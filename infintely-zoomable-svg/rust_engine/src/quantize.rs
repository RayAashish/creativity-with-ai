//! Adaptive Perceptual Color Quantization with Luminance-Weighted OKLab Distance
//! and Human Skin-Tone Gamut Prioritization.

use rayon::prelude::*;

#[derive(Clone, Copy, Debug)]
pub struct Oklab {
    pub l: f32,
    pub a: f32,
    pub b: f32,
}

impl Oklab {
    /// Luminance-weighted perceptual distance:
    /// ΔE² = 2.5 * (ΔL)² + (Δa)² + (Δb)²
    /// Prioritizing luminance prevents midtones from merging into shadows.
    #[inline]
    pub fn distance_sq(&self, other: &Oklab) -> f32 {
        let dl = self.l - other.l;
        let da = self.a - other.a;
        let db = self.b - other.b;
        2.5 * dl * dl + da * da + db * db
    }

    /// Checks if the color falls within the human skin-tone gamut in OKLab.
    #[inline]
    pub fn is_skin_tone(&self) -> bool {
        self.l >= 0.28 && self.l <= 0.92 && self.a >= 0.012 && self.a <= 0.16 && self.b >= 0.02 && self.b <= 0.20
    }
}

fn srgb_to_linear(c: f32) -> f32 {
    let c = c / 255.0;
    if c <= 0.04045 {
        c / 12.92
    } else {
        ((c + 0.055) / 1.055).powf(2.4)
    }
}

fn linear_to_srgb(c: f32) -> f32 {
    let c = c.clamp(0.0, 1.0);
    if c <= 0.0031308 {
        c * 12.92 * 255.0
    } else {
        (1.055 * c.powf(1.0 / 2.4) - 0.055) * 255.0
    }
}

pub fn rgb_to_oklab(r: u8, g: u8, b: u8) -> Oklab {
    let lr = srgb_to_linear(r as f32);
    let lg = srgb_to_linear(g as f32);
    let lb = srgb_to_linear(b as f32);

    let l_c = (0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb).cbrt();
    let m_c = (0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb).cbrt();
    let s_c = (0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb).cbrt();

    Oklab {
        l: 0.2104542553 * l_c + 0.7936177850 * m_c - 0.0040720468 * s_c,
        a: 1.9779984951 * l_c - 2.4285922050 * m_c + 0.4505937099 * s_c,
        b: 0.0259040371 * l_c + 0.7827717662 * m_c - 0.8086757660 * s_c,
    }
}

pub fn oklab_to_rgb(ok: &Oklab) -> (u8, u8, u8) {
    let l_c = ok.l + 0.3963377774 * ok.a + 0.2158037573 * ok.b;
    let m_c = ok.l - 0.1055613458 * ok.a - 0.0638541728 * ok.b;
    let s_c = ok.l - 0.0894841775 * ok.a - 1.2914855480 * ok.b;

    let l = l_c * l_c * l_c;
    let m = m_c * m_c * m_c;
    let s = s_c * s_c * s_c;

    let lr = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    let lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    let lb = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

    (
        linear_to_srgb(lr).round().clamp(0.0, 255.0) as u8,
        linear_to_srgb(lg).round().clamp(0.0, 255.0) as u8,
        linear_to_srgb(lb).round().clamp(0.0, 255.0) as u8,
    )
}

/// Adaptive Perceptual Quantization using L-weighted OKLab with Rayon parallelism.
pub fn quantize_oklab(rgba: &[u8], width: usize, height: usize, k: usize) -> Vec<u8> {
    let k = k.clamp(2, 64);
    let total_pixels = width * height;
    if total_pixels == 0 || rgba.len() != total_pixels * 4 {
        return rgba.to_vec();
    }

    // Step 1: Collect non-transparent pixel samples with facial/skin-tone oversampling
    let sample_capacity = total_pixels.min(12000);
    let step = (total_pixels / sample_capacity).max(1);

    let mut samples: Vec<Oklab> = Vec::with_capacity(sample_capacity);
    let mut skin_samples: Vec<Oklab> = Vec::new();

    for i in (0..total_pixels).step_by(step) {
        let idx = i * 4;
        if rgba[idx + 3] >= 32 {
            let ok = rgb_to_oklab(rgba[idx], rgba[idx + 1], rgba[idx + 2]);
            if ok.is_skin_tone() {
                skin_samples.push(ok);
            }
            samples.push(ok);
        }
    }

    if samples.len() < k {
        return rgba.to_vec();
    }

    // If skin tone samples exist, interleave them so skin tones occupy at least 35% of sample space
    if !skin_samples.is_empty() {
        let boost_count = (samples.len() / 3).min(skin_samples.len());
        for i in 0..boost_count {
            samples.push(skin_samples[i % skin_samples.len()]);
        }
    }

    // Step 2: Robust K-Means++ initialization using cumulative distance distribution
    let mut centroids = Vec::with_capacity(k);
    let mut sorted_by_l = samples.clone();
    sorted_by_l.sort_by(|a, b| a.l.partial_cmp(&b.l).unwrap_or(std::cmp::Ordering::Equal));
    centroids.push(sorted_by_l[sorted_by_l.len() / 2]);

    for step_idx in 1..k {
        let distances: Vec<f32> = samples
            .par_iter()
            .map(|sample| {
                let mut min_d = f32::MAX;
                for c in &centroids {
                    let d = sample.distance_sq(c);
                    if d < min_d {
                        min_d = d;
                    }
                }
                min_d
            })
            .collect();

        let total_dist: f32 = distances.iter().sum();
        if total_dist <= 1e-6 {
            centroids.push(sorted_by_l[(step_idx * sorted_by_l.len()) / k]);
            continue;
        }

        let target = (total_dist * (step_idx as f32 / k as f32)).min(total_dist * 0.98);
        let mut cum = 0.0f32;
        let mut chosen = samples[0];
        for (idx, &d) in distances.iter().enumerate() {
            cum += d;
            if cum >= target {
                chosen = samples[idx];
                break;
            }
        }
        centroids.push(chosen);
    }

    // Step 3: Run fast parallel K-Means iterations (8 iterations)
    let iterations = 8;
    for _ in 0..iterations {
        // Partition samples in parallel and accumulate sums
        let (sums_l, sums_a, sums_b, counts) = samples
            .par_chunks(512)
            .map(|chunk| {
                let mut l_sum = vec![0.0f32; k];
                let mut a_sum = vec![0.0f32; k];
                let mut b_sum = vec![0.0f32; k];
                let mut cnt = vec![0usize; k];

                for sample in chunk {
                    let mut nearest_idx = 0;
                    let mut nearest_dist = f32::MAX;

                    for (ci, c) in centroids.iter().enumerate() {
                        let d = sample.distance_sq(c);
                        if d < nearest_dist {
                            nearest_dist = d;
                            nearest_idx = ci;
                        }
                    }

                    l_sum[nearest_idx] += sample.l;
                    a_sum[nearest_idx] += sample.a;
                    b_sum[nearest_idx] += sample.b;
                    cnt[nearest_idx] += 1;
                }
                (l_sum, a_sum, b_sum, cnt)
            })
            .reduce(
                || (vec![0.0f32; k], vec![0.0f32; k], vec![0.0f32; k], vec![0usize; k]),
                |mut a, b| {
                    for i in 0..k {
                        a.0[i] += b.0[i];
                        a.1[i] += b.1[i];
                        a.2[i] += b.2[i];
                        a.3[i] += b.3[i];
                    }
                    a
                },
            );

        for i in 0..k {
            if counts[i] > 0 {
                let cnt = counts[i] as f32;
                centroids[i] = Oklab {
                    l: sums_l[i] / cnt,
                    a: sums_a[i] / cnt,
                    b: sums_b[i] / cnt,
                };
            }
        }
    }

    // Step 4: Map centroids back to sRGB palette
    let palette_rgb: Vec<(u8, u8, u8)> = centroids.iter().map(oklab_to_rgb).collect();
    let palette_oklab: Vec<Oklab> = palette_rgb
        .iter()
        .map(|&(r, g, b)| rgb_to_oklab(r, g, b))
        .collect();

    // Step 5: Parallel remapping of all image pixels across all CPU cores
    let mut result = vec![0u8; total_pixels * 4];

    result
        .par_chunks_mut(4096)
        .enumerate()
        .for_each(|(chunk_idx, chunk)| {
            let start_pixel = chunk_idx * (4096 / 4);
            let chunk_pixels = chunk.len() / 4;

            for p in 0..chunk_pixels {
                let px_idx = start_pixel + p;
                if px_idx >= total_pixels {
                    break;
                }

                let src_idx = px_idx * 4;
                let dst_idx = p * 4;
                let a = rgba[src_idx + 3];

                if a < 32 {
                    chunk[dst_idx] = rgba[src_idx];
                    chunk[dst_idx + 1] = rgba[src_idx + 1];
                    chunk[dst_idx + 2] = rgba[src_idx + 2];
                    chunk[dst_idx + 3] = a;
                } else {
                    let px_ok = rgb_to_oklab(rgba[src_idx], rgba[src_idx + 1], rgba[src_idx + 2]);
                    let mut best_idx = 0;
                    let mut best_dist = f32::MAX;

                    for (ci, c) in palette_oklab.iter().enumerate() {
                        let d = px_ok.distance_sq(c);
                        if d < best_dist {
                            best_dist = d;
                            best_idx = ci;
                        }
                    }

                    let (r, g, b) = palette_rgb[best_idx];
                    chunk[dst_idx] = r;
                    chunk[dst_idx + 1] = g;
                    chunk[dst_idx + 2] = b;
                    chunk[dst_idx + 3] = a;
                }
            }
        });

    result
}

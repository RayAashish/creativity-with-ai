//! High-performance parallel image filtering for artifact suppression.

use rayon::prelude::*;

/// Applies a multi-threaded bilateral filter to the RGBA pixel buffer using Rayon.
pub fn bilateral_filter(
    rgba: &[u8],
    width: usize,
    height: usize,
    spatial_sigma: f32,
    range_sigma: f32,
) -> Vec<u8> {
    if width == 0 || height == 0 || rgba.len() != width * height * 4 {
        return rgba.to_vec();
    }

    let radius = ((2.0 * spatial_sigma).ceil() as isize).clamp(1, 3);
    let mut output = vec![0u8; width * height * 4];

    let two_spatial_sq = 2.0 * spatial_sigma * spatial_sigma;
    let two_range_sq = 2.0 * range_sigma * range_sigma;

    // Precalculate spatial Gaussian weights
    let kernel_dim = (2 * radius + 1) as usize;
    let mut spatial_weights = vec![0.0f32; kernel_dim * kernel_dim];
    for dy in -radius..=radius {
        for dx in -radius..=radius {
            let dist_sq = (dx * dx + dy * dy) as f32;
            let idx = ((dy + radius) as usize) * kernel_dim + ((dx + radius) as usize);
            spatial_weights[idx] = (-dist_sq / two_spatial_sq).exp();
        }
    }

    // Process scanlines in parallel across all CPU cores
    output
        .par_chunks_mut(width * 4)
        .enumerate()
        .for_each(|(y, row)| {
            let y_isize = y as isize;

            for x in 0..width {
                let x_isize = x as isize;
                let center_idx = (y * width + x) * 4;
                let row_offset = x * 4;

                let cr = rgba[center_idx] as f32;
                let cg = rgba[center_idx + 1] as f32;
                let cb = rgba[center_idx + 2] as f32;
                let ca = rgba[center_idx + 3];

                if ca < 8 {
                    row[row_offset] = rgba[center_idx];
                    row[row_offset + 1] = rgba[center_idx + 1];
                    row[row_offset + 2] = rgba[center_idx + 2];
                    row[row_offset + 3] = ca;
                    continue;
                }

                let mut sum_r = 0.0f32;
                let mut sum_g = 0.0f32;
                let mut sum_b = 0.0f32;
                let mut sum_w = 0.0f32;

                for dy in -radius..=radius {
                    let ny = y_isize + dy;
                    if ny < 0 || ny >= height as isize {
                        continue;
                    }
                    let k_y = (dy + radius) as usize;

                    for dx in -radius..=radius {
                        let nx = x_isize + dx;
                        if nx < 0 || nx >= width as isize {
                            continue;
                        }
                        let k_x = (dx + radius) as usize;

                        let neighbor_idx = (ny as usize * width + nx as usize) * 4;
                        let nr = rgba[neighbor_idx] as f32;
                        let ng = rgba[neighbor_idx + 1] as f32;
                        let nb = rgba[neighbor_idx + 2] as f32;

                        let dr = cr - nr;
                        let dg = cg - ng;
                        let db = cb - nb;
                        let color_dist_sq = dr * dr + dg * dg + db * db;

                        let range_w = (-color_dist_sq / two_range_sq).exp();
                        let w = spatial_weights[k_y * kernel_dim + k_x] * range_w;

                        sum_r += nr * w;
                        sum_g += ng * w;
                        sum_b += nb * w;
                        sum_w += w;
                    }
                }

                if sum_w > 0.0 {
                    row[row_offset] = (sum_r / sum_w).round().clamp(0.0, 255.0) as u8;
                    row[row_offset + 1] = (sum_g / sum_w).round().clamp(0.0, 255.0) as u8;
                    row[row_offset + 2] = (sum_b / sum_w).round().clamp(0.0, 255.0) as u8;
                } else {
                    row[row_offset] = rgba[center_idx];
                    row[row_offset + 1] = rgba[center_idx + 1];
                    row[row_offset + 2] = rgba[center_idx + 2];
                }
                row[row_offset + 3] = ca;
            }
        });

    output
}

/// Applies a parallel 3x3 median blur.
pub fn median_filter_3x3(rgba: &[u8], width: usize, height: usize) -> Vec<u8> {
    if width < 3 || height < 3 || rgba.len() != width * height * 4 {
        return rgba.to_vec();
    }

    let mut output = vec![0u8; width * height * 4];

    output
        .par_chunks_mut(width * 4)
        .enumerate()
        .for_each(|(y, row)| {
            let mut window_r = [0u8; 9];
            let mut window_g = [0u8; 9];
            let mut window_b = [0u8; 9];

            for x in 0..width {
                let center_idx = (y * width + x) * 4;
                let row_offset = x * 4;
                let ca = rgba[center_idx + 3];

                if x == 0 || x + 1 == width || y == 0 || y + 1 == height || ca < 8 {
                    row[row_offset] = rgba[center_idx];
                    row[row_offset + 1] = rgba[center_idx + 1];
                    row[row_offset + 2] = rgba[center_idx + 2];
                    row[row_offset + 3] = ca;
                    continue;
                }

                let mut count = 0;
                for dy in 0..3 {
                    let ny = y + dy - 1;
                    for dx in 0..3 {
                        let nx = x + dx - 1;
                        let idx = (ny * width + nx) * 4;
                        window_r[count] = rgba[idx];
                        window_g[count] = rgba[idx + 1];
                        window_b[count] = rgba[idx + 2];
                        count += 1;
                    }
                }

                window_r.sort_unstable();
                window_g.sort_unstable();
                window_b.sort_unstable();

                row[row_offset] = window_r[4];
                row[row_offset + 1] = window_g[4];
                row[row_offset + 2] = window_b[4];
                row[row_offset + 3] = ca;
            }
        });

    output
}

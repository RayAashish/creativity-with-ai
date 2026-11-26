//! VectorForge vectorization orchestration combining pre-filters, L-weighted OKLab color quantization,
//! and the high-precision Neural-Gradient Mosaic / Polygon / Pixel Art engines.

use visioncortex::ColorImage;
use vtracer::{Clustering, Config, FitMode, Hierarchical};

use crate::filter::{bilateral_filter, median_filter_3x3};
use crate::mosaic_engine::vectorize_gradient_mosaic_svg;
use crate::quantize::quantize_oklab;

#[derive(Debug, Clone)]
pub struct VectorForgeOptions {
    /// 0 = Spline (Photo HD / Smooth curves), 1 = Polygon (RDP straight lines), 2 = PixelArt (crisp pixel lattice)
    pub fit_mode: i32,
    /// Enable per-region clamped 2D linear color gradients (rich photographic shading)
    pub gradient_shading: bool,
    /// Micro-detail fidelity from 0.05 (coarse minimalist shapes) to 1.0 (maximum photographic precision)
    pub detail_level: f32,
    /// Optical edge unsharp mask before tracing (0.0 to 1.0)
    pub sharpen_amount: f32,
    /// 0 = None, 1 = Bilateral, 2 = Median
    pub filter_mode: i32,
    /// Strength multiplier for filters (e.g. 1.0 to 5.0)
    pub filter_strength: f32,
    /// Target color count (2 to 64), or 0 to disable explicit quantization (full color)
    pub color_quantize_k: i32,
    /// Curve simplification tolerance in pixels (0.0 for tightest fidelity)
    pub simplify_tolerance: f64,
    /// Speckle filter size (0 = preserve finest 2px+ features like eye catchlights & hair strands)
    pub filter_speckle: usize,
    /// Corner threshold in degrees (e.g. 130 for mosaic spline junctions)
    pub corner_threshold: i32,
    /// Path precision decimal places (e.g. 1 or 2)
    pub path_precision: u32,
}

impl Default for VectorForgeOptions {
    fn default() -> Self {
        Self {
            fit_mode: 0,
            gradient_shading: true,
            detail_level: 0.80,
            sharpen_amount: 0.38,
            filter_mode: 0, // Off by default: preserves raw optical sharpness
            filter_strength: 1.0,
            color_quantize_k: 0, // 0 = Full Color high fidelity by default
            simplify_tolerance: 0.0,
            filter_speckle: 0,
            corner_threshold: 62,
            path_precision: 2,
        }
    }
}

pub fn vectorize_to_svg(
    raw_rgba: &[u8],
    width: usize,
    height: usize,
    opts: &VectorForgeOptions,
) -> Result<String, String> {
    if width == 0 || height == 0 || raw_rgba.len() != width * height * 4 {
        return Err(format!(
            "Invalid buffer dimension: {}x{}, buffer len={}",
            width,
            height,
            raw_rgba.len()
        ));
    }

    // Step 1: Pre-filtering (only applied when explicitly chosen by user; never on Pixel Art)
    let processed_pixels = if opts.fit_mode == 2 {
        raw_rgba.to_vec()
    } else {
        match opts.filter_mode {
            1 => {
                let spatial_sigma = (opts.filter_strength * 0.8).clamp(0.6, 2.2);
                let range_sigma = (opts.filter_strength * 10.0).clamp(6.0, 28.0);
                bilateral_filter(raw_rgba, width, height, spatial_sigma, range_sigma)
            }
            2 => median_filter_3x3(raw_rgba, width, height),
            _ => raw_rgba.to_vec(),
        }
    };

    // Step 2: Perceptual OKLab Color Quantization (when user selects a 2..=64 flat palette)
    let has_palette_quantization = opts.color_quantize_k >= 2 && opts.color_quantize_k <= 64;
    let tracing_pixels = if has_palette_quantization {
        quantize_oklab(
            &processed_pixels,
            width,
            height,
            opts.color_quantize_k as usize,
        )
    } else {
        processed_pixels
    };

    // Mode 2: Dedicated Pixel Art lattice via vtracer Cutout (preserves exact crisp square pixels + alpha)
    if opts.fit_mode == 2 {
        let mut color_img = ColorImage::new_w_h(width, height);
        color_img.pixels = tracing_pixels;

        let mut config = Config::default();
        config.clustering = Clustering::ColorCluster;
        config.mode = FitMode::Pixel;
        config.hierarchical = Hierarchical::Cutout;
        config.path_precision = Some(opts.path_precision);
        config.color_precision = 8;
        config.filter_speckle = 0;
        config.simplify = None;
        config.layer_difference = 2;
        config.optimize = 1;

        let pipeline = config
            .build()
            .map_err(|e| format!("Failed to build pixel pipeline: {:?}", e))?;
        let raw_svg = pipeline
            .to_svg(&color_img)
            .map_err(|e| format!("Pixel vectorization error: {:?}", e))?;
        return Ok(enrich_svg_header(&raw_svg, width, height));
    }

    // Mode 0 (Spline / Photo HD) & Mode 1 (Polygon RDP):
    // Powered by the parallel Neural-Gradient Mosaic watershed + topological boundary graph.
    let polygon_only = opts.fit_mode == 1;
    let use_gradients = opts.gradient_shading && !has_palette_quantization;
    let effective_sharpen = if has_palette_quantization {
        0.0
    } else if opts.filter_mode == 0 {
        opts.sharpen_amount.clamp(0.0, 1.0)
    } else {
        // Gentle sharpening after explicit denoising avoids amplifying suppressed compression noise
        (opts.sharpen_amount * 0.45).clamp(0.0, 0.45)
    };
    let min_area = 2usize.saturating_add(opts.filter_speckle.clamp(0, 64));
    let corner_deg = opts.corner_threshold.clamp(45, 175);

    let svg = vectorize_gradient_mosaic_svg(
        &tracing_pixels,
        width,
        height,
        effective_sharpen,
        opts.detail_level.clamp(0.05, 1.0),
        min_area,
        polygon_only,
        use_gradients,
        corner_deg,
        1.20,
        1.05,
        opts.simplify_tolerance.clamp(0.0, 8.0),
    );

    Ok(svg)
}

/// Ensures the root <svg> element contains full metadata attributes:
/// xmlns="http://www.w3.org/2000/svg", version="1.1", width, height, viewBox, and fill-rule="nonzero".
fn enrich_svg_header(svg: &str, width: usize, height: usize) -> String {
    if let Some(pos) = svg.find("<svg") {
        if let Some(end_bracket) = svg[pos..].find('>') {
            let new_tag = format!(
                "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" width=\"{}\" height=\"{}\" viewBox=\"0 0 {} {}\" fill-rule=\"nonzero\">",
                width, height, width, height
            );

            let mut result = String::with_capacity(svg.len() + 128);
            result.push_str(&svg[..pos]);
            result.push_str(&new_tag);
            result.push_str(&svg[pos + end_bracket + 1..]);
            return result;
        }
    }
    svg.to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_enrich_svg_header() {
        let raw = "<svg viewBox=\"0 0 100 100\">\n<path d=\"M0,0L10,10Z\" fill=\"#000\"/>\n</svg>";
        let enriched = enrich_svg_header(raw, 100, 100);
        assert!(enriched.contains("xmlns=\"http://www.w3.org/2000/svg\""));
        assert!(enriched.contains("version=\"1.1\""));
        assert!(enriched.contains("width=\"100\""));
        assert!(enriched.contains("height=\"100\""));
        assert!(enriched.contains("viewBox=\"0 0 100 100\""));
        assert!(enriched.contains("fill-rule=\"nonzero\""));
    }

    #[test]
    fn test_invalid_buffer_returns_error() {
        let err = vectorize_to_svg(&[0u8; 10], 4, 4, &VectorForgeOptions::default())
            .expect_err("should reject mismatched buffer length");
        assert!(err.contains("Invalid buffer dimension"));
    }

    #[test]
    fn test_all_vector_modes_produce_clean_svg() {
        let w = 96usize;
        let h = 96usize;
        let mut rgba = vec![0u8; w * h * 4];
        for y in 0..h {
            for x in 0..w {
                let idx = (y * w + x) * 4;
                let dx = x as f32 - 48.0;
                let dy = y as f32 - 48.0;
                let r2 = dx * dx + dy * dy;
                if r2 < 32.0 * 32.0 {
                    // Warm shaded portrait-like sphere
                    let nx = dx / 32.0;
                    let ny = dy / 32.0;
                    let light = (0.65 - 0.35 * nx - 0.35 * ny).clamp(0.15, 1.0);
                    rgba[idx] = (230.0 * light) as u8;
                    rgba[idx + 1] = (172.0 * light) as u8;
                    rgba[idx + 2] = (130.0 * light) as u8;
                } else {
                    // Cool twilight sky backdrop
                    rgba[idx] = (24 + (y / 4) as u8).min(255);
                    rgba[idx + 1] = (40 + (x / 5) as u8).min(255);
                    rgba[idx + 2] = (75 + (y / 2) as u8).min(255);
                }
                rgba[idx + 3] = 255;
            }
        }

        // 1. Photo HD (Spline + Linear Gradients)
        let hd_svg = vectorize_to_svg(&rgba, w, h, &VectorForgeOptions::default())
            .expect("Photo HD mode should succeed");
        assert!(hd_svg.contains("viewBox=\"0 0 96 96\""));
        assert!(hd_svg.contains("<linearGradient"));
        assert!(hd_svg.contains("<path"));

        // 2. Crisp Flat Vector (Spline without gradients)
        let flat_opts = VectorForgeOptions {
            gradient_shading: false,
            ..VectorForgeOptions::default()
        };
        let flat_svg = vectorize_to_svg(&rgba, w, h, &flat_opts)
            .expect("Flat Vector mode should succeed");
        assert!(!flat_svg.contains("<linearGradient"));
        assert!(flat_svg.contains("<path"));

        // 3. Polygon RDP
        let poly_opts = VectorForgeOptions {
            fit_mode: 1,
            gradient_shading: false,
            simplify_tolerance: 1.5,
            ..VectorForgeOptions::default()
        };
        let poly_svg = vectorize_to_svg(&rgba, w, h, &poly_opts)
            .expect("Polygon mode should succeed");
        assert!(poly_svg.contains("<path"));

        // 4. Pixel Art
        let pixel_opts = VectorForgeOptions {
            fit_mode: 2,
            ..VectorForgeOptions::default()
        };
        let pixel_svg = vectorize_to_svg(&rgba, w, h, &pixel_opts)
            .expect("Pixel Art mode should succeed");
        assert!(pixel_svg.contains("xmlns=\"http://www.w3.org/2000/svg\""));
    }

    #[test]
    fn test_selfie_mosaic_speed_and_detail() {
        let raw_path = "/tmp/bench_selfie.raw";
        if let Ok(bytes) = std::fs::read(raw_path) {
            let opts = VectorForgeOptions::default();
            let start = std::time::Instant::now();
            let svg = vectorize_to_svg(&bytes, 206, 685, &opts)
                .expect("vectorization should succeed");
            let elapsed = start.elapsed();
            let path_count = svg.matches("<path").count();
            assert!(
                elapsed.as_millis() < 300,
                "Expected sub-300ms vectorization, got {:?}",
                elapsed
            );
            assert!(path_count > 1000, "Expected rich mosaic paths, got {}", path_count);
            assert!(svg.contains("<linearGradient"));
        }
    }
}

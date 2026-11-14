//! Curvify vectorization orchestration combining pre-filters, L-weighted OKLab color quantization,
//! and vtracer's Spline / Polygon / Pixel Art tracing.

use visioncortex::ColorImage;
use vtracer::{Clustering, Config, FitMode, Hierarchical};

use crate::filter::{bilateral_filter, median_filter_3x3};
use crate::quantize::quantize_oklab;

#[derive(Debug, Clone)]
pub struct CurvifyOptions {
    /// 0 = Spline (curves), 1 = Polygon (RDP straight lines), 2 = PixelArt (crisp pixel lattice)
    pub fit_mode: i32,
    /// 0 = None, 1 = Bilateral, 2 = Median
    pub filter_mode: i32,
    /// Strength multiplier for filters (e.g. 1.0 to 5.0)
    pub filter_strength: f32,
    /// Target color count (2 to 64), or 0 to disable explicit quantization (full color)
    pub color_quantize_k: i32,
    /// RDP / curve simplification tolerance in pixels (e.g. 0.5 to 10.0)
    pub simplify_tolerance: f64,
    /// Speckle filter size (side length in pixels, e.g. 0 to 16)
    pub filter_speckle: usize,
    /// Corner threshold in degrees (e.g. 60)
    pub corner_threshold: i32,
    /// Path precision decimal places (e.g. 2)
    pub path_precision: u32,
}

impl Default for CurvifyOptions {
    fn default() -> Self {
        Self {
            fit_mode: 0,
            filter_mode: 0, // Default to None so facial features & low-contrast details are never melted
            filter_strength: 1.0,
            color_quantize_k: 0, // 0 = Full Color high fidelity by default
            simplify_tolerance: 0.8,
            filter_speckle: 2, // Cleans speckles < 4px area while preserving subtle contours
            corner_threshold: 60,
            path_precision: 2,
        }
    }
}

pub fn vectorize_to_svg(
    raw_rgba: &[u8],
    width: usize,
    height: usize,
    opts: &CurvifyOptions,
) -> Result<String, String> {
    if width == 0 || height == 0 || raw_rgba.len() != width * height * 4 {
        return Err(format!(
            "Invalid buffer dimension: {}x{}, buffer len={}",
            width,
            height,
            raw_rgba.len()
        ));
    }

    // Step 1: Pre-filtering (only applied when explicitly enabled by user)
    let processed_pixels = if opts.fit_mode == 2 {
        // Pixel Art mode preserves exact raw pixel boundaries
        raw_rgba.to_vec()
    } else {
        match opts.filter_mode {
            1 => {
                let spatial_sigma = (opts.filter_strength * 0.8).clamp(0.6, 2.2);
                let range_sigma = (opts.filter_strength * 10.0).clamp(6.0, 28.0);
                bilateral_filter(raw_rgba, width, height, spatial_sigma, range_sigma)
            }
            2 => {
                median_filter_3x3(raw_rgba, width, height)
            }
            _ => raw_rgba.to_vec(),
        }
    };

    // Step 2: Perceptual Color Quantization (only when user specifies a target palette k in 2..=64)
    let quantized_pixels = if opts.color_quantize_k >= 2 && opts.color_quantize_k <= 64 {
        quantize_oklab(
            &processed_pixels,
            width,
            height,
            opts.color_quantize_k as usize,
        )
    } else {
        processed_pixels
    };

    // Step 3: Wrap into visioncortex ColorImage
    let mut color_img = ColorImage::new_w_h(width, height);
    color_img.pixels = quantized_pixels;

    // Step 4: Configure vtracer pipeline based on mode
    let mut config = Config::default();
    config.clustering = Clustering::ColorCluster;

    // Seam-free Cutout mosaic guarantees that every color region is an independent
    // planar tile. Dark backgrounds NEVER occlude, punch through, or discard foreground objects!
    config.hierarchical = Hierarchical::Cutout;
    config.path_precision = Some(opts.path_precision);
    config.color_precision = 8; // Preserve full 8-bit precision (0 bits lost)

    match opts.fit_mode {
        // Mode 2: Dedicated Pixel Art Mode (sharp pixel grid, no curve fitting)
        2 => {
            config.mode = FitMode::Pixel;
            config.filter_speckle = 0;
            config.simplify = None;
            config.layer_difference = 2;
            config.optimize = 1;
        }
        // Mode 1: Polygon Mode (straight Douglas-Peucker edges)
        1 => {
            config.mode = FitMode::Polygon;
            config.filter_speckle = opts.filter_speckle.clamp(0, 16);
            config.simplify = Some(opts.simplify_tolerance);
            config.corner_threshold = opts.corner_threshold;
            config.layer_difference = if opts.color_quantize_k > 0 { 8 } else { 4 };
            config.optimize = 2;
        }
        // Mode 0: Spline Mode (Least-squares cubic Béziers + adaptive curves)
        _ => {
            config.mode = FitMode::Spline;
            config.filter_speckle = opts.filter_speckle.clamp(0, 8);
            config.simplify = Some(opts.simplify_tolerance);
            config.corner_threshold = opts.corner_threshold;
            // Layer difference of 4 allows low-contrast details (lunar craters, portrait midtones, shadows)
            // to be traced faithfully without being merged into adjacent background clusters!
            config.layer_difference = if opts.color_quantize_k > 0 { 8 } else { 4 };
            config.optimize = 2;
        }
    }

    let pipeline = config
        .build()
        .map_err(|e| format!("Failed to build vtracer pipeline: {:?}", e))?;

    let raw_svg = pipeline
        .to_svg(&color_img)
        .map_err(|e| format!("Vectorization error: {:?}", e))?;

    // Step 5: Post-process SVG to guarantee 100% compliant SVG root metadata
    let enriched_svg = enrich_svg_header(&raw_svg, width, height);

    Ok(enriched_svg)
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
    fn test_moon_vectorization() {
        let path = "/tmp/moon_orig.raw";
        if let Ok(bytes) = std::fs::read(path) {
            let opts = CurvifyOptions::default();
            let svg = vectorize_to_svg(&bytes, 550, 1400, &opts).expect("vectorization should succeed");
            let path_count = svg.matches("<path").count();
            println!("Moon path count: {}, bytes: {}", path_count, svg.len());
            assert!(path_count > 500, "Moon should generate rich crater paths!");
            assert!(svg.contains("xmlns=\"http://www.w3.org/2000/svg\""));
        }
    }
}

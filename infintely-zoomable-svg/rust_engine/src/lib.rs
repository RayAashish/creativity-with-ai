pub mod filter;
pub mod mosaic_engine;
pub mod pipeline;
pub mod quantize;

use jni::objects::{JByteArray, JClass};
use jni::sys::{jboolean, jfloat, jint, jstring, JNI_TRUE};
use jni::JNIEnv;

use crate::pipeline::{vectorize_to_svg, VectorForgeOptions};

#[allow(clippy::too_many_arguments)]
fn run_vectorize_rgba(
    mut env: JNIEnv,
    pixels: JByteArray,
    width: jint,
    height: jint,
    fit_mode: jint,
    gradient_shading: bool,
    detail_level: jfloat,
    sharpen_amount: jfloat,
    filter_mode: jint,
    filter_strength: jfloat,
    color_quantize_k: jint,
    simplify_tolerance: jfloat,
    filter_speckle: jint,
) -> jstring {
    let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        if width <= 0 || height <= 0 {
            return Err(format!("Invalid dimensions: {}x{}", width, height));
        }
        let width_usize = width as usize;
        let height_usize = height as usize;
        let expected_len = width_usize
            .checked_mul(height_usize)
            .and_then(|n| n.checked_mul(4))
            .ok_or_else(|| "Buffer size overflow".to_string())?;

        let pixel_len = match env.get_array_length(&pixels) {
            Ok(len) => len as usize,
            Err(_) => return Err("Failed to get pixel array length".to_string()),
        };

        if pixel_len != expected_len {
            return Err(format!(
                "Pixel buffer length mismatch: expected {}, got {}",
                expected_len, pixel_len
            ));
        }

        let mut raw_bytes = vec![0i8; pixel_len];
        if let Err(e) = env.get_byte_array_region(&pixels, 0, &mut raw_bytes) {
            return Err(format!("Failed to copy byte array region: {:?}", e));
        }

        let u8_bytes: &[u8] = unsafe {
            std::slice::from_raw_parts(raw_bytes.as_ptr() as *const u8, raw_bytes.len())
        };

        let opts = VectorForgeOptions {
            fit_mode,
            gradient_shading,
            detail_level: detail_level.clamp(0.05, 1.0),
            sharpen_amount: sharpen_amount.clamp(0.0, 1.0),
            filter_mode,
            filter_strength,
            color_quantize_k,
            simplify_tolerance: (simplify_tolerance as f64).max(0.0),
            filter_speckle: (filter_speckle.max(0) as usize).clamp(0, 64),
            corner_threshold: 62,
            path_precision: 2,
        };

        vectorize_to_svg(u8_bytes, width_usize, height_usize, &opts)
    }));

    match result {
        Ok(Ok(svg)) => match env.new_string(svg) {
            Ok(js) => js.into_raw(),
            Err(_) => std::ptr::null_mut(),
        },
        Ok(Err(err_msg)) => {
            eprintln!("[VectorForge Native] Error: {}", err_msg);
            let _ = env.throw_new("java/lang/RuntimeException", err_msg);
            std::ptr::null_mut()
        }
        Err(_) => {
            eprintln!("[VectorForge Native] Panic during vectorization!");
            let _ = env.throw_new(
                "java/lang/RuntimeException",
                "Native panic during vectorization",
            );
            std::ptr::null_mut()
        }
    }
}

const ENGINE_VERSION: &str = "VectorForge Native Rust Core v4.0 (Neural-Gradient Mosaic + OKLab)";

// ----------------- VectorForge & VectorCraft (App Package) JNI Exports -----------------

#[no_mangle]
#[allow(clippy::too_many_arguments)]
pub extern "system" fn Java_com_vectorforge_app_engine_NativeBridge_vectorizeRgbaV2(
    env: JNIEnv,
    _class: JClass,
    pixels: JByteArray,
    width: jint,
    height: jint,
    fit_mode: jint,
    gradient_shading: jboolean,
    detail_level: jfloat,
    sharpen_amount: jfloat,
    filter_mode: jint,
    filter_strength: jfloat,
    color_quantize_k: jint,
    simplify_tolerance: jfloat,
    filter_speckle: jint,
) -> jstring {
    run_vectorize_rgba(
        env,
        pixels,
        width,
        height,
        fit_mode,
        gradient_shading == JNI_TRUE,
        detail_level,
        sharpen_amount,
        filter_mode,
        filter_strength,
        color_quantize_k,
        simplify_tolerance,
        filter_speckle,
    )
}

#[no_mangle]
#[allow(clippy::too_many_arguments)]
pub extern "system" fn Java_com_vectorcraft_app_engine_NativeBridge_vectorizeRgbaV2(
    env: JNIEnv,
    _class: JClass,
    pixels: JByteArray,
    width: jint,
    height: jint,
    fit_mode: jint,
    gradient_shading: jboolean,
    detail_level: jfloat,
    sharpen_amount: jfloat,
    filter_mode: jint,
    filter_strength: jfloat,
    color_quantize_k: jint,
    simplify_tolerance: jfloat,
    filter_speckle: jint,
) -> jstring {
    run_vectorize_rgba(
        env,
        pixels,
        width,
        height,
        fit_mode,
        gradient_shading == JNI_TRUE,
        detail_level,
        sharpen_amount,
        filter_mode,
        filter_strength,
        color_quantize_k,
        simplify_tolerance,
        filter_speckle,
    )
}

#[no_mangle]
#[allow(clippy::too_many_arguments)]
pub extern "system" fn Java_com_vectorforge_app_engine_NativeBridge_vectorizeRgba(
    env: JNIEnv,
    _class: JClass,
    pixels: JByteArray,
    width: jint,
    height: jint,
    fit_mode: jint,
    filter_mode: jint,
    filter_strength: jfloat,
    color_quantize_k: jint,
    simplify_tolerance: jfloat,
    filter_speckle: jint,
) -> jstring {
    run_vectorize_rgba(
        env,
        pixels,
        width,
        height,
        fit_mode,
        fit_mode == 0,
        0.80,
        0.38,
        filter_mode,
        filter_strength,
        color_quantize_k,
        simplify_tolerance,
        filter_speckle,
    )
}

#[no_mangle]
pub extern "system" fn Java_com_vectorforge_app_engine_NativeBridge_getEngineVersion(
    env: JNIEnv,
    _class: JClass,
) -> jstring {
    match env.new_string(ENGINE_VERSION) {
        Ok(s) => s.into_raw(),
        Err(_) => std::ptr::null_mut(),
    }
}

// ----------------- Legacy Package Aliases (VectorCraft & Curvify) -----------------

#[no_mangle]
#[allow(clippy::too_many_arguments)]
pub extern "system" fn Java_com_vectorcraft_app_engine_NativeBridge_vectorizeRgba(
    env: JNIEnv,
    _class: JClass,
    pixels: JByteArray,
    width: jint,
    height: jint,
    fit_mode: jint,
    filter_mode: jint,
    filter_strength: jfloat,
    color_quantize_k: jint,
    simplify_tolerance: jfloat,
    filter_speckle: jint,
) -> jstring {
    run_vectorize_rgba(
        env,
        pixels,
        width,
        height,
        fit_mode,
        fit_mode == 0,
        0.80,
        0.38,
        filter_mode,
        filter_strength,
        color_quantize_k,
        simplify_tolerance,
        filter_speckle,
    )
}

#[no_mangle]
pub extern "system" fn Java_com_vectorcraft_app_engine_NativeBridge_getEngineVersion(
    env: JNIEnv,
    _class: JClass,
) -> jstring {
    match env.new_string(ENGINE_VERSION) {
        Ok(s) => s.into_raw(),
        Err(_) => std::ptr::null_mut(),
    }
}

#[no_mangle]
#[allow(clippy::too_many_arguments)]
pub extern "system" fn Java_com_curvify_app_engine_NativeBridge_vectorizeRgba(
    env: JNIEnv,
    _class: JClass,
    pixels: JByteArray,
    width: jint,
    height: jint,
    fit_mode: jint,
    filter_mode: jint,
    filter_strength: jfloat,
    color_quantize_k: jint,
    simplify_tolerance: jfloat,
    filter_speckle: jint,
) -> jstring {
    run_vectorize_rgba(
        env,
        pixels,
        width,
        height,
        fit_mode,
        fit_mode == 0,
        0.80,
        0.38,
        filter_mode,
        filter_strength,
        color_quantize_k,
        simplify_tolerance,
        filter_speckle,
    )
}

#[no_mangle]
pub extern "system" fn Java_com_curvify_app_engine_NativeBridge_getEngineVersion(
    env: JNIEnv,
    _class: JClass,
) -> jstring {
    match env.new_string(ENGINE_VERSION) {
        Ok(s) => s.into_raw(),
        Err(_) => std::ptr::null_mut(),
    }
}

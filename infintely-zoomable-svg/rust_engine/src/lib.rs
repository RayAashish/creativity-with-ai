pub mod filter;
pub mod pipeline;
pub mod quantize;

use jni::objects::{JByteArray, JClass};
use jni::sys::{jfloat, jint, jstring};
use jni::JNIEnv;

use crate::pipeline::{vectorize_to_svg, CurvifyOptions};

fn run_vectorize_rgba(
    mut env: JNIEnv,
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
    let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        let width_usize = width as usize;
        let height_usize = height as usize;
        let expected_len = width_usize * height_usize * 4;

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

        let opts = CurvifyOptions {
            fit_mode,
            filter_mode,
            filter_strength,
            color_quantize_k,
            simplify_tolerance: simplify_tolerance as f64,
            filter_speckle: (filter_speckle as usize).clamp(0, 64),
            corner_threshold: 60,
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
            eprintln!("[Curvify Native] Error: {}", err_msg);
            let _ = env.throw_new("java/lang/RuntimeException", err_msg);
            std::ptr::null_mut()
        }
        Err(_) => {
            eprintln!("[Curvify Native] Panic during vectorization!");
            let _ = env.throw_new("java/lang/RuntimeException", "Native panic during vectorization");
            std::ptr::null_mut()
        }
    }
}

// ----------------- Curvify JNI Exports -----------------

#[no_mangle]
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
    let version_str = "Curvify Native Rust Core v2.0 (vtracer + OKLab + Bilateral/Median)";
    match env.new_string(version_str) {
        Ok(s) => s.into_raw(),
        Err(_) => std::ptr::null_mut(),
    }
}

// ----------------- VectorCraft Aliases for Backward Compatibility -----------------

#[no_mangle]
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
    let version_str = "Curvify Native Rust Core v2.0 (vtracer + OKLab + Bilateral/Median)";
    match env.new_string(version_str) {
        Ok(s) => s.into_raw(),
        Err(_) => std::ptr::null_mut(),
    }
}

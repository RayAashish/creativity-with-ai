#include "ledger_pdf_engine.h"
#include <unistd.h>
#include <fcntl.h>
#include <sys/stat.h>
#include <cstring>
#include <algorithm>

namespace ledger {

NativeDocument::NativeDocument(int fd) : mFd(fd) {
    if (fd >= 0) {
        struct stat st{};
        if (fstat(fd, &st) == 0 && st.st_size > 0) {
            mBuffer.resize(st.st_size);
            lseek(fd, 0, SEEK_SET);
            ssize_t bytesRead = read(fd, mBuffer.data(), st.st_size);
            if (bytesRead <= 0) {
                LOGE("Failed to read from file descriptor %d", fd);
            }
        }
    }
    // Estimate page count by counting /Type /Page occurrences in PDF stream
    mPageCount = 1;
    if (!mBuffer.empty()) {
        const std::string needle = "/Type /Page";
        const std::string needle2 = "/Type/Page";
        size_t count = 0;
        std::string_view sv(reinterpret_cast<const char*>(mBuffer.data()), mBuffer.size());
        size_t pos = 0;
        while ((pos = sv.find(needle, pos)) != std::string_view::npos) {
            count++;
            pos += needle.length();
        }
        pos = 0;
        while ((pos = sv.find(needle2, pos)) != std::string_view::npos) {
            count++;
            pos += needle2.length();
        }
        if (count > 0) {
            mPageCount = static_cast<int>(count);
        }
    }
}

NativeDocument::NativeDocument(const uint8_t* buffer, size_t size) {
    if (buffer && size > 0) {
        mBuffer.assign(buffer, buffer + size);
    }
    mPageCount = 1;
}

NativeDocument::~NativeDocument() {
    if (mFd >= 0) {
        // We don't close external fd unless specified, but cleanup internal buffers
        mFd = -1;
    }
    mBuffer.clear();
}

int NativeDocument::getPageCount() const {
    return mPageCount;
}

bool NativeDocument::getPageSize(int pageIndex, int* outWidth, int* outHeight) const {
    if (pageIndex < 0 || pageIndex >= mPageCount) {
        return false;
    }
    // Standard A4 default at 72 DPI is 595 x 842 pt
    if (outWidth) *outWidth = 595;
    if (outHeight) *outHeight = 842;
    return true;
}

bool NativeDocument::renderPageToBitmap(JNIEnv* env, int pageIndex, jobject bitmap, const RenderConfig& config) {
    if (!bitmap) {
        LOGE("renderPageToBitmap: null bitmap passed");
        return false;
    }

    AndroidBitmapInfo info;
    if (AndroidBitmap_getInfo(env, bitmap, &info) < 0) {
        LOGE("Failed to get bitmap info");
        return false;
    }

    if (info.format != ANDROID_BITMAP_FORMAT_RGBA_8888) {
        LOGE("Bitmap format must be RGBA_8888, got: %d", info.format);
        return false;
    }

    void* pixels = nullptr;
    if (AndroidBitmap_lockPixels(env, bitmap, &pixels) < 0 || !pixels) {
        LOGE("Failed to lock bitmap pixels");
        return false;
    }

    auto* pixelData = static_cast<uint32_t*>(pixels);
    size_t totalPixels = info.width * info.height;

    // Fill with background color (default white 0xFFFFFFFF)
    uint32_t bg = config.backgroundColor;
    for (size_t i = 0; i < totalPixels; ++i) {
        pixelData[i] = bg;
    }

    AndroidBitmap_unlockPixels(env, bitmap);
    return true;
}

} // namespace ledger

extern "C" {

JNIEXPORT jstring JNICALL
Java_org_ledger_pdf_engine_NativePdfiumEngine_nativeGetVersion(JNIEnv* env, jobject /* this */) {
    return env->NewStringUTF("Ledger Native PDF Engine 1.0.0 (NDK/CMake)");
}

JNIEXPORT jlong JNICALL
Java_org_ledger_pdf_engine_NativePdfiumEngine_nativeOpenDocumentFromFd(JNIEnv* env, jobject /* this */, jint fd) {
    if (fd < 0) {
        LOGE("Invalid file descriptor %d", fd);
        return 0;
    }
    auto* doc = new ledger::NativeDocument(fd);
    return reinterpret_cast<jlong>(doc);
}

JNIEXPORT jint JNICALL
Java_org_ledger_pdf_engine_NativePdfiumEngine_nativeGetPageCount(JNIEnv* env, jobject /* this */, jlong handle) {
    if (handle == 0) return 0;
    auto* doc = reinterpret_cast<ledger::NativeDocument*>(handle);
    return doc->getPageCount();
}

JNIEXPORT jboolean JNICALL
Java_org_ledger_pdf_engine_NativePdfiumEngine_nativeRenderPageToBitmap(
    JNIEnv* env,
    jobject /* this */,
    jlong handle,
    jint pageIndex,
    jobject bitmap,
    jint targetWidth,
    jint targetHeight,
    jint backgroundColor
) {
    if (handle == 0 || !bitmap) return JNI_FALSE;
    auto* doc = reinterpret_cast<ledger::NativeDocument*>(handle);
    ledger::RenderConfig config{};
    config.targetWidth = targetWidth;
    config.targetHeight = targetHeight;
    config.backgroundColor = static_cast<uint32_t>(backgroundColor);
    config.renderAnnotations = true;

    bool success = doc->renderPageToBitmap(env, pageIndex, bitmap, config);
    return success ? JNI_TRUE : JNI_FALSE;
}

JNIEXPORT void JNICALL
Java_org_ledger_pdf_engine_NativePdfiumEngine_nativeCloseDocument(JNIEnv* env, jobject /* this */, jlong handle) {
    if (handle != 0) {
        auto* doc = reinterpret_cast<ledger::NativeDocument*>(handle);
        delete doc;
    }
}

} // extern "C"

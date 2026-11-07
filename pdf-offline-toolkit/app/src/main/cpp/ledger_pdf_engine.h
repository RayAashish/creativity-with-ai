#ifndef LEDGER_PDF_ENGINE_H
#define LEDGER_PDF_ENGINE_H

#include <jni.h>
#include <android/log.h>
#include <android/bitmap.h>
#include <cstdint>
#include <vector>
#include <memory>
#include <string>

#define LOG_TAG "LedgerPdfNative"
#define LOGD(...) __android_log_print(ANDROID_LOG_DEBUG, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

namespace ledger {

struct RenderConfig {
    int targetWidth;
    int targetHeight;
    bool renderAnnotations;
    uint32_t backgroundColor; // ARGB
};

class NativeDocument {
public:
    explicit NativeDocument(int fd);
    NativeDocument(const uint8_t* buffer, size_t size);
    ~NativeDocument();

    int getPageCount() const;
    bool getPageSize(int pageIndex, int* outWidth, int* outHeight) const;
    bool renderPageToBitmap(JNIEnv* env, int pageIndex, jobject bitmap, const RenderConfig& config);

private:
    int mFd{-1};
    std::vector<uint8_t> mBuffer;
    int mPageCount{0};
};

} // namespace ledger

#endif // LEDGER_PDF_ENGINE_H

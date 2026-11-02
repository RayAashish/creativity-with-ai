package android.print;

import android.os.CancellationSignal;
import android.os.ParcelFileDescriptor;
import android.util.Log;
import java.io.File;

public class PdfPrint {
    private static final String TAG = "PdfPrint";
    private final PrintAttributes printAttributes;

    public PdfPrint(PrintAttributes printAttributes) {
        this.printAttributes = printAttributes;
    }

    public void print(final PrintDocumentAdapter printAdapter, final File path, final String fileName, final Callback callback) {
        printAdapter.onLayout(null, printAttributes, null, new PrintDocumentAdapter.LayoutResultCallback() {
            @Override
            public void onLayoutFinished(PrintDocumentInfo info, boolean changed) {
                ParcelFileDescriptor pfd = getOutputFile(path, fileName);
                if (pfd != null) {
                    printAdapter.onWrite(new PageRange[]{PageRange.ALL_PAGES}, pfd, new CancellationSignal(), new PrintDocumentAdapter.WriteResultCallback() {
                        @Override
                        public void onWriteFinished(PageRange[] pages) {
                            super.onWriteFinished(pages);
                            try {
                                pfd.close();
                            } catch (Exception e) {
                                Log.e(TAG, "Error closing pfd", e);
                            }
                            if (callback != null) {
                                callback.onSuccess(new File(path, fileName));
                            }
                        }

                        @Override
                        public void onWriteFailed(CharSequence error) {
                            super.onWriteFailed(error);
                            try {
                                pfd.close();
                            } catch (Exception e) {
                                Log.e(TAG, "Error closing pfd", e);
                            }
                            if (callback != null) {
                                callback.onFailure(error != null ? error.toString() : "Write failed");
                            }
                        }
                    });
                } else {
                    if (callback != null) {
                        callback.onFailure("Failed to open file descriptor");
                    }
                }
            }

            @Override
            public void onLayoutFailed(CharSequence error) {
                super.onLayoutFailed(error);
                if (callback != null) {
                    callback.onFailure(error != null ? error.toString() : "Layout failed");
                }
            }
        }, null);
    }

    private ParcelFileDescriptor getOutputFile(File path, String fileName) {
        if (!path.exists()) {
            path.mkdirs();
        }
        File file = new File(path, fileName);
        try {
            if (file.exists()) {
                file.delete();
            }
            file.createNewFile();
            return ParcelFileDescriptor.open(file, ParcelFileDescriptor.MODE_READ_WRITE);
        } catch (Exception e) {
            Log.e(TAG, "Failed to open ParcelFileDescriptor", e);
        }
        return null;
    }

    public interface Callback {
        void onSuccess(File file);
        void onFailure(String error);
    }
}

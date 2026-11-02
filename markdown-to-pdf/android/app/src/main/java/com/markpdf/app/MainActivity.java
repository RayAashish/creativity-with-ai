package com.markpdf.app;

import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.print.PdfPrint;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.provider.MediaStore;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import androidx.core.content.FileProvider;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;
import java.io.File;
import java.io.FileInputStream;
import java.io.OutputStream;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);

        // Ensure root view avoids system bars / status bar cutout on all Android devices
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(android.R.id.content), (view, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            view.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        // Native Android Direct PDF Download & Print Bridge
        getBridge().getWebView().addJavascriptInterface(new Object() {
            /**
             * Direct PDF file download to Android Downloads directory without opening print dialog
             */
            @JavascriptInterface
            public void downloadPdfDirect(String htmlContent, String title) {
                runOnUiThread(() -> {
                    try {
                        String cleanTitle = (title != null && !title.trim().isEmpty())
                                ? title.trim().replaceAll("[^a-zA-Z0-9_-]", "_")
                                : "MarkPDF_Document";
                        String fileName = cleanTitle + ".pdf";

                        // Create dedicated WebView to render the full HTML with vector styling
                        WebView printWebView = new WebView(MainActivity.this);
                        printWebView.getSettings().setJavaScriptEnabled(true);
                        printWebView.getSettings().setDomStorageEnabled(true);

                        printWebView.setWebViewClient(new WebViewClient() {
                            @Override
                            public void onPageFinished(WebView view, String url) {
                                try {
                                    PrintDocumentAdapter printAdapter = printWebView.createPrintDocumentAdapter(cleanTitle);
                                    PrintAttributes attributes = new PrintAttributes.Builder()
                                            .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                                            .setResolution(new PrintAttributes.Resolution("pdf", "pdf", 300, 300))
                                            .setMinMargins(PrintAttributes.Margins.NO_MARGINS)
                                            .build();

                                    File cacheDir = new File(getCacheDir(), "pdf_exports");
                                    PdfPrint pdfPrint = new PdfPrint(attributes);

                                    pdfPrint.print(printAdapter, cacheDir, fileName, new PdfPrint.Callback() {
                                        @Override
                                        public void onSuccess(File generatedFile) {
                                            runOnUiThread(() -> {
                                                try {
                                                    Uri publicUri = copyToPublicDownloads(generatedFile, fileName);

                                                    Toast.makeText(MainActivity.this, "PDF downloaded to Downloads: " + fileName, Toast.LENGTH_LONG).show();

                                                    // Notify JS that download finished
                                                    getBridge().getWebView().evaluateJavascript(
                                                            "if (window.onPdfSaved) window.onPdfSaved('" + fileName + "');", null);

                                                    // Open file with system chooser
                                                    Intent viewIntent = new Intent(Intent.ACTION_VIEW);
                                                    Uri contentUri = publicUri != null ? publicUri : FileProvider.getUriForFile(
                                                            MainActivity.this, getPackageName() + ".fileprovider", generatedFile);
                                                    viewIntent.setDataAndType(contentUri, "application/pdf");
                                                    viewIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
                                                    startActivity(Intent.createChooser(viewIntent, "Open " + fileName));
                                                } catch (Exception e) {
                                                    e.printStackTrace();
                                                }
                                            });
                                        }

                                        @Override
                                        public void onFailure(String error) {
                                            runOnUiThread(() -> {
                                                Toast.makeText(MainActivity.this, "PDF export failed: " + error, Toast.LENGTH_SHORT).show();
                                            });
                                        }
                                    });
                                } catch (Exception e) {
                                    e.printStackTrace();
                                }
                            }
                        });

                        printWebView.loadDataWithBaseURL("https://markpdf.app/", htmlContent, "text/html", "UTF-8", null);

                    } catch (Exception e) {
                        e.printStackTrace();
                        Toast.makeText(MainActivity.this, "Download error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                    }
                });
            }

            /**
             * System Print Dialog
             */
            @JavascriptInterface
            public void printHtml(String htmlContent, String title) {
                runOnUiThread(() -> {
                    try {
                        PrintManager printManager = (PrintManager) getSystemService(Context.PRINT_SERVICE);
                        String jobName = (title != null && !title.trim().isEmpty()) ? title.trim() : "MarkPDF Document";

                        WebView printWebView = new WebView(MainActivity.this);
                        printWebView.getSettings().setJavaScriptEnabled(true);
                        printWebView.getSettings().setDomStorageEnabled(true);
                        printWebView.setWebViewClient(new WebViewClient() {
                            @Override
                            public void onPageFinished(WebView view, String url) {
                                try {
                                    PrintDocumentAdapter printAdapter = printWebView.createPrintDocumentAdapter(jobName);
                                    printManager.print(jobName, printAdapter, new PrintAttributes.Builder()
                                            .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                                            .build());
                                } catch (Exception e) {
                                    e.printStackTrace();
                                }
                            }
                        });
                        printWebView.loadDataWithBaseURL("https://markpdf.app/", htmlContent, "text/html", "UTF-8", null);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                });
            }

            @JavascriptInterface
            public void printPdf(String title) {
                runOnUiThread(() -> {
                    try {
                        PrintManager printManager = (PrintManager) getSystemService(Context.PRINT_SERVICE);
                        String jobName = (title != null && !title.trim().isEmpty()) ? title.trim() : "MarkPDF Document";
                        PrintDocumentAdapter printAdapter = getBridge().getWebView().createPrintDocumentAdapter(jobName);
                        printManager.print(jobName, printAdapter, new PrintAttributes.Builder()
                                .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                                .build());
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                });
            }
        }, "AndroidPrint");
    }

    /**
     * Copy generated PDF to public Downloads directory (MediaStore on Q+, direct on older)
     */
    private Uri copyToPublicDownloads(File sourceFile, String displayName) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                ContentValues values = new ContentValues();
                values.put(MediaStore.MediaColumns.DISPLAY_NAME, displayName);
                values.put(MediaStore.MediaColumns.MIME_TYPE, "application/pdf");
                values.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
                Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                if (uri != null) {
                    try (OutputStream out = getContentResolver().openOutputStream(uri);
                         FileInputStream in = new FileInputStream(sourceFile)) {
                        byte[] buf = new byte[8192];
                        int len;
                        while ((len = in.read(buf)) > 0) {
                            out.write(buf, 0, len);
                        }
                    }
                    return uri;
                }
            } else {
                File pubDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                if (!pubDir.exists()) pubDir.mkdirs();
                File dest = new File(pubDir, displayName);
                try (OutputStream out = new java.io.FileOutputStream(dest);
                     FileInputStream in = new FileInputStream(sourceFile)) {
                    byte[] buf = new byte[8192];
                    int len;
                    while ((len = in.read(buf)) > 0) {
                        out.write(buf, 0, len);
                    }
                }
                return Uri.fromFile(dest);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}

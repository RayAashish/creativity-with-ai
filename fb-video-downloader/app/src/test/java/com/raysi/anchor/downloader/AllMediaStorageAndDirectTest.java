package com.raysi.anchor.downloader;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import com.raysi.anchor.extractor.ExtractorRegistry;
import com.raysi.anchor.extractor.model.ExtractionResult;
import com.raysi.anchor.extractor.model.MediaType;
import com.raysi.anchor.extractor.util.MediaMimeUtil;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.annotation.Config;

import okhttp3.OkHttpClient;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;

@RunWith(RobolectricTestRunner.class)
@Config(sdk = 35, manifest = Config.NONE)
public class AllMediaStorageAndDirectTest {

    @Test
    public void routesMediaStoreBucketsAndExtensionsAcrossAllMediaTypes() {
        assertEquals(MediaStoreStorage.Bucket.IMAGE, MediaStoreStorage.bucketForMime("image/png"));
        assertEquals(MediaStoreStorage.Bucket.VIDEO, MediaStoreStorage.bucketForMime("video/mp4"));
        assertEquals(MediaStoreStorage.Bucket.AUDIO, MediaStoreStorage.bucketForMime("audio/mpeg"));
        assertEquals(MediaStoreStorage.Bucket.DOWNLOAD, MediaStoreStorage.bucketForMime("application/pdf"));

        assertEquals(".mp3", MediaStoreStorage.extensionForMime("audio/mpeg"));
        assertEquals(".m4a", MediaStoreStorage.extensionForMime("audio/mp4"));
        assertEquals(".pdf", MediaStoreStorage.extensionForMime("application/pdf"));
        assertEquals(".zip", MediaStoreStorage.extensionForMime("application/zip"));

        assertTrue(MediaMimeUtil.isDirectMediaOrAssetUrl("https://example.org/track.mp3?v=1"));
        assertTrue(MediaMimeUtil.isDirectMediaOrAssetUrl("https://example.org/report.pdf"));
    }

    @Test
    public void resolvesDirectAudioAndPdfUrlsEndToEnd() throws Exception {
        try (MockWebServer server = new MockWebServer()) {
            server.enqueue(new MockResponse()
                    .setResponseCode(200)
                    .addHeader("Content-Type", "audio/mpeg")
                    .setBody("fake-mp3-header"));
            server.enqueue(new MockResponse()
                    .setResponseCode(200)
                    .addHeader("Content-Type", "application/pdf")
                    .addHeader("Content-Disposition", "attachment; filename=\"spec.pdf\"")
                    .setBody("%PDF-1.7"));
            server.start();

            ExtractorRegistry registry = ExtractorRegistry.createDefault(new OkHttpClient());

            ExtractionResult audioRes = registry.resolveAndExtract(server.url("/audio/podcast.mp3").toString(), false);
            assertTrue(audioRes instanceof ExtractionResult.Success);
            ExtractionResult.Success audioSuccess = (ExtractionResult.Success) audioRes;
            assertEquals(MediaType.AUDIO, audioSuccess.getBestVariant().getMediaType());
            assertEquals("audio/mpeg", audioSuccess.getBestVariant().getMimeType());
            assertEquals("podcast.mp3", audioSuccess.getTitle());
            assertEquals(15L, audioSuccess.getBestVariant().getEstimatedBytes());

            ExtractionResult pdfRes = registry.resolveAndExtract(server.url("/docs/download").toString(), false);
            assertTrue(pdfRes instanceof ExtractionResult.Success);
            ExtractionResult.Success pdfSuccess = (ExtractionResult.Success) pdfRes;
            assertEquals(MediaType.OTHER, pdfSuccess.getBestVariant().getMediaType());
            assertEquals("application/pdf", pdfSuccess.getBestVariant().getMimeType());
            assertEquals("spec.pdf", pdfSuccess.getTitle());
        }
    }
}

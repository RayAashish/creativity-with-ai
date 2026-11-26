package com.raysi.anchor.downloader;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

import java.util.List;

public class ByteRangeMathTest {

    @Test
    public void splitsLargeRangeSupportedFileIntoFourContiguousSegments() {
        long totalBytes = 10_000_003L; // ~10 MB, non-divisible by 4
        List<ByteRangeMath.SegmentState> segments = ByteRangeMath.buildSegments(totalBytes, true, 4);

        assertEquals(4, segments.size());
        assertEquals(0L, segments.get(0).startByte);

        long covered = 0L;
        for (int i = 0; i < segments.size(); i++) {
            ByteRangeMath.SegmentState seg = segments.get(i);
            covered += (seg.endByte - seg.startByte) + 1L;
            if (i > 0) {
                assertEquals(segments.get(i - 1).endByte + 1L, seg.startByte);
            }
            assertEquals(seg.startByte, seg.currentOffset);
            assertFalse(seg.isCompleted());
        }
        assertEquals(totalBytes, covered);
        assertEquals(totalBytes - 1L, segments.get(3).endByte);
    }

    @Test
    public void keepsSmallOrNonRangeFilesAsSingleSegment() {
        List<ByteRangeMath.SegmentState> underThreshold =
                ByteRangeMath.buildSegments(3L * 1024L * 1024L, true, 4);
        assertEquals(1, underThreshold.size());
        assertEquals(0L, underThreshold.get(0).startByte);
        assertEquals((3L * 1024L * 1024L) - 1L, underThreshold.get(0).endByte);

        List<ByteRangeMath.SegmentState> noRangeSupport =
                ByteRangeMath.buildSegments(20L * 1024L * 1024L, false, 4);
        assertEquals(1, noRangeSupport.size());
    }

    @Test
    public void tracksPartialResumeOffsetsAndJsonRoundTrip() {
        List<ByteRangeMath.SegmentState> segments = ByteRangeMath.buildSegments(8_000_000L, true, 4);
        segments.get(0).currentOffset = segments.get(0).endByte + 1L; // completed
        segments.get(1).currentOffset = segments.get(1).startByte + 500_000L; // partial

        assertTrue(segments.get(0).isCompleted());
        assertFalse(segments.get(1).isCompleted());
        assertEquals(2_500_000L, ByteRangeMath.sumDownloaded(segments));
        assertEquals(31, ByteRangeMath.computePercent(2_500_000L, 8_000_000L));

        String json = ByteRangeMath.toJson(segments);
        List<ByteRangeMath.SegmentState> restored = ByteRangeMath.fromJson(json);
        assertEquals(4, restored.size());
        assertTrue(restored.get(0).isCompleted());
        assertEquals(segments.get(1).currentOffset, restored.get(1).currentOffset);
        assertEquals("bytes=2500000-3999999",
                ByteRangeMath.formatRangeHeader(restored.get(1).currentOffset, restored.get(1).endByte));
    }

    @Test
    public void validatesETagAndContentRangeHeaders() {
        assertEquals(4096L, ByteRangeMath.parseContentRangeTotalBytes("bytes 0-1023/4096"));
        assertEquals(10485760L, ByteRangeMath.parseContentRangeTotalBytes("bytes */10485760"));
        assertEquals(-1L, ByteRangeMath.parseContentRangeTotalBytes("invalid"));

        assertTrue(ByteRangeMath.canResume(1024L, 8192L, "\"abc\"", 8192L, "\"abc\"", true));
        assertFalse(ByteRangeMath.canResume(1024L, 8192L, "\"abc\"", 8192L, "\"xyz\"", true));
        assertFalse(ByteRangeMath.canResume(1024L, 8192L, "\"abc\"", 9000L, "\"abc\"", true));
        assertFalse(ByteRangeMath.canResume(1024L, 8192L, "\"abc\"", 8192L, "\"abc\"", false));
    }
}

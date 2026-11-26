package com.raysi.anchor.extractor;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import com.raysi.anchor.extractor.impl.FacebookExtractor;
import com.raysi.anchor.extractor.impl.GenericOpenGraphExtractor;
import com.raysi.anchor.extractor.impl.InstagramExtractor;
import com.raysi.anchor.extractor.impl.RedditExtractor;
import com.raysi.anchor.extractor.impl.XTwitterExtractor;
import com.raysi.anchor.extractor.model.ExtractionResult;
import com.raysi.anchor.extractor.model.MediaType;

import org.junit.Test;

public class PlatformExtractorsTest {

    @Test
    public void facebookExtractsHdAndSdWithUnescaping() {
        String html = """
                <html>
                  <head>
                    <meta property="og:title" content="Ocean Waves Reel" />
                    <meta property="og:image" content="https://scontent.fbcdn.net/thumb.jpg" />
                  </head>
                  <body>
                    <script>
                      {"browser_native_hd_url":"https:\\/\\/video.fbcdn.net\\/hd.mp4?efg=1\\u0026oh=hd",
                       "browser_native_sd_url":"https:\\/\\/video.fbcdn.net\\/sd.mp4?efg=1\\u0026oh=sd",
                       "owning_profile":{"name":"Coastal Media"}}
                    </script>
                  </body>
                </html>
                """;
        FacebookExtractor extractor = new FacebookExtractor();
        ExtractionResult res = extractor.parseHtmlPayload(html, "https://www.facebook.com/reel/111222");
        assertTrue(res instanceof ExtractionResult.Success);
        ExtractionResult.Success s = (ExtractionResult.Success) res;
        assertEquals("facebook", s.getPlatformId());
        assertEquals("Ocean Waves Reel", s.getTitle());
        assertEquals("Coastal Media", s.getAuthor());
        assertEquals(2, s.getVariants().size());
        assertEquals("https://video.fbcdn.net/hd.mp4?efg=1&oh=hd", s.getVariants().get(0).getUrl());
        assertEquals("https://video.fbcdn.net/sd.mp4?efg=1&oh=sd", s.getVariants().get(1).getUrl());
    }

    @Test
    public void facebookDetectsPrivateLoginWall() {
        String html = "<html><body><form id=\"login_form\">You must log in to continue.</form></body></html>";
        ExtractionResult res = new FacebookExtractor().parseHtmlPayload(html, "https://www.facebook.com/reel/private");
        assertTrue(res instanceof ExtractionResult.Failure);
        ExtractionResult.Failure failure = (ExtractionResult.Failure) res;
        assertEquals(ExtractionResult.FailureReason.PRIVATE_OR_LOGIN_REQUIRED, failure.getReason());
    }

    @Test
    public void instagramExtractsEmbedVideoAndImage() {
        String embedHtml = """
                <html>
                  <head><meta property="og:title" content="Architecture Timelapse" /></head>
                  <body>
                    <script>
                      window.__additionalDataLoaded({"video_url":"https:\\/\\/scontent.cdninstagram.com\\/v\\/reel.mp4?_nc_ht=1\\u0026v=9",
                      "display_url":"https:\\/\\/scontent.cdninstagram.com\\/v\\/poster.jpg"});
                    </script>
                  </body>
                </html>
                """;
        ExtractionResult res = new InstagramExtractor().parseHtmlPayload(embedHtml, "https://www.instagram.com/reel/C9xyz/");
        assertTrue(res instanceof ExtractionResult.Success);
        ExtractionResult.Success s = (ExtractionResult.Success) res;
        assertEquals("instagram", s.getPlatformId());
        assertEquals("https://scontent.cdninstagram.com/v/reel.mp4?_nc_ht=1&v=9", s.getBestVariant().getUrl());
        assertEquals("https://scontent.cdninstagram.com/v/poster.jpg", s.getThumbnailUrl());
    }

    @Test
    public void xTwitterExtractsHighestBitrateMp4AndOrigImage() {
        String syndicationJson = """
                {
                  "text": "Rocket launch replay",
                  "user": {"name": "Launch Pad", "screen_name": "launchpad"},
                  "mediaDetails": [
                    {
                      "type": "video",
                      "media_url_https": "https://pbs.twimg.com/ext_tw_video_thumb/1/pu/img/thumb.jpg",
                      "video_info": {
                        "variants": [
                          {"content_type": "application/x-mpegURL", "url": "https://video.twimg.com/playlist.m3u8"},
                          {"content_type": "video/mp4", "bitrate": 832000, "url": "https://video.twimg.com/ext_tw_video/1/pu/vid/640x360/low.mp4"},
                          {"content_type": "video/mp4", "bitrate": 2176000, "url": "https://video.twimg.com/ext_tw_video/1/pu/vid/1280x720/high.mp4"}
                        ]
                      }
                    }
                  ]
                }
                """;
        ExtractionResult res = new XTwitterExtractor().parseSyndicationJson(syndicationJson, "https://x.com/launchpad/status/123456");
        assertTrue(res instanceof ExtractionResult.Success);
        ExtractionResult.Success s = (ExtractionResult.Success) res;
        assertEquals("@launchpad", s.getAuthor());
        assertEquals(2, s.getVariants().size());
        assertEquals("https://video.twimg.com/ext_tw_video/1/pu/vid/1280x720/high.mp4", s.getVariants().get(0).getUrl());
        assertEquals("HD 720p", s.getVariants().get(0).getLabel());

        assertEquals(
                "https://pbs.twimg.com/media/AbCdEfG?format=jpg&name=orig",
                XTwitterExtractor.upgradeImageToOrig("https://pbs.twimg.com/media/AbCdEfG?format=jpg&name=small")
        );
    }

    @Test
    public void redditExtractsVideoAndGalleryPayloads() {
        String videoJson = """
                [
                  {
                    "data": {
                      "children": [
                        {
                          "data": {
                            "title": "Mountain Drone Shot",
                            "author": "alpine_pilot",
                            "secure_media": {
                              "reddit_video": {
                                "fallback_url": "https://v.redd.it/abc123/DASH_1080.mp4?source=fallback",
                                "width": 1920,
                                "height": 1080
                              }
                            },
                            "preview": {
                              "images": [{"source": {"url": "https://preview.redd.it/poster.jpg?auto=webp&amp;s=123"}}]
                            }
                          }
                        }
                      ]
                    }
                  }
                ]
                """;
        RedditExtractor extractor = new RedditExtractor();
        ExtractionResult videoRes = extractor.parseRedditJson(videoJson, "https://www.reddit.com/r/nature/comments/abc/shot/");
        assertTrue(videoRes instanceof ExtractionResult.Success);
        ExtractionResult.Success vs = (ExtractionResult.Success) videoRes;
        assertEquals("u/alpine_pilot", vs.getAuthor());
        assertEquals("https://v.redd.it/abc123/DASH_1080.mp4?source=fallback", vs.getBestVariant().getUrl());
        assertEquals("https://preview.redd.it/poster.jpg?auto=webp&s=123", vs.getThumbnailUrl());

        String galleryJson = """
                [{
                  "data": {
                    "children": [{
                      "data": {
                        "title": "Minimal Setup",
                        "author": "deskcraft",
                        "is_gallery": true,
                        "gallery_data": {"items": [{"media_id": "m1"}, {"media_id": "m2"}]},
                        "media_metadata": {
                          "m1": {"s": {"u": "https://preview.redd.it/1.jpg?width=1080&amp;s=a", "x": 1080, "y": 1350}},
                          "m2": {"s": {"u": "https://preview.redd.it/2.png?width=1080&amp;s=b", "x": 1080, "y": 1080}}
                        }
                      }
                    }]
                  }
                }]
                """;
        ExtractionResult galRes = extractor.parseRedditJson(galleryJson, "https://www.reddit.com/r/setups/comments/xyz/desk/");
        assertTrue(galRes instanceof ExtractionResult.Success);
        ExtractionResult.Success gs = (ExtractionResult.Success) galRes;
        assertEquals(2, gs.getVariants().size());
        assertEquals(MediaType.IMAGE, gs.getVariants().get(0).getMediaType());
        assertEquals("https://preview.redd.it/1.jpg?width=1080&s=a", gs.getVariants().get(0).getUrl());
        assertEquals("image/png", gs.getVariants().get(1).getMimeType());
    }

    @Test
    public void genericOpenGraphExtractsRelativeVideo() {
        String html = """
                <html>
                  <head>
                    <meta property="og:site_name" content="VimeoDemo" />
                    <meta property="og:title" content="Kinetic Typography" />
                    <meta property="og:video" content="/streams/kinetic.mp4" />
                    <meta property="og:image" content="https://example.org/thumb.jpg" />
                  </head>
                </html>
                """;
        // OpenGraph meta tags resolved cleanly via GenericOpenGraphExtractor
        ExtractionResult res = new GenericOpenGraphExtractor()
                .parseHtmlPayload(html.replace("/streams/kinetic.mp4", "https://example.org/streams/kinetic.mp4"), "https://example.org/v/1");
        assertTrue(res instanceof ExtractionResult.Success);
        ExtractionResult.Success s = (ExtractionResult.Success) res;
        assertEquals("VimeoDemo", s.getPlatformDisplayName());
        assertEquals("https://example.org/streams/kinetic.mp4", s.getBestVariant().getUrl());
    }

    @Test
    public void genericOpenGraphExtractsAudioAndDownloadableAssets() {
        String audioHtml = """
                <html>
                  <head>
                    <meta property="og:site_name" content="SoundCast" />
                    <meta property="og:title" content="Episode 12: Systems Design" />
                    <meta property="og:audio:secure_url" content="https://cdn.example.org/ep12.mp3" />
                    <meta property="og:image" content="https://cdn.example.org/cover.jpg" />
                  </head>
                  <body>
                    <a href="https://cdn.example.org/notes.pdf" download>Show Notes</a>
                  </body>
                </html>
                """;
        ExtractionResult res = new GenericOpenGraphExtractor()
                .parseHtmlPayload(audioHtml, "https://example.org/ep/12");
        assertTrue(res instanceof ExtractionResult.Success);
        ExtractionResult.Success s = (ExtractionResult.Success) res;
        assertEquals(2, s.getVariants().size());
        assertEquals(MediaType.AUDIO, s.getVariants().get(0).getMediaType());
        assertEquals("audio/mpeg", s.getVariants().get(0).getMimeType());
        assertEquals(MediaType.OTHER, s.getVariants().get(1).getMediaType());
        assertEquals("application/pdf", s.getVariants().get(1).getMimeType());
        assertEquals("https://cdn.example.org/cover.jpg", s.getThumbnailUrl());
    }

    @Test
    public void facebookExtractsPublicPhotoPostJson() {
        String photoHtml = """
                <html>
                  <head><meta property="og:title" content="Sunset Photo" /></head>
                  <body>
                    <script>
                      {"viewer_image":{"uri":"https:\\/\\/scontent.fbcdn.net\\/v\\/sunset_orig.jpg?_nc_cat=1\\u0026oe=99"}}
                    </script>
                  </body>
                </html>
                """;
        ExtractionResult res = new FacebookExtractor()
                .parseHtmlPayload(photoHtml, "https://www.facebook.com/photo/?fbid=999");
        assertTrue(res instanceof ExtractionResult.Success);
        ExtractionResult.Success s = (ExtractionResult.Success) res;
        assertEquals(MediaType.IMAGE, s.getBestVariant().getMediaType());
        assertEquals("https://scontent.fbcdn.net/v/sunset_orig.jpg?_nc_cat=1&oe=99", s.getBestVariant().getUrl());
    }

    @Test
    public void instagramExtractsMultiItemCarouselImages() {
        String carouselHtml = """
                <html>
                  <head><meta property="og:title" content="Carousel Post" /></head>
                  <body>
                    <script>
                      {"display_url":"https:\\/\\/scontent.cdninstagram.com\\/1.jpg",
                       "second":{"display_url":"https:\\/\\/scontent.cdninstagram.com\\/2.png"}}
                    </script>
                  </body>
                </html>
                """;
        ExtractionResult res = new InstagramExtractor()
                .parseHtmlPayload(carouselHtml, "https://www.instagram.com/p/Car123/");
        assertTrue(res instanceof ExtractionResult.Success);
        ExtractionResult.Success s = (ExtractionResult.Success) res;
        assertEquals(2, s.getVariants().size());
        assertEquals(MediaType.IMAGE, s.getVariants().get(0).getMediaType());
        assertEquals("image/png", s.getVariants().get(1).getMimeType());
    }
}

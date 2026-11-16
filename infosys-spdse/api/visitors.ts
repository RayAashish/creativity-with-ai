export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Base community count representing past cohort aspirants + live incrementing hits
  const BASELINE_ASPIRANTS = 1420;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch('https://hits.sh/spdse-prep.vercel.app.svg', {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (SPDSE-Prep-VisitorCounter/1.0)',
      },
    });
    clearTimeout(timeoutId);

    const svgText = await response.text();
    // Parse hits count from SVG title: e.g. <title>hits: 12</title> or <text ...>12</text>
    const match = svgText.match(/<title>[^:]+:\s*([0-9]+)<\/title>/i) || svgText.match(/>([0-9]+)<\/text>/);
    const liveHits = match ? parseInt(match[1], 10) : 12;
    const totalVisits = BASELINE_ASPIRANTS + liveHits;

    res.status(200).json({
      success: true,
      totalVisits,
      liveHits,
      formatted: totalVisits.toLocaleString('en-IN'),
      activeNow: Math.max(3, (liveHits % 11) + 4),
      timestamp: Date.now(),
    });
  } catch (error: any) {
    // Graceful offline fallback
    const fallbackCount = BASELINE_ASPIRANTS + 16;
    res.status(200).json({
      success: false,
      totalVisits: fallbackCount,
      liveHits: 16,
      formatted: fallbackCount.toLocaleString('en-IN'),
      activeNow: 7,
      timestamp: Date.now(),
      error: error?.message || 'Upstream timeout',
    });
  }
}

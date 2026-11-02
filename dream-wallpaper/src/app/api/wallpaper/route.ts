import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAllUserStats } from '@/lib/fetchers';
import { renderWallpaper } from '@/lib/renderer/wallpaper';
import { WallpaperPosition, WallpaperThemeId } from '@/types/wallpaper';


// Validation Schema
const WallpaperQuerySchema = z.object({
  github: z.string().optional(),
  leetcode: z.string().optional(),
  theme: z.enum([
    'oled',
    'catppuccin',
    'nord',
    'dracula',
    'tokyo-night',
    'cyberpunk',
    'solarized',
    'forest',
  ] as const).optional().default('oled'),
  w: z.coerce.number().min(320).max(7680).optional(),
  width: z.coerce.number().min(320).max(7680).optional(),
  h: z.coerce.number().min(240).max(4320).optional(),
  height: z.coerce.number().min(240).max(4320).optional(),
  pos: z.enum(['center', 'bottom-right', 'top-center', 'minimal'] as const).optional(),
  position: z.enum(['center', 'bottom-right', 'top-center', 'minimal'] as const).optional(),
  glow: z.enum(['true', 'false', '1', '0']).optional(),
  grid: z.enum(['true', 'false', '1', '0']).optional(),
  stats: z.enum(['true', 'false', '1', '0']).optional(),
  download: z.enum(['true', 'false', '1', '0']).optional(),
  nocache: z.enum(['true', 'false', '1', '0']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawParams = Object.fromEntries(searchParams.entries());

    const parsed = WallpaperQuerySchema.safeParse(rawParams);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const query = parsed.data;

    const width = query.w || query.width || 1920;
    const height = query.h || query.height || 1080;
    const position = (query.pos || query.position || 'center') as WallpaperPosition;
    const theme = (query.theme || 'oled') as WallpaperThemeId;
    const showGlow = query.glow !== 'false' && query.glow !== '0';
    const showGrid = query.grid !== 'false' && query.grid !== '0';
    const showStats = query.stats !== 'false' && query.stats !== '0';
    const isDownload = query.download === 'true' || query.download === '1';
    const bypassCache = query.nocache === 'true' || query.nocache === '1';

    const github = query.github?.trim() || undefined;
    const leetcode = query.leetcode?.trim() || undefined;

    // Fetch user statistics
    const platforms = await getAllUserStats({
      github,
      leetcode,
      bypassCache,
    });

    // Render wallpaper buffer
    const imageBuffer = await renderWallpaper({
      width,
      height,
      theme,
      position,
      showGlow,
      showGrid,
      showStats,
      platforms,
    });

    const primaryUsername = github || leetcode || 'developer';
    const filename = `streakpaper-${primaryUsername}-${width}x${height}.png`;

    const headers = new Headers();
    headers.set('Content-Type', 'image/png');
    headers.set('Content-Length', imageBuffer.length.toString());

    if (isDownload) {
      headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    } else {
      headers.set('Content-Disposition', `inline; filename="${filename}"`);
    }

    // Cache headers: 4 hours client/edge cache, allow 24h stale-while-revalidate
    headers.set(
      'Cache-Control',
      'public, max-age=14400, s-maxage=14400, stale-while-revalidate=86400'
    );

    return new NextResponse(imageBuffer as unknown as BodyInit, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('[API /api/wallpaper Error]:', error);
    return NextResponse.json(
      { error: 'Failed to generate wallpaper', message: (error as Error).message },
      { status: 500 }
    );
  }
}

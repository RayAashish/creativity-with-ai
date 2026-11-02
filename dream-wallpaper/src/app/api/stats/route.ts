import { NextRequest, NextResponse } from 'next/server';
import { getAllUserStats } from '@/lib/fetchers';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const github = searchParams.get('github') || undefined;
    const leetcode = searchParams.get('leetcode') || undefined;
    const bypassCache = searchParams.get('nocache') === '1' || searchParams.get('nocache') === 'true';

    const platforms = await getAllUserStats({
      github,
      leetcode,
      bypassCache,
    });

    return NextResponse.json({
      success: true,
      platforms,
    });
  } catch (error) {
    console.error('[API /api/stats Error]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user stats', message: (error as Error).message },
      { status: 500 }
    );
  }
}

import { createCanvas, Path2D, SKRSContext2D } from '@napi-rs/canvas';
import { PlatformStats } from '@/types/wallpaper';
import { getTheme } from '@/lib/themes';

// Vector paths for crisp rendering at any resolution
const GITHUB_SVG_PATH =
  'M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z';

const LEETCODE_SVG_PATH =
  'M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .666-1.794l3.86-4.133 5.39-5.772a1.37 1.37 0 0 0-.97-2.348zm-1.84 8.783a1.374 1.374 0 0 0-1.375 1.375v4.542a1.375 1.375 0 0 0 2.75 0v-4.542a1.374 1.374 0 0 0-1.375-1.375zm7.391 3.064c-.759 0-1.375.616-1.375 1.375v4.542a1.375 1.375 0 0 0 2.75 0v-4.542c0-.759-.616-1.375-1.375-1.375z';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export interface RenderWallpaperParams {
  width?: number;
  height?: number;
  theme?: string;
  position?: 'center' | 'bottom-right' | 'top-center' | 'minimal';
  showGlow?: boolean;
  showGrid?: boolean;
  showStats?: boolean;
  platforms: PlatformStats[];
  customTitle?: string;
}

export async function renderWallpaper(params: RenderWallpaperParams): Promise<Buffer> {
  const width = Math.max(480, Math.min(7680, params.width || 1920));
  const height = Math.max(320, Math.min(4320, params.height || 1080));
  const theme = getTheme(params.theme);
  const position = params.position || 'center';
  const showGlow = params.showGlow !== false;
  const showGrid = params.showGrid !== false;
  const showStats = params.showStats !== false;
  const platforms = params.platforms.length > 0 ? params.platforms : [];

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Base scale calculation: standard desktop is 1920x1080
  const isPortrait = height > width;
  const baseScale = isPortrait
    ? Math.max(0.6, Math.min(2.5, width / 1080))
    : Math.max(0.5, Math.min(3.0, Math.min(width / 1920, height / 1080)));

  // 1. Draw solid background
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, width, height);

  // 2. Draw subtle background dot grid if enabled
  if (showGrid) {
    drawSubtleGrid(ctx, width, height, theme.gridColor, baseScale);
  }

  // 3. Compute layout coordinates
  const isMinimal = position === 'minimal';
  const cardData = prepareLayoutDimensions({
    platforms,
    baseScale,
    isPortrait,
    isMinimal,
    showStats,
  });

  let cardX = 0;
  let cardY = 0;

  const marginX = Math.round(70 * baseScale);
  const marginY = Math.round(70 * baseScale);

  switch (position) {
    case 'center':
      cardX = Math.round((width - cardData.cardWidth) / 2);
      cardY = Math.round((height - cardData.totalCardHeight) / 2);
      break;
    case 'top-center':
      cardX = Math.round((width - cardData.cardWidth) / 2);
      cardY = marginY;
      break;
    case 'bottom-right':
      cardX = Math.round(width - cardData.cardWidth - marginX);
      cardY = Math.round(height - cardData.totalCardHeight - marginY);
      break;
    case 'minimal':
      cardX = Math.round((width - cardData.cardWidth) / 2);
      cardY = Math.round((height - cardData.totalCardHeight) / 2);
      break;
  }

  // Keep within bounds
  cardX = Math.max(marginX / 2, cardX);
  cardY = Math.max(marginY / 2, cardY);

  // 4. Draw ambient neon/glow behind the card if enabled
  if (showGlow) {
    drawAmbientGlow(
      ctx,
      cardX + cardData.cardWidth / 2,
      cardY + cardData.totalCardHeight / 2,
      cardData.cardWidth * 0.7,
      theme.accentGlow
    );
  }

  // 5. Render Platforms Cards
  let currentY = cardY;
  for (let idx = 0; idx < platforms.length; idx++) {
    const platform = platforms[idx];
    const cardHeight = cardData.sectionHeights[idx];

    renderPlatformCard({
      ctx,
      platform,
      x: cardX,
      y: currentY,
      width: cardData.cardWidth,
      height: cardHeight,
      theme,
      baseScale,
      showStats,
      isMinimal,
      isPortrait,
    });

    currentY += cardHeight + cardData.sectionGap;
  }

  // 6. Draw subtle branding / sync status watermark
  drawBrandingWatermark(ctx, width, height, theme, baseScale);

  return canvas.toBuffer('image/png');
}

/**
 * Draw ambient radial glow
 */
function drawAmbientGlow(
  ctx: SKRSContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  colorGlow: string
) {
  ctx.save();
  const grad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, radius);
  grad.addColorStop(0, colorGlow);
  grad.addColorStop(0.5, colorGlow.replace(/[\d.]+\)$/g, '0.08)'));
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Draw subtle coordinate dot grid
 */
function drawSubtleGrid(
  ctx: SKRSContext2D,
  width: number,
  height: number,
  color: string,
  scale: number
) {
  ctx.save();
  ctx.fillStyle = color;
  const step = Math.round(48 * scale);
  const dotSize = Math.max(1, Math.round(1.5 * scale));

  for (let x = step / 2; x < width; x += step) {
    for (let y = step / 2; y < height; y += step) {
      ctx.fillRect(x, y, dotSize, dotSize);
    }
  }
  ctx.restore();
}

/**
 * Layout calculation helper
 */
function prepareLayoutDimensions(opts: {
  platforms: PlatformStats[];
  baseScale: number;
  isPortrait: boolean;
  isMinimal: boolean;
  showStats: boolean;
}) {
  const { platforms, baseScale, isPortrait, isMinimal, showStats } = opts;
  const count = Math.max(1, platforms.length);

  // Column width configuration
  const cols = isMinimal ? 16 : isPortrait ? 26 : 53;
  const cellSize = Math.round((isMinimal ? 14 : isPortrait ? 13 : 13.5) * baseScale);
  const cellGap = Math.round(3.5 * baseScale);
  const labelMargin = Math.round(36 * baseScale);
  const cardPaddingX = Math.round(32 * baseScale);

  const cardWidth = Math.round(
    cardPaddingX * 2 + labelMargin + cols * (cellSize + cellGap)
  );

  const sectionHeights: number[] = [];
  for (let i = 0; i < count; i++) {
    // Header: ~50px
    // Stats row: ~54px (if enabled and not minimal)
    // Month label row: ~24px
    // Grid: 7 * (cellSize + cellGap) ~ 120px
    // Legend / Footer: ~32px
    // Padding top & bottom: ~50px
    let h = 0;
    if (isMinimal) {
      h = Math.round((140 + (showStats ? 48 : 0)) * baseScale);
    } else {
      const headerH = 46 * baseScale;
      const statsH = showStats ? 54 * baseScale : 0;
      const gridH = (22 + 7 * (cellSize + cellGap) + 32) * baseScale;
      const paddingH = 48 * baseScale;
      h = Math.round(headerH + statsH + gridH + paddingH);
    }
    sectionHeights.push(h);
  }

  const sectionGap = Math.round(20 * baseScale);
  const totalCardHeight =
    sectionHeights.reduce((acc, curr) => acc + curr, 0) +
    (count - 1) * sectionGap;

  return {
    cardWidth,
    sectionHeights,
    sectionGap,
    totalCardHeight,
    cols,
    cellSize,
    cellGap,
  };
}

/**
 * Renders a single platform card
 */
function renderPlatformCard(opts: {
  ctx: SKRSContext2D;
  platform: PlatformStats;
  x: number;
  y: number;
  width: number;
  height: number;
  theme: ReturnType<typeof getTheme>;
  baseScale: number;
  showStats: boolean;
  isMinimal: boolean;
  isPortrait: boolean;
}) {
  const { ctx, platform, x, y, width, height, theme, baseScale, showStats, isMinimal, isPortrait } = opts;

  ctx.save();

  // 1. Card Container (glassmorphic dark box with subtle border)
  const cardRadius = Math.round(18 * baseScale);
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, cardRadius);
  ctx.fillStyle = theme.cardBg;
  ctx.fill();

  ctx.lineWidth = Math.max(1, Math.round(1.5 * baseScale));
  ctx.strokeStyle = theme.cardBorder;
  ctx.stroke();

  // Internal Coordinates
  const padX = Math.round(28 * baseScale);
  let curY = y + Math.round(24 * baseScale);

  // 2. Card Header: Icon, Platform Name, Username, Sync status
  const iconSize = Math.round(22 * baseScale);
  const iconX = x + padX;
  const iconY = curY;

  // Draw Platform Icon
  ctx.save();
  ctx.translate(iconX, iconY);
  const svgScale = iconSize / 24;
  ctx.scale(svgScale, svgScale);

  const iconPath =
    platform.platform === 'github'
      ? new Path2D(GITHUB_SVG_PATH)
      : new Path2D(LEETCODE_SVG_PATH);

  ctx.fillStyle = platform.platform === 'github' ? theme.textPrimary : '#FFA116'; // LeetCode signature orange
  ctx.fill(iconPath);
  ctx.restore();

  // Header Title & Handle
  ctx.font = `600 ${Math.round(16 * baseScale)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillStyle = theme.textPrimary;
  const titleX = iconX + iconSize + Math.round(12 * baseScale);
  const titleY = curY + Math.round(16 * baseScale);
  const platformLabel = platform.platform === 'github' ? 'GitHub' : 'LeetCode';
  ctx.fillText(platformLabel, titleX, titleY);

  const titleWidth = ctx.measureText(platformLabel).width;
  ctx.font = `400 ${Math.round(14 * baseScale)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillStyle = theme.textSecondary;
  ctx.fillText(`@${platform.username}`, titleX + titleWidth + Math.round(8 * baseScale), titleY);

  // Status Badge / Active Streak Flag on Header Right
  const badgeText = `🔥 ${platform.currentStreak}d streak`;
  ctx.font = `600 ${Math.round(12 * baseScale)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  const badgeMetrics = ctx.measureText(badgeText);
  const badgeW = badgeMetrics.width + Math.round(18 * baseScale);
  const badgeH = Math.round(24 * baseScale);
  const badgeX = x + width - padX - badgeW;
  const badgeY = curY - Math.round(2 * baseScale);

  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, Math.round(12 * baseScale));
  ctx.fillStyle = theme.badgeBg;
  ctx.fill();
  ctx.fillStyle = theme.badgeText;
  ctx.fillText(badgeText, badgeX + Math.round(9 * baseScale), badgeY + Math.round(16 * baseScale));

  curY += Math.round(36 * baseScale);

  // 3. Stats Metric Chips (Current Streak, Longest Streak, Total, Active Days)
  if (showStats && !isMinimal) {
    const stats = [
      { label: 'Current Streak', val: `${platform.currentStreak} Days`, icon: '🔥' },
      { label: 'Longest Streak', val: `${platform.longestStreak} Days`, icon: '⚡' },
      { label: 'Total Contributions', val: platform.totalContributions.toLocaleString(), icon: '📊' },
      { label: 'Active Days', val: `${platform.totalActiveDays} / 365`, icon: '📅' },
    ];

    const statGap = Math.round(12 * baseScale);
    const statW = Math.round((width - padX * 2 - statGap * 3) / 4);
    const statH = Math.round(44 * baseScale);

    for (let sIdx = 0; sIdx < stats.length; sIdx++) {
      const item = stats[sIdx];
      const sX = x + padX + sIdx * (statW + statGap);
      const sY = curY;

      ctx.beginPath();
      ctx.roundRect(sX, sY, statW, statH, Math.round(10 * baseScale));
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Stat Label
      ctx.font = `500 ${Math.round(10.5 * baseScale)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillStyle = theme.textMuted;
      ctx.fillText(item.label, sX + Math.round(10 * baseScale), sY + Math.round(16 * baseScale));

      // Stat Value
      ctx.font = `700 ${Math.round(13.5 * baseScale)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillStyle = sIdx === 0 ? theme.accent : theme.textPrimary;
      ctx.fillText(
        item.val,
        sX + Math.round(10 * baseScale),
        sY + Math.round(34 * baseScale)
      );
    }

    curY += statH + Math.round(18 * baseScale);
  }

  // 4. Heatmap Matrix
  const colsCount = isMinimal ? 16 : isPortrait ? 26 : 53;
  const cellSize = Math.round((isMinimal ? 14 : isPortrait ? 13 : 13.5) * baseScale);
  const cellGap = Math.round(3.5 * baseScale);
  const labelColW = Math.round(32 * baseScale);

  const gridStartX = x + padX + labelColW;
  const gridStartY = curY + Math.round(18 * baseScale);

  // Build grid columns from platform calendar
  const gridColumns = buildGridFromCalendar(platform.calendar, colsCount);

  // Month header row
  ctx.font = `500 ${Math.round(10 * baseScale)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillStyle = theme.textMuted;

  let lastMonth = -1;
  for (let c = 0; c < gridColumns.length; c++) {
    const col = gridColumns[c];
    // Find first non-null day in this column
    const firstDay = col.find((d) => d !== null);
    if (firstDay) {
      const monthIdx = parseInt(firstDay.date.split('-')[1], 10) - 1;
      if (monthIdx !== lastMonth && (c === 0 || c >= 2)) {
        lastMonth = monthIdx;
        const monthX = gridStartX + c * (cellSize + cellGap);
        ctx.fillText(MONTH_NAMES[monthIdx], monthX, curY + Math.round(12 * baseScale));
      }
    }
  }

  // Weekday row labels on left (Mon, Wed, Fri)
  ctx.font = `500 ${Math.round(9.5 * baseScale)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillStyle = theme.textMuted;
  const dayRowIndices = [1, 3, 5]; // Mon, Wed, Fri
  for (const r of dayRowIndices) {
    const rowY = gridStartY + r * (cellSize + cellGap) + cellSize * 0.8;
    ctx.fillText(DAY_LABELS[r].substring(0, 3), x + padX, rowY);
  }

  // Render individual contribution cells
  const cellRadius = Math.max(2, Math.round(2.5 * baseScale));
  for (let c = 0; c < gridColumns.length; c++) {
    const col = gridColumns[c];
    const cellX = gridStartX + c * (cellSize + cellGap);

    for (let r = 0; r < 7; r++) {
      const day = col[r];
      const cellY = gridStartY + r * (cellSize + cellGap);

      if (day !== null) {
        ctx.beginPath();
        ctx.roundRect(cellX, cellY, cellSize, cellSize, cellRadius);
        ctx.fillStyle = theme.levels[day.level];
        ctx.fill();

        // If level 4 or high contribution, add subtle inner highlight
        if (day.level === 4) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }

  // 5. Heatmap Legend (Less ▫ ▫ ▫ ▫ ▫ More)
  const legendY = gridStartY + 7 * (cellSize + cellGap) + Math.round(16 * baseScale);
  const legendSquareSize = Math.round(10 * baseScale);
  const legendGap = Math.round(3 * baseScale);
  const legendRightX = gridStartX + gridColumns.length * (cellSize + cellGap);

  ctx.font = `500 ${Math.round(9.5 * baseScale)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillStyle = theme.textMuted;

  const moreMetrics = ctx.measureText('More');
  let curLegX = legendRightX - moreMetrics.width;
  ctx.fillText('More', curLegX, legendY + legendSquareSize * 0.85);

  curLegX -= (legendSquareSize + legendGap) * 5 + Math.round(6 * baseScale);

  for (let l = 0; l <= 4; l++) {
    ctx.beginPath();
    ctx.roundRect(
      curLegX + l * (legendSquareSize + legendGap),
      legendY,
      legendSquareSize,
      legendSquareSize,
      Math.max(1, Math.round(2 * baseScale))
    );
    ctx.fillStyle = theme.levels[l as 0 | 1 | 2 | 3 | 4];
    ctx.fill();
  }

  const lessMetrics = ctx.measureText('Less');
  ctx.fillStyle = theme.textMuted;
  ctx.fillText('Less', curLegX - lessMetrics.width - Math.round(6 * baseScale), legendY + legendSquareSize * 0.85);

  ctx.restore();
}

/**
 * Builds array of columns (each array of 7 elements: Sun-Sat) from calendar
 */
function buildGridFromCalendar(
  calendar: PlatformStats['calendar'],
  targetCols: number
) {
  if (!calendar || calendar.length === 0) {
    return [];
  }

  // Sort chronologically
  const sorted = [...calendar].sort((a, b) => a.date.localeCompare(b.date));

  // Determine starting weekday of first day
  const firstDate = new Date(`${sorted[0].date}T00:00:00Z`);
  const startDay = firstDate.getUTCDay(); // 0 = Sunday

  const allColumns: Array<Array<PlatformStats['calendar'][0] | null>> = [];
  let currentCol: Array<PlatformStats['calendar'][0] | null> = [];

  // Pad first column up to startDay
  for (let i = 0; i < startDay; i++) {
    currentCol.push(null);
  }

  for (const day of sorted) {
    currentCol.push(day);
    if (currentCol.length === 7) {
      allColumns.push(currentCol);
      currentCol = [];
    }
  }

  if (currentCol.length > 0) {
    while (currentCol.length < 7) {
      currentCol.push(null);
    }
    allColumns.push(currentCol);
  }

  // Slice to desired target columns ending at the most recent week
  if (allColumns.length > targetCols) {
    return allColumns.slice(allColumns.length - targetCols);
  }

  return allColumns;
}

/**
 * Subtle watermark in corner
 */
function drawBrandingWatermark(
  ctx: SKRSContext2D,
  width: number,
  height: number,
  theme: ReturnType<typeof getTheme>,
  scale: number
) {
  ctx.save();
  ctx.font = `500 ${Math.round(11 * scale)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillStyle = theme.textMuted;
  const brand = 'STREAKPAPER • AUTO-SYNC';
  const metrics = ctx.measureText(brand);
  ctx.fillText(brand, width - metrics.width - Math.round(30 * scale), height - Math.round(24 * scale));
  ctx.restore();
}

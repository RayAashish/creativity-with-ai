import React, { useEffect, useRef } from 'react';

export interface ThemeBackgroundCanvasProps {
  currentTheme: string;
}

export const ThemeBackgroundCanvas: React.FC<ThemeBackgroundCanvasProps> = ({ currentTheme }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initScene();
    };
    window.addEventListener('resize', handleResize);

    const mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // ==========================================
    // RETRO & MODERN SCENE DATA
    // ==========================================
    let stars: Array<{ x: number; y: number; r: number; alpha: number; pulse: number; speed: number }> = [];
    let modernDots: Array<{ x: number; y: number; vx: number; vy: number; r: number; alpha: number }> = [];
    let gridOffset = 0;

    function initScene() {
      // 8-bit / Synthwave Stars for Retro
      stars = [];
      const starCount = Math.floor(Math.min(90, width / 16));
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * (height * 0.6),
          r: Math.random() * 1.5 + 0.5,
          alpha: Math.random() * 0.8 + 0.2,
          pulse: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.04 + 0.01,
        });
      }

      // Minimal Modern Floating Dust for Modern
      modernDots = [];
      const dotCount = Math.floor(Math.min(45, width / 28));
      for (let i = 0; i < dotCount; i++) {
        modernDots.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          r: Math.random() * 1.5 + 0.5,
          alpha: Math.random() * 0.35 + 0.1,
        });
      }
    }

    initScene();

    // ==========================================
    // RENDER LOOP
    // ==========================================
    const render = () => {
      // Smooth mouse follow
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      if (currentTheme === 'retro') {
        // ----------------------------------------
        // RETRO SYNTHWAVE / ARCADE VIBE
        // ----------------------------------------
        const horizonY = Math.floor(height * 0.58);

        // 1. Sky Gradient (Deep arcade violet to horizon glow)
        const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
        skyGrad.addColorStop(0, '#06030c');
        skyGrad.addColorStop(0.65, '#0d0618');
        skyGrad.addColorStop(1, '#1b0a2a');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, horizonY);

        // 2. Retro Neon Stars in Sky
        for (const star of stars) {
          star.pulse += star.speed;
          const a = star.alpha * (0.6 + 0.4 * Math.sin(star.pulse));
          ctx.fillStyle = `rgba(255, 235, 255, ${a})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
          ctx.fill();

          // Occasional cyan/magenta star twinkle
          if (star.r > 1.4) {
            ctx.fillStyle = `rgba(0, 245, 212, ${a * 0.5})`;
            ctx.fillRect(star.x - 2, star.y, 5, 0.8);
            ctx.fillRect(star.x, star.y - 2, 0.8, 5);
          }
        }

        // 3. Ground Background (Deep space floor)
        const groundGrad = ctx.createLinearGradient(0, horizonY, 0, height);
        groundGrad.addColorStop(0, '#10051e');
        groundGrad.addColorStop(0.4, '#0a0314');
        groundGrad.addColorStop(1, '#05020a');
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, horizonY, width, height - horizonY);

        // 4. Horizon Glow Beam
        const beamGrad = ctx.createLinearGradient(0, horizonY - 25, 0, horizonY + 25);
        beamGrad.addColorStop(0, 'rgba(255, 42, 133, 0)');
        beamGrad.addColorStop(0.5, 'rgba(255, 42, 133, 0.35)');
        beamGrad.addColorStop(1, 'rgba(0, 245, 212, 0)');
        ctx.fillStyle = beamGrad;
        ctx.fillRect(0, horizonY - 25, width, 50);

        // Bright horizon line
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 42, 133, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.moveTo(0, horizonY);
        ctx.lineTo(width, horizonY);
        ctx.stroke();

        // 5. 3D Perspective Retro Grid
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, horizonY, width, height - horizonY);
        ctx.clip();

        gridOffset = (gridOffset + 0.45) % 36;
        const groundHeight = height - horizonY;
        const numHorizLines = 16;

        // Moving horizontal perspective lines
        for (let i = 0; i <= numHorizLines; i++) {
          const ratio = Math.pow((i + gridOffset / 36) / numHorizLines, 2.2);
          const y = horizonY + ratio * groundHeight;
          const alpha = Math.min(0.55, ratio * 0.7);

          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 42, 133, ${alpha})`;
          ctx.lineWidth = Math.max(0.8, ratio * 2);
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Perspective vertical lines radiating from vanishing point
        const vanishingX = width / 2;
        const lineSpacing = Math.max(45, width / 22);
        const totalLines = Math.ceil(width / lineSpacing) * 2;

        for (let i = -totalLines; i <= totalLines; i++) {
          const bottomX = vanishingX + i * lineSpacing * 1.8;
          ctx.beginPath();
          const distFromCenter = Math.abs(i) / totalLines;
          const alpha = Math.max(0.08, 0.45 * (1 - distFromCenter * 0.6));
          ctx.strokeStyle = i % 2 === 0 
            ? `rgba(0, 245, 212, ${alpha * 0.8})` 
            : `rgba(255, 42, 133, ${alpha * 0.7})`;
          ctx.lineWidth = 1;
          ctx.moveTo(vanishingX, horizonY);
          ctx.lineTo(bottomX, height);
          ctx.stroke();
        }

        ctx.restore();

        // 6. Subtle cursor retro neon halo
        const retroHalo = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 280);
        retroHalo.addColorStop(0, 'rgba(255, 42, 133, 0.08)');
        retroHalo.addColorStop(0.6, 'rgba(0, 245, 212, 0.03)');
        retroHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = retroHalo;
        ctx.fillRect(0, 0, width, height);

      } else {
        // ----------------------------------------
        // MINIMAL MODERN VIBE (Default / Sleek Dark)
        // ----------------------------------------
        // 1. Deep Obsidian Base
        const modernBg = ctx.createLinearGradient(0, 0, width, height);
        modernBg.addColorStop(0, '#090d16');
        modernBg.addColorStop(0.5, '#0b0f19');
        modernBg.addColorStop(1, '#080c14');
        ctx.fillStyle = modernBg;
        ctx.fillRect(0, 0, width, height);

        // 2. Subtle Interactive Radial Glow (Linear/Raycast style)
        const aura = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 450);
        aura.addColorStop(0, 'rgba(6, 182, 212, 0.06)');
        aura.addColorStop(0.4, 'rgba(99, 102, 241, 0.03)');
        aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = aura;
        ctx.fillRect(0, 0, width, height);

        // Static ambient top-right subtle indigo aura
        const topAura = ctx.createRadialGradient(width * 0.85, 0, 0, width * 0.85, 0, 500);
        topAura.addColorStop(0, 'rgba(99, 102, 241, 0.05)');
        topAura.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = topAura;
        ctx.fillRect(0, 0, width, height);

        // 3. Ultra-subtle ambient drifting particles
        ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
        for (const dot of modernDots) {
          dot.x += dot.vx;
          dot.y += dot.vy;

          if (dot.x < 0) dot.x = width;
          if (dot.x > width) dot.x = 0;
          if (dot.y < 0) dot.y = height;
          if (dot.y > height) dot.y = 0;

          ctx.globalAlpha = dot.alpha;
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [currentTheme]);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-500"
      />
      {/* Subtle CRT Scanline overlay only active in Retro mode */}
      {currentTheme === 'retro' && (
        <div 
          aria-hidden="true" 
          className="fixed inset-0 pointer-events-none z-10 crt-scanlines opacity-20"
        />
      )}
    </>
  );
};

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

    const mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // ==========================================
    // SCENE INITIALIZATION & UPDATE
    // ==========================================
    let particles: any[] = [];
    let matrixDrops: number[] = [];
    const matrixChars = '0101010101ABCDEF0123456789アイウエオカキクケコサシスセソタチツテトナニヌネハヒフヘホ';

    function initScene() {
      particles = [];
      const area = width * height;

      if (currentTheme === 'matrix') {
        const colWidth = 18;
        const cols = Math.floor(width / colWidth);
        matrixDrops = new Array(cols).fill(0).map(() => Math.floor(Math.random() * -50));
      } else if (currentTheme === 'aurora') {
        const count = Math.min(120, Math.floor(area / 10000));
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2.5 + 0.8,
            speedY: Math.random() * 1.2 + 0.5,
            speedX: Math.random() * 0.6 - 0.3,
            sway: Math.random() * 0.03 + 0.01,
            swayOffset: Math.random() * Math.PI * 2,
            opacity: Math.random() * 0.7 + 0.3,
            isStar: Math.random() > 0.65
          });
        }
      } else if (currentTheme === 'sakura') {
        const count = Math.min(65, Math.floor(area / 16000));
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            rx: Math.random() * 5 + 4,
            ry: Math.random() * 2.5 + 2,
            angle: Math.random() * Math.PI * 2,
            angularSpeed: (Math.random() - 0.5) * 0.04,
            speedY: Math.random() * 1.4 + 0.8,
            speedX: Math.random() * 0.8 - 0.2,
            sway: Math.random() * 0.02 + 0.01,
            swayOffset: Math.random() * Math.PI * 2,
            opacity: Math.random() * 0.55 + 0.45,
            color: Math.random() > 0.4 ? 'rgba(244, 114, 182,' : 'rgba(251, 113, 133,'
          });
        }
      } else if (currentTheme === 'ember') {
        const count = Math.min(110, Math.floor(area / 11000));
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: height + Math.random() * 100,
            radius: Math.random() * 2.8 + 0.8,
            speedY: -(Math.random() * 1.8 + 0.8),
            speedX: (Math.random() - 0.5) * 0.8,
            life: Math.random() * 120 + 60,
            maxLife: Math.random() * 120 + 60,
            hue: Math.random() > 0.4 ? 25 : 45
          });
        }
      } else if (currentTheme === 'ocean') {
        const count = Math.min(80, Math.floor(area / 14000));
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 3.5 + 1,
            speedY: -(Math.random() * 0.8 + 0.3),
            speedX: (Math.random() - 0.5) * 0.4,
            sway: Math.random() * 0.02 + 0.01,
            swayOffset: Math.random() * Math.PI * 2,
            opacity: Math.random() * 0.6 + 0.2,
            color: Math.random() > 0.5 ? '56, 189, 248' : '52, 211, 153'
          });
        }
      } else if (currentTheme === 'cyberpunk') {
        const count = Math.min(70, Math.floor(area / 16000));
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2.2 + 1,
            speedX: (Math.random() - 0.5) * 0.9,
            speedY: (Math.random() - 0.5) * 0.9,
            isSquare: Math.random() > 0.6,
            color: Math.random() > 0.5 ? '#00f0ff' : '#ff007f'
          });
        }
      } else {
        // Midnight Dark (Default): Constellation starfield
        const count = Math.min(85, Math.floor(area / 14000));
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2 + 0.6,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            baseAlpha: Math.random() * 0.6 + 0.2,
            pulse: Math.random() * 0.03 + 0.01,
            pulsePhase: Math.random() * Math.PI * 2
          });
        }
      }
    }

    initScene();

    let frameCount = 0;

    const render = () => {
      frameCount++;

      if (currentTheme === 'matrix') {
        ctx.fillStyle = 'rgba(2, 9, 4, 0.16)';
        ctx.fillRect(0, 0, width, height);

        ctx.font = '14px "Fira Code", monospace';
        const colWidth = 18;

        for (let i = 0; i < matrixDrops.length; i++) {
          const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
          const x = i * colWidth;
          const y = matrixDrops[i] * 18;

          ctx.fillStyle = '#f0fff0';
          ctx.shadowColor = '#00ff66';
          ctx.shadowBlur = 8;
          ctx.fillText(char, x, y);

          if (matrixDrops[i] > 1) {
            ctx.fillStyle = '#00ff66';
            ctx.shadowBlur = 4;
            const prevChar = matrixChars[Math.floor(Math.random() * matrixChars.length)];
            ctx.fillText(prevChar, x, y - 18);
          }

          ctx.shadowBlur = 0;

          if (y > height && Math.random() > 0.985) {
            matrixDrops[i] = 0;
          }
          matrixDrops[i]++;
        }
      } else if (currentTheme === 'aurora') {
        ctx.clearRect(0, 0, width, height);

        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, 'rgba(45, 212, 191, 0.03)');
        grad.addColorStop(0.5, 'rgba(167, 139, 250, 0.04)');
        grad.addColorStop(1, 'rgba(56, 189, 248, 0.02)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        particles.forEach(p => {
          p.swayOffset += p.sway;
          p.x += Math.sin(p.swayOffset) * 0.8 + p.speedX;
          p.y += p.speedY;

          if (p.y > height + 10) {
            p.y = -10;
            p.x = Math.random() * width;
          }
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.fillStyle = `rgba(230, 250, 247, ${p.opacity})`;
          ctx.shadowColor = '#2dd4bf';
          ctx.shadowBlur = p.isStar ? 6 : 2;

          if (p.isStar) {
            ctx.beginPath();
            ctx.moveTo(0, -p.radius * 2);
            ctx.lineTo(p.radius * 0.5, -p.radius * 0.5);
            ctx.lineTo(p.radius * 2, 0);
            ctx.lineTo(p.radius * 0.5, p.radius * 0.5);
            ctx.lineTo(0, p.radius * 2);
            ctx.lineTo(-p.radius * 0.5, p.radius * 0.5);
            ctx.lineTo(-p.radius * 2, 0);
            ctx.lineTo(-p.radius * 0.5, -p.radius * 0.5);
            ctx.closePath();
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        });
      } else if (currentTheme === 'sakura') {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
          p.swayOffset += p.sway;
          p.angle += p.angularSpeed;
          p.x += Math.sin(p.swayOffset) * 1.2 + p.speedX;
          p.y += p.speedY;

          if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * width;
          }
          if (p.x < -20) p.x = width + 20;
          if (p.x > width + 20) p.x = -20;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.beginPath();
          ctx.ellipse(0, 0, p.rx, p.ry, 0, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color} ${p.opacity})`;
          ctx.shadowColor = '#f472b6';
          ctx.shadowBlur = 4;
          ctx.fill();
          ctx.restore();
        });
      } else if (currentTheme === 'ember') {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
          p.x += p.speedX + (Math.random() - 0.5) * 0.6;
          p.y += p.speedY;
          p.life--;

          const progress = p.life / p.maxLife;
          const currentRadius = Math.max(0.2, p.radius * progress);

          if (p.life <= 0 || p.y < -20) {
            p.x = Math.random() * width;
            p.y = height + 10;
            p.life = p.maxLife;
          }

          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
          const alpha = Math.max(0, progress * 0.8);
          ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${alpha})`;
          ctx.shadowColor = '#ff5722';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.restore();
        });
      } else if (currentTheme === 'ocean') {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
          p.swayOffset += p.sway;
          p.x += Math.sin(p.swayOffset) * 0.6 + p.speedX;
          p.y += p.speedY;

          if (p.y < -20) {
            p.y = height + 20;
            p.x = Math.random() * width;
          }

          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${p.color}, ${p.opacity * 0.8})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.fillStyle = `rgba(${p.color}, ${p.opacity * 0.35})`;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.restore();
        });
      } else if (currentTheme === 'cyberpunk') {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 130) {
              const alpha = (1 - dist / 130) * 0.25;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
              ctx.lineWidth = 0.8;
              ctx.shadowColor = '#00f0ff';
              ctx.shadowBlur = 4;
              ctx.stroke();
              ctx.shadowBlur = 0;
            }
          }
        }

        particles.forEach(p => {
          p.x += p.speedX;
          p.y += p.speedY;

          if (p.x < 0 || p.x > width) p.speedX *= -1;
          if (p.y < 0 || p.y > height) p.speedY *= -1;

          ctx.save();
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          if (p.isSquare) {
            ctx.fillRect(p.x - p.radius, p.y - p.radius, p.radius * 2, p.radius * 2);
          } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        });
      } else {
        // Midnight Dark (Default)
        ctx.clearRect(0, 0, width, height);
        const strokeColor = '99, 102, 241';
        const starColor = '248, 250, 252';

        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 115) {
              const alpha = (1 - dist / 115) * 0.18;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(${strokeColor}, ${alpha})`;
              ctx.lineWidth = 0.6;
              ctx.stroke();
            }
          }

          const mdx = particles[i].x - mouse.x;
          const mdy = particles[i].y - mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 150) {
            const malpha = (1 - mdist / 150) * 0.35;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(${strokeColor}, ${malpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        particles.forEach(p => {
          p.x += p.speedX;
          p.y += p.speedY;

          if (p.x < 0 || p.x > width) p.speedX *= -1;
          if (p.y < 0 || p.y > height) p.speedY *= -1;

          p.pulsePhase += p.pulse;
          const alpha = p.baseAlpha + Math.sin(p.pulsePhase) * 0.2;

          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${starColor}, ${Math.max(0.1, alpha)})`;
          ctx.shadowColor = '#6366f1';
          ctx.shadowBlur = 5;
          ctx.fill();
          ctx.restore();
        });
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
    <canvas
      ref={canvasRef}
      className="theme-motion-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
};

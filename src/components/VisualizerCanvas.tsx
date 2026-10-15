import React, { useEffect, useRef } from 'react';

interface VisualizerCanvasProps {
  currentTime: number;
  isPlaying: boolean;
}

interface Particle {
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  size: number;
  hue: number; // 180 = cyan, 280 = violet, 320 = magenta
  alpha: number;
  seed: number;
}

interface BurstSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  lifetime: number;
}

export const VisualizerCanvas: React.FC<VisualizerCanvasProps> = ({ currentTime }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const burstSparksRef = useRef<BurstSpark[]>([]);

  // Initialize ambient particles
  useEffect(() => {
    const particles: Particle[] = [];
    const count = 75;
    for (let i = 0; i < count; i++) {
      particles.push({
        baseX: Math.random(),
        baseY: Math.random(),
        vx: (Math.random() - 0.5) * 0.04,
        vy: (Math.random() - 0.5) * 0.04,
        size: Math.random() * 2.5 + 1.0,
        hue: Math.random() > 0.5 ? 185 + Math.random() * 30 : 270 + Math.random() * 50,
        alpha: Math.random() * 0.7 + 0.3,
        seed: Math.random() * 100,
      });
    }
    particlesRef.current = particles;

    // Generate burst sparks for the impact at 15.6s
    const sparks: BurstSpark[] = [];
    const sparkCount = 120;
    for (let i = 0; i < sparkCount; i++) {
      const angle = (i / sparkCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
      const speed = Math.random() * 450 + 150;
      const isCyan = Math.random() > 0.4;
      sparks.push({
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3.5 + 1.2,
        color: isCyan ? '#00f0ff' : '#d946ef',
        lifetime: Math.random() * 1.5 + 0.8,
      });
    }
    burstSparksRef.current = sparks;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const t = currentTime;

      // 1. Deep space / midnight background with dynamic radial glow
      const bgGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        50,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.85
      );

      // Intensity increases in kinetic, fluid, and impact stages
      let glowIntensity = 0.25;
      if (t < 3.0) {
        glowIntensity = 0.15 + (t / 3.0) * 0.2;
      } else if (t >= 3.0 && t < 6.0) {
        glowIntensity = 0.35 + Math.sin(t * 3) * 0.08;
      } else if (t >= 6.0 && t < 10.0) {
        // Fluid light waves phase
        glowIntensity = 0.45 + Math.sin(t * 2) * 0.12;
      } else if (t >= 10.0 && t < 15.0) {
        // Neon pulse phase (pulsing to 128 BPM rhythm)
        const pulse = Math.abs(Math.sin((t - 10.0) * Math.PI * 2.13));
        glowIntensity = 0.35 + pulse * 0.25;
      } else if (t >= 15.0 && t < 18.0) {
        // Climax impact
        if (t >= 15.6 && t < 16.5) {
          const impactDecay = Math.max(0, 1 - (t - 15.6) / 0.9);
          glowIntensity = 0.5 + impactDecay * 0.5;
        } else {
          glowIntensity = 0.4;
        }
      } else {
        // Hero frame (18.0 - 20.0s)
        glowIntensity = 0.38 + Math.sin(t * 1.5) * 0.05;
      }

      bgGrad.addColorStop(0, `rgba(45, 10, 80, ${glowIntensity})`);
      bgGrad.addColorStop(0.35, `rgba(18, 5, 40, ${glowIntensity * 0.8})`);
      bgGrad.addColorStop(0.7, '#080214');
      bgGrad.addColorStop(1, '#030107');

      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Fluid light ribbons & organic waves (behind text)
      const ribbonAlpha = t < 1.0 ? t * 0.3 : t > 6.0 && t < 15.0 ? 0.35 : 0.22;
      if (ribbonAlpha > 0.01) {
        const wavesCount = 4;
        for (let w = 0; w < wavesCount; w++) {
          ctx.beginPath();
          const waveY = height * 0.5 + (w - 1.5) * 70;
          ctx.moveTo(0, waveY);

          const segments = 24;
          for (let s = 0; s <= segments; s++) {
            const px = (s / segments) * width;
            const frequency = 0.0018 + w * 0.0006;
            const speed = t * (0.8 + w * 0.3);
            const py =
              waveY +
              Math.sin(px * frequency + speed) * (40 + w * 18) +
              Math.cos(px * 0.003 - speed * 0.7) * 25;
            ctx.lineTo(px, py);
          }

          ctx.lineWidth = 2.5 + w * 1.2;
          const waveGrad = ctx.createLinearGradient(0, 0, width, 0);
          if (w % 2 === 0) {
            waveGrad.addColorStop(0, 'rgba(0, 240, 255, 0)');
            waveGrad.addColorStop(0.3, `rgba(0, 240, 255, ${ribbonAlpha})`);
            waveGrad.addColorStop(0.7, `rgba(168, 85, 247, ${ribbonAlpha * 1.2})`);
            waveGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
          } else {
            waveGrad.addColorStop(0, 'rgba(236, 72, 153, 0)');
            waveGrad.addColorStop(0.4, `rgba(236, 72, 153, ${ribbonAlpha})`);
            waveGrad.addColorStop(0.7, `rgba(59, 130, 246, ${ribbonAlpha * 1.1})`);
            waveGrad.addColorStop(1, 'rgba(236, 72, 153, 0)');
          }

          ctx.strokeStyle = waveGrad;
          ctx.shadowBlur = 18;
          ctx.shadowColor = w % 2 === 0 ? '#00f0ff' : '#ec4899';
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }

      // 3. Floating particles with proximity connection trails
      const particles = particlesRef.current;
      const positions: { x: number; y: number; p: Particle }[] = [];

      particles.forEach((p) => {
        // Deterministic drift based on time
        const px = ((p.baseX + p.vx * t * 1.5 + Math.sin(t * 0.5 + p.seed) * 0.05) % 1 + 1) % 1 * width;
        const py = ((p.baseY + p.vy * t * 1.5 + Math.cos(t * 0.4 + p.seed) * 0.05) % 1 + 1) % 1 * height;

        positions.push({ x: px, y: py, p });

        // Draw particle
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        const particleOpacity = Math.min(1, Math.max(0.1, p.alpha * (0.6 + Math.sin(t * 2 + p.seed) * 0.4)));
        ctx.fillStyle = `hsla(${p.hue}, 90%, 75%, ${particleOpacity})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `hsl(${p.hue}, 100%, 70%)`;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Particle connecting light trails (especially in Stage 3: 06.00-10.00s and ambient elsewhere)
      const connectThreshold = t >= 6.0 && t <= 10.0 ? 110 : 75;
      const connectionBaseAlpha = t >= 6.0 && t <= 10.0 ? 0.35 : 0.15;

      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const dx = positions[i].x - positions[j].x;
          const dy = positions[i].y - positions[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectThreshold) {
            const alpha = (1 - dist / connectThreshold) * connectionBaseAlpha;
            ctx.beginPath();
            ctx.moveTo(positions[i].x, positions[i].y);
            ctx.lineTo(positions[j].x, positions[j].y);
            ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // 4. Climax Impact (15.6s - 17.5s): Expanding Shockwave & Particle Explosion
      if (t >= 15.6 && t <= 17.8) {
        const impactElapsed = t - 15.6;
        const centerX = width * 0.5;
        const centerY = height * 0.5;

        // Expanding radial light wave
        const maxRadius = Math.max(width, height) * 0.9;
        const currentRadius = Math.min(maxRadius, impactElapsed * 750);
        const waveAlpha = Math.max(0, 1 - currentRadius / maxRadius);

        if (waveAlpha > 0.01) {
          // Inner cyan ring
          ctx.beginPath();
          ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
          ctx.lineWidth = Math.max(1, 14 * (1 - impactElapsed / 1.5));
          ctx.strokeStyle = `rgba(0, 240, 255, ${waveAlpha * 0.8})`;
          ctx.shadowBlur = 30;
          ctx.shadowColor = '#00f0ff';
          ctx.stroke();

          // Outer magenta / violet ring
          ctx.beginPath();
          ctx.arc(centerX, centerY, Math.max(0, currentRadius - 20), 0, Math.PI * 2);
          ctx.lineWidth = Math.max(1, 8 * (1 - impactElapsed / 1.5));
          ctx.strokeStyle = `rgba(236, 72, 153, ${waveAlpha * 0.6})`;
          ctx.shadowBlur = 25;
          ctx.shadowColor = '#ec4899';
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Particle sparks radiating from center
        const sparks = burstSparksRef.current;
        sparks.forEach((spark) => {
          if (impactElapsed < spark.lifetime) {
            const sparkAge = impactElapsed / spark.lifetime;
            // Drag deceleration
            const currentDist = (1 - Math.exp(-sparkAge * 3.5)) * 1.1;
            const sx = centerX + (spark.vx * currentDist * (width / 1400));
            const sy = centerY + (spark.vy * currentDist * (height / 900));
            const sAlpha = (1 - sparkAge) * 0.9;

            ctx.beginPath();
            ctx.arc(sx, sy, spark.size * (1 - sparkAge * 0.5), 0, Math.PI * 2);
            ctx.fillStyle = spark.color;
            ctx.shadowBlur = 12;
            ctx.shadowColor = spark.color;
            ctx.globalAlpha = sAlpha;
            ctx.fill();
            ctx.globalAlpha = 1.0;
            ctx.shadowBlur = 0;
          }
        });
      }

      ctx.restore();
    };

    render();
    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentTime]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};

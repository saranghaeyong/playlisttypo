import React, { useMemo } from 'react';

interface KineticTypographyProps {
  currentTime: number;
}

// Ease helper: cubic bezier simulation
function easeOutBack(x: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

export const KineticTypography: React.FC<KineticTypographyProps> = ({ currentTime: t }) => {
  const line1Chars = useMemo(() => 'SARANG RN'.split(''), []);
  const line2Chars = useMemo(() => 'PLAYLIST'.split(''), []);
  const line3Chars = useMemo(() => 'BGM'.split(''), []);

  // Global scene camera/perspective calculations based on timeline
  const sceneTransform = useMemo(() => {
    // 00.00 - 03.00: Camera pushes forward slowly
    if (t < 3.0) {
      const progress = easeOutCubic(clamp(t / 3.0, 0, 1));
      const z = -200 + progress * 200;
      const rotX = (1 - progress) * 12;
      return `translate3d(0, 0, ${z}px) rotateX(${rotX}deg)`;
    }

    // 03.00 - 06.00: Kinetic 3D perspective shifts
    if (t >= 3.0 && t < 6.0) {
      const kt = t - 3.0;
      const rotY = Math.sin(kt * 1.6) * 5.5;
      const rotX = Math.cos(kt * 1.3) * 3.5;
      const scale = 1 + Math.sin(kt * 2.2) * 0.02;
      return `rotateY(${rotY}deg) rotateX(${rotX}deg) scale3d(${scale}, ${scale}, 1)`;
    }

    // 06.00 - 10.00: Fluid breathing & parallax
    if (t >= 6.0 && t < 10.0) {
      const ft = t - 6.0;
      const rotY = Math.sin(ft * 0.9) * 4;
      const rotX = Math.sin(ft * 1.1) * 2.5;
      const z = Math.sin(ft * 1.4) * 30;
      return `translate3d(0, 0, ${z}px) rotateY(${rotY}deg) rotateX(${rotX}deg)`;
    }

    // 10.00 - 15.00: Neon pulse rhythmic bounce
    if (t >= 10.0 && t < 15.0) {
      const pt = t - 10.0;
      // 128 BPM pulse (period = 0.46875s)
      const beat = (pt % 0.46875) / 0.46875;
      const bounce = Math.pow(1 - beat, 2) * 0.035;
      const rotY = Math.sin(pt * 0.8) * 3;
      return `scale3d(${1 + bounce}, ${1 + bounce}, 1) rotateY(${rotY}deg)`;
    }

    // 15.00 - 18.00: Climax anticipation & impact
    if (t >= 15.0 && t < 18.0) {
      if (t < 15.6) {
        // Anticipation pullback
        const pullProgress = (t - 15.0) / 0.6;
        const z = -pullProgress * 120;
        const scale = 1 - pullProgress * 0.06;
        return `translate3d(0, 0, ${z}px) scale3d(${scale}, ${scale}, 1)`;
      } else {
        // Impact snap!
        const impactElapsed = t - 15.6;
        const impactProgress = clamp(impactElapsed / 1.2, 0, 1);
        // Spring bounce from 1.14 down to 1.0
        const scale = 1 + (0.14 * Math.exp(-impactElapsed * 4.5) * Math.cos(impactElapsed * 15));
        // Screen shake
        const shakeDecay = Math.max(0, 1 - impactElapsed / 0.8);
        const shakeX = Math.sin(impactElapsed * 60) * 12 * shakeDecay;
        const shakeY = Math.cos(impactElapsed * 50) * 9 * shakeDecay;
        return `translate3d(${shakeX}px, ${shakeY}px, 0) scale3d(${scale}, ${scale}, 1)`;
      }
    }

    // 18.00 - 20.00: Hero End Frame (subtle majestic ambient breathing)
    const ht = t - 18.0;
    const breathe = Math.sin(ht * 1.2) * 0.008;
    return `scale3d(${1 + breathe}, ${1 + breathe}, 1)`;
  }, [t]);

  // Overall bloom/glow intensity
  const sceneGlow = useMemo(() => {
    if (t < 1.0) return '0 0 10px rgba(0, 240, 255, 0.2)';
    if (t >= 10.0 && t < 15.0) {
      const beat = ((t - 10.0) % 0.46875) / 0.46875;
      const pulseGlow = Math.pow(1 - beat, 2) * 25;
      return `0 0 ${15 + pulseGlow}px rgba(0, 240, 255, 0.6), 0 0 ${30 + pulseGlow * 1.5}px rgba(168, 85, 247, 0.5)`;
    }
    if (t >= 15.6 && t < 16.5) {
      const impactDecay = Math.max(0, 1 - (t - 15.6) / 0.9);
      return `0 0 ${40 * impactDecay + 20}px rgba(0, 240, 255, 0.9), 0 0 ${80 * impactDecay + 30}px rgba(236, 72, 153, 0.8)`;
    }
    return '0 0 20px rgba(0, 240, 255, 0.4), 0 0 40px rgba(138, 43, 226, 0.3)';
  }, [t]);

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full px-4 sm:px-6 md:px-12 pointer-events-none select-none">
      <div
        className="scene-3d flex flex-col items-center justify-center transition-transform duration-75 ease-out text-center"
        style={{
          transform: sceneTransform,
          willChange: 'transform',
        }}
      >
        {/* LINE 1: SARANG RN (Identity line) */}
        <div className="flex items-center justify-center tracking-[0.25em] md:tracking-[0.35em] text-xs sm:text-sm md:text-xl lg:text-2xl font-black uppercase mb-1 sm:mb-2 md:mb-3">
          {line1Chars.map((char, index) => {
            // Reveal timing: 0.3s to 1.6s
            const charDelay = 0.3 + index * 0.08;
            let opacity = 0;
            let transform = 'translate3d(0, -35px, -150px) rotateX(45deg)';
            let filter = 'blur(12px)';

            if (t >= charDelay) {
              const charProgress = clamp((t - charDelay) / 0.55, 0, 1);
              const eased = easeOutBack(charProgress);
              opacity = charProgress;
              const y = (1 - eased) * -35;
              const z = (1 - eased) * -150;
              const rotX = (1 - eased) * 45;
              transform = `translate3d(0, ${y}px, ${z}px) rotateX(${rotX}deg)`;
              filter = `blur(${(1 - charProgress) * 12}px)`;
            }

            // Staggered kinetic shimmer during stage 2 & 4
            let charColorClass = 'text-cyan-violet';
            if (t >= 3.0 && t <= 6.0) {
              const sweep = Math.sin((t - 3.0) * 4 - index * 0.4);
              if (sweep > 0.6) {
                charColorClass = 'text-white drop-shadow-[0_0_12px_#00f0ff]';
              }
            }

            return (
              <span
                key={`l1-${index}`}
                className={`inline-block font-extrabold transition-all duration-75 ${
                  char === ' ' ? 'w-2 sm:w-3 md:w-5' : ''
                } ${charColorClass}`}
                style={{
                  opacity,
                  transform,
                  filter,
                  willChange: 'transform, opacity, filter',
                  textShadow: t > 1.2 ? '0 0 14px rgba(0, 240, 255, 0.6), 0 0 28px rgba(192, 132, 252, 0.4)' : undefined,
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            );
          })}
        </div>

        {/* LINE 2: PLAYLIST (The Hero oversized word) */}
        <div
          className="relative flex items-center justify-center font-black tracking-tighter leading-none my-1 md:my-2"
          style={{
            fontSize: 'clamp(3.8rem, 15.5vw, 12.5rem)',
            letterSpacing: '-0.04em',
          }}
        >
          {line2Chars.map((char, index) => {
            // Reveal timing: 1.1s to 2.4s
            const charDelay = 1.1 + index * 0.1;
            let opacity = 0;
            let transform = 'translate3d(0, 60px, -250px) scale(0.5) rotateY(-30deg)';
            let filter = 'blur(16px)';

            if (t >= charDelay) {
              const charProgress = clamp((t - charDelay) / 0.65, 0, 1);
              const eased = easeOutBack(charProgress);
              opacity = charProgress;

              // Base reveal transform
              let y = (1 - eased) * 60;
              let z = (1 - eased) * -250;
              let scale = 0.5 + eased * 0.5;
              let rotY = (1 - eased) * -30;
              let rotX = 0;

              // Subsequent phases per-letter motion
              if (t >= 3.0 && t < 6.0) {
                // Kinetic phase: staggered ripple & spring
                const wave = Math.sin((t - 3.0) * 3.5 + index * 0.5);
                y += wave * 7;
                rotX = wave * 6;
                scale *= 1 + wave * 0.025;
              } else if (t >= 6.0 && t < 10.0) {
                // Fluid phase: floating drift
                const wave = Math.sin((t - 6.0) * 2.2 + index * 0.6);
                y += wave * 5;
                z += Math.cos((t - 6.0) * 1.8 + index * 0.4) * 15;
              } else if (t >= 10.0 && t < 15.0) {
                // Neon pulse phase
                const beat = ((t - 10.0) % 0.46875) / 0.46875;
                const letterBounce = Math.sin(beat * Math.PI) * Math.sin(index * 0.8) * 4;
                y -= letterBounce;
              } else if (t >= 15.0 && t < 15.6) {
                // Anticipation contraction
                z -= 50;
                scale *= 0.96;
              } else if (t >= 15.6 && t < 17.5) {
                // Climax impact snap
                const impactElapsed = t - 15.6;
                const spring = Math.sin(impactElapsed * 18 + index * 0.3) * Math.exp(-impactElapsed * 5) * 8;
                y += spring;
              }

              transform = `translate3d(0, ${y}px, ${z}px) scale3d(${scale}, ${scale}, 1) rotateY(${rotY}deg) rotateX(${rotX}deg)`;
              filter = `blur(${(1 - charProgress) * 16}px)`;
            }

            // Light sweep & chrome reflection position
            const sweepOffset = (t * 80 + index * 15) % 300;
            const bgPosition = `${sweepOffset}% center`;

            return (
              <span
                key={`l2-${index}`}
                className="inline-block font-black text-chrome-gradient transition-all duration-75 relative select-none"
                style={{
                  opacity,
                  transform,
                  filter,
                  backgroundPosition: bgPosition,
                  willChange: 'transform, opacity, filter',
                  textShadow: sceneGlow,
                }}
              >
                {char}
                {/* Luminous edge highlight pseudo overlay */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 text-transparent pointer-events-none -z-10"
                  style={{
                    WebkitTextStroke: '2px rgba(0, 240, 255, 0.45)',
                    opacity: t >= 2.0 ? 0.7 : 0,
                  }}
                >
                  {char}
                </span>
              </span>
            );
          })}
        </div>

        {/* LINE 3: BGM (Directly below PLAYLIST with bold neon outline & luminous impact) */}
        <div
          className="flex items-center justify-center font-black tracking-widest leading-none mt-1 sm:mt-2"
          style={{
            fontSize: 'clamp(2.4rem, 8.5vw, 6.2rem)',
            letterSpacing: '0.18em',
          }}
        >
          {line3Chars.map((char, index) => {
            // Reveal timing: 1.8s to 2.8s
            const charDelay = 1.8 + index * 0.18;
            let opacity = 0;
            let transform = 'translate3d(0, 40px, -180px) scale(0.7)';
            let filter = 'blur(14px)';

            if (t >= charDelay) {
              const charProgress = clamp((t - charDelay) / 0.55, 0, 1);
              const eased = easeOutBack(charProgress);
              opacity = charProgress;

              let y = (1 - eased) * 40;
              let z = (1 - eased) * -180;
              let scale = 0.7 + eased * 0.3;

              // Pulse phase expansion
              if (t >= 10.0 && t < 15.0) {
                const beat = ((t - 10.0) % 0.46875) / 0.46875;
                scale *= 1 + Math.sin(beat * Math.PI) * 0.04;
              } else if (t >= 15.6) {
                // Post impact dramatic presence
                scale *= 1.02;
              }

              transform = `translate3d(0, ${y}px, ${z}px) scale3d(${scale}, ${scale}, 1)`;
              filter = `blur(${(1 - charProgress) * 14}px)`;
            }

            // Fill style changes across phases:
            // - Initially outlined neon
            // - In pulse phase (10-15s) and post-impact (15.6-20s), activates luminous gradient fill
            const isLuminousPhase = (t >= 10.0 && t <= 14.8) || t >= 15.6;

            return (
              <span
                key={`l3-${index}`}
                className={`inline-block font-black transition-all duration-100 ${
                  isLuminousPhase ? 'text-neon-fill' : 'text-neon-stroke'
                }`}
                style={{
                  opacity,
                  transform,
                  filter,
                  willChange: 'transform, opacity, filter',
                  textShadow:
                    t >= 15.6
                      ? '0 0 20px #00f0ff, 0 0 40px #8a2be2, 0 0 70px #ec4899'
                      : t >= 10.0
                      ? '0 0 15px rgba(0, 240, 255, 0.8), 0 0 30px rgba(138, 43, 226, 0.6)'
                      : '0 0 10px rgba(0, 240, 255, 0.5)',
                }}
              >
                {char}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React, { useMemo } from 'react';

interface CinematicOverlayProps {
  currentTime: number;
}

export const CinematicOverlay: React.FC<CinematicOverlayProps> = ({ currentTime: t }) => {
  // Cinematic flash calculations
  const flashAlpha = useMemo(() => {
    // Flash 1: Minor flare at 7.8s
    if (t >= 7.8 && t < 8.3) {
      const p = (t - 7.8) / 0.5;
      return Math.sin(p * Math.PI) * 0.28;
    }
    // Flash 2: Major title impact flash at 15.6s
    if (t >= 15.6 && t < 16.3) {
      const p = (t - 15.6) / 0.7;
      return Math.pow(1 - p, 2) * 0.85;
    }
    return 0;
  }, [t]);

  // Flash color tint (white-cyan on impact)
  const flashColor = t >= 15.6 ? 'rgba(235, 250, 255, ' : 'rgba(168, 85, 247, ';

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      {/* 1. Cinematic Flash Wash */}
      {flashAlpha > 0.005 && (
        <div
          className="absolute inset-0 transition-opacity duration-75"
          style={{
            backgroundColor: `${flashColor}${flashAlpha})`,
            mixBlendMode: 'screen',
          }}
        />
      )}

      {/* 2. Soft Volumetric Vignette & Atmospheric Depth */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(3, 1, 7, 0.75) 100%)',
        }}
      />

      {/* 3. Subtle Film Grain */}
      <div className="absolute inset-0 grain-overlay opacity-30" />

      {/* 4. Horizontal anamorphic flare line during impact (15.6s - 16.5s) */}
      {t >= 15.6 && t < 16.6 && (
        <div
          className="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(0, 240, 255, 0.8) 50%, transparent 100%)',
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.9), 0 0 40px rgba(168, 85, 247, 0.6)',
            opacity: Math.max(0, 1 - (t - 15.6) / 1.0),
          }}
        />
      )}
    </div>
  );
};

/**
 * SARANG RN — PLAYLIST BGM
 * Professional Cinematic Kinetic Typography & Music-Video Title Experience
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VisualizerCanvas } from './components/VisualizerCanvas.tsx';
import { KineticTypography } from './components/KineticTypography.tsx';
import { CinematicOverlay } from './components/CinematicOverlay.tsx';
import { PlaybackControls } from './components/PlaybackControls.tsx';
import { TOTAL_DURATION } from './types.ts';
import { soundEngine } from './utils/audio.ts';

export default function App() {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isControlsVisible, setIsControlsVisible] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [customAudioName, setCustomAudioName] = useState<string | null>(null);

  // References for master monotonic timer
  const animFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const currentTimeRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(true);

  // Keep ref synchronized
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Main high-resolution animation loop
  useEffect(() => {
    const loop = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }
      const delta = (timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      if (isPlayingRef.current) {
        const nextTime = currentTimeRef.current + delta;
        if (nextTime >= TOTAL_DURATION) {
          // Reached exactly 20.00s: Freeze at final Hero frame (do not reset to black)
          currentTimeRef.current = TOTAL_DURATION;
          setCurrentTime(TOTAL_DURATION);
          setIsPlaying(false);
          isPlayingRef.current = false;
          soundEngine.syncAudio(TOTAL_DURATION, false);
        } else {
          currentTimeRef.current = nextTime;
          setCurrentTime(nextTime);
          soundEngine.syncAudio(nextTime, true);
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Handlers
  const handlePlay = useCallback(() => {
    soundEngine.init();
    if (currentTimeRef.current >= TOTAL_DURATION) {
      currentTimeRef.current = 0;
      setCurrentTime(0);
    }
    lastTimestampRef.current = null;
    setIsPlaying(true);
    isPlayingRef.current = true;
    soundEngine.syncAudio(currentTimeRef.current, true);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    soundEngine.syncAudio(currentTimeRef.current, false);
  }, []);

  const handleReplay = useCallback(() => {
    soundEngine.init();
    currentTimeRef.current = 0;
    setCurrentTime(0);
    lastTimestampRef.current = null;
    setIsPlaying(true);
    isPlayingRef.current = true;
    soundEngine.syncAudio(0, true);
  }, []);

  const handleReset = useCallback(() => {
    currentTimeRef.current = 0;
    setCurrentTime(0);
    setIsPlaying(false);
    isPlayingRef.current = false;
    soundEngine.syncAudio(0, false);
  }, []);

  const handleSeek = useCallback((time: number) => {
    const clamped = Math.min(Math.max(time, 0), TOTAL_DURATION);
    currentTimeRef.current = clamped;
    setCurrentTime(clamped);
    soundEngine.syncAudio(clamped, isPlayingRef.current);
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  }, []);

  const handleToggleMute = useCallback(() => {
    soundEngine.init();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEngine.setMuted(nextMuted);
  }, [isMuted]);

  const handleUploadAudio = useCallback(async (file: File) => {
    try {
      soundEngine.init();
      const fileName = await soundEngine.loadCustomFile(file);
      setCustomAudioName(fileName);
      setIsMuted(false);
      soundEngine.setMuted(false);
      soundEngine.syncAudio(currentTimeRef.current, isPlayingRef.current);
    } catch (e) {
      console.error('Failed to load audio', e);
    }
  }, []);

  const handleRemoveAudio = useCallback(() => {
    soundEngine.removeCustomFile();
    setCustomAudioName(null);
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (isPlayingRef.current) {
            handlePause();
          } else {
            handlePlay();
          }
          break;
        case 'KeyR':
          e.preventDefault();
          handleReplay();
          break;
        case 'KeyF':
          e.preventDefault();
          handleToggleFullscreen();
          break;
        case 'KeyH':
          e.preventDefault();
          setIsControlsVisible((prev) => !prev);
          break;
        case 'KeyM':
          e.preventDefault();
          handleToggleMute();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleSeek(Math.max(0, currentTimeRef.current - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleSeek(Math.min(TOTAL_DURATION, currentTimeRef.current + 1));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePause, handlePlay, handleReplay, handleToggleFullscreen, handleToggleMute, handleSeek]);

  // Fullscreen change listener
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Page visibility change listener (pause processing when hidden)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && isPlayingRef.current) {
        handlePause();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [handlePause]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#030107] flex items-center justify-center select-none font-sans">
      {/* Visual Canvas (Fluid Waves & Connecting Particles & Shockwave) */}
      <VisualizerCanvas currentTime={currentTime} isPlaying={isPlaying} />

      {/* Hero 3D Kinetic Typography */}
      <KineticTypography currentTime={currentTime} />

      {/* Cinematic Overlays (Flashes, Light flare, Vignette & Grain) */}
      <CinematicOverlay currentTime={currentTime} />

      {/* Discreet Master Playback Controls */}
      <PlaybackControls
        currentTime={currentTime}
        isPlaying={isPlaying}
        onPlay={handlePlay}
        onPause={handlePause}
        onReplay={handleReplay}
        onReset={handleReset}
        onSeek={handleSeek}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        isControlsVisible={isControlsVisible}
        onToggleControlsVisible={() => setIsControlsVisible((prev) => !prev)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        customAudioName={customAudioName}
        onUploadAudio={handleUploadAudio}
        onRemoveAudio={handleRemoveAudio}
      />
    </main>
  );
}

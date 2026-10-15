import React, { useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Upload,
  X,
  Sparkles,
} from 'lucide-react';
import { TIMELINE_PHASES, TOTAL_DURATION } from '../types.ts';

interface PlaybackControlsProps {
  currentTime: number;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReplay: () => void;
  onReset: () => void;
  onSeek: (time: number) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isControlsVisible: boolean;
  onToggleControlsVisible: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  customAudioName: string | null;
  onUploadAudio: (file: File) => void;
  onRemoveAudio: () => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  currentTime,
  isPlaying,
  onPlay,
  onPause,
  onReplay,
  onReset,
  onSeek,
  isFullscreen,
  onToggleFullscreen,
  isControlsVisible,
  onToggleControlsVisible,
  isMuted,
  onToggleMute,
  customAudioName,
  onUploadAudio,
  onRemoveAudio,
}) => {
  const [showAudioModal, setShowAudioModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Find active phase
  const activePhase =
    TIMELINE_PHASES.find(
      (p) => currentTime >= p.startTime && currentTime <= p.endTime
    ) || TIMELINE_PHASES[TIMELINE_PHASES.length - 1];

  const formatTime = (seconds: number) => {
    const clamped = Math.min(Math.max(seconds, 0), TOTAL_DURATION);
    const secs = Math.floor(clamped);
    const millis = Math.floor((clamped - secs) * 100);
    return `${secs.toString().padStart(2, '0')}.${millis.toString().padStart(2, '0')}s`;
  };

  const progressPercent = (currentTime / TOTAL_DURATION) * 100;

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    onSeek(newTime);
  };

  const handlePhaseClick = (startTime: number) => {
    onSeek(startTime);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadAudio(file);
      setShowAudioModal(false);
    }
  };

  return (
    <>
      {/* Top Floating Mini-Bar: Clean View toggle & Active Phase Indicator */}
      <div
        className={`fixed top-4 left-4 right-4 z-40 flex items-center justify-between transition-opacity duration-300 pointer-events-none ${
          isControlsVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="pointer-events-auto flex items-center gap-3 bg-black/60 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-lg text-xs font-mono text-zinc-300 shadow-xl">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-semibold text-white tracking-wider">{activePhase.label}</span>
          <span className="text-zinc-500" aria-hidden="true">·</span>
          <span className="hidden sm:inline text-zinc-400">{activePhase.description}</span>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          {/* Audio track indicator if loaded */}
          {customAudioName && (
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-cyan-500/30 px-3 py-1.5 rounded-lg text-xs text-cyan-300">
              <span className="truncate max-w-[140px] sm:max-w-[200px]">{customAudioName}</span>
              <button
                onClick={onRemoveAudio}
                className="hover:text-white transition-colors p-0.5"
                title="Remove custom audio"
                aria-label="Remove audio"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Quick HUD Toggle button */}
          <button
            onClick={onToggleControlsVisible}
            className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg text-xs text-zinc-300 hover:text-white transition-colors"
            title="Toggle Interface (Hotkey: H)"
            aria-label="Hide interface controls"
          >
            <EyeOff className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Clean View (H)</span>
          </button>
        </div>
      </div>

      {/* Floating reveal button when HUD is hidden */}
      {!isControlsVisible && (
        <button
          onClick={onToggleControlsVisible}
          className="fixed bottom-4 right-4 z-50 bg-black/80 hover:bg-black text-zinc-400 hover:text-cyan-400 border border-white/15 p-2.5 rounded-full shadow-2xl transition-all duration-200 hover:scale-110"
          title="Show Controls (Hotkey: H)"
          aria-label="Show controls"
        >
          <Eye className="w-5 h-5" />
        </button>
      )}

      {/* Bottom Main Cinematic Master Control Bar */}
      <nav
        aria-label="Playback controls"
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-40 bg-[#090514]/85 backdrop-blur-xl border border-white/15 shadow-[0_10px_40px_rgba(0,0,0,0.8)] rounded-2xl p-3 sm:p-4 transition-all duration-300 ${
          isControlsVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-8 pointer-events-none'
        }`}
      >
        {/* Phase Timeline Markers & Progress Bar */}
        <div className="mb-3">
          {/* Phase tabs / jump points */}
          <div className="hidden sm:grid grid-cols-6 gap-1 mb-2 text-[10px] font-mono tracking-wider text-zinc-400">
            {TIMELINE_PHASES.map((phase) => {
              const isCurrent =
                currentTime >= phase.startTime && currentTime <= phase.endTime;
              return (
                <button
                  key={phase.id}
                  onClick={() => handlePhaseClick(phase.startTime)}
                  className={`text-left px-1.5 py-0.5 rounded transition-colors truncate ${
                    isCurrent
                      ? 'text-cyan-300 font-bold bg-cyan-950/40 border border-cyan-500/30'
                      : 'hover:text-zinc-200'
                  }`}
                  title={`Jump to ${phase.name} (${phase.startTime}s)`}
                >
                  {phase.startTime.toFixed(0)}s {phase.name}
                </button>
              );
            })}
          </div>

          {/* Interactive Scrubbing Bar */}
          <div className="relative flex items-center group">
            {/* Visual gradient track */}
            <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden relative border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-500 rounded-full transition-all duration-75"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Range input scrub handler */}
            <input
              type="range"
              min={0}
              max={TOTAL_DURATION}
              step={0.02}
              value={currentTime}
              onChange={handleScrubberChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              aria-label="Timeline position scrubber"
            />
          </div>
        </div>

        {/* Control Buttons & Indicators Row */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Playback Triggers */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Play / Pause Button */}
            <button
              onClick={isPlaying ? onPause : onPlay}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 text-white shadow-lg hover:shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            {/* Replay from Start */}
            <button
              onClick={onReplay}
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 hover:border-white/20 transition-all"
              title="Replay from Beginning (R)"
              aria-label="Replay from beginning"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Reset to Opening Frame */}
            <button
              onClick={onReset}
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 hover:border-white/20 transition-all"
              title="Reset to 00.00s"
              aria-label="Reset to start"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Exact Elapsed / Total Time */}
            <div className="ml-2 font-mono text-xs sm:text-sm font-semibold tracking-wider text-zinc-300">
              <span className="text-cyan-300 font-bold">{formatTime(currentTime)}</span>
              <span className="text-zinc-600 mx-1">/</span>
              <span className="text-zinc-400">20.00s</span>
            </div>
          </div>

          {/* Right: Sound, Audio Upload & Fullscreen */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Audio Synth / Sound FX Mute Toggle */}
            <button
              onClick={onToggleMute}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                !isMuted
                  ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40'
                  : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
              }`}
              title={isMuted ? 'Unmute Sound FX / Audio (M)' : 'Mute Sound (M)'}
              aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-4 h-4 text-zinc-400" />
                  <span className="hidden md:inline">Muted</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  <span className="hidden md:inline">Sound ON</span>
                </>
              )}
            </button>

            {/* Load Custom BGM Audio File */}
            <button
              onClick={() => setShowAudioModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 hover:border-white/20 transition-all"
              title="Upload Local BGM File for Preview"
              aria-label="Upload custom audio"
            >
              <Upload className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden lg:inline">Custom BGM</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={onToggleFullscreen}
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 hover:border-white/20 transition-all"
              title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Audio Upload Modal */}
      {showAudioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#0f0920] border border-white/15 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowAudioModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Preview with Custom BGM</h3>
                <p className="text-xs text-zinc-400">Select any local music or beat file from your device</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed mb-5">
              The animation runs completely independently without audio. If you load a soundtrack, it will automatically sync to the master 20-second timeline.
            </p>

            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="hidden"
                id="audio-file-input"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-semibold text-sm transition-all shadow-lg hover:shadow-cyan-500/20"
              >
                <Upload className="w-4 h-4" />
                Select Audio File (.mp3, .wav, .m4a)
              </button>

              {customAudioName && (
                <button
                  onClick={() => {
                    onRemoveAudio();
                    setShowAudioModal(false);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-500/30 text-xs font-medium transition-all"
                >
                  Remove current audio: {customAudioName}
                </button>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setShowAudioModal(false)}
                className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

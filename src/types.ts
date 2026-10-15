export interface TimelinePhase {
  id: string;
  name: string;
  label: string;
  startTime: number;
  endTime: number;
  description: string;
}

export const TIMELINE_PHASES: TimelinePhase[] = [
  {
    id: 'intro',
    name: 'Intro & Reveal',
    label: '01 INTRO REVEAL',
    startTime: 0.0,
    endTime: 3.0,
    description: 'Atmospheric darkness, slow camera push, per-character emergence.',
  },
  {
    id: 'kinetic',
    name: 'Kinetic Typography',
    label: '02 KINETIC MOTION',
    startTime: 3.0,
    endTime: 6.0,
    description: '3D rotation, spring perspective, chrome reflection sweep.',
  },
  {
    id: 'fluid',
    name: 'Fluid Light & Particles',
    label: '03 FLUID LIGHT',
    startTime: 6.0,
    endTime: 10.0,
    description: 'Cyan-violet energy waves, connecting particle trails, light ribbons.',
  },
  {
    id: 'pulse',
    name: 'Neon Pulse & Reflection',
    label: '04 NEON PULSE',
    startTime: 10.0,
    endTime: 15.0,
    description: 'Rhythmic luminosity modulation, chrome sweeps, neon edge resonance.',
  },
  {
    id: 'impact',
    name: 'Final Impact',
    label: '05 TITLE IMPACT',
    startTime: 15.0,
    endTime: 18.0,
    description: 'Anticipation snap, cinematic flash, shockwave burst & electric bloom.',
  },
  {
    id: 'hero',
    name: 'Hero End Frame',
    label: '06 HERO FRAME',
    startTime: 18.0,
    endTime: 20.0,
    description: 'Majestic stabilized title composition with subtle ambient life.',
  },
];

export const TOTAL_DURATION = 20.0; // Exact 20 seconds

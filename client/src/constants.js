// Difficulty index (0-3) -> display info. Class names are written out in full so Tailwind picks them up.
export const DIFFICULTIES = [
  { label: 'Easy', bg: 'bg-easy', ring: 'ring-easy', dot: '🟨' },
  { label: 'Medium', bg: 'bg-medium', ring: 'ring-medium', dot: '🟩' },
  { label: 'Hard', bg: 'bg-hard', ring: 'ring-hard', dot: '🟦' },
  { label: 'Extreme', bg: 'bg-extreme', ring: 'ring-extreme', dot: '🟪' },
];

export const GROUP_SIZE = 4;
export const MAX_MISTAKES = 4;

"use client";
import { DoguMood } from "@/lib/types";

const MOODS: Record<DoguMood, { eyes: string; mouth: string; color: string }> = {
  idle:    { eyes: "•  •", mouth: "‿", color: "#7B6A4E" },
  happy:   { eyes: "^  ^", mouth: "▽", color: "#A0845C" },
  think:   { eyes: "~  ~", mouth: "–", color: "#7B6A4E" },
  correct: { eyes: "★  ★", mouth: "▽", color: "#5C8A5C" },
  wrong:   { eyes: "×  ×", mouth: "–", color: "#8A5C5C" },
  excited: { eyes: "◉  ◉", mouth: "D", color: "#A0845C" },
};

export default function DoguFace({ mood = "idle", size = 72 }: { mood?: DoguMood; size?: number }) {
  const m = MOODS[mood];
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" style={{ flexShrink: 0 }}>
      <ellipse cx="36" cy="34" rx="26" ry="28" fill={m.color} />
      <rect x="22" y="8" width="28" height="8" rx="4" fill={m.color} opacity="0.7" />
      <rect x="28" y="4" width="16" height="8" rx="4" fill={m.color} opacity="0.5" />
      <line x1="14" y1="30" x2="22" y2="30" stroke="#C8B89A" strokeWidth="1.5" opacity="0.6" />
      <line x1="50" y1="30" x2="58" y2="30" stroke="#C8B89A" strokeWidth="1.5" opacity="0.6" />
      <text x="36" y="34" textAnchor="middle" fontSize="11" fill="#F5EFE0" fontFamily="monospace" letterSpacing="4">{m.eyes}</text>
      <text x="36" y="46" textAnchor="middle" fontSize="9"  fill="#F5EFE0" fontFamily="monospace">{m.mouth}</text>
      <ellipse cx="36" cy="60" rx="10" ry="5" fill={m.color} opacity="0.5" />
    </svg>
  );
}

import { useEffect, useState } from "react";

export function Confetti({ count = 80 }: { count?: number }) {
  const [pieces, setPieces] = useState<{ left: number; delay: number; hue: number; dur: number }[]>([]);
  useEffect(() => {
    setPieces(
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 2,
        hue: Math.floor(Math.random() * 360),
        dur: 3 + Math.random() * 3,
      })),
    );
  }, [count]);
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          style={{
            left: `${p.left}%`,
            top: "-10px",
            background: `oklch(0.75 0.18 ${p.hue})`,
            animation: `confetti-fall ${p.dur}s linear ${p.delay}s infinite`,
          }}
          className="absolute h-2 w-2 rounded-sm opacity-90"
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
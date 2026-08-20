import { motion, useReducedMotion } from "framer-motion";

// デザイン方針: LEGENDARYの達成感を短い上方演出で伝え、当選アイテムと操作ボタンの可読性・タップ操作を妨げない。
const CONFETTI_PIECES = [
  { left: "5%",  color: "#FBBF24", delay: 0.02, drift: 16, rotate: 270, width: 7, height: 12, radius: "2px" },
  { left: "12%", color: "#E91E8C", delay: 0.12, drift: -14, rotate: 320, width: 6, height: 10, radius: "50%" },
  { left: "18%", color: "#60A5FA", delay: 0.22, drift: 21, rotate: 210, width: 8, height: 8, radius: "2px" },
  { left: "25%", color: "#F59E0B", delay: 0.08, drift: -9, rotate: 360, width: 5, height: 13, radius: "2px" },
  { left: "32%", color: "#A855F7", delay: 0.29, drift: 18, rotate: 280, width: 7, height: 10, radius: "50%" },
  { left: "39%", color: "#FDE68A", delay: 0.16, drift: -20, rotate: 320, width: 9, height: 6, radius: "2px" },
  { left: "46%", color: "#E91E8C", delay: 0.34, drift: 8, rotate: 250, width: 6, height: 12, radius: "2px" },
  { left: "53%", color: "#38BDF8", delay: 0.04, drift: -16, rotate: 330, width: 8, height: 8, radius: "50%" },
  { left: "60%", color: "#FBBF24", delay: 0.25, drift: 12, rotate: 300, width: 6, height: 13, radius: "2px" },
  { left: "67%", color: "#A855F7", delay: 0.14, drift: -22, rotate: 280, width: 8, height: 7, radius: "2px" },
  { left: "74%", color: "#E91E8C", delay: 0.31, drift: 17, rotate: 360, width: 6, height: 10, radius: "50%" },
  { left: "81%", color: "#FDE68A", delay: 0.06, drift: -10, rotate: 260, width: 9, height: 6, radius: "2px" },
  { left: "88%", color: "#60A5FA", delay: 0.2, drift: 19, rotate: 340, width: 6, height: 12, radius: "2px" },
  { left: "95%", color: "#F59E0B", delay: 0.27, drift: -14, rotate: 220, width: 7, height: 9, radius: "2px" },
] as const;

export default function LegendaryConfetti() {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-30 h-64 overflow-hidden">
      {CONFETTI_PIECES.map((piece, index) => (
        <motion.span
          key={`${piece.left}-${index}`}
          initial={{ opacity: 0, y: -18, x: 0, rotate: 0 }}
          animate={{ opacity: [0, 1, 1, 0], y: [-18, 236], x: [0, piece.drift], rotate: [0, piece.rotate] }}
          transition={{ duration: 1.35, delay: piece.delay, ease: [0.23, 1, 0.32, 1] }}
          className="absolute block"
          style={{ left: piece.left, width: piece.width, height: piece.height, borderRadius: piece.radius, background: piece.color, boxShadow: `0 1px 4px ${piece.color}` }}
        />
      ))}
    </div>
  );
}

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

// ================================================================
// PWAスプラッシュスクリーン
// ダークネイビー背景 + 稲妻ロゴ + "Wallet active" ロゴタイプ
// PWA（standalone）起動時のみ表示。ブラウザ通常アクセス時は非表示。
// ================================================================

function isPWA(): boolean {
  if (typeof window === "undefined") return false;
  // iOS Safari の standalone モード
  if ((window.navigator as any).standalone === true) return true;
  // Android Chrome / その他 PWA
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  return false;
}

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");

  useEffect(() => {
    // in: 0.6s → hold: 0.8s → out: 0.5s → done
    const t1 = setTimeout(() => setPhase("hold"), 600);
    const t2 = setTimeout(() => setPhase("out"), 1400);
    const t3 = setTimeout(() => onDone(), 1900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <AnimatePresence>
      {phase !== "out" ? (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: "linear-gradient(180deg, #0D1B3E 0%, #060f26 100%)" }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {/* 背景グロー */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 50% 45%, rgba(245,158,11,0.18) 0%, transparent 65%)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === "hold" ? 1 : 0.6 }}
            transition={{ duration: 0.6 }}
          />

          {/* ロゴアイコン（稲妻マーク） */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="mb-6 relative"
          >
            {/* アイコン枠 */}
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center"
              style={{
                background: "rgba(245,158,11,0.12)",
                border: "2px solid rgba(245,158,11,0.5)",
                boxShadow: "0 0 48px rgba(245,158,11,0.35), 0 0 96px rgba(245,158,11,0.12)",
              }}
            >
              {/* 稲妻SVG */}
              <svg width="44" height="56" viewBox="0 0 44 56" fill="none">
                <path
                  d="M26 2L4 30H22L18 54L40 26H22L26 2Z"
                  fill="#F59E0B"
                  stroke="rgba(245,158,11,0.4)"
                  strokeWidth="1"
                />
              </svg>
            </div>

            {/* パルスリング */}
            <motion.div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{ border: "2px solid rgba(245,158,11,0.4)" }}
              animate={{ scale: [1, 1.25, 1.5], opacity: [0.6, 0.3, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
            />
          </motion.div>

          {/* ロゴタイプ */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
            className="text-center"
          >
            <div className="flex items-baseline gap-1.5">
              <span
                className="text-3xl font-black tracking-tight text-white"
                style={{ fontFamily: "'Noto Sans JP', sans-serif", letterSpacing: "-0.02em" }}
              >
                Wallet
              </span>
              <span
                className="text-3xl font-black tracking-tight"
                style={{ color: "#F59E0B", fontFamily: "'Noto Sans JP', sans-serif", letterSpacing: "-0.02em" }}
              >
                active
              </span>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="text-white/40 text-xs mt-1.5 tracking-widest font-medium"
            >
              MOVE · EARN · REWARD
            </motion.p>
          </motion.div>

          {/* ローディングドット */}
          <motion.div
            className="absolute bottom-16 flex gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "rgba(245,158,11,0.6)" }}
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export { isPWA };

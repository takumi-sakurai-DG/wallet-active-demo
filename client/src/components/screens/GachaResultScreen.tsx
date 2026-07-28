import { useApp } from "@/contexts/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Repeat } from "lucide-react";
import { useEffect, useState } from "react";

function Confetti() {
  const pieces = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {pieces.map(i => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-sm"
          style={{
            left: `${Math.random() * 100}%`,
            top: "-10px",
            background: ["#E60012", "#F59E0B", "#10B981", "#a855f7", "#60A5FA"][i % 5],
            rotate: Math.random() * 360,
          }}
          animate={{
            y: ["0vh", "110vh"],
            rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 1.5,
            delay: Math.random() * 0.8,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

function PsychBadge({ theory, cite, color = "#93C5FD" }: { theory: string; cite: string; color?: string }) {
  return (
    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{ background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.3)", color }}>
      🧠 {theory} <span className="opacity-60">{cite}</span>
    </div>
  );
}

export default function GachaResultScreen() {
  const { state, setScreen } = useApp();
  const result = state.lastGachaResult;
  if (!result) return null;

  const isGood = result.fuelChange >= 0 || result.type === "boost";
  const color = result.type === "jackpot" ? "#F59E0B" : isGood ? "#10B981" : "#E60012";
  const bgColor = result.type === "jackpot" ? "rgba(245,158,11,0.15)" : isGood ? "rgba(16,185,129,0.15)" : "rgba(230,0,18,0.15)";
  const isJackpot = result.type === "jackpot";

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-6 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #0D1B3E 0%, #0a1530 100%)" }}>
      {isJackpot && <Confetti />}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="text-center"
      >
        <motion.div
          animate={result.type === "jackpot" ? { rotate: [0, -5, 5, -5, 5, 0] } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-7xl mb-4"
        >
          {result.type === "jackpot" ? "🎉" : result.type === "boost" ? "🚀" : isGood ? "⚡" : "💨"}
        </motion.div>

        <div className="text-4xl font-black mb-2" style={{ color }}>{result.label}</div>

        <div className="rounded-2xl px-6 py-4 mb-6" style={{ background: bgColor, border: `1px solid ${color}40` }}>
          <div className="text-white font-bold text-lg mb-1">{result.description}</div>
          {result.fuelChange !== 0 && (
            <div className="text-2xl font-black" style={{ color }}>
              Fuel {result.fuelChange > 0 ? "+" : ""}{result.fuelChange}
            </div>
          )}
          {result.boostMultiplier && (
            <div className="text-sm mt-1" style={{ color: "#E60012" }}>
              次回ブースト ×{result.boostMultiplier}
            </div>
          )}
          {state.showPsychBadge && (
            <div className="mt-3 flex flex-wrap gap-1 justify-center">
              {isGood ? (
                <PsychBadge theory="保有効果" cite="Thaler, 1980" />
              ) : (
                <PsychBadge theory="損失回避バイアス" cite="Kahneman & Tversky, 1979" color="#FCA5A5" />
              )}
              {result.boostMultiplier && (
                <PsychBadge theory="拡張自己" cite="Belk, 1988" />
              )}
            </div>
          )}
        </div>

        <div className="text-white/60 text-sm mb-2">現在のFuel</div>
        <div className="text-5xl font-black text-amber-400 mb-8">{state.fuel}</div>

        <div className="flex gap-3">
          {state.fuel >= 10 && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setScreen("gacha")}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-white"
              style={{ background: "rgba(168,85,247,0.3)", border: "1px solid rgba(168,85,247,0.5)" }}
            >
              <Repeat size={16} />
              もう一回
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setScreen("home")}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white"
            style={{ background: "linear-gradient(135deg, #E60012, #ff4444)", boxShadow: "0 4px 20px rgba(230,0,18,0.4)" }}
          >
            <Home size={18} />
            ホームへ
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

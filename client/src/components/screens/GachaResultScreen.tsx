import { useApp } from "@/contexts/AppContext";
import { motion } from "framer-motion";
import { Home } from "lucide-react";

export default function GachaResultScreen() {
  const { state, setScreen } = useApp();
  const result = state.lastGachaResult;
  if (!result) return null;

  const isGood = result.fuelChange >= 0 || result.type === "boost";
  const color = result.type === "jackpot" ? "#F59E0B" : isGood ? "#10B981" : "#E60012";
  const bgColor = result.type === "jackpot" ? "rgba(245,158,11,0.15)" : isGood ? "rgba(16,185,129,0.15)" : "rgba(230,0,18,0.15)";

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-6" style={{ background: "linear-gradient(180deg, #0D1B3E 0%, #0a1530 100%)" }}>
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
        </div>

        <div className="text-white/60 text-sm mb-2">現在のFuel</div>
        <div className="text-5xl font-black text-amber-400 mb-8">{state.fuel}</div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setScreen("home")}
          className="flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-white"
          style={{ background: "linear-gradient(135deg, #E60012, #ff4444)", boxShadow: "0 4px 20px rgba(230,0,18,0.4)" }}
        >
          <Home size={18} />
          ホームに戻る
        </motion.button>
      </motion.div>
    </div>
  );
}

import { useApp, GachaResult } from "@/contexts/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

const ROULETTE_ITEMS = ["⚡", "✨", "🎉", "▲", "▼", "🚀", "⚡", "✨", "🎉"];

export default function GachaScreen() {
  const { setScreen, spinGacha, applyGachaResult } = useApp();
  const [spinning, setSpinning] = useState(false);
  const [offset, setOffset] = useState(0);
  const [done, setDone] = useState(false);

  const handleSpin = () => {
    if (spinning || done) return;
    setSpinning(true);
    const result: GachaResult = spinGacha();
    const spins = 5 + Math.random() * 3;
    const finalOffset = -(spins * ROULETTE_ITEMS.length * 60);
    setOffset(finalOffset);
    setTimeout(() => {
      setSpinning(false);
      setDone(true);
      applyGachaResult(result);
      setTimeout(() => setScreen("gacha-result"), 800);
    }, 2000);
  };

  return (
    <div className="w-full h-full flex flex-col items-center" style={{ background: "linear-gradient(180deg, #0D1B3E 0%, #1a0a2e 100%)" }}>
      <div className="flex items-center w-full px-5 pt-10 pb-4">
        <button onClick={() => setScreen("choose")} className="p-2 rounded-full mr-3" style={{ background: "rgba(255,255,255,0.08)" }}>
          <ArrowLeft size={18} color="white" />
        </button>
        <div className="text-white font-black text-xl">ガチャに挑戦！</div>
      </div>

      <div className="text-white/50 text-sm mb-8">Fuel 10を消費してガチャを回す</div>

      {/* ルーレット */}
      <div className="relative w-64 overflow-hidden rounded-2xl" style={{ height: 80, background: "rgba(0,0,0,0.4)", border: "2px solid rgba(168,85,247,0.5)" }}>
        <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: "linear-gradient(90deg, rgba(13,27,62,0.9) 0%, transparent 30%, transparent 70%, rgba(13,27,62,0.9) 100%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-xl z-20 pointer-events-none" style={{ border: "2px solid #a855f7", boxShadow: "0 0 20px rgba(168,85,247,0.5)" }} />
        <motion.div
          className="flex items-center"
          style={{ height: 80 }}
          animate={{ x: offset }}
          transition={spinning ? { duration: 2, ease: [0.25, 0.1, 0.25, 1] } : { duration: 0 }}
        >
          {[...ROULETTE_ITEMS, ...ROULETTE_ITEMS, ...ROULETTE_ITEMS, ...ROULETTE_ITEMS, ...ROULETTE_ITEMS].map((item, i) => (
            <div key={i} className="flex-shrink-0 w-16 h-16 flex items-center justify-center text-3xl mx-1">
              {item}
            </div>
          ))}
        </motion.div>
      </div>

      {/* スピンボタン */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleSpin}
        disabled={spinning || done}
        className="mt-10 px-12 py-4 rounded-2xl font-black text-lg transition-all"
        style={{
          background: spinning || done ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, #a855f7, #7c3aed)",
          color: "white",
          boxShadow: spinning || done ? "none" : "0 4px 20px rgba(168,85,247,0.5)",
        }}
      >
        {spinning ? "回転中..." : done ? "結果へ..." : "SPIN!"}
      </motion.button>

      {spinning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="mt-6 text-purple-300 text-sm font-bold tracking-widest"
        >
          ドキドキ...
        </motion.div>
      )}
    </div>
  );
}

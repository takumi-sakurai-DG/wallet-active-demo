import { useApp } from "@/contexts/AppContext";
import { motion } from "framer-motion";
import { Home } from "lucide-react";

export default function ConvertDoneScreen() {
  const { state, setScreen } = useApp();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-6" style={{ background: "linear-gradient(180deg, #0D1B3E 0%, #0a1e0a 100%)" }}>
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-7xl mb-6"
        >
          ✅
        </motion.div>
        <div className="text-3xl font-black text-white mb-2">変換完了！</div>
        <div className="text-white/60 text-sm mb-8">TOYOTAポイントに変換しました</div>

        <div className="rounded-2xl px-8 py-5 mb-8" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
          <div className="text-white/60 text-xs mb-1">保有ポイント</div>
          <div className="text-5xl font-black text-green-400">{state.points.toLocaleString()}</div>
          <div className="text-green-400/60 text-sm mt-1">pt</div>
        </div>

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


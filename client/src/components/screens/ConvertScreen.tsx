import { useApp } from "@/contexts/AppContext";
import { motion } from "framer-motion";
import { ArrowLeft, Coins, ArrowRight } from "lucide-react";

export default function ConvertScreen() {
  const { state, setScreen, convertToPoints } = useApp();
  const gain = state.fuel * 10;

  const handleConvert = () => {
    convertToPoints();
    setScreen("convert-done");
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ background: "linear-gradient(180deg, #0D1B3E 0%, #0a1e0a 100%)" }}>
      <div className="flex items-center px-5 pt-10 pb-6">
        <button onClick={() => setScreen("choose")} className="p-2 rounded-full mr-3" style={{ background: "rgba(255,255,255,0.08)" }}>
          <ArrowLeft size={18} color="white" />
        </button>
        <div className="text-white font-black text-xl">ポイントに変換</div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full rounded-2xl p-6 mb-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-center">
              <div className="text-white/50 text-xs mb-1">現在のFuel</div>
              <div className="text-4xl font-black text-amber-400">{state.fuel}</div>
            </div>
            <ArrowRight size={24} color="rgba(255,255,255,0.3)" />
            <div className="text-center">
              <div className="text-white/50 text-xs mb-1">獲得ポイント</div>
              <div className="text-4xl font-black text-green-400">+{gain}</div>
              <div className="text-green-400/60 text-xs">pt</div>
            </div>
          </div>
          <div className="text-center text-white/40 text-xs">1 Fuel = 10 TOYOTAポイント</div>
        </div>

        <div className="w-full rounded-xl p-4 mb-8" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <div className="text-white/60 text-xs mb-1">変換後の保有ポイント</div>
          <div className="text-white font-bold text-xl">{(state.points + gain).toLocaleString()} pt</div>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleConvert}
          className="w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #10B981, #059669)", color: "white", boxShadow: "0 4px 20px rgba(16,185,129,0.4)" }}
        >
          <Coins size={20} />
          変換を確定する
        </motion.button>
      </div>
    </div>
  );
}

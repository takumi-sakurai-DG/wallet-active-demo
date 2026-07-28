import { useApp } from "@/contexts/AppContext";
import { motion } from "framer-motion";
import { Gamepad2, Coins, ArrowLeft } from "lucide-react";

export default function ChooseScreen() {
  const { state, setScreen } = useApp();

  return (
    <div className="w-full h-full flex flex-col" style={{ background: "linear-gradient(180deg, #0D1B3E 0%, #0a1530 100%)" }}>
      <div className="flex items-center px-5 pt-10 pb-6">
        <button onClick={() => setScreen("home")} className="p-2 rounded-full mr-3" style={{ background: "rgba(255,255,255,0.08)" }}>
          <ArrowLeft size={18} color="white" />
        </button>
        <div>
          <div className="text-white font-black text-xl">Fuelの使い道を選ぶ</div>
          <div className="text-amber-400 text-sm font-bold mt-0.5">現在のFuel: {state.fuel}</div>
        </div>
      </div>

      <div className="px-5 flex flex-col gap-4 mt-4">
        {/* ガチャ選択 */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setScreen("gacha")}
          className="w-full rounded-2xl p-5 text-left relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1a0a2e, #2d1060)", border: "1px solid rgba(168,85,247,0.4)" }}
        >
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
            <Gamepad2 size={80} color="#a855f7" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(168,85,247,0.3)" }}>
                <Gamepad2 size={16} color="#a855f7" />
              </div>
              <span className="text-purple-300 text-xs font-bold tracking-widest">CHALLENGE</span>
            </div>
            <div className="text-white font-black text-xl mb-1">ガチャに挑戦する</div>
            <div className="text-white/60 text-sm leading-relaxed">Fuelを10消費してガチャを回す。<br />結果次第でFuel増減・ブースト強化！</div>
            <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold" style={{ background: "rgba(168,85,247,0.2)", color: "#c084fc" }}>
              消費: Fuel 10
            </div>
          </div>
        </motion.button>

        {/* ポイント変換 */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setScreen("convert")}
          className="w-full rounded-2xl p-5 text-left relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0a1e0a, #0d3320)", border: "1px solid rgba(16,185,129,0.4)" }}
        >
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
            <Coins size={80} color="#10B981" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(16,185,129,0.3)" }}>
                <Coins size={16} color="#10B981" />
              </div>
              <span className="text-green-400 text-xs font-bold tracking-widest">CONVERT</span>
            </div>
            <div className="text-white font-black text-xl mb-1">ポイントに変換する</div>
            <div className="text-white/60 text-sm leading-relaxed">全Fuelを確実にTOYOTAポイントへ変換。<br />1 Fuel = 10 pt で計算。</div>
            <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold" style={{ background: "rgba(16,185,129,0.2)", color: "#34d399" }}>
              獲得予定: {state.fuel * 10} pt
            </div>
          </div>
        </motion.button>
      </div>

      <div className="px-5 mt-6 text-center text-white/30 text-xs leading-relaxed">
        ガチャはFuelが増える可能性もありますが、<br />減ることもあります。
      </div>
    </div>
  );
}

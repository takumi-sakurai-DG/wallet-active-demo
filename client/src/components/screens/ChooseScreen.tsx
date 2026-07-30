import { useApp } from "@/contexts/AppContext";
import { motion } from "framer-motion";
import { Gamepad2, Coins, ArrowLeft, AlertTriangle } from "lucide-react";


export default function ChooseScreen() {
  const { state, setScreen } = useApp();
  const nearFull = state.fuel >= state.maxFuel * 0.85;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden" style={{ background: "linear-gradient(180deg, #F8F9FA 0%, #F1F3F5 100%)" }}>
      <div className="flex items-center px-5 pb-6" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
        <button onClick={() => setScreen("home")} className="p-2 rounded-full mr-3" style={{ background: "rgba(0,0,0,0.05)" }}>
          <ArrowLeft size={18} color="#212529" />
        </button>
        <div>
          <div className="text-gray-800 font-black text-xl">ポイントの使い道を選ぶ</div>
          <div className="text-amber-400 text-sm font-bold mt-0.5">現在のポイント: {state.fuel}</div>
        </div>
      </div>

      {/* 損失回避フレーミング */}
      {nearFull && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-5 mb-4 rounded-xl px-4 py-3 flex items-center gap-3"
          style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.4)" }}
        >
          <AlertTriangle size={18} color="#F59E0B" />
          <div className="flex-1">
            <div className="text-amber-400 font-bold text-sm">ポイントが{state.fuel}まで蓄積しています</div>
            <div className="text-gray-500 text-xs mt-0.5">今すぐ使わないと上限に達して損になります</div>
          </div>
        </motion.div>
      )}

      <div className="flex-1 overflow-y-auto px-5 flex flex-col gap-4 mt-4 pb-nav" style={{ scrollbarWidth: "none" }}>
        {/* ガチャ選択 */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setScreen("gacha")}
          className="w-full rounded-2xl p-5 text-left relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #F5F0FF, #EDE0FF)", border: "1px solid rgba(168,85,247,0.30)", boxShadow: "0 4px 20px rgba(168,85,247,0.12)" }}
        >
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 overflow-hidden pointer-events-none">
            <Gamepad2 size={80} color="#a855f7" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(168,85,247,0.3)" }}>
                <Gamepad2 size={16} color="#a855f7" />
              </div>
              <span className="text-purple-600 text-xs font-bold tracking-widest">CHALLENGE</span>
            </div>
            <div className="text-gray-800 font-black text-xl mb-1">ガチャに挑戦する</div>
            <div className="text-gray-500 text-sm leading-relaxed">ポイントを10消費してガチャを回す。<br />結果次第でポイント増減・ブースト強化！</div>
            <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold" style={{ background: "rgba(168,85,247,0.2)", color: "#c084fc" }}>
              消費: 10 pt
            </div>
          </div>
        </motion.button>

        {/* ポイント変換 */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setScreen("convert")}
          className="w-full rounded-2xl p-5 text-left relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #EDFAF4, #D9F5E8)", border: "1px solid rgba(16,185,129,0.30)", boxShadow: "0 4px 20px rgba(16,185,129,0.10)" }}
        >
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 overflow-hidden pointer-events-none">
            <Coins size={80} color="#10B981" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(16,185,129,0.3)" }}>
                <Coins size={16} color="#10B981" />
              </div>
              <span className="text-green-700 text-xs font-bold tracking-widest">CONVERT</span>
            </div>
            <div className="text-gray-800 font-black text-xl mb-1">ポイントに変換する</div>
            <div className="text-gray-500 text-sm leading-relaxed">全ポイントを確実にTOYOTAポイントへ変換。<br />1 pt = 10 TOYOTAポイント で計算。</div>
            <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold" style={{ background: "rgba(16,185,129,0.2)", color: "#34d399" }}>
              獲得予定: {state.fuel * 10} pt
            </div>
          </div>
        </motion.button>
        {/* 注意書き */}
        <div className="text-center text-gray-400 text-xs leading-relaxed mt-2 mb-2">
          ガチャはポイントが増える可能性もありますが、<br />減ることもあります。
        </div>
      </div>

    </div>
  );
}

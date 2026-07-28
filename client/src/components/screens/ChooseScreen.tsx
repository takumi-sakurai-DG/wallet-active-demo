import { useApp } from "@/contexts/AppContext";
import { motion } from "framer-motion";
import { Gamepad2, Coins, ArrowLeft, AlertTriangle } from "lucide-react";

function PsychBadge({ theory, cite, color = "#93C5FD" }: { theory: string; cite: string; color?: string }) {
  return (
    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{ background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.3)", color }}>
      🧠 {theory} <span className="opacity-60">{cite}</span>
    </div>
  );
}

export default function ChooseScreen() {
  const { state, setScreen } = useApp();
  const nearFull = state.fuel >= state.maxFuel * 0.85;

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
            <div className="text-amber-400 font-bold text-sm">Fuelが{state.fuel}まで蓄積しています</div>
            <div className="text-white/60 text-xs mt-0.5">今すぐ使わないと上限に達して損になります</div>
            {state.showPsychBadge && (
              <div className="mt-1.5">
                <PsychBadge theory="損失回避バイアス" cite="Kahneman & Tversky, 1979" color="#FCA5A5" />
              </div>
            )}
          </div>
        </motion.div>
      )}

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
            {state.showPsychBadge && (
              <div className="mt-2">
                <PsychBadge theory="損失回避バイアス" cite="Kahneman & Tversky, 1979" color="#FCA5A5" />
              </div>
            )}
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
            {state.showPsychBadge && (
              <div className="mt-2">
                <PsychBadge theory="保有効果" cite="Thaler, 1980" />
              </div>
            )}
          </div>
        </motion.button>
      </div>

      <div className="px-5 mt-6 text-center text-white/30 text-xs leading-relaxed">
        ガチャはFuelが増える可能性もありますが、<br />減ることもあります。
      </div>
    </div>
  );
}

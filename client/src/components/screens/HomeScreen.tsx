import { useApp } from "@/contexts/AppContext";
import { motion } from "framer-motion";
import { Zap, Car, Coins, ChevronRight, X, Brain } from "lucide-react";

function PsychBadge({ theory, cite, color = "#93C5FD" }: { theory: string; cite: string; color?: string }) {
  return (
    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{ background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.3)", color }}>
      🧠 {theory} <span className="opacity-60">{cite}</span>
    </div>
  );
}

function FuelGauge({ value, max }: { value: number; max: number }) {
  const pct = (value / max) * 100;
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
      <svg width="140" height="140" className="absolute">
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={r} fill="none"
          stroke="#F59E0B" strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ filter: "drop-shadow(0 0 8px #F59E0B)" }}
        />
      </svg>
      <div className="text-center z-10">
        <div className="text-3xl font-black text-white">{value}</div>
        <div className="text-xs text-amber-400 font-bold tracking-widest">FUEL</div>
      </div>
    </div>
  );
}

export default function HomeScreen() {
  const { state, setScreen, simulateMovement, dismissFuelNotification, togglePsychBadge } = useApp();
  const isFuelFull = state.fuel >= state.maxFuel;

  return (
    <div className="w-full h-full flex flex-col" style={{ background: "linear-gradient(180deg, #0D1B3E 0%, #0a1530 100%)" }}>
      {/* 心理バッジ表示トグル */}
      <div className="absolute top-2 right-2 z-30">
        <button
          onClick={togglePsychBadge}
          className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold transition-all"
          style={{ background: state.showPsychBadge ? "rgba(96,165,250,0.2)" : "rgba(255,255,255,0.08)", border: "1px solid rgba(96,165,250,0.3)", color: state.showPsychBadge ? "#93C5FD" : "rgba(255,255,255,0.4)" }}
        >
          <Brain size={10} /> 心理設計を表示
        </button>
      </div>

      {/* Fuel満タン通知バナー（損失回避バイアス） */}
      {isFuelFull && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mx-3 mt-2 rounded-xl px-4 py-3 flex items-start gap-3 relative"
          style={{ background: "rgba(230,0,18,0.15)", border: "1px solid rgba(230,0,18,0.5)" }}
        >
          <div className="text-xl">⚠️</div>
          <div className="flex-1">
            <div className="text-white font-bold text-sm">Fuelが満タンです</div>
            <div className="text-white/70 text-xs mt-0.5">これ以上移動してもFuelは増えません。今すぐ使わないと損です。</div>
            {state.showPsychBadge && (
              <div className="mt-1.5">
                <PsychBadge theory="損失回避バイアス" cite="Kahneman & Tversky, 1979" color="#FCA5A5" />
              </div>
            )}
          </div>
          <button onClick={dismissFuelNotification} className="text-white/40 hover:text-white/70 mt-0.5">
            <X size={14} />
          </button>
        </motion.div>
      )}

      {/* ヘッダー */}
      <div className="flex items-center justify-between px-5 pt-8 pb-3">
        <div>
          <div className="text-white/50 text-xs">おかえりなさい</div>
          <div className="text-white font-bold text-base">{state.carConfig.colorLabel}の{state.carConfig.modelLabel}</div>
        </div>
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full" style={{ background: "rgba(230,0,18,0.15)", border: "1px solid rgba(230,0,18,0.3)" }}>
          <Coins size={14} color="#F59E0B" />
          <span className="text-amber-400 font-bold text-sm">{state.points.toLocaleString()}</span>
          <span className="text-white/50 text-xs">pt</span>
        </div>
      </div>

      {/* マイカーアバター */}
      <div className="flex flex-col items-center px-5 py-4">
        <div className="relative w-full rounded-2xl overflow-hidden flex flex-col items-center py-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {state.isHighBoost && (
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold"
              style={{ background: "rgba(230,0,18,0.2)", border: "1px solid #E60012", color: "#E60012" }}
            >
              <Zap size={10} fill="#E60012" /> HIGH BOOST
            </motion.div>
          )}
          <img
            src="/manus-storage/car-avatar_5742fb71.png"
            alt="マイカー"
            className="w-52 h-auto object-contain"
            style={{ filter: `drop-shadow(0 0 20px ${state.carConfig.colorHex}88) hue-rotate(${state.carConfig.color === 'red' ? '180deg' : state.carConfig.color === 'blue' ? '200deg' : state.carConfig.color === 'navy' ? '220deg' : '0deg'})` }}
          />
          <div className="mt-1 text-white/60 text-xs">TOYOTA {state.carConfig.modelLabel}</div>
          <div className="flex items-center gap-1 mt-1">
            {state.isCarMoving ? (
              <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 0.8, repeat: Infinity }}
                className="flex items-center gap-1 text-green-400 text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                移動中 {state.isHighBoost ? "（ハイブースト）" : ""}
              </motion.div>
            ) : (
              <span className="text-white/40 text-xs">停車中</span>
            )}
          </div>
          {state.showPsychBadge && (
            <div className="absolute bottom-2 left-2">
              <PsychBadge theory="拡張自己" cite="Belk, 1988" />
            </div>
          )}
          <button
            onClick={() => setScreen("car-register")}
            className="absolute bottom-2 right-2 text-white/30 text-[10px] hover:text-white/60 transition-colors"
          >
            変更
          </button>
        </div>
      </div>

      {/* Fuelゲージ */}
      <div className="flex items-center justify-between px-5 py-3">
        <FuelGauge value={state.fuel} max={state.maxFuel} />
        <div className="flex-1 pl-5">
          <div className="text-white/60 text-xs mb-0.5">移動でFuelが自動蓄積</div>
          <div className="text-white text-sm font-bold mb-1">{state.fuel} / {state.maxFuel}</div>
          {state.showPsychBadge && (
            <div className="mb-2">
              <PsychBadge theory="保有効果" cite="Thaler, 1980" />
            </div>
          )}
          <button
            onClick={simulateMovement}
            className="w-full py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
            style={{ background: state.isCarMoving ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)", border: `1px solid ${state.isCarMoving ? "#10B981" : "#F59E0B"}`, color: state.isCarMoving ? "#10B981" : "#F59E0B" }}
          >
            {state.isCarMoving ? "⏹ 移動停止" : "▶ 移動シミュレート"}
          </button>
        </div>
      </div>

      {/* Fuelを使う */}
      <div className="px-5 mt-2">
        <button
          onClick={() => setScreen("choose")}
          disabled={state.fuel < 10}
          className="w-full py-4 rounded-2xl font-black text-base flex items-center justify-between px-5 transition-all active:scale-95 disabled:opacity-40"
          style={{ background: state.fuel >= 10 ? "linear-gradient(135deg, #E60012, #ff4444)" : "rgba(255,255,255,0.05)", color: "white", boxShadow: state.fuel >= 10 ? "0 4px 20px rgba(230,0,18,0.4)" : "none" }}
        >
          <span>Fuelを使う</span>
          <ChevronRight size={20} />
        </button>
        {state.fuel < 10 && <p className="text-white/40 text-xs text-center mt-2">Fuel 10以上で使用可能</p>}
      </div>

      {/* 明細ボタン（プレースホルダー） */}
      <div className="px-5 mt-3">
        <button
          onClick={() => setScreen("history")}
          className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-between px-4 transition-all active:scale-95"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
        >
          <span className="flex items-center gap-2"><Car size={16} />移動履歴を見る</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

import { useApp } from "@/contexts/AppContext";
import { motion } from "framer-motion";
import { Zap, Car, Coins, ChevronRight, X, Brain, Trophy } from "lucide-react";
import { Settings } from "lucide-react";
import { useState, useEffect, useRef } from "react";

// ================================================================
// 紙吹雪パーティクル（Fuel満タン達成演出）
// ================================================================
const CONFETTI_COLORS = ["#F59E0B", "#10B981", "#60A5FA", "#F472B6", "#A78BFA", "#34D399", "#FBBF24"];
const CONFETTI_COUNT = 40;

function FuelFullConfetti({ show }: { show: boolean }) {
  const particles = useRef(
    Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
      id: i,
      x: 20 + Math.random() * 60,       // 横位置 20%〜80%
      delay: Math.random() * 0.6,
      duration: 1.2 + Math.random() * 0.8,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: 5 + Math.random() * 5,
      rotate: Math.random() * 360,
      shape: i % 3,                      // 0=正方形, 1=円, 2=長方形
    }))
  );

  if (!show) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50" style={{ borderRadius: "inherit" }}>
      {particles.current.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}%`, opacity: 1, rotate: p.rotate, scale: 0.8 }}
          animate={{ y: "110%", opacity: [1, 1, 0], rotate: p.rotate + 360 * (Math.random() > 0.5 ? 1 : -1) }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
          style={{
            position: "absolute",
            top: 0,
            width: p.shape === 2 ? p.size * 2 : p.size,
            height: p.shape === 1 ? p.size : p.size,
            borderRadius: p.shape === 1 ? "50%" : p.shape === 0 ? "2px" : "1px",
            background: p.color,
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

function FuelGauge({ value, max }: { value: number; max: number }) {
  // カウントアップアニメーション
  const [displayValue, setDisplayValue] = useState(value);
  const prevValue = useRef(value);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const from = prevValue.current;
    const to = value;
    if (from === to) return;
    prevValue.current = to;

    const duration = 800; // ms
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (to - from) * eased);
      setDisplayValue(current);
      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(to);
      }
    };

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(animate);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [value]);

  const pct = (displayValue / max) * 100;
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
          style={{ filter: "drop-shadow(0 0 8px #F59E0B)", transition: "stroke-dasharray 0.05s linear" }}
        />
      </svg>
      <div className="text-center z-10">
        <div className="text-3xl font-black text-white">{displayValue}</div>
        <div className="text-xs text-amber-400 font-bold tracking-widest">FUEL</div>
      </div>
    </div>
  );
}

export default function HomeScreen() {
  const { state, setScreen, setPreferredGachaMode, simulateMovement, dismissFuelNotification, togglePsychBadge } = useApp();
  const isFuelFull = state.fuel >= state.maxFuel;
  const prevFuelRef = useRef(state.fuel);
  const [fuelDelta, setFuelDelta] = useState<number | null>(null);
  const deltaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 短期目標ミッション計算
  const fuelPerMove = state.isHighBoost ? 12 : 6;
  const fuelRemaining = state.maxFuel - state.fuel;
  const movesNeeded = isFuelFull ? 0 : Math.ceil(fuelRemaining / fuelPerMove);
  const progressPct = Math.round((state.fuel / state.maxFuel) * 100);

  // Fuel増加時にデルタ表示
  useEffect(() => {
    const delta = state.fuel - prevFuelRef.current;
    if (delta > 0) {
      setFuelDelta(delta);
      if (deltaTimerRef.current) clearTimeout(deltaTimerRef.current);
      deltaTimerRef.current = setTimeout(() => setFuelDelta(null), 1800);
    }
    prevFuelRef.current = state.fuel;
  }, [state.fuel]);

  // Fuel満タン達成時の紙吹雪トリガー
  const [showConfetti, setShowConfetti] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const prevIsFuelFull = useRef(isFuelFull);
  const confettiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // 満タンでなかった→満タンになった瞬間だけ発火
    if (!prevIsFuelFull.current && isFuelFull) {
      setShowConfetti(true);
      setShowPulse(true);
      if (confettiTimerRef.current) clearTimeout(confettiTimerRef.current);
      confettiTimerRef.current = setTimeout(() => {
        setShowConfetti(false);
        setShowPulse(false);
      }, 2800);
    }
    prevIsFuelFull.current = isFuelFull;
    return () => { if (confettiTimerRef.current) clearTimeout(confettiTimerRef.current); };
  }, [isFuelFull]);

  return (
    <div className="w-full h-full flex flex-col" style={{ background: "linear-gradient(180deg, #0D1B3E 0%, #0a1530 100%)" }}>
      {/* Fuel満タン達成：紙吹雪オーバーレイ */}
      <FuelFullConfetti show={showConfetti} />

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
        <div className="relative flex-shrink-0">
          <FuelGauge value={state.fuel} max={state.maxFuel} />
          {/* 満タン達成パルスリング */}
          {showPulse && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full pointer-events-none"
                initial={{ scale: 0.8, opacity: 0.8 }}
                animate={{ scale: 1.6, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ border: "3px solid #10B981" }}
              />
              <motion.div
                className="absolute inset-0 rounded-full pointer-events-none"
                initial={{ scale: 0.8, opacity: 0.6 }}
                animate={{ scale: 1.9, opacity: 0 }}
                transition={{ duration: 1.1, delay: 0.15, ease: "easeOut" }}
                style={{ border: "2px solid #34D399" }}
              />
              <motion.div
                className="absolute inset-0 rounded-full pointer-events-none"
                initial={{ scale: 0.8, opacity: 0.4 }}
                animate={{ scale: 2.2, opacity: 0 }}
                transition={{ duration: 1.4, delay: 0.3, ease: "easeOut" }}
                style={{ border: "1px solid #6EE7B7" }}
              />
            </>
          )}
          {/* Fuel増加デルタ表示 */}
          {fuelDelta !== null && (
            <motion.div
              key={fuelDelta + Date.now()}
              initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{ opacity: 0, y: -32, scale: 1.2 }}
              transition={{ duration: 1.6, ease: "easeOut" }}
              className="absolute -top-2 left-1/2 -translate-x-1/2 pointer-events-none z-20"
            >
              <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full font-black text-sm"
                style={{ background: "rgba(245,158,11,0.2)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.4)" }}>
                <Zap size={11} fill="#F59E0B" />
                +{fuelDelta}
              </div>
            </motion.div>
          )}
        </div>
        <div className="flex-1 pl-5">
          <div className="text-white/60 text-xs mb-0.5">移動でFuelが自動蓄積</div>
          <div className="text-white text-sm font-bold mb-1">{state.fuel} / {state.maxFuel}</div>
          {state.showPsychBadge && (
            <div className="mb-2">
              <PsychBadge theory="保有効果" cite="Thaler, 1980" />
            </div>
          )}
          {/* 短期目標ミッション */}
          {!isFuelFull && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mb-2 rounded-xl px-3 py-2"
              style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}
            >
              {/* プログレスバー */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-amber-300 text-[10px] font-black tracking-wide">MISSION</span>
                <span className="text-amber-400 text-[10px] font-bold">{progressPct}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden mb-1.5" style={{ background: "rgba(255,255,255,0.08)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #F59E0B, #FBBF24)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                />
              </div>
              <div className="flex items-center gap-1">
                <Zap size={10} fill="#F59E0B" color="#F59E0B" />
                <span className="text-amber-300 text-[10px] font-bold">
                  あと{movesNeeded}回移動でFuel満タン
                </span>
              </div>
              {state.showPsychBadge && (
                <div className="mt-1.5">
                  <PsychBadge theory="目標勾配効果" cite="Hull, 1932" color="#FCD34D" />
                </div>
              )}
            </motion.div>
          )}
          {isFuelFull && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="mb-2 rounded-xl px-3 py-2"
              style={{
                background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(52,211,153,0.08))",
                border: "1px solid rgba(52,211,153,0.5)",
                boxShadow: "0 0 12px rgba(16,185,129,0.2)",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 1] }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-base"
                >🎉</motion.span>
                <span className="text-green-300 text-[11px] font-black tracking-wide">MISSION COMPLETE！</span>
              </div>
              <div className="text-green-400/80 text-[10px]">Fuelが満タンになりました。今すぐ使いましょう！</div>
              {/* パルスドット */}
              <div className="flex items-center gap-1 mt-1.5">
                {[0, 0.15, 0.3].map((delay, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "#34D399" }}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 0.9, delay, repeat: Infinity, ease: "easeInOut" }}
                  />
                ))}
               <motion.button
                 whileTap={{ scale: 0.93 }}
                 onClick={() => {
                    // Fuel残量で回せる最大モードを算出してガチャ画面にヒントを渡す
                    const fuel = state.fuel;
                    const mode: 1 | 3 | 10 = fuel >= 85 ? 10 : fuel >= 28 ? 3 : 1;
                    setPreferredGachaMode(mode);
                    setScreen("choose");
                  }}
                  className="ml-1 flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black transition-all"
                  style={{
                    background: "rgba(52,211,153,0.2)",
                    border: "1px solid rgba(52,211,153,0.5)",
                    color: "#34D399",
                  }}
                >
                  Fuelを使う → ガチャへ
                  <ChevronRight size={8} />
                </motion.button>
              </div>
            </motion.div>
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

      {/* フッター：設定ボタン */}
      {/* コレクションボタン */}
      <div className="px-5 mt-2">
        <button
          onClick={() => setScreen("collection")}
          className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-between px-4 transition-all active:scale-95"
          style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)", color: "rgba(192,132,252,0.8)" }}
        >
          <span className="flex items-center gap-2"><Trophy size={16} />ガチャコレクション</span>
          <span className="flex items-center gap-1">
            {state.gachaCollection.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-black"
                style={{ background: "rgba(168,85,247,0.3)", color: "#c084fc" }}>
                {state.gachaCollection.length}件
              </span>
            )}
            <ChevronRight size={16} />
          </span>
        </button>
      </div>
      <div className="px-5 mt-3 flex justify-center safe-bottom">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setScreen("settings")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}
        >
          <Settings size={13} />
          設定・デモリセット
        </motion.button>
      </div>
    </div>
  );
}

import { useApp } from "@/contexts/AppContext";
import { motion } from "framer-motion";
import { Zap, Coins, X, ChevronRight } from "lucide-react";
import { Settings } from "lucide-react";
import { useState, useEffect, useRef } from "react";
// ================================================================
// CarRegisterScreenと同じカラーフィルターをHomeScreenでも使用
// ================================================================
const HOME_COLOR_FILTER: Record<string, { hue: string; sat: string; bright: string; sepia?: string }> = {
  white:  { hue: "0deg",   sat: "5%",   bright: "100%" },
  silver: { hue: "0deg",   sat: "8%",   bright: "82%" },
  gray:   { hue: "0deg",   sat: "5%",   bright: "55%" },
  black:  { hue: "0deg",   sat: "0%",   bright: "12%" },
  red:    { hue: "355deg", sat: "400%", bright: "70%" },
  blue:   { hue: "195deg", sat: "300%", bright: "65%" },
  navy:   { hue: "210deg", sat: "350%", bright: "28%" },
  green:  { hue: "120deg", sat: "350%", bright: "45%" },
  bronze: { hue: "30deg",  sat: "200%", bright: "60%", sepia: "60%" },
  orange: { hue: "15deg",  sat: "400%", bright: "72%" },
};
function buildCarFilter(colorId: string, glowHex: string, glowSize = 16): string {
  const f = HOME_COLOR_FILTER[colorId] ?? HOME_COLOR_FILTER.white;
  const sepia = f.sepia ? ` sepia(${f.sepia})` : "";
  return [
    `drop-shadow(0 0 ${glowSize}px ${glowHex}aa)`,
    `hue-rotate(${f.hue})`,
    `saturate(${f.sat})`,
    `brightness(${f.bright})`,
    sepia,
  ].join(" ").trim();
}


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


function FuelGauge({ value, max, initialValue = value, onDisplayChange }: {
  value: number;
  max: number;
  initialValue?: number;
  onDisplayChange?: (v: number) => void;
}) {
  // カウントアップアニメーション
  const [displayValue, setDisplayValue] = useState(initialValue);
  const prevValue = useRef(initialValue);
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
      onDisplayChange?.(current);
      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(to);
        onDisplayChange?.(to);
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
        <div className="text-xs text-amber-400 font-bold tracking-widest">PT</div>
      </div>
    </div>
  );
}

export default function HomeScreen() {
  const { state, setScreen, setPreferredGachaMode, simulateMovement, dismissFuelNotification } = useApp();
  const isFuelFull = state.fuel >= state.maxFuel;
  const prevFuelRef = useRef(state.fuel);
  const [fuelDelta, setFuelDelta] = useState<number | null>(null);
  const deltaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ホーム遷移時に0からカウントアップするための表示値
  const [fuelDisplayValue, setFuelDisplayValue] = useState(0);


  // 短期目標ミッション計算
  const fuelPerMove = state.isHighBoost ? 12 : 6;
  const fuelRemaining = state.maxFuel - state.fuel;
  const movesNeeded = isFuelFull ? 0 : Math.ceil(fuelRemaining / fuelPerMove);
  const progressPct = Math.round((state.fuel / state.maxFuel) * 100);

  // ── 自動付与カウントダウン（AppContextのタイマーと同期: 30秒）──
  const AUTO_INTERVAL = 30;
  const [countdown, setCountdown] = useState(AUTO_INTERVAL);
  useEffect(() => {
    const tick = setInterval(() => {
      setCountdown((c) => (c <= 1 ? AUTO_INTERVAL : c - 1));
    }, 1000);
    return () => clearInterval(tick);
  }, []);

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
    <div className="w-full h-full flex flex-col overflow-hidden relative" style={{ background: "linear-gradient(180deg, #0D1B3E 0%, #0a1530 100%)" }}>
      {/* Fuel満タン達成：紙吹雪オーバーレイ */}
      <FuelFullConfetti show={showConfetti} />
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
            <div className="text-white font-bold text-sm">ポイントが満タンです</div>
            <div className="text-white/70 text-xs mt-0.5">ポイントが満タンです！ガチャを回して消費しましょう。</div>
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => {
                const fuel = state.fuel;
                const mode: 1 | 3 | 10 = fuel >= 85 ? 10 : fuel >= 28 ? 3 : 1;
                setPreferredGachaMode(mode);
                setScreen("choose");
              }}
              className="mt-2 flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black"
              style={{ background: "rgba(230,0,18,0.25)", border: "1px solid rgba(230,0,18,0.6)", color: "#FCA5A5" }}
            >
              今すぐガチャへ <ChevronRight size={10} />
            </motion.button>
          </div>
          <button onClick={dismissFuelNotification} className="text-white/40 hover:text-white/70 mt-0.5">
            <X size={14} />
          </button>
        </motion.div>
      )}

      {/* ヘッダー（固定） */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 pt-8 pb-3">
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

      {/* スクロール領域：マイカーアバター〜移動シミュレート */}
      <div className="flex-1 overflow-y-auto pb-nav">
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
            src={state.carConfig.imgUrl || "/manus-storage/car_crown_d3b82223.png"}
            alt="マイカー"
            className="w-52 h-auto object-contain"
            style={{ filter: buildCarFilter(state.carConfig.color, state.carConfig.colorHex, 20) }}
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
          {/* マイカーサムネイル（ゲージ上部に小さく表示） */}
          <div className="flex justify-center mb-1.5 relative">
            <motion.img
              key={state.carConfig.imgUrl + state.carConfig.color}
              src={state.carConfig.imgUrl || "/manus-storage/car_crown_d3b82223.png"}
              alt="マイカー"
              className="h-10 w-auto object-contain"
              style={{ filter: buildCarFilter(state.carConfig.color, state.carConfig.colorHex, 8) }}
              initial={{ opacity: 0, x: -10 }}
              animate={
                fuelDelta !== null
                  ? { opacity: 1, x: 0, y: [0, -8, 2, -4, 0], scale: [1, 1.18, 0.95, 1.08, 1] }
                  : state.isCarMoving
                  ? { opacity: 1, x: [0, 2, -2, 2, -2, 0], y: [0, -2, 0, -2, 0] }
                  : { opacity: 1, x: 0 }
              }
              transition={
                fuelDelta !== null
                  ? { duration: 0.55, ease: [0.23, 1, 0.32, 1] }
                  : state.isCarMoving
                  ? { duration: 0.5, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }
                  : { duration: 0.4, ease: [0.23, 1, 0.32, 1] }
              }
            />
          </div>
          <FuelGauge
            value={state.fuel}
            max={state.maxFuel}
            initialValue={0}
            onDisplayChange={setFuelDisplayValue}
          />
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
          {/* 自動付与・移動ボーナス説明 */}
          <div className="flex flex-col gap-1 mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(96,165,250,0.15)", color: "#93C5FD", border: "1px solid rgba(96,165,250,0.25)" }}>自動付与</span>
              <span className="text-white/70 text-[11px]">+3 pt</span>
              <span className="text-blue-300/60 text-[10px] font-bold ml-0.5">次まで {countdown}秒</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(245,158,11,0.15)", color: "#FCD34D", border: "1px solid rgba(245,158,11,0.25)" }}>移動ボーナス</span>
              <span className="text-white/70 text-[11px]">+6〜12 pt / 回</span>
            </div>
          </div>
          <div className="text-white text-sm font-bold mb-1">{fuelDisplayValue} / {state.maxFuel}</div>
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
                  あと{movesNeeded}回移動でポイント満タン
                </span>
              </div>
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
              <div className="text-green-400/80 text-[10px]">ポイントが満タンになりました。今すぐ使いましょう！</div>
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
                  ポイントを使う → ガチャへ
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
          {state.isCarMoving ? "⏹ 移動を終了する" : "🚗 クルマで移動してボーナス獲得"}
          </button>
        </div>
      </div>
      </div>{/* /スクロール領域 */}

      {/* 設定ボタン（ボトムナビの上） */}
      <div className="flex-shrink-0 flex justify-center py-1.5" style={{ paddingBottom: "calc(64px + env(safe-area-inset-bottom) + 6px)" }}>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setScreen("settings")}
          className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.35)" }}
        >
          <Settings size={12} />
          設定・デモリセット
        </motion.button>
      </div>

    </div>
  );
}

import { useApp, GachaResult } from "@/contexts/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { useCallback } from "react";
import { ArrowLeft, Info, ChevronDown, Zap, Star } from "lucide-react";

// ================================================================
// Fuelプログレスバー（ヘッダー用）
// ================================================================
function FuelProgressBar({ fuel, maxFuel, costPerSpin }: { fuel: number; maxFuel: number; costPerSpin: number }) {
  const pct = Math.min(100, Math.round((fuel / maxFuel) * 100));
  const remainingSpins = Math.floor(fuel / costPerSpin);
  const barColor = pct >= 60 ? "#a855f7" : pct >= 30 ? "#F59E0B" : "#F87171";
  const glowColor = pct >= 60 ? "rgba(168,85,247,0.5)" : pct >= 30 ? "rgba(245,158,11,0.5)" : "rgba(248,113,113,0.5)";
  return (
    <div className="flex-1 ml-2">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <Zap size={10} fill="#F59E0B" color="#F59E0B" />
          <span className="text-amber-400 font-black text-sm">{fuel}</span>
          <span className="text-white/30 text-[10px]">/ {maxFuel}</span>
        </div>
        <div className="flex items-center gap-1">
          {remainingSpins > 0 ? (
            <>
              <span className="text-white/40 text-[10px]">あと</span>
              <span className="font-black text-xs" style={{ color: barColor }}>{remainingSpins}</span>
              <span className="text-white/40 text-[10px]">回回せる</span>
            </>
          ) : (
            <span className="text-red-400/70 text-[10px] font-bold">ポイント不足</span>
          )}
        </div>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)`, boxShadow: `0 0 8px ${glowColor}` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        />
      </div>
    </div>
  );
}

// ================================================================
// ハプティクスフィードバック（navigator.vibrate対応端末のみ）
// ================================================================
function vibrate(pattern: number | number[]) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  } catch (_) {
    // 非対応端末は無視
  }
}

const ROULETTE_ITEMS = ["🚗", "⛽", "🏆", "🔥", "🚘", "⭐", "🛣️", "💨", "🎯"];

// ================================================================
// 連ガチャオプション定義
// ================================================================
type GachaMode = 1 | 3 | 10;

interface GachaModeOption {
  count: GachaMode;
  label: string;
  fuelCost: number;
  badge?: string;
  badgeColor?: string;
  discount?: string;
}

const GACHA_MODES: GachaModeOption[] = [
  { count: 1,  label: "1回",  fuelCost: 10 },
  { count: 3,  label: "3連",  fuelCost: 28, badge: "お得",   badgeColor: "#60A5FA", discount: "1回あたり 9.3 Fuel" },
  { count: 10, label: "10連", fuelCost: 85, badge: "最もお得", badgeColor: "#F59E0B", discount: "1回あたり 8.5 Fuel" },
];

// ================================================================
// 確率テーブル
// ================================================================
const PROB_TABLE = [
  { icon: "🎉", label: "JACKPOT",   reward: "+50 pt / ブースト×2.0", prob: 5,  color: "#F59E0B", tier: "LEGENDARY" },
  { icon: "⚡", label: "BIG WIN",   reward: "+30 pt / ブースト×1.5", prob: 10, color: "#a855f7", tier: "EPIC"      },
  { icon: "✨", label: "WIN",       reward: "+15 pt",                 prob: 25, color: "#60A5FA", tier: "RARE"      },
  { icon: "▲", label: "SMALL WIN", reward: "+5 pt",                  prob: 30, color: "#34D399", tier: "COMMON"    },
  { icon: "▼", label: "MISS",      reward: "−10 pt",                 prob: 20, color: "#F87171", tier: "MISS"      },
  { icon: "🚀", label: "BOOST UP", reward: "次回ブースト×2.0",          prob: 10, color: "#E60012", tier: "SPECIAL"   },
];

function ProbBar({ prob, color }: { prob: number; color: string }) {
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${prob}%` }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        />
      </div>
      <span className="text-white/60 text-xs font-bold w-8 text-right">{prob}%</span>
    </div>
  );
}

function ProbabilityTable({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <div className="w-full px-5 mt-3">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all"
        style={{
          background: open ? "rgba(168,85,247,0.12)" : "rgba(255,255,255,0.05)",
          border: `1px solid ${open ? "rgba(168,85,247,0.4)" : "rgba(255,255,255,0.1)"}`,
        }}
      >
        <div className="flex items-center gap-2">
          <Info size={13} color={open ? "#c084fc" : "rgba(255,255,255,0.4)"} />
          <span className="text-xs font-bold" style={{ color: open ? "#c084fc" : "rgba(255,255,255,0.5)" }}>
            排出確率を確認する
          </span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown size={13} color={open ? "#c084fc" : "rgba(255,255,255,0.3)"} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="prob-table"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-xl overflow-hidden" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(168,85,247,0.2)" }}>
              <div className="grid grid-cols-[28px_1fr_1fr] gap-2 px-3 py-2 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <span className="text-white/30 text-[10px] font-bold">絵柄</span>
                <span className="text-white/30 text-[10px] font-bold">報酬</span>
                <span className="text-white/30 text-[10px] font-bold">確率</span>
              </div>
              {PROB_TABLE.map((row, i) => (
                <motion.div
                  key={row.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                  className="grid grid-cols-[28px_1fr_1fr] gap-2 items-center px-3 py-2"
                  style={{
                    borderBottom: i < PROB_TABLE.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    background: row.tier === "LEGENDARY" ? "rgba(245,158,11,0.05)" : "transparent",
                  }}
                >
                  <div className="text-base leading-none">{row.icon}</div>
                  <div>
                    <div className="text-xs font-black leading-none" style={{ color: row.color }}>{row.label}</div>
                    <div className="text-white/40 text-[10px] mt-0.5 leading-tight">{row.reward}</div>
                  </div>
                  <ProbBar prob={row.prob} color={row.color} />
                </motion.div>
              ))}
              <div className="px-3 py-2 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <p className="text-white/25 text-[9px] leading-relaxed">
                  ※ 確率は各ガチャ独立試行です。過去の結果は次回に影響しません。<br />
                  ※ このデモは提案用プロトタイプです。実際の確率設計とは異なります。
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ================================================================
// ガチャモード選択UI
// ================================================================
function GachaModeSelector({
  selected,
  fuel,
  onSelect,
}: {
  selected: GachaMode;
  fuel: number;
  onSelect: (m: GachaMode) => void;
}) {
  return (
    <div className="w-full px-5 mt-5">
      <div className="text-white/40 text-xs font-bold mb-2 tracking-wide">回数を選ぶ</div>
      <div className="grid grid-cols-3 gap-2">
        {GACHA_MODES.map((opt) => {
          const isSelected = selected === opt.count;
          const canAfford = fuel >= opt.fuelCost;
          return (
            <motion.button
              key={opt.count}
              whileTap={{ scale: 0.95 }}
              onClick={() => canAfford && onSelect(opt.count)}
              disabled={!canAfford}
              className="relative flex flex-col items-center py-3 px-2 rounded-xl transition-all"
              style={{
                background: isSelected ? "rgba(168,85,247,0.2)" : canAfford ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                border: isSelected ? "1.5px solid rgba(168,85,247,0.7)" : canAfford ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0.04)",
                opacity: canAfford ? 1 : 0.4,
              }}
            >
              {opt.badge && canAfford && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full text-[9px] font-black whitespace-nowrap"
                  style={{ background: opt.badgeColor, color: "#0D1B3E" }}>
                  {opt.badge}
                </div>
              )}
              <span className="font-black text-base" style={{ color: isSelected ? "#c084fc" : "rgba(255,255,255,0.8)" }}>
                {opt.label}
              </span>
              <div className="flex items-center gap-0.5 mt-1">
                <Zap size={10} fill="#F59E0B" color="#F59E0B" />
                <span className="text-amber-400 font-bold text-xs">{opt.fuelCost}</span>
                <span className="text-white/30 text-[10px]"> pt</span>
              </div>
              {opt.discount && (
                <div className="mt-1 text-[9px] font-bold" style={{ color: opt.badgeColor ?? "rgba(255,255,255,0.4)" }}>
                  {opt.discount}
                </div>
              )}
              {isSelected && (
                <motion.div
                  layoutId="gacha-mode-indicator"
                  className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                  style={{ background: "#c084fc" }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence>
        {selected === 10 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-2 px-3 py-2 rounded-lg flex items-center gap-2"
            style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}
          >
            <Star size={11} fill="#F59E0B" color="#F59E0B" />
            <div className="flex flex-col gap-0.5">
              <span className="text-amber-300 text-[10px] font-black">
                🏆 レア確定！WIN以上が最低1回保証
              </span>
              <span className="text-amber-200/50 text-[9px]">
                10連なら1回あたり8.5 pt。最もお得にレアを狙えます
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ================================================================
// メイン
// ================================================================
export default function GachaScreen() {
  const { state, setScreen, spinGacha, applyGachaResult, applyMultiGachaResults } = useApp();
  // ハプティクスフラグを参照して振動を制御
  const vibrateIfEnabled = (pattern: number | number[]) => {
    if (state.hapticsEnabled) vibrate(pattern);
  };
  const [spinning, setSpinning] = useState(false);
  const [offset, setOffset] = useState(0);
  const [done, setDone] = useState(false);
  const [probOpen, setProbOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<GachaMode>(1);
  const rAFRef = useRef<number | null>(null);
  const [rouletteX, setRouletteX] = useState(0);
  const [rouletteScale, setRouletteScale] = useState(1);
  const [speedLineOpacity, setSpeedLineOpacity] = useState(0);
  const [cruisePhase, setCruisePhase] = useState(false);
  const skipRef = useRef(false);
  const [winnerIdx, setWinnerIdx] = useState<number | null>(null);
  // selectedModeをrefで保持（rAFクロージャ内から最新値を参照するため）
  const selectedModeRef = useRef(selectedMode);
  useEffect(() => { selectedModeRef.current = selectedMode; }, [selectedMode]);

  // スピン結果を確定して画面遷移する共通処理
  const finishSpin = useCallback(() => {
    const mode = selectedModeRef.current;
    const opt = currentOptionRef.current;
    if (mode === 1) {
      let result: GachaResult = spinGacha();
      if (result.type === "jackpot") {
        vibrateIfEnabled([80, 40, 80, 40, 120]);
      } else if (result.type === "fuel-up" && result.fuelChange >= 30) {
        vibrateIfEnabled([60, 30, 60]);
      } else if (result.type === "fuel-up") {
        vibrateIfEnabled([40]);
      } else if (result.type === "fuel-down") {
        vibrateIfEnabled([15, 10, 15, 10, 15]);
      } else if (result.type === "boost") {
        vibrateIfEnabled([50, 20, 80]);
      }
      applyGachaResult({ ...result, fuelChange: result.fuelChange - opt.fuelCost });
      setTimeout(() => setScreen("gacha-result"), 700);
    } else {
      const results: GachaResult[] = Array.from({ length: mode }, (_, i) => {
        let r = spinGacha();
        if (mode === 10 && i === mode - 1) {
          const wins = ["jackpot", "fuel-up", "boost"] as const;
          if (!wins.includes(r.type as any)) {
            r = { type: "fuel-up", label: "✨ WIN", fuelChange: 15, description: "Fuelが15増加！" };
          }
        }
        return r;
      });
      const hasJackpot = results.some(r => r.type === "jackpot");
      if (hasJackpot) {
        vibrateIfEnabled([80, 40, 80, 40, 120, 40, 80]);
      } else {
        vibrateIfEnabled([40, 20, 40]);
      }
      applyMultiGachaResults(results, opt.fuelCost);
      setTimeout(() => setScreen("multi-gacha-result"), 700);
    }
  }, [spinGacha, applyGachaResult, applyMultiGachaResults, setScreen]);

  // MISSIONボタンからの遷移時：preferredGachaModeを初期選択に反映
  useEffect(() => {
    if (state.preferredGachaMode) {
      setSelectedMode(state.preferredGachaMode);
    }
  }, []);

  const currentOption = GACHA_MODES.find(o => o.count === selectedMode)!;
  const canSpin = state.fuel >= currentOption.fuelCost && !spinning && !done;
  // currentOptionをrefで保持（rAFクロージャ内から最新値を参照するため）
  const currentOptionRef = useRef(currentOption);
  useEffect(() => { currentOptionRef.current = currentOption; }, [currentOption]);

  // Fuel残量・選択モードに応じた動的SPINボタンコピー
  const getSpinLabel = () => {
    if (spinning) return "回転中...";
    if (done) return "結果へ...";
    const fuel = state.fuel;
    const cost = currentOption.fuelCost;
    if (!canSpin) return `ポイント不足 (${cost} pt 必要)`;
    if (selectedMode === 10) return `全力で回す！ (${cost} pt)`;
    if (selectedMode === 3) {
      if (fuel >= 85) return `3連で試す (${cost} pt)`;
      return `3連ガチャ！ (${cost} pt)`;
    }
    // 1回
    if (fuel >= 85) return `まず1回試す (${cost} pt)`;
    if (fuel >= 28) return `1回だけ試す (${cost} pt)`;
    if (fuel >= 10) return `ラスト1回！ (${cost} pt)`;
    return `SPIN! (${cost} pt)`;
  };

  const handleSpin = () => {
    if (!canSpin) return;
    setSpinning(true);
    // SPIN開始：短い振動
    vibrateIfEnabled([30, 20, 30]);

    // ---- rAFベース3フェーズスピン ----
    const SPIN_DURATION = 2600;
    const ITEM_WIDTH = 74; // アイテム幅70px + 左右margin各2px = 74px
    const totalItems = ROULETTE_ITEMS.length * 5;
    const maxTravel = totalItems * ITEM_WIDTH;
    // コンテナ幅290px、中心145px。アイテム中央を枠中心に合わせるオフセット
    // アイテム中央 = アイテム左端 + 35px。枠中心 = 145px。
    // スナップ: 停止X → 最近傍のアイテム中央が145pxに来る位置に丸める
    const CONTAINER_CENTER = 145;
    const startTime = performance.now();

    const hapticMidTimer = setTimeout(() => {
      vibrateIfEnabled([10, 5, 10]);
    }, SPIN_DURATION * 0.25);

    const animate = (now: number) => {
      // スキップフラグが立っていたらアニメーション終了処理へ
      if (skipRef.current) {
        skipRef.current = false;
        clearTimeout(hapticMidTimer);
        if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
        setSpeedLineOpacity(0);
        setCruisePhase(false);
        // スキップ時も現在位置から最近傍アイテム中央にスナップ
        setRouletteX(prev => {
          const scrolled = -prev;
          const nearestIdx = Math.round((scrolled - CONTAINER_CENTER + 35) / ITEM_WIDTH);
          const snappedX = -(nearestIdx * ITEM_WIDTH - CONTAINER_CENTER + 35);
          setWinnerIdx(nearestIdx);
          return snappedX;
        });
        setSpinning(false);
        setDone(true);
        setRouletteScale(1.1);
        setTimeout(() => setRouletteScale(1), 300);
        finishSpin();
        return;
      }
      const elapsed = now - startTime;
      const t = Math.min(elapsed / SPIN_DURATION, 1);
      const easedT = spinEasing(t);
      const x = -(easedT * maxTravel * 0.85);
      setRouletteX(x);

      // 最高速フェーズ(0.25〜0.55)で集中線を表示
      if (t >= 0.25 && t < 0.55) {
        const cruiseT = (t - 0.25) / 0.30;
        // 入り: 0→0.3で0→1, 出: 0.7→1で1→0
        const fadeIn = Math.min(cruiseT / 0.3, 1);
        const fadeOut = cruiseT > 0.7 ? 1 - (cruiseT - 0.7) / 0.3 : 1;
        setSpeedLineOpacity(Math.min(fadeIn, fadeOut) * 0.55);
        setCruisePhase(true);
      } else {
        setSpeedLineOpacity(0);
        setCruisePhase(false);
      }

      if (t < 1) {
        rAFRef.current = requestAnimationFrame(animate);
      } else {
        clearTimeout(hapticMidTimer);
        // アイテム中央が枠中心に来るようスナップ
        const rawX = -(easedT * maxTravel * 0.85);
        // rawXにおけるアイテム左端位置: -rawX がスクロール量
        // 枠中心に来るアイテムインデックス: (-rawX + CONTAINER_CENTER - 35) / ITEM_WIDTH
        const scrolled = -rawX;
        const nearestIdx = Math.round((scrolled - CONTAINER_CENTER + 35) / ITEM_WIDTH);
        const snappedX = -(nearestIdx * ITEM_WIDTH - CONTAINER_CENTER + 35);
        setRouletteX(snappedX);
        setWinnerIdx(nearestIdx);
        setSpinning(false);
        setDone(true);
        // 停止時：ズームイン演出（scale 1→1.1→1）
        setRouletteScale(1.1);
        setTimeout(() => setRouletteScale(1), 300);
        finishSpin();
      }
    };
    rAFRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="w-full h-full flex flex-col items-center overflow-y-auto" style={{ background: "linear-gradient(180deg, #0D1B3E 0%, #1a0a2e 100%)" }}>
      {/* ヘッダー */}
      <div className="flex flex-col w-full px-5 pb-3 flex-shrink-0 safe-top">
        <div className="flex items-center mb-3">
        <button onClick={() => setScreen("choose")} className="p-2 rounded-full mr-3" style={{ background: "rgba(255,255,255,0.08)" }}>
          <ArrowLeft size={18} color="white" />
        </button>
        <div>
          <div className="text-white font-black text-xl">ガチャに挑戦！</div>
        </div>
        </div>
        {/* Fuelプログレスバー */}
        <div className="flex items-center px-1">
          <FuelProgressBar fuel={state.fuel} maxFuel={state.maxFuel} costPerSpin={currentOption.fuelCost} />
        </div>
      </div>

      {/* ルーレット */}
      {/* 集中線オーバーレイ（ルーレット外側・画面全幅） */}
      <AnimatePresence>
        {speedLineOpacity > 0 && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: speedLineOpacity }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.08 }}
            style={{
              background: `radial-gradient(ellipse at center, transparent 18%, rgba(168,85,247,0.08) 40%, transparent 70%),
                repeating-conic-gradient(
                  rgba(168,85,247,0.18) 0deg 1.2deg,
                  transparent 1.2deg 6deg
                )`,
            }}
          />
        )}
      </AnimatePresence>

      <motion.div
      className="relative overflow-hidden rounded-2xl flex-shrink-0"
      animate={{ scale: rouletteScale }}
      transition={{ type: "spring", stiffness: 500, damping: 18 }}
      style={{ width: 290, height: 90, background: "rgba(0,0,0,0.4)", border: "2px solid rgba(168,85,247,0.5)" }}
      >
      {/* スキップ用オーバーレイ（スピン中のみ表示） */}
      {spinning && (
        <div
          className="absolute inset-0 z-30 cursor-pointer flex items-center justify-center"
          onClick={() => { skipRef.current = true; }}
          style={{ background: "transparent" }}
        />
      )}
        <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: "linear-gradient(90deg, rgba(13,27,62,0.9) 0%, transparent 30%, transparent 70%, rgba(13,27,62,0.9) 100%)" }} />
        {/* 中央ハイライト枠：スピン中は紫→停止時にゴールドに変化 */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl z-20 pointer-events-none"
          animate={{
            borderColor: done ? "#F59E0B" : spinning ? "#c084fc" : "#a855f7",
            boxShadow: done
              ? "0 0 28px rgba(245,158,11,0.7), 0 0 60px rgba(245,158,11,0.3)"
              : spinning
              ? "0 0 20px rgba(192,132,252,0.6)"
              : "0 0 20px rgba(168,85,247,0.5)",
          }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          style={{ width: 74, height: 74, border: "2px solid #a855f7" }}
        />
        {/* rAFで直接transform制御（Framer motionを使わない） */}
        <div
          className="flex items-center"
          style={{ height: 90, transform: `translateX(${rouletteX}px)`, willChange: "transform" }}
        >
          {[...ROULETTE_ITEMS, ...ROULETTE_ITEMS, ...ROULETTE_ITEMS, ...ROULETTE_ITEMS, ...ROULETTE_ITEMS].map((item, i) => (
            <div
              key={i}
              className="flex-shrink-0 flex items-center justify-center text-3xl"
              style={{
                width: 70,
                height: 70,
                margin: "0 2px",
                transition: done && winnerIdx === i ? "transform 0.35s cubic-bezier(0.23,1,0.32,1), filter 0.35s ease" : "none",
                transform: done && winnerIdx === i ? "scale(1.35)" : "scale(1)",
                filter: done && winnerIdx === i
                  ? "drop-shadow(0 0 10px rgba(245,158,11,0.9)) brightness(1.3)"
                  : done
                  ? "brightness(0.55)"
                  : "none",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </motion.div>

      {/* 連ガチャ選択 */}
      {!spinning && !done && (
        <GachaModeSelector selected={selectedMode} fuel={state.fuel} onSelect={setSelectedMode} />
      )}

      {/* スピンボタン */}
      <motion.button
        whileTap={{
          scale: 0.88,
          y: 4,
          boxShadow: "0 1px 6px rgba(168,85,247,0.3)",
        }}
        transition={{ type: "spring", stiffness: 600, damping: 20 }}
        onClick={handleSpin}
        disabled={!canSpin}
        className="mt-5 px-10 py-4 rounded-2xl font-black text-lg flex-shrink-0 select-none"
        style={{
          background: canSpin ? "linear-gradient(135deg, #a855f7, #7c3aed)" : "rgba(255,255,255,0.1)",
          color: "white",
          boxShadow: canSpin ? "0 6px 0 #5b21b6, 0 4px 20px rgba(168,85,247,0.4)" : "none",
          transform: "translateY(0)",
        }}
      >
        {getSpinLabel()}
      </motion.button>

      {!canSpin && !spinning && !done && state.fuel < currentOption.fuelCost && (
        <div className="mt-2 text-white/40 text-xs">
          Fuel不足 (必要: {currentOption.fuelCost} / 現在: {state.fuel})
        </div>
      )}

      {spinning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="mt-4 text-purple-300 text-sm font-bold tracking-widest"
        >
          {selectedMode > 1 ? `${selectedMode}連ガチャ 回転中...` : "ドキドキ..."}
        </motion.div>
      )}

      {/* 折りたたみ確率テーブル */}
      {!spinning && !done && (
        <ProbabilityTable open={probOpen} onToggle={() => setProbOpen(v => !v)} />
      )}

      <div className="flex-shrink-0 pb-nav" />
    </div>
  );
}

// ================================================================
// ルーレット用カスタムイージング関数
// ================================================================
// 加速フェーズ (0→1): ease-in cubic
function easeInCubic(t: number) { return t * t * t; }
// 減速フェーズ (0→1): ease-out quintic（急激に減速して止まる）
function easeOutQuintic(t: number) { return 1 - Math.pow(1 - t, 5); }

// 3フェーズ合成: accel(0〜0.25) → cruise(0.25〜0.55) → decel(0.55〜1.0)
function spinEasing(t: number): number {
  if (t < 0.25) {
    return easeInCubic(t / 0.25) * 0.35;
  } else if (t < 0.55) {
    const p = (t - 0.25) / 0.30;
    return 0.35 + p * 0.35;
  } else {
    const p = (t - 0.55) / 0.45;
    return 0.70 + easeOutQuintic(p) * 0.30;
  }
}

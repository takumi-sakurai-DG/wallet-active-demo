import { useApp } from "@/contexts/AppContext";
import { motion } from "framer-motion";
import { Zap, Coins, X, ChevronRight, Gift, Ticket, Star, Trophy, Flame, AlertTriangle, Timer, MapPin, Bell, Shield, ShieldOff } from "lucide-react";
import { Settings } from "lucide-react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { toast } from "sonner";

// ── カウントアップアニメーションフック ──
function useCountUp(target: number, duration = 800): number {
  const [current, setCurrent] = useState(target);
  const prevTarget = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = prevTarget.current;
    if (from === target) return;
    prevTarget.current = target;
    const startTime = performance.now();
    const diff = target - from;
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(from + diff * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setCurrent(target);
      }
    };
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return current;
}

// ================================================================
// PWAインストールバナー
// beforeinstallpromptイベントをキャッチして表示。
// iOS Safari は手動案内テキストを表示。
// ================================================================
function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(() =>
    typeof localStorage !== "undefined" && localStorage.getItem("pwa-banner-dismissed") === "1"
  );
  useEffect(() => {
    const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const standalone =
      (window.navigator as any).standalone === true ||
      window.matchMedia("(display-mode: standalone)").matches;
    setIsIOS(ios);
    setIsStandalone(standalone);
    const handler = (e: Event) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);
  const prompt = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    localStorage.setItem("pwa-banner-dismissed", "1");
    setDismissed(true);
  }, [deferredPrompt]);
  const dismiss = useCallback(() => {
    localStorage.setItem("pwa-banner-dismissed", "1");
    setDismissed(true);
  }, []);
  const show = !dismissed && !isStandalone && (!!deferredPrompt || isIOS);
  return { show, isIOS, prompt, dismiss };
}

function PWAInstallBanner() {
  const { show, isIOS, prompt, dismiss } = usePWAInstall();
  if (!show) return null;
  return (
    <motion.div
      initial={{ y: -48, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mx-3 mt-2 rounded-xl px-4 py-3 flex items-center gap-3 flex-shrink-0"
      style={{
        background: "linear-gradient(135deg, #EDE8F5, #F5F0FF)",
        border: "1px solid rgba(168,85,247,0.25)",
        boxShadow: "0 2px 12px rgba(168,85,247,0.10)",
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(233,30,140,0.10)", border: "1px solid rgba(233,30,140,0.20)" }}
      >
        <Zap size={16} color="#E91E8C" fill="#E91E8C" />
      </div>
      <div className="flex-1 min-w-0">
        {isIOS ? (
          <>
            <div className="text-gray-800 font-bold text-xs leading-snug">ホーム画面に追加できます</div>
            <div className="text-gray-500 text-[10px] mt-0.5">Safari の <span className="font-bold">共有</span> → <span className="font-bold">ホーム画面に追加</span></div>
          </>
        ) : (
          <>
            <div className="text-gray-800 font-bold text-xs leading-snug">アプリとして追加できます</div>
            <div className="text-gray-500 text-[10px] mt-0.5">ホーム画面に追加してすぐ起動</div>
          </>
        )}
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {!isIOS && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={prompt}
            className="px-3 py-1.5 rounded-lg text-xs font-bold"
            style={{ background: "rgba(233,30,140,0.15)", color: "#E91E8C", border: "1px solid rgba(233,30,140,0.25)" }}
          >
            追加
          </motion.button>
        )}
        <button onClick={dismiss} className="p-1 rounded-full" style={{ color: "rgba(0,0,0,0.25)" }} aria-label="閉じる">
          <X size={14} />
        </button>
      </div>
    </motion.div>
  );
}
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

// ================================================================
// キャンペーンバナーデータ（横スクロール）
// ================================================================
const CAMPAIGNS = [
  {
    id: "c1",
    label: "期間限定",
    title: "移動でポイント2倍！",
    sub: "8月31日まで",
    icon: <Zap size={20} className="text-white" />,
    bg: "linear-gradient(135deg, #E91E8C 0%, #C0166F 100%)",
    badge: "NEW",
  },
  {
    id: "c2",
    label: "キャンペーン",
    title: "マイカー登録で\n+50 pt プレゼント",
    sub: "初回登録限定",
    icon: <Gift size={20} className="text-white" />,
    bg: "linear-gradient(135deg, #FF9800 0%, #E65100 100%)",
    badge: null,
  },
  {
    id: "c3",
    label: "お知らせ",
    title: "ガチャに新アイテム\n追加されました",
    sub: "コレクション画面で確認",
    icon: <Star size={20} className="text-white" />,
    bg: "linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)",
    badge: null,
  },
  {
    id: "c4",
    label: "特典",
    title: "友達紹介で\n+100 pt ボーナス",
    sub: "シェア画面から招待",
    icon: <Ticket size={20} className="text-white" />,
    bg: "linear-gradient(135deg, #00BCD4 0%, #006064 100%)",
    badge: null,
  },
];

function CampaignBanners() {
  return (
    <div className="mt-3 mb-1">
      <div className="flex items-center justify-between px-5 mb-2">
        <span className="text-xs font-bold text-gray-500 tracking-wide">キャンペーン・お知らせ</span>
        <span className="text-[10px] text-pink-500 font-bold">すべて見る →</span>
      </div>
      <div className="flex gap-3 overflow-x-auto px-5 pb-2 scrollbar-none" style={{ scrollSnapType: "x mandatory" }}>
        {CAMPAIGNS.map((c) => (
          <motion.div
            key={c.id}
            whileTap={{ scale: 0.97 }}
            className="flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer"
            style={{ width: 200, scrollSnapAlign: "start", background: c.bg, boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}
          >
            <div className="p-4 flex flex-col gap-2 h-full">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-white/70 tracking-wide uppercase">{c.label}</span>
                {c.badge && (
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-white/20 text-white">{c.badge}</span>
                )}
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  {c.icon}
                </div>
                <div>
                  <div className="text-sm font-black text-white leading-tight whitespace-pre-line">{c.title}</div>
                  <div className="text-[10px] text-white/70 mt-1">{c.sub}</div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

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
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="10" />
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
        <div className="text-3xl font-black text-gray-800">{displayValue}</div>
        <div className="text-xs text-amber-400 font-bold tracking-widest">PT</div>
      </div>
    </div>
  );
}

export default function HomeScreen() {
  const { state, setScreen, setPreferredGachaMode, simulateMovement, dismissFuelNotification, claimPendingPoints } = useApp();
  const displayPoints = useCountUp(state.points, 900);
  const displayPending = useCountUp(state.pendingPoints, 700);
  const [claimFlash, setClaimFlash] = useState(false);
  const isFuelFull = state.points >= 100;
  const unreadCount = state.notifications.filter(n => !n.read).length;

  // ── 保有効果：累積走行距離・レベル・称号 ──
  const totalDistance = useMemo(
    () => state.movementHistory.reduce((sum, r) => sum + r.distance, 0),
    [state.movementHistory]
  );
  const carLevel = useMemo(() => {
    if (totalDistance >= 200) return 5;
    if (totalDistance >= 100) return 4;
    if (totalDistance >= 50) return 3;
    if (totalDistance >= 20) return 2;
    return 1;
  }, [totalDistance]);
  const carTitle = useMemo(() => {
    if (carLevel >= 5) return "ポイント王";
    if (carLevel >= 4) return "走り込み上手";
    if (carLevel >= 3) return "よく走る車";
    if (carLevel >= 2) return "ドライブ好き";
    return "はじめての一台";
  }, [carLevel]);

  // ── 損失回避：満タン経過秒数カウンター ──
  const fuelFullStartRef = useRef<number | null>(null);
  const [fuelFullElapsed, setFuelFullElapsed] = useState(0);
  useEffect(() => {
    if (isFuelFull) {
      if (fuelFullStartRef.current === null) {
        fuelFullStartRef.current = Date.now();
      }
      const tick = setInterval(() => {
        setFuelFullElapsed(Math.floor((Date.now() - (fuelFullStartRef.current ?? Date.now())) / 1000));
      }, 1000);
      return () => clearInterval(tick);
    } else {
      fuelFullStartRef.current = null;
      setFuelFullElapsed(0);
    }
  }, [isFuelFull]);
  const fuelFullElapsedStr = useMemo(() => {
    if (fuelFullElapsed < 60) return `${fuelFullElapsed}秒`;
    const m = Math.floor(fuelFullElapsed / 60);
    const s = fuelFullElapsed % 60;
    return `${m}分${s}秒`;
  }, [fuelFullElapsed]);

  const prevFuelRef = useRef(state.points);
  const [fuelDelta, setFuelDelta] = useState<number | null>(null);
  const deltaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ホーム遷移時に0からカウントアップするための表示値
  const [fuelDisplayValue, setFuelDisplayValue] = useState(0);


  // 短期目標ミッション計算
  const fuelPerMove = false ? 12 : 6;
  const fuelRemaining = 100 - state.points;
  const movesNeeded = isFuelFull ? 0 : Math.ceil(fuelRemaining / fuelPerMove);
  const progressPct = Math.round((state.points / 100) * 100);

  // ── ゴールグラデーション：残り1回ハプティクス ──
  const prevMovesNeededRef = useRef(movesNeeded);
  useEffect(() => {
    if (prevMovesNeededRef.current !== 1 && movesNeeded === 1 && state.hapticsEnabled) {
      try { navigator.vibrate?.(10); } catch (_) { /* noop */ }
    }
    prevMovesNeededRef.current = movesNeeded;
  }, [movesNeeded, state.hapticsEnabled]);

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
    const delta = state.points - prevFuelRef.current;
    if (delta > 0) {
      setFuelDelta(delta);
      if (deltaTimerRef.current) clearTimeout(deltaTimerRef.current);
      deltaTimerRef.current = setTimeout(() => setFuelDelta(null), 1800);
    }
    prevFuelRef.current = state.points;
  }, [state.points]);

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
    <div className="w-full h-full flex flex-col overflow-hidden relative" style={{ background: "linear-gradient(180deg, #F8F9FA 0%, #F1F3F5 100%)" }}>
      {/* Fuel満タン達成：紙吹雪オーバーレイ */}
      <FuelFullConfetti show={showConfetti} />
      {/* Fuel満タン通知バナー（損失回避バイアス） */}
      {isFuelFull && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mx-3 mt-2 rounded-xl px-4 py-3 flex items-start gap-3 relative"
          style={{ background: "rgba(233,30,140,0.15)", border: "1px solid rgba(233,30,140,0.5)" }}
        >
          <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" color="#E91E8C" />
          <div className="flex-1">
            <div className="text-gray-800 font-bold text-sm">ポイントが満タン — 今すぐ使わないと損です</div>
            <div className="text-gray-600 text-xs mt-0.5 flex items-center gap-1">
              <Timer size={10} className="flex-shrink-0" color="#E91E8C" />
              <span>満タンのまま <span className="font-bold text-pink-600">{fuelFullElapsedStr}</span> 経過中</span>
            </div>
            <div className="text-gray-500/70 text-xs mt-0.5">ガチャを回してポイントを活用しましょう。</div>
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => {
                const fuel = state.points;
                const mode: 1 | 3 | 10 = fuel >= 85 ? 10 : fuel >= 28 ? 3 : 1;
                setPreferredGachaMode(mode);
                setScreen("choose");
              }}
              className="mt-2 flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black"
              style={{ background: "rgba(233,30,140,0.25)", border: "1px solid rgba(233,30,140,0.6)", color: "#E91E8C" }}
            >
              今すぐガチャへ <ChevronRight size={10} />
            </motion.button>
          </div>
          <button onClick={dismissFuelNotification} className="text-gray-500/40 hover:text-gray-500/70 mt-0.5">
            <X size={14} />
          </button>
        </motion.div>
      )}

      {/* ヘッダー（固定） */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 pb-3 safe-top">
        <div>
          <div className="text-gray-500/50 text-xs">おかえりなさい</div>
          <div className="text-gray-800 font-bold text-sm leading-tight truncate max-w-[180px]">{state.carConfig.colorLabel}の{state.carConfig.modelLabel}</div>
        </div>
        <div className="flex items-center gap-2">
          {/* 通知ベルアイコン */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => setScreen("notifications")}
            className="relative w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.08)" }}
          >
            <Bell size={16} color={unreadCount > 0 ? "#E91E8C" : "#9CA3AF"} />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white"
                style={{ background: "#E91E8C" }}
              >
                {unreadCount}
              </motion.span>
            )}
          </motion.button>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full" style={{ background: "rgba(233,30,140,0.15)", border: "1px solid rgba(233,30,140,0.25)" }}>
            <Coins size={14} color="#F59E0B" />
            <span className="text-amber-400 font-bold text-sm">{state.points.toLocaleString()}</span>
            <span className="text-gray-500/50 text-xs">pt</span>
          </div>
        </div>
      </div>
      {/* PWAインストールバナー（ヘッダー直下） */}
      <PWAInstallBanner />

      {/* スクロール領域：マイカーアバター〜移動シミュレート */}
      <div className="flex-1 overflow-y-auto pb-nav">
      <div className="flex flex-col items-center px-5 py-4">
        {/* ── 保有ポイント・受取前ポイント 2カラム ── */}
        <div className="w-full grid grid-cols-2 gap-3 mb-4">
          {/* 保有ポイント */}
          <div className="rounded-2xl px-4 py-3 flex flex-col gap-1"
            style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(251,191,36,0.08))", border: "1px solid rgba(245,158,11,0.35)", boxShadow: "0 2px 8px rgba(245,158,11,0.10)" }}>
            <div className="text-[10px] font-bold text-amber-500/80 tracking-wide flex items-center gap-1">
              <Coins size={9} color="#F59E0B" />
              保有ポイント
            </div>
            <div className="text-2xl font-black text-gray-800 leading-tight">{displayPoints.toLocaleString()}<span className="text-xs font-bold text-amber-400 ml-1">pt</span></div>
          </div>
          {/* 受取前ポイント */}
          <motion.div
            className="rounded-2xl px-4 py-3 flex flex-col gap-1 cursor-pointer"
            style={{
              background: state.pendingPoints > 0
                ? "linear-gradient(135deg, rgba(233,30,140,0.15), rgba(255,100,180,0.08))"
                : "rgba(0,0,0,0.04)",
              border: state.pendingPoints > 0 ? "1px solid rgba(233,30,140,0.40)" : "1px solid rgba(0,0,0,0.08)",
              boxShadow: state.pendingPoints > 0 ? "0 2px 8px rgba(233,30,140,0.12)" : "none",
            }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              if (state.pendingPoints > 0) {
                const claimed = state.pendingPoints;
                claimPendingPoints();
                setClaimFlash(true);
                setTimeout(() => setClaimFlash(false), 600);
                toast.success(`+${claimed.toLocaleString()}pt 受け取り完了！`, {
                  description: "保有ポイントに加算されました 🎉",
                  duration: 3000,
                  style: {
                    background: "linear-gradient(135deg, #E91E8C, #FF6EB4)",
                    color: "#fff",
                    border: "none",
                    fontWeight: "800",
                    fontSize: "14px",
                  },
                });
              }
            }}
          >
            <div className="text-[10px] font-bold tracking-wide flex items-center gap-1"
              style={{ color: state.pendingPoints > 0 ? "#E91E8C" : "#9CA3AF" }}>
              <Gift size={9} color={state.pendingPoints > 0 ? "#E91E8C" : "#9CA3AF"} />
              受取前ポイント
            </div>
            <div className="text-2xl font-black leading-tight" style={{ color: state.pendingPoints > 0 ? "#E91E8C" : "#9CA3AF" }}>
              {displayPending.toLocaleString()}<span className="text-xs font-bold ml-1">pt</span>
            </div>
            {state.pendingPoints > 0 && (
              <div className="text-[9px] font-black text-pink-500 mt-0.5">タップして受け取る →</div>
            )}
            {claimFlash && (
              <motion.div
                initial={{ opacity: 0.8, scale: 0.8 }}
                animate={{ opacity: 0, scale: 1.6 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{ background: "rgba(233,30,140,0.25)" }}
              />
            )}
          </motion.div>
        </div>
        <div className="relative w-full rounded-2xl overflow-hidden flex flex-col items-center py-4" style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)" }}>
          {false && (
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold"
              style={{ background: "rgba(233,30,140,0.12)", border: "1px solid #E91E8C", color: "#E91E8C" }}
            >
              <Zap size={10} fill="#E91E8C" /> HIGH BOOST
            </motion.div>
          )}
          {/* 保有効果：レベル・称号バッジ（左上） */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black"
              style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.35)", color: "#D97706" }}>
              <Star size={8} fill="#D97706" />
              Lv.{carLevel}
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold"
              style={{ background: "rgba(233,30,140,0.08)", border: "1px solid rgba(233,30,140,0.25)", color: "#E91E8C" }}>
              <Trophy size={8} />
              {carTitle}
            </div>
          </div>
         <img
            src={state.carConfig.imgUrl || "/car_images/car_crown.webp"}
            alt="マイカー"
            className="w-52 h-auto object-contain"
            style={{ filter: buildCarFilter(state.carConfig.color, state.carConfig.colorHex, 20) }}
          />
          <div className="mt-1 text-gray-500/60 text-xs">TOYOTA {state.carConfig.modelLabel}</div>
          {/* 保有効果：累積走行距離 */}
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin size={9} color="#9CA3AF" />
            <span className="text-gray-500/60 text-[10px]">累積 <span className="font-bold text-gray-600">{totalDistance.toFixed(1)}</span> km</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            {state.isCarMoving ? (
              <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 0.8, repeat: Infinity }}
                className="flex items-center gap-1 text-green-400 text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                移動中 {false ? "（ハイブースト）" : ""}
              </motion.div>
            ) : (
              <span className="text-gray-500/40 text-xs">停車中</span>
            )}
          </div>
          <button
            onClick={() => setScreen("car-register")}
            className="absolute bottom-2 right-2 text-gray-500/30 text-[10px] hover:text-gray-500/60 transition-colors"
          >
            変更
          </button>
        </div>
      </div>

      {/* Fuelゲージ */}
      <div className="flex items-start gap-3 px-5 py-3">
        <div className="relative flex-shrink-0">
          {/* マイカーサムネイル（ゲージ上部に小さく表示） */}
          <div className="flex justify-center mb-1.5 relative">
            <motion.img
              key={state.carConfig.imgUrl + state.carConfig.color}
              src={state.carConfig.imgUrl || "/car_images/car_crown.webp"}
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
            value={state.points}
            max={100}
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
        <div className="flex-1 min-w-0">
          {/* 自動付与・移動ボーナス説明 */}
          <div className="flex flex-col gap-1 mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(37,99,235,0.08)", color: "#2563EB", border: "1px solid rgba(37,99,235,0.2)" }}>自動付与</span>
              <span className="text-gray-500/70 text-[11px]">+3 pt</span>
              <span className="text-blue-500/80 text-[10px] font-bold ml-0.5">次まで {countdown}秒</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(217,119,6,0.08)", color: "#D97706", border: "1px solid rgba(217,119,6,0.2)" }}>移動ボーナス</span>
              <span className="text-gray-500/70 text-[11px]">+6〜12 pt / 回</span>
            </div>
          </div>
          <div className="text-gray-800 text-sm font-bold mb-1">{fuelDisplayValue} / {100}</div>
          {/* 短期目標ミッション */}
          {!isFuelFull && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mb-2 rounded-xl px-3 py-2"
              style={{
                background: progressPct >= 80 ? "rgba(245,158,11,0.18)" : "rgba(245,158,11,0.10)",
                border: progressPct >= 80 ? "1px solid rgba(245,158,11,0.55)" : "1px solid rgba(245,158,11,0.28)",
                boxShadow: progressPct >= 80 ? "0 0 12px rgba(245,158,11,0.25)" : "0 1px 6px rgba(245,158,11,0.10)",
              }}
            >
              {/* プログレスバー */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-amber-600 text-[10px] font-black tracking-wide flex items-center gap-1">
                  {progressPct >= 80 && (
                    <motion.span
                      animate={{ scale: [1, 1.25, 1] }}
                      transition={{ duration: 0.7, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Flame size={10} fill="#F59E0B" color="#F59E0B" />
                    </motion.span>
                  )}
                  MISSION
                </span>
                <span className="text-amber-400 text-[10px] font-bold">{progressPct}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden mb-1.5" style={{ background: "rgba(0,0,0,0.06)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: progressPct >= 80
                      ? "linear-gradient(90deg, #F59E0B, #FBBF24, #FDE68A)"
                      : "linear-gradient(90deg, #F59E0B, #FBBF24)",
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                />
              </div>
              <div className="flex items-center gap-1">
                <Zap size={10} fill="#F59E0B" color="#F59E0B" />
                {progressPct >= 80 ? (
                  <motion.span
                    className="text-amber-600 text-[10px] font-black"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    🔥 もうすぐ満タン！あと{movesNeeded}回
                  </motion.span>
                ) : (
                  <span className="text-amber-600 text-[10px] font-bold">
                    あと{movesNeeded}回移動でポイント満タン
                  </span>
                )}
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
                <span className="text-green-700 text-[11px] font-black tracking-wide">MISSION COMPLETE！</span>
              </div>
              <div className="text-green-700 text-[10px]">ポイントが満タンになりました。今すぐ使いましょう！</div>
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
                    const fuel = state.points;
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
          {/* ── 装備中アイテムバッジ ── */}
          {state.avatar.equippedItem ? (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
              className="mb-2 flex items-center gap-2 rounded-xl px-3 py-2"
              style={{
                background: state.avatar.equippedItem.rarity === "legendary"
                  ? "linear-gradient(135deg, rgba(245,158,11,0.18), rgba(251,191,36,0.08))"
                  : state.avatar.equippedItem.rarity === "epic"
                  ? "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(167,139,250,0.08))"
                  : "rgba(0,0,0,0.04)",
                border: state.avatar.equippedItem.rarity === "legendary"
                  ? "1px solid rgba(245,158,11,0.45)"
                  : state.avatar.equippedItem.rarity === "epic"
                  ? "1px solid rgba(139,92,246,0.35)"
                  : "1px solid rgba(0,0,0,0.10)",
              }}
            >
              <span className="text-lg leading-none">{state.avatar.equippedItem.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-800 font-black text-[11px] truncate">{state.avatar.equippedItem.name}</span>
                  <span
                    className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                    style={{
                      background: state.avatar.equippedItem.rarity === "legendary" ? "rgba(245,158,11,0.2)" : state.avatar.equippedItem.rarity === "epic" ? "rgba(139,92,246,0.2)" : "rgba(0,0,0,0.06)",
                      color: state.avatar.equippedItem.rarity === "legendary" ? "#D97706" : state.avatar.equippedItem.rarity === "epic" ? "#7C3AED" : "#6B7280",
                    }}
                  >
                    {state.avatar.equippedItem.rarity.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-bold" style={{ color: "#E91E8C" }}>
                    移動 ×{state.avatar.equippedItem.multiplier.toFixed(1)}倍
                  </span>
                  <span className="text-gray-400 text-[10px]">|</span>
                  {state.avatar.equippedItem.maxDurability === 0 ? (
                    <span className="text-[10px] text-amber-500 font-bold">次回移動で消耗</span>
                  ) : (
                    <span className="text-[10px]" style={{ color: state.avatar.equippedItem.durability <= 2 ? "#EF4444" : "#6B7280" }}>
                      残り <span className="font-black">{state.avatar.equippedItem.durability}</span> 回
                      {state.avatar.equippedItem.durability <= 2 && " ⚠️"}
                    </span>
                  )}
                </div>
              </div>
              <Shield size={14} color={state.avatar.equippedItem.rarity === "legendary" ? "#D97706" : state.avatar.equippedItem.rarity === "epic" ? "#7C3AED" : "#9CA3AF"} />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-2 flex items-center gap-2 rounded-xl px-3 py-2"
              style={{ background: "rgba(0,0,0,0.03)", border: "1px dashed rgba(0,0,0,0.12)" }}
            >
              <ShieldOff size={13} color="#D1D5DB" />
              <span className="text-gray-400 text-[10px]">装備なし — ガチャでブーストアイテムを取得しよう</span>
            </motion.div>
          )}
          <button
            onClick={simulateMovement}
            className="w-full py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
            style={{ background: state.isCarMoving ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)", border: `1.5px solid ${state.isCarMoving ? "#10B981" : "#F59E0B"}`, color: state.isCarMoving ? "#059669" : "#D97706", boxShadow: `0 2px 8px ${state.isCarMoving ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)"}` }}
          >
          {state.isCarMoving ? "⏹ 移動を終了する" : "🚗 移動してボーナスをもらう"}
          </button>

          {/* キャンペーンバナーエリア */}
          {/* キャンペーンバナーはFuelゲージ外に移動 */}
        </div>
      </div>
      {/* キャンペーンバナー（Fuelゲージ外・全幅） */}
      <CampaignBanners />
      </div>{/* /スクロール領域 */}

      {/* 設定ボタン（ボトムナビの上） */}
      <div className="flex-shrink-0 flex justify-center py-1.5" style={{ paddingBottom: "calc(64px + env(safe-area-inset-bottom) + 6px)" }}>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setScreen("settings")}
          className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all"
          style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.18)", color: "#495057" }}
        >
          <Settings size={12} />
          設定・デモリセット
        </motion.button>
      </div>

    </div>
  );
}

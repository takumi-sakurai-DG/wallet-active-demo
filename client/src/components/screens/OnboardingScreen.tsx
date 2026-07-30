import { useApp } from "@/contexts/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { ChevronRight, Zap, Dices, Coins } from "lucide-react";

// ================================================================
// オンボーディングのスライドデータ
// ================================================================
  const SLIDES = [
  {
    id: 0,
    step: "STEP 1",
    title: "何もしないでも\nポイントが貯まる",
    subtitle: "毎日自動でポイントが蓄積。\nクルマで移動するともっと速く貯まります。",
    icon: <Zap size={36} fill="#F59E0B" color="#F59E0B" />,
    color: "#F59E0B",
    glow: "rgba(245,158,11,0.4)",
    bg: "radial-gradient(ellipse at 50% 30%, rgba(245,158,11,0.12) 0%, transparent 70%)",
    detail: [
      { label: "毎日自動付与", value: "+3 pt/日" },
      { label: "移動ボーナス", value: "+6〜12 pt/回" },
    ],
  },
  {
    id: 1,
    step: "STEP 2",
    title: "ポイントを使って\nガチャを回す",
    subtitle: "貯めたポイントでガチャに挑戦。\n1回・3連・10連から選べます。",
    icon: <Dices size={36} color="#a855f7" />,
    color: "#a855f7",
    glow: "rgba(168,85,247,0.4)",
    bg: "radial-gradient(ellipse at 50% 30%, rgba(168,85,247,0.12) 0%, transparent 70%)",
    detail: [
      { label: "1回", value: "10 pt" },
      { label: "3連（お得）", value: "28 pt" },
      { label: "10連（最お得）", value: "85 pt" },
    ],
  },
  {
    id: 2,
    step: "STEP 3",
    title: "ポイントを\nさらに増やす",
    subtitle: "ガチャで増やしたポイントをTOYOTAポイントへ変換。\nランクが上がるほど還元率がアップ！",
    icon: <Coins size={36} color="#34D399" />,
    color: "#34D399",
    glow: "rgba(52,211,153,0.4)",
    bg: "radial-gradient(ellipse at 50% 30%, rgba(52,211,153,0.12) 0%, transparent 70%)",
    detail: [
      { label: "変換レート", value: "1 pt = 10 TOYOTApt" },
      { label: "ブロンズ還元率", value: "1.0%" },
      { label: "ダイヤモンド還元率", value: "5.0%" },
    ],
  },
];

// ================================================================
// ドットインジケーター
// ================================================================
function Dots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ width: i === current ? 20 : 6, opacity: i === current ? 1 : 0.3 }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          className="h-1.5 rounded-full"
          style={{ background: i === current ? SLIDES[current].color : "rgba(0,0,0,0.2)" }}
        />
      ))}
    </div>
  );
}

// ================================================================
// メイン
// ================================================================
interface OnboardingScreenProps {
  onComplete?: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { completeOnboarding } = useApp();
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const slide = SLIDES[current];
  const isLast = current === SLIDES.length - 1;

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    } else {
      completeOnboarding();
    }
  };

  const goNext = () => {
    if (isLast) {
      handleComplete();
    } else {
      setCurrent(c => c + 1);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50 && !isLast) setCurrent(c => c + 1);
    if (diff < -50 && current > 0) setCurrent(c => c - 1);
    touchStartX.current = null;
  };

  return (
    <div
      className="w-full h-full flex flex-col relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #F8F9FA 0%, #F1F3F5 100%)" }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 背景グロー */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: slide.bg }} />

      {/* 上部ヘッダー：ドット + スキップ */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 pb-1 z-20 safe-top">
        <Dots current={current} total={SLIDES.length} />
        <button
          onClick={handleComplete}
          className="text-gray-400 text-xs font-bold px-3 py-1.5 rounded-full"
          style={{ background: "rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.10)" }}
        >
          スキップ
        </button>
      </div>

      {/* メインコンテンツ：flex-1で残り高さを占有・スクロールなし */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 overflow-hidden min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -40, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            className="flex flex-col items-center text-center w-full"
          >
            {/* ステップラベル */}
            <div
              className="text-[10px] font-black tracking-widest mb-3 px-3 py-1 rounded-full"
              style={{ background: `${slide.color}18`, color: slide.color, border: `1px solid ${slide.color}44` }}
            >
              {slide.step}
            </div>

            {/* アイコン */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="mb-4 relative"
            >
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{
                  background: `${slide.color}15`,
                  border: `2px solid ${slide.color}44`,
                  boxShadow: `0 0 24px ${slide.glow}`,
                }}
              >
                <div style={{ transform: "scale(1.1)" }}>{slide.icon}</div>
              </div>
            </motion.div>

            {/* タイトル */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.35 }}
              className="text-gray-800 font-black text-xl leading-tight mb-2 whitespace-pre-line"
            >
              {slide.title}
            </motion.h2>

            {/* サブタイトル */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.35 }}
              className="text-gray-500 text-xs leading-relaxed mb-4 whitespace-pre-line"
            >
              {slide.subtitle}
            </motion.p>

            {/* 詳細カード */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.35 }}
              className="w-full rounded-xl overflow-hidden"
              style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.07)" }}
            >
              {slide.detail.map((d, i) => (
                <div
                  key={d.label}
                  className="flex items-center justify-between px-4 py-2.5"
                  style={{ borderBottom: i < slide.detail.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none" }}
                >
                  <span className="text-gray-500 text-xs">{d.label}</span>
                  <span className="font-black text-xs" style={{ color: slide.color }}>{d.value}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* フッター：次へ/さっそく始めるボタン・最下部固定 */}
      <div
        className="flex-shrink-0 px-6 pt-2"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        {/* 最終スライドのみパルスアニメーション付きボタン */}
        {isLast ? (
          <motion.button
            whileTap={{ scale: 0.95 }}
            animate={{
              scale: [1, 1.03, 1],
              boxShadow: [
                "0 6px 24px rgba(233,30,140,0.45)",
                "0 8px 32px rgba(233,30,140,0.65)",
                "0 6px 24px rgba(233,30,140,0.45)",
              ],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            onClick={goNext}
            className="w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 text-white"
            style={{
              background: "linear-gradient(135deg, #E91E8C, #ff4444)",
            }}
          >
            さっそく始める
            <ChevronRight size={20} />
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={goNext}
            className="w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${slide.color}, ${slide.color}cc)`,
              color: "#F8F9FA",
              boxShadow: `0 6px 24px ${slide.glow}`,
            }}
          >
            次へ
            <ChevronRight size={20} />
          </motion.button>
        )}
      </div>
    </div>
  );
}

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
    title: "移動するだけで\nFuelが貯まる",
    subtitle: "クルマで走るたびに自動でFuelが蓄積。\nハイブースト中は2倍速で貯まります。",
    icon: <Zap size={56} fill="#F59E0B" color="#F59E0B" />,
    color: "#F59E0B",
    glow: "rgba(245,158,11,0.4)",
    bg: "radial-gradient(ellipse at 50% 30%, rgba(245,158,11,0.18) 0%, transparent 70%)",
    detail: [
      { label: "通常走行", value: "+6 Fuel/回" },
      { label: "ハイブースト", value: "+12 Fuel/回" },
    ],
  },
  {
    id: 1,
    step: "STEP 2",
    title: "Fuelを使って\nガチャを回す",
    subtitle: "貯めたFuelでガチャに挑戦。\n1回・3連・10連から選べます。",
    icon: <Dices size={56} color="#a855f7" />,
    color: "#a855f7",
    glow: "rgba(168,85,247,0.4)",
    bg: "radial-gradient(ellipse at 50% 30%, rgba(168,85,247,0.18) 0%, transparent 70%)",
    detail: [
      { label: "1回", value: "Fuel 10" },
      { label: "3連（お得）", value: "Fuel 28" },
      { label: "10連（最お得）", value: "Fuel 85" },
    ],
  },
  {
    id: 2,
    step: "STEP 3",
    title: "FuelをTOYOTA\nポイントに変換",
    subtitle: "ガチャで増やしたFuelをポイントに変換。\nランクが上がるほど還元率がアップ！",
    icon: <Coins size={56} color="#34D399" />,
    color: "#34D399",
    glow: "rgba(52,211,153,0.4)",
    bg: "radial-gradient(ellipse at 50% 30%, rgba(52,211,153,0.18) 0%, transparent 70%)",
    detail: [
      { label: "変換レート", value: "1 Fuel = 10pt" },
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
          style={{ background: i === current ? SLIDES[current].color : "rgba(255,255,255,0.4)" }}
        />
      ))}
    </div>
  );
}

// ================================================================
// メイン
// ================================================================
export default function OnboardingScreen() {
  const { completeOnboarding } = useApp();
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const slide = SLIDES[current];
  const isLast = current === SLIDES.length - 1;

  const goNext = () => {
    if (isLast) {
      completeOnboarding();
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
      style={{ background: "linear-gradient(180deg, #0D1B3E 0%, #0a1530 100%)" }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 背景グロー */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: slide.bg }} />

      {/* スキップボタン */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => completeOnboarding()}
          className="text-white/30 text-xs font-bold px-3 py-1.5 rounded-full hover:text-white/60 transition-colors"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          スキップ
        </button>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-4">
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
              className="text-[10px] font-black tracking-widest mb-5 px-3 py-1 rounded-full"
              style={{ background: `${slide.color}22`, color: slide.color, border: `1px solid ${slide.color}44` }}
            >
              {slide.step}
            </div>

            {/* アイコン */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="mb-6 relative"
            >
              <div
                className="w-28 h-28 rounded-3xl flex items-center justify-center"
                style={{
                  background: `${slide.color}15`,
                  border: `2px solid ${slide.color}44`,
                  boxShadow: `0 0 40px ${slide.glow}`,
                }}
              >
                {slide.icon}
              </div>
            </motion.div>

            {/* タイトル */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.35 }}
              className="text-white font-black text-2xl leading-tight mb-3 whitespace-pre-line"
            >
              {slide.title}
            </motion.h2>

            {/* サブタイトル */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.35 }}
              className="text-white/60 text-sm leading-relaxed mb-6 whitespace-pre-line"
            >
              {slide.subtitle}
            </motion.p>

            {/* 詳細カード */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.35 }}
              className="w-full rounded-2xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {slide.detail.map((d, i) => (
                <div
                  key={d.label}
                  className="flex items-center justify-between px-4 py-3"
                  style={{ borderBottom: i < slide.detail.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}
                >
                  <span className="text-white/50 text-sm">{d.label}</span>
                  <span className="font-black text-sm" style={{ color: slide.color }}>{d.value}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* フッター */}
      <div className="flex-shrink-0 px-6 pb-10 flex flex-col items-center gap-5">
        {/* ドット */}
        <Dots current={current} total={SLIDES.length} />

        {/* 次へ / はじめるボタン */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={goNext}
          className="w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2"
          style={{
            background: isLast
              ? "linear-gradient(135deg, #E60012, #ff4444)"
              : `linear-gradient(135deg, ${slide.color}, ${slide.color}bb)`,
            color: isLast ? "white" : "#0D1B3E",
            boxShadow: isLast ? "0 4px 20px rgba(230,0,18,0.4)" : `0 4px 20px ${slide.glow}`,
          }}
        >
          {isLast ? "さっそく始める" : "次へ"}
          <ChevronRight size={20} />
        </motion.button>

        {/* スワイプヒント */}
        {!isLast && (
          <p className="text-white/20 text-[10px]">← スワイプで移動 →</p>
        )}
      </div>
    </div>
  );
}

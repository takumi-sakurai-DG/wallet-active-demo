import { useApp } from "@/contexts/AppContext";
import type { GachaResult } from "@/contexts/AppContext";
import LegendaryConfetti from "@/components/LegendaryConfetti";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { toast } from "sonner";
import { ArrowLeft, Crown, Zap, Star, Package } from "lucide-react";
import { useState } from "react";

// デザイン方針: ガチャの高揚感を保ちつつ、当選サマリー・取得一覧・次の行動をモバイル画面で重ねずに判別できるようにする。
// ================================================================
// MultiGachaResultScreen — 複数回ガチャ結果（アイテム取得型）
// ================================================================

const RARITY_CONFIG: Record<GachaResult["type"], {
  bg: string; border: string; color: string; icon: React.ReactNode; label: string;
}> = {
  legendary: { bg: "linear-gradient(135deg,#FFF8E1,#FFF3CD)", border: "rgba(245,158,11,0.5)", color: "#B45309", icon: <Crown size={14} />, label: "LEGENDARY" },
  epic:      { bg: "linear-gradient(135deg,#F5F0FF,#EDE0FF)", border: "rgba(168,85,247,0.4)", color: "#7C3AED", icon: <Zap size={14} />,   label: "EPIC" },
  rare:      { bg: "linear-gradient(135deg,#EFF6FF,#DBEAFE)", border: "rgba(59,130,246,0.4)",  color: "#1D4ED8", icon: <Star size={14} />,  label: "RARE" },
  common:    { bg: "rgba(0,0,0,0.03)",                        border: "rgba(0,0,0,0.10)",      color: "#374151", icon: <Package size={14} />, label: "COMMON" },
};

function ItemCard({ result, index }: { result: GachaResult; index: number }) {
  const cfg = RARITY_CONFIG[result.type];
  const item = result.item;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      className="min-h-[116px] flex-shrink-0 rounded-2xl p-2.5 flex flex-col items-center justify-between gap-1.5"
      style={{ background: cfg.bg, border: `1.5px solid ${cfg.border}` }}
    >
      <div className="text-2xl leading-none">{item.emoji}</div>
      <div className="text-center">
        <div className="min-h-7 font-black text-[11px] leading-tight" style={{ color: cfg.color }}>{item.name}</div>
        <div className="mt-0.5 text-[9px] text-gray-500">×{item.multiplier} / {item.maxDurability}回</div>
      </div>
      <span className="rounded-full px-1.5 py-0.5 text-[8px] font-black" style={{ background: cfg.border, color: cfg.color }}>
        {cfg.label}
      </span>
    </motion.div>
  );
}

export default function MultiGachaResultScreen() {
  const { state, setScreen } = useApp();
  const results = state.multiGachaResults;
  const [showAll, setShowAll] = useState(false);

  // アイテム取得フィードバックtoast（マルチガチャ）
  useEffect(() => {
    if (!results || results.length === 0) return;
    const best = results.find(r => r.type === "legendary") ?? results.find(r => r.type === "epic") ?? results[results.length - 1];
    if (!best) return;
    const toastStyle = best.type === "legendary"
      ? { background: "linear-gradient(135deg, #F59E0B, #FBBF24)", color: "#fff", border: "none", fontWeight: "800" }
      : best.type === "epic"
      ? { background: "linear-gradient(135deg, #7C3AED, #A855F7)", color: "#fff", border: "none", fontWeight: "800" }
      : { background: "linear-gradient(135deg, #E91E8C, #FF6EB4)", color: "#fff", border: "none", fontWeight: "800" };
    toast.success(`${best.item.emoji} ${best.item.name}を取得！`, {
      description: `${results.length}連ガチャ完了 / 次の移動から×${best.item.multiplier.toFixed(1)}倍`,
      duration: 4500,
      style: toastStyle,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!results || results.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <button onClick={() => setScreen("choose")} className="text-gray-500">← 戻る</button>
      </div>
    );
  }

  // ベスト結果（最高レアリティ）
  const RANK: Record<GachaResult["type"], number> = { legendary: 4, epic: 3, rare: 2, common: 1 };
  const bestResult = results.reduce((best, r) => RANK[r.type] > RANK[best.type] ? r : best, results[0]);
  const bestCfg = RARITY_CONFIG[bestResult.type];

  // レアリティ別集計
  const summary = results.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] ?? 0) + 1;
    return acc;
  }, {} as Record<GachaResult["type"], number>);

  const displayResults = showAll ? results : results.slice(0, 6);

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden" style={{ background: "linear-gradient(180deg, #1A0533 0%, #0D0020 100%)" }}>
      {bestResult.type === "legendary" && <LegendaryConfetti />}
      {/* ヘッダー */}
      <div className="flex flex-shrink-0 items-center px-5 pb-3" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
        <button onClick={() => setScreen("choose")} className="p-2 rounded-full mr-3" style={{ background: "rgba(255,255,255,0.1)" }}>
          <ArrowLeft size={18} color="white" />
        </button>
        <div>
          <div className="text-white font-black text-xl">{results.length}連ガチャ 結果</div>
          <div className="text-white/60 text-sm">{results.length}個のアイテムを取得</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 flex flex-col gap-3" style={{ scrollbarWidth: "none", paddingBottom: "1.25rem" }}>
        {/* ベストアイテム強調 */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          className="min-h-[164px] flex-shrink-0 rounded-3xl px-4 py-3.5 flex flex-col items-center justify-center gap-2"
          style={{ background: bestCfg.bg, border: `2px solid ${bestCfg.border}` }}
        >
          <span className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black" style={{ background: bestCfg.border, color: bestCfg.color }}>
            {bestCfg.icon}<span>BEST {bestCfg.label}</span>
          </span>
          <div className="text-4xl leading-none">{bestResult.item.emoji}</div>
          <div className="text-center">
            <div className="font-black text-lg leading-tight" style={{ color: bestCfg.color }}>{bestResult.item.name}</div>
            <div className="mt-1 max-w-[250px] truncate text-[11px] text-gray-600">{bestResult.item.description}</div>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-[10px] text-gray-500">倍率</div>
              <div className="font-black text-base" style={{ color: bestCfg.color }}>×{bestResult.item.multiplier}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-gray-500">耐久</div>
              <div className="font-black text-base" style={{ color: bestCfg.color }}>{bestResult.item.maxDurability}回</div>
            </div>
          </div>
        </motion.div>

        {/* レアリティ集計 */}
        <div className="grid flex-shrink-0 grid-cols-4 rounded-2xl px-2 py-2" style={{ background: "rgba(255,255,255,0.08)" }}>
          {(["legendary","epic","rare","common"] as const).filter(r => summary[r]).map(r => {
            const cfg = RARITY_CONFIG[r];
            return (
              <div key={r} className="text-center">
                <div className="font-black text-base leading-tight" style={{ color: cfg.color }}>{summary[r]}</div>
                <div className="mt-0.5 text-[8px] text-white/50">{cfg.label}</div>
              </div>
            );
          })}
        </div>

        {/* 全アイテム一覧 */}
        <div className="flex-shrink-0">
          <div className="text-white/60 text-xs font-bold mb-2 tracking-wide">取得アイテム一覧</div>
          <div className="grid grid-cols-3 gap-2">
            {displayResults.map((r, i) => (
              <ItemCard key={`${r.item.id}_${i}`} result={r} index={i} />
            ))}
          </div>
          {results.length > 6 && (
            <button
              onClick={() => setShowAll(v => !v)}
              className="w-full mt-2 py-2 rounded-xl text-sm font-bold"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}
            >
              {showAll ? "折りたたむ" : `残り${results.length - 6}件を表示`}
            </button>
          )}
        </div>

        {/* 残りポイント */}
        <div className="flex-shrink-0 text-center text-white/60 text-sm">
          残りポイント: <span className="font-black text-white">{state.points} pt</span>
        </div>
      </div>

      {/* ボタン */}
      <div className="flex-shrink-0 px-5 pt-3" style={{ paddingBottom: "calc(max(0.75rem, env(safe-area-inset-bottom)) + 4.5rem)" }}>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setScreen("avatar")}
          className="w-full rounded-2xl py-3.5 font-black text-base text-white"
          style={{ background: "linear-gradient(135deg, #E91E8C 0%, #9333EA 100%)", boxShadow: "0 4px 20px rgba(233,30,140,0.35)" }}
        >
          アバター画面で装備する
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setScreen("home")}
          className="mt-2 w-full rounded-2xl py-2.5 font-bold text-sm"
          style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}
        >
          ホームへ戻る
        </motion.button>
      </div>
    </div>
  );
}

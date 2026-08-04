import { useApp } from "@/contexts/AppContext";
import type { GachaResult } from "@/contexts/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Crown, Zap, Star, Package } from "lucide-react";
import { useState } from "react";

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
      className="rounded-2xl p-3 flex flex-col items-center gap-2"
      style={{ background: cfg.bg, border: `1.5px solid ${cfg.border}` }}
    >
      <div className="text-3xl">{item.emoji}</div>
      <div className="text-center">
        <div className="font-black text-xs leading-tight" style={{ color: cfg.color }}>{item.name}</div>
        <div className="text-gray-500 text-[10px] mt-0.5">×{item.multiplier} / {item.maxDurability}回</div>
      </div>
      <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: cfg.border, color: cfg.color }}>
        {cfg.label}
      </span>
    </motion.div>
  );
}

export default function MultiGachaResultScreen() {
  const { state, setScreen } = useApp();
  const results = state.multiGachaResults;
  const [showAll, setShowAll] = useState(false);

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
    <div className="w-full h-full flex flex-col overflow-hidden" style={{ background: "linear-gradient(180deg, #1A0533 0%, #0D0020 100%)" }}>
      {/* ヘッダー */}
      <div className="flex items-center px-5 pb-4" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
        <button onClick={() => setScreen("choose")} className="p-2 rounded-full mr-3" style={{ background: "rgba(255,255,255,0.1)" }}>
          <ArrowLeft size={18} color="white" />
        </button>
        <div>
          <div className="text-white font-black text-xl">{results.length}連ガチャ 結果</div>
          <div className="text-white/60 text-sm">{results.length}個のアイテムを取得</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 flex flex-col gap-4" style={{ scrollbarWidth: "none", paddingBottom: "calc(max(1.5rem, env(safe-area-inset-bottom)) + 5rem)" }}>
        {/* ベストアイテム強調 */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          className="rounded-3xl p-5 flex flex-col items-center gap-3"
          style={{ background: bestCfg.bg, border: `2px solid ${bestCfg.border}` }}
        >
          <span className="text-xs font-black px-3 py-1 rounded-full" style={{ background: bestCfg.border, color: bestCfg.color }}>
            {bestCfg.icon} BEST {bestCfg.label}
          </span>
          <div className="text-5xl">{bestResult.item.emoji}</div>
          <div className="text-center">
            <div className="font-black text-xl" style={{ color: bestCfg.color }}>{bestResult.item.name}</div>
            <div className="text-gray-600 text-sm mt-1">{bestResult.item.description}</div>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-xs text-gray-500">倍率</div>
              <div className="font-black text-lg" style={{ color: bestCfg.color }}>×{bestResult.item.multiplier}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">耐久</div>
              <div className="font-black text-lg" style={{ color: bestCfg.color }}>{bestResult.item.maxDurability}回</div>
            </div>
          </div>
        </motion.div>

        {/* レアリティ集計 */}
        <div className="rounded-2xl px-4 py-3 flex gap-3 justify-center" style={{ background: "rgba(255,255,255,0.08)" }}>
          {(["legendary","epic","rare","common"] as const).filter(r => summary[r]).map(r => {
            const cfg = RARITY_CONFIG[r];
            return (
              <div key={r} className="text-center">
                <div className="font-black text-lg" style={{ color: cfg.color }}>{summary[r]}</div>
                <div className="text-[10px] text-white/50">{cfg.label}</div>
              </div>
            );
          })}
        </div>

        {/* 全アイテム一覧 */}
        <div>
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
        <div className="text-center text-white/60 text-sm">
          残りポイント: <span className="font-black text-white">{state.points} pt</span>
        </div>
      </div>

      {/* ボタン */}
      <div className="px-5 flex flex-col gap-3" style={{ paddingBottom: "calc(max(1.5rem, env(safe-area-inset-bottom)) + 0.5rem)" }}>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setScreen("avatar")}
          className="w-full py-4 rounded-2xl font-black text-lg text-white"
          style={{ background: "linear-gradient(135deg, #E91E8C 0%, #9333EA 100%)", boxShadow: "0 4px 20px rgba(233,30,140,0.35)" }}
        >
          アバター画面で装備する
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setScreen("home")}
          className="w-full py-3 rounded-2xl font-bold text-base"
          style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}
        >
          ホームへ戻る
        </motion.button>
      </div>
    </div>
  );
}

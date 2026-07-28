import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ArrowLeft, Trophy, Zap, Star, TrendingUp, Trash2, Filter } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import type { GachaCollectionItem } from "@/contexts/AppContext";

// ================================================================
// レアリティ設定
// ================================================================
const RARITY_CONFIG: Record<string, { color: string; bg: string; border: string; label: string; rank: number }> = {
  jackpot: { color: "#FFD700", bg: "rgba(255,215,0,0.12)", border: "rgba(255,215,0,0.5)", label: "JACKPOT", rank: 5 },
  boost:   { color: "#E60012", bg: "rgba(230,0,18,0.12)",  border: "rgba(230,0,18,0.5)",  label: "BOOST UP", rank: 4 },
  "fuel-up": { color: "#34D399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.4)", label: "WIN", rank: 3 },
  "fuel-down": { color: "#9CA3AF", bg: "rgba(156,163,175,0.08)", border: "rgba(156,163,175,0.2)", label: "MISS", rank: 1 },
};

function getRarity(item: GachaCollectionItem) {
  return RARITY_CONFIG[item.result.type] ?? RARITY_CONFIG["fuel-down"];
}

// ================================================================
// コレクションカード
// ================================================================
function CollectionCard({ item, index }: { item: GachaCollectionItem; index: number }) {
  const rarity = getRarity(item);
  const isJackpot = item.result.type === "jackpot";
  const isBoost = item.result.type === "boost";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4), ease: [0.23, 1, 0.32, 1] }}
      className="relative rounded-xl p-3 flex items-center gap-3"
      style={{ background: rarity.bg, border: `1px solid ${rarity.border}`, boxShadow: isJackpot ? `0 0 12px ${rarity.color}30` : "none" }}
    >
      {/* レアリティアイコン */}
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: `${rarity.color}20`, border: `1.5px solid ${rarity.border}` }}>
        {isJackpot ? <Trophy size={18} style={{ color: rarity.color }} /> :
         isBoost   ? <Star size={18} fill={rarity.color} style={{ color: rarity.color }} /> :
         item.result.fuelChange > 0 ? <TrendingUp size={18} style={{ color: rarity.color }} /> :
         <Zap size={18} style={{ color: "#6B7280" }} />}
      </div>

      {/* 内容 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="font-black text-xs" style={{ color: rarity.color }}>{rarity.label}</span>
          {item.isMulti && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
              style={{ background: "rgba(168,85,247,0.2)", color: "#c084fc", border: "1px solid rgba(168,85,247,0.3)" }}>
              {item.multiCount}連
            </span>
          )}
        </div>
        <div className="text-white/70 text-[11px] truncate">{item.result.description}</div>
        <div className="text-white/30 text-[10px] mt-0.5">{item.timestamp}</div>
      </div>

      {/* Fuel変化 */}
      {item.result.fuelChange !== 0 && (
        <div className="flex-shrink-0 text-right">
          <div className="font-black text-sm" style={{ color: item.result.fuelChange > 0 ? "#34D399" : "#F87171" }}>
            {item.result.fuelChange > 0 ? "+" : ""}{item.result.fuelChange}
          </div>
          <div className="flex items-center gap-0.5 justify-end">
            <Zap size={8} fill="#F59E0B" color="#F59E0B" />
            <span className="text-amber-400/60 text-[9px]">Fuel</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ================================================================
// フィルタータブ
// ================================================================
type FilterType = "all" | "jackpot" | "boost" | "fuel-up" | "fuel-down";

const FILTER_OPTIONS: { key: FilterType; label: string; color: string }[] = [
  { key: "all",       label: "すべて",   color: "#9CA3AF" },
  { key: "jackpot",   label: "JACKPOT",  color: "#FFD700" },
  { key: "boost",     label: "BOOST",    color: "#E60012" },
  { key: "fuel-up",   label: "WIN",      color: "#34D399" },
  { key: "fuel-down", label: "MISS",     color: "#6B7280" },
];

// ================================================================
// メイン
// ================================================================
export default function CollectionScreen() {
  const { state, setScreen, clearCollection } = useApp();
  const [filter, setFilter] = useState<FilterType>("all");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const collection = state.gachaCollection;
  const filtered = filter === "all" ? collection : collection.filter(item => item.result.type === filter);

  // サマリー集計
  const jackpotCount = collection.filter(i => i.result.type === "jackpot").length;
  const boostCount   = collection.filter(i => i.result.type === "boost").length;
  const winCount     = collection.filter(i => i.result.type === "fuel-up").length;
  const totalFuel    = collection.reduce((sum, i) => sum + i.result.fuelChange, 0);

  return (
    <div className="w-full h-full flex flex-col" style={{ background: "linear-gradient(180deg, #0a0f1e 0%, #0d1b3e 100%)" }}>
      {/* ヘッダー */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-3 flex-shrink-0">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen("home")}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.08)" }}>
          <ArrowLeft size={16} className="text-white/70" />
        </motion.button>
        <div className="flex-1">
          <h2 className="text-white font-black text-base">コレクション</h2>
          <p className="text-white/40 text-[10px]">ガチャ結果の記録 {collection.length}件</p>
        </div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowClearConfirm(true)}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.06)" }}>
          <Trash2 size={14} className="text-white/40" />
        </motion.button>
      </div>

      {/* サマリーカード */}
      <div className="px-4 mb-3 flex-shrink-0">
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "JACKPOT", value: jackpotCount, color: "#FFD700" },
            { label: "BOOST",   value: boostCount,   color: "#E60012" },
            { label: "WIN",     value: winCount,     color: "#34D399" },
            { label: "Fuel計",  value: totalFuel > 0 ? `+${totalFuel}` : totalFuel, color: totalFuel >= 0 ? "#34D399" : "#F87171" },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-2 text-center"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="font-black text-base" style={{ color: s.color }}>{s.value}</div>
              <div className="text-white/30 text-[9px] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* フィルタータブ */}
      <div className="px-4 mb-3 flex-shrink-0">
        <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          <Filter size={12} className="text-white/30 flex-shrink-0 mt-1.5" />
          {FILTER_OPTIONS.map(opt => (
            <motion.button key={opt.key} whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(opt.key)}
              className="flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all"
              style={{
                background: filter === opt.key ? `${opt.color}25` : "rgba(255,255,255,0.05)",
                border: filter === opt.key ? `1px solid ${opt.color}60` : "1px solid rgba(255,255,255,0.08)",
                color: filter === opt.key ? opt.color : "rgba(255,255,255,0.4)",
              }}>
              {opt.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* コレクションリスト */}
      <div className="flex-1 overflow-y-auto px-4 pb-6" style={{ scrollbarWidth: "none" }}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <Trophy size={32} className="text-white/15" />
            <p className="text-white/30 text-sm text-center">
              {collection.length === 0 ? "まだガチャを引いていません\nガチャを回して記録を残そう！" : "該当する結果がありません"}
            </p>
            {collection.length === 0 && (
              <motion.button whileTap={{ scale: 0.95 }}
                onClick={() => setScreen("choose")}
                className="px-4 py-2 rounded-xl font-bold text-white text-sm"
                style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", boxShadow: "0 4px 16px rgba(124,58,237,0.4)" }}>
                ガチャを引く
              </motion.button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((item, i) => (
              <CollectionCard key={item.id} item={item} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* クリア確認モーダル */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-50"
            style={{ background: "rgba(0,0,0,0.7)" }}
            onClick={() => setShowClearConfirm(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="mx-6 rounded-2xl p-5"
              style={{ background: "#1a1f35", border: "1px solid rgba(255,255,255,0.1)" }}
              onClick={e => e.stopPropagation()}>
              <h3 className="text-white font-black text-base mb-1">コレクションを削除</h3>
              <p className="text-white/50 text-sm mb-4">すべての記録が削除されます。この操作は取り消せません。</p>
              <div className="flex gap-2">
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-white/60 text-sm"
                  style={{ background: "rgba(255,255,255,0.06)" }}>キャンセル</motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => { clearCollection(); setShowClearConfirm(false); }}
                  className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm"
                  style={{ background: "linear-gradient(135deg, #E60012, #ff4444)" }}>削除する</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

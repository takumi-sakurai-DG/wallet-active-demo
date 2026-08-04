import { useApp } from "@/contexts/AppContext";
import type { GachaCollectionItem, BoostItem } from "@/contexts/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Crown, Zap, Star, Package, Trash2 } from "lucide-react";
import { useState } from "react";

// ================================================================
// CollectionScreen — ガチャ取得アイテム履歴
// ================================================================

const RARITY_CONFIG: Record<BoostItem["rarity"], {
  bg: string; border: string; color: string; icon: React.ReactNode; label: string;
}> = {
  legendary: { bg: "linear-gradient(135deg,#FFF8E1,#FFF3CD)", border: "rgba(245,158,11,0.5)", color: "#B45309", icon: <Crown size={12} />, label: "LEGENDARY" },
  epic:      { bg: "linear-gradient(135deg,#F5F0FF,#EDE0FF)", border: "rgba(168,85,247,0.4)", color: "#7C3AED", icon: <Zap size={12} />,   label: "EPIC" },
  rare:      { bg: "linear-gradient(135deg,#EFF6FF,#DBEAFE)", border: "rgba(59,130,246,0.4)",  color: "#1D4ED8", icon: <Star size={12} />,  label: "RARE" },
  common:    { bg: "rgba(0,0,0,0.03)",                        border: "rgba(0,0,0,0.10)",      color: "#374151", icon: <Package size={12} />, label: "COMMON" },
};

function CollectionCard({ entry }: { entry: GachaCollectionItem }) {
  const item = entry.item;
  const cfg = RARITY_CONFIG[item.rarity];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl p-3 flex flex-col items-center gap-2"
      style={{ background: cfg.bg, border: `1.5px solid ${cfg.border}` }}
    >
      <div className="text-3xl">{item.emoji}</div>
      <div className="text-center">
        <div className="font-black text-xs leading-tight" style={{ color: cfg.color }}>{item.name}</div>
        <div className="text-gray-500 text-[10px] mt-0.5">×{item.multiplier}</div>
      </div>
      <div className="flex items-center gap-1">
        {cfg.icon}
        <span className="text-[9px] font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
      </div>
      <div className="text-gray-400 text-[9px]">{entry.timestamp}</div>
    </motion.div>
  );
}

export default function CollectionScreen() {
  const { state, setScreen, clearCollection } = useApp();
  const [filter, setFilter] = useState<BoostItem["rarity"] | "all">("all");
  const collection = state.gachaCollection;

  const filtered = filter === "all" ? collection : collection.filter(e => e.item.rarity === filter);

  // 集計
  const summary = collection.reduce((acc, e) => {
    acc[e.item.rarity] = (acc[e.item.rarity] ?? 0) + 1;
    return acc;
  }, {} as Record<BoostItem["rarity"], number>);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden" style={{ background: "linear-gradient(180deg, #F8F9FA 0%, #F1F3F5 100%)" }}>
      {/* ヘッダー */}
      <div className="flex items-center px-5 pb-4" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
        <button onClick={() => setScreen("home")} className="p-2 rounded-full mr-3" style={{ background: "rgba(0,0,0,0.05)" }}>
          <ArrowLeft size={18} color="#212529" />
        </button>
        <div className="flex-1">
          <div className="text-gray-800 font-black text-xl">アイテム履歴</div>
          <div className="text-gray-500 text-sm mt-0.5">取得済み {collection.length}個</div>
        </div>
        {collection.length > 0 && (
          <button
            onClick={clearCollection}
            className="p-2 rounded-full"
            style={{ background: "rgba(239,68,68,0.1)" }}
          >
            <Trash2 size={16} color="#EF4444" />
          </button>
        )}
      </div>

      {/* 集計バー */}
      {collection.length > 0 && (
        <div className="px-5 mb-3 flex gap-2">
          {(["legendary","epic","rare","common"] as const).filter(r => summary[r]).map(r => {
            const cfg = RARITY_CONFIG[r];
            return (
              <div key={r} className="text-center px-2 py-1 rounded-xl" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                <div className="font-black text-sm" style={{ color: cfg.color }}>{summary[r]}</div>
                <div className="text-[9px] text-gray-500">{cfg.label}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* フィルター */}
      <div className="px-5 mb-3 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {(["all","legendary","epic","rare","common"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap"
            style={{
              background: filter === f ? "linear-gradient(135deg,#E91E8C,#9333EA)" : "rgba(0,0,0,0.06)",
              color: filter === f ? "white" : "#6B7280",
            }}
          >
            {f === "all" ? "すべて" : RARITY_CONFIG[f].label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-nav" style={{ scrollbarWidth: "none" }}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <div className="text-5xl">🎁</div>
            <div className="text-gray-500 text-sm text-center">
              {collection.length === 0
                ? "ガチャを回してアイテムを集めよう！"
                : "このレアリティのアイテムはまだありません"}
            </div>
            {collection.length === 0 && (
              <button
                onClick={() => setScreen("gacha")}
                className="px-6 py-2 rounded-full font-bold text-sm text-white"
                style={{ background: "linear-gradient(135deg,#E91E8C,#9333EA)" }}
              >
                ガチャへ
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 pb-4">
            <AnimatePresence>
              {filtered.map((entry, i) => (
                <motion.div key={entry.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                  <CollectionCard entry={entry} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

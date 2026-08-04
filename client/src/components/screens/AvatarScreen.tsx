import { useApp } from "@/contexts/AppContext";
import type { BoostItem } from "@/contexts/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Shield, Zap, Star, Crown, Package, ChevronRight } from "lucide-react";

// ================================================================
// AvatarScreen — マイカーアバター育成・アイテム装備画面
// ================================================================

const RARITY_CONFIG: Record<BoostItem["rarity"], {
  bg: string; border: string; color: string; icon: React.ReactNode; label: string;
}> = {
  legendary: { bg: "linear-gradient(135deg,#FFF8E1,#FFF3CD)", border: "rgba(245,158,11,0.5)", color: "#B45309", icon: <Crown size={12} />, label: "LEGENDARY" },
  epic:      { bg: "linear-gradient(135deg,#F5F0FF,#EDE0FF)", border: "rgba(168,85,247,0.4)", color: "#7C3AED", icon: <Zap size={12} />,   label: "EPIC" },
  rare:      { bg: "linear-gradient(135deg,#EFF6FF,#DBEAFE)", border: "rgba(59,130,246,0.4)",  color: "#1D4ED8", icon: <Star size={12} />,  label: "RARE" },
  common:    { bg: "rgba(0,0,0,0.03)",                        border: "rgba(0,0,0,0.10)",      color: "#374151", icon: <Package size={12} />, label: "COMMON" },
};

function ItemCard({ item, isEquipped, onEquip }: { item: BoostItem; isEquipped: boolean; onEquip: () => void }) {
  const cfg = RARITY_CONFIG[item.rarity];
  const worn = item.durability <= 0;
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={!worn && !isEquipped ? onEquip : undefined}
      className="rounded-2xl p-3 flex flex-col gap-2 relative"
      style={{
        background: isEquipped ? "linear-gradient(135deg,#EDFAF4,#D9F5E8)" : worn ? "rgba(0,0,0,0.04)" : cfg.bg,
        border: isEquipped ? "2px solid rgba(16,185,129,0.5)" : worn ? "1px solid rgba(0,0,0,0.08)" : `1.5px solid ${cfg.border}`,
        opacity: worn ? 0.5 : 1,
        cursor: worn || isEquipped ? "default" : "pointer",
      }}
    >
      {isEquipped && (
        <span className="absolute top-1.5 right-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-green-500 text-white">装備中</span>
      )}
      {worn && (
        <span className="absolute top-1.5 right-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-gray-400 text-white">消耗</span>
      )}
      <div className="text-3xl text-center">{item.emoji}</div>
      <div className="text-center">
        <div className="font-black text-xs leading-tight" style={{ color: isEquipped ? "#065F46" : cfg.color }}>{item.name}</div>
        <div className="text-gray-500 text-[10px] mt-0.5">×{item.multiplier} / 残{item.durability}回</div>
      </div>
      <div className="flex items-center justify-center gap-1">
        {cfg.icon}
        <span className="text-[9px] font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
      </div>
      {!worn && !isEquipped && (
        <div className="text-center text-[10px] font-bold text-purple-600 flex items-center justify-center gap-0.5">
          装備する <ChevronRight size={10} />
        </div>
      )}
    </motion.div>
  );
}

export default function AvatarScreen() {
  const { state, setScreen, equipItem, unequipItem } = useApp();
  const { avatar } = state;
  const equipped = avatar.equippedItem;

  const expPct = Math.min(100, Math.round((avatar.exp / (avatar.exp + avatar.expToNext)) * 100));

  return (
    <div className="w-full h-full flex flex-col overflow-hidden" style={{ background: "linear-gradient(180deg, #F8F9FA 0%, #F1F3F5 100%)" }}>
      {/* ヘッダー */}
      <div className="flex items-center px-5 pb-4" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
        <button onClick={() => setScreen("home")} className="p-2 rounded-full mr-3" style={{ background: "rgba(0,0,0,0.05)" }}>
          <ArrowLeft size={18} color="#212529" />
        </button>
        <div>
          <div className="text-gray-800 font-black text-xl">マイカーアバター</div>
          <div className="text-pink-500 text-sm font-bold mt-0.5">Lv.{avatar.level} · ガチャ {avatar.totalGachaCount}回</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-nav flex flex-col gap-5" style={{ scrollbarWidth: "none" }}>
        {/* アバターカード */}
        <div
          className="rounded-3xl p-5 flex flex-col gap-4"
          style={{ background: "linear-gradient(135deg, #1A0533 0%, #2D0A5C 100%)" }}
        >
          {/* 車のビジュアル */}
          <div className="flex items-center justify-center py-4">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="text-7xl"
            >
              🚗
            </motion.div>
          </div>

          {/* レベル・EXP */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-white font-black text-lg">Lv.{avatar.level}</div>
              <div className="text-white/60 text-xs">EXP {avatar.exp} / {avatar.exp + avatar.expToNext}</div>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.15)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #E91E8C, #9333EA)" }}
                initial={{ width: 0 }}
                animate={{ width: `${expPct}%` }}
                transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
              />
            </div>
            <div className="text-white/40 text-xs mt-1">次のレベルまで {avatar.expToNext} EXP</div>
          </div>

          {/* 装備中アイテム */}
          <div className="rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div className="text-white/60 text-xs font-bold mb-2">装備中アイテム</div>
            {equipped ? (
              <div className="flex items-center gap-3">
                <span className="text-3xl">{equipped.emoji}</span>
                <div className="flex-1">
                  <div className="text-white font-bold text-sm">{equipped.name}</div>
                  <div className="text-white/60 text-xs mt-0.5">移動ポイント ×{equipped.multiplier} / 残り耐久 {equipped.durability}回</div>
                </div>
                <button
                  onClick={unequipItem}
                  className="text-[10px] font-bold px-2 py-1 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}
                >
                  外す
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-white/40">
                <Shield size={24} />
                <div className="text-sm">装備なし — 下のインベントリから選択</div>
              </div>
            )}
          </div>
        </div>

        {/* インベントリ */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-gray-700 font-black text-base">所持アイテム</div>
            <div className="text-gray-400 text-xs">{avatar.inventory.length}個</div>
          </div>
          {avatar.inventory.length === 0 ? (
            <div className="rounded-2xl p-8 text-center" style={{ background: "rgba(0,0,0,0.04)", border: "1px dashed rgba(0,0,0,0.12)" }}>
              <div className="text-4xl mb-2">🎁</div>
              <div className="text-gray-500 text-sm">ガチャを回してアイテムを入手しよう！</div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <AnimatePresence>
                {avatar.inventory.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <ItemCard
                      item={item}
                      isEquipped={equipped?.id === item.id}
                      onEquip={() => equipItem(item)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ガチャへの誘導 */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setScreen("gacha")}
          className="w-full py-4 rounded-2xl font-black text-lg text-white"
          style={{ background: "linear-gradient(135deg, #E91E8C 0%, #9333EA 100%)", boxShadow: "0 4px 20px rgba(233,30,140,0.3)" }}
        >
          ガチャでアイテムを増やす
        </motion.button>
      </div>
    </div>
  );
}

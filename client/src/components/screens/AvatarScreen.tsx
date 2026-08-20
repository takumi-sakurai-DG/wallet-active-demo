import { useApp } from "@/contexts/AppContext";
import type { BoostItem } from "@/contexts/AppContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Shield, Zap, Star, Crown, Package, ChevronRight, Sparkles } from "lucide-react";

// デザイン方針: 白基調のモバイルUIで愛車画像を主役に置き、車種・カラーは直下で即座に識別できる補助情報として扱う。
// ── アイテムレアリティ別の車体ビジュアルエフェクト ──
const ITEM_VISUAL_EFFECT: Record<BoostItem["rarity"], {
  glowColor: string;
  glowSize: number;
  filterExtra: string;
  label: string;
  labelColor: string;
  aura: string;
}> = {
  legendary: {
    glowColor: "#F59E0B",
    glowSize: 32,
    filterExtra: "saturate(130%) brightness(110%)",
    label: "LEGENDARY BOOST",
    labelColor: "#B45309",
    aura: "radial-gradient(ellipse 80% 40% at 50% 100%, rgba(245,158,11,0.35) 0%, transparent 70%)",
  },
  epic: {
    glowColor: "#A855F7",
    glowSize: 24,
    filterExtra: "saturate(120%) brightness(105%)",
    label: "EPIC BOOST",
    labelColor: "#7C3AED",
    aura: "radial-gradient(ellipse 80% 40% at 50% 100%, rgba(168,85,247,0.30) 0%, transparent 70%)",
  },
  rare: {
    glowColor: "#3B82F6",
    glowSize: 18,
    filterExtra: "saturate(110%) brightness(103%)",
    label: "RARE BOOST",
    labelColor: "#1D4ED8",
    aura: "radial-gradient(ellipse 80% 40% at 50% 100%, rgba(59,130,246,0.25) 0%, transparent 70%)",
  },
  common: {
    glowColor: "#9CA3AF",
    glowSize: 8,
    filterExtra: "",
    label: "COMMON BOOST",
    labelColor: "#6B7280",
    aura: "none",
  },
};

// CarRegisterScreenと同じカラーフィルター
const AVATAR_COLOR_FILTER: Record<string, { hue: string; sat: string; bright: string; sepia?: string }> = {
  white:    { hue: "0deg",   sat: "5%",   bright: "100%" },
  silver:   { hue: "0deg",   sat: "8%",   bright: "82%" },
  gray:     { hue: "0deg",   sat: "5%",   bright: "55%" },
  black:    { hue: "0deg",   sat: "0%",   bright: "12%" },
  red:      { hue: "355deg", sat: "400%", bright: "70%" },
  blue:     { hue: "195deg", sat: "300%", bright: "65%" },
  navy:     { hue: "210deg", sat: "350%", bright: "28%" },
  green:    { hue: "120deg", sat: "350%", bright: "45%" },
  bronze:   { hue: "30deg",  sat: "200%", bright: "60%", sepia: "60%" },
  orange:   { hue: "15deg",  sat: "400%", bright: "72%" },
};
function buildAvatarFilter(colorId: string, glowHex: string, glowSize = 16, extraFilter = ""): string {
  const f = AVATAR_COLOR_FILTER[colorId] ?? AVATAR_COLOR_FILTER.white;
  const sepia = f.sepia ? ` sepia(${f.sepia})` : "";
  return [
    `drop-shadow(0 0 ${glowSize}px ${glowHex}aa)`,
    `hue-rotate(${f.hue})`,
    `saturate(${f.sat})`,
    `brightness(${f.bright})`,
    sepia,
    extraFilter,
  ].join(" ").trim();
}

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
  const [distancePeriod, setDistancePeriod] = useState<"week" | "month">("week");
  const { avatar } = state;
  const equipped = avatar.equippedItem;
  const carConfig = state.carConfig;
  const carImgUrl = carConfig.imgUrl || "/car_images/car_crown.webp";
  const effect = equipped ? ITEM_VISUAL_EFFECT[equipped.rarity] : null;
  const carFilter = buildAvatarFilter(
    carConfig.color,
    effect ? effect.glowColor : "#9CA3AF",
    effect ? effect.glowSize : 8,
    effect ? effect.filterExtra : "",
  );

  const expPct = Math.min(100, Math.round((avatar.exp / (avatar.exp + avatar.expToNext)) * 100));
  const parseRecordDate = (dateLabel: string) => {
    const [month, day] = dateLabel.split(" ")[0].split("/").map(Number);
    return new Date(2026, month - 1, day);
  };
  const referenceDate = state.movementHistory.reduce<Date>(
    (latest, record) => {
      const recordDate = parseRecordDate(record.date);
      return recordDate > latest ? recordDate : latest;
    },
    new Date(2026, 0, 1),
  );
  const periodStartDate = new Date(referenceDate);
  periodStartDate.setDate(referenceDate.getDate() - 6);
  const displayedDistance = state.movementHistory
    .filter((record) => {
      const recordDate = parseRecordDate(record.date);
      if (distancePeriod === "month") {
        return recordDate.getMonth() === referenceDate.getMonth();
      }
      return recordDate >= periodStartDate && recordDate <= referenceDate;
    })
    .reduce((total, record) => total + record.distance, 0);
  const distanceLabel = distancePeriod === "week" ? "直近7日間" : `${referenceDate.getMonth() + 1}月`;
  const nextBoostMultiplier = equipped?.multiplier ?? 1.0;
  const nextBoostLabel = equipped?.name ?? "標準設定";
  const isLowDurability = equipped?.durability === 1;
  const nextBoostDetail = equipped
    ? isLowDurability ? "残り耐久 1回 · まもなく切れます" : `${nextBoostLabel} · 残り耐久 ${equipped.durability}回`
    : "装備なし · 標準倍率";

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
          style={{ minHeight: 410, background: "linear-gradient(135deg, #1A0533 0%, #2D0A5C 100%)" }}
        >
          {/* 車のビジュアル */}
          <div className="flex min-h-[190px] flex-col items-center justify-center py-4 overflow-visible">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              {/* オーラエフェクト（装備レアリティに応じて変化） */}
              {effect && effect.aura !== "none" && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: effect.aura, transform: "scaleX(1.5) scaleY(2)", transformOrigin: "bottom center" }}
                />
              )}
              <img
                src={carImgUrl}
                alt="マイカー"
                className="w-64 max-h-40 h-auto object-contain relative z-10"
                style={{ filter: carFilter }}
              />
              {/* 装備中アイテムのバッジ */}
              {equipped && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 z-20 flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black"
                  style={{ background: RARITY_CONFIG[equipped.rarity].border, color: RARITY_CONFIG[equipped.rarity].color, border: `1px solid ${RARITY_CONFIG[equipped.rarity].border}`, backdropFilter: "blur(4px)" }}
                >
                  <Sparkles size={8} />
                  {effect?.label}
                </motion.div>
              )}
            </motion.div>
            {/* 現在登録中のマイカー情報・変更導線 */}
            <motion.button
              type="button"
              onClick={() => setScreen("car-register")}
              whileTap={{ scale: 0.97 }}
              className="relative z-20 mt-1.5 flex flex-col items-center rounded-xl px-4 py-1.5 text-center transition-colors"
              style={{ background: "rgba(255,255,255,0.08)" }}
              aria-label="マイカーを変更する"
            >
              <div className="text-sm font-black tracking-wide text-white leading-tight">{carConfig.modelLabel}</div>
              <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-white/65">
                <span>{carConfig.colorLabel}</span>
                <span className="text-white/40">·</span>
                <span className="text-pink-200">タップして変更</span>
                <ChevronRight size={11} />
              </div>
            </motion.button>
          </div>

          {/* 車両情報 */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl px-3 py-2.5" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-bold text-white/55">走行距離</span>
                <div className="flex rounded-md p-0.5" style={{ background: "rgba(0,0,0,0.18)" }}>
                  {(["week", "month"] as const).map((period) => {
                    const isActive = distancePeriod === period;
                    return (
                      <button
                        key={period}
                        type="button"
                        onClick={() => setDistancePeriod(period)}
                        aria-pressed={isActive}
                        className="rounded px-1.5 py-0.5 text-[8px] font-black transition-colors"
                        style={{ background: isActive ? "#FFFFFF" : "transparent", color: isActive ? "#2D0A5C" : "rgba(255,255,255,0.55)" }}
                      >
                        {period === "week" ? "週別" : "月別"}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="mt-1 flex items-baseline gap-1 text-white">
                <span className="text-lg font-black">{displayedDistance.toFixed(1)}</span>
                <span className="text-[10px] font-bold text-white/60">km</span>
              </div>
              <div className="mt-0.5 text-[9px] font-bold text-white/45">{distanceLabel}の合計</div>
            </div>
            <div className="rounded-2xl px-3 py-2.5" style={{ background: "rgba(233,30,140,0.16)", border: "1px solid rgba(244,114,182,0.22)" }}>
              <div className="text-[10px] font-bold text-pink-100/75">次回ブースト</div>
              <div className="mt-1 flex items-baseline gap-1 text-white">
                <span className="text-lg font-black">×{nextBoostMultiplier.toFixed(1)}</span>
              </div>
              <div className="mt-0.5 truncate text-[9px] font-bold" style={{ color: isLowDurability ? "#FCA5A5" : "rgba(252,231,243,0.65)" }}>{nextBoostDetail}</div>
            </div>
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
                  <div className="text-xs mt-0.5" style={{ color: isLowDurability ? "#FCA5A5" : "rgba(255,255,255,0.6)" }}>
                    移動ポイント ×{equipped.multiplier} / 残り耐久 {equipped.durability}回{isLowDurability ? " · まもなく切れます" : ""}
                  </div>
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

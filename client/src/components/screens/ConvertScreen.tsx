import { useApp } from "@/contexts/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Coins, ArrowRight, Trophy, ChevronRight, X, ChevronDown } from "lucide-react";
import { useState } from "react";

// ================================================================
// ランク定義
// ================================================================
const RANKS = [
  { name: "ブロンズ",     minPt: 0,     color: "#CD7F32", glow: "rgba(205,127,50,0.4)"  },
  { name: "シルバー",     minPt: 2000,  color: "#A8A9AD", glow: "rgba(168,169,173,0.4)" },
  { name: "ゴールド",     minPt: 5000,  color: "#F59E0B", glow: "rgba(245,158,11,0.4)"  },
  { name: "プラチナ",     minPt: 10000, color: "#60A5FA", glow: "rgba(96,165,250,0.4)"  },
  { name: "ダイヤモンド", minPt: 20000, color: "#c084fc", glow: "rgba(192,132,252,0.4)" },
];

// ================================================================
// ランク特典テーブルデータ
// ================================================================
const RANK_BENEFITS = [
  {
    rank: RANKS[0],
    benefits: [
      { label: "ポイント還元率",   value: "1.0%",    highlight: false },
      { label: "ガチャ割引",       value: "なし",     highlight: false },
      { label: "ボーナスFuel",     value: "なし",     highlight: false },
      { label: "専用クーポン",     value: "月1枚",    highlight: false },
    ],
  },
  {
    rank: RANKS[1],
    benefits: [
      { label: "ポイント還元率",   value: "1.5%",    highlight: false },
      { label: "ガチャ割引",       value: "5% OFF",  highlight: true  },
      { label: "ボーナスFuel",     value: "+5/月",   highlight: false },
      { label: "専用クーポン",     value: "月2枚",   highlight: false },
    ],
  },
  {
    rank: RANKS[2],
    benefits: [
      { label: "ポイント還元率",   value: "2.0%",    highlight: true  },
      { label: "ガチャ割引",       value: "10% OFF", highlight: true  },
      { label: "ボーナスFuel",     value: "+10/月",  highlight: false },
      { label: "専用クーポン",     value: "月3枚",   highlight: false },
    ],
  },
  {
    rank: RANKS[3],
    benefits: [
      { label: "ポイント還元率",   value: "3.0%",    highlight: true  },
      { label: "ガチャ割引",       value: "15% OFF", highlight: true  },
      { label: "ボーナスFuel",     value: "+20/月",  highlight: true  },
      { label: "専用クーポン",     value: "月5枚",   highlight: false },
    ],
  },
  {
    rank: RANKS[4],
    benefits: [
      { label: "ポイント還元率",   value: "5.0%",    highlight: true  },
      { label: "ガチャ割引",       value: "20% OFF", highlight: true  },
      { label: "ボーナスFuel",     value: "+50/月",  highlight: true  },
      { label: "専用クーポン",     value: "月10枚",  highlight: true  },
    ],
  },
];

function getRankInfo(points: number) {
  let current = RANKS[0];
  let next: typeof RANKS[0] | null = RANKS[1];
  for (let i = 0; i < RANKS.length; i++) {
    if (points >= RANKS[i].minPt) {
      current = RANKS[i];
      next = RANKS[i + 1] ?? null;
    }
  }
  return { current, next };
}

// ================================================================
// ランクバッジ
// ================================================================
function RankBadge({ rank, size = "sm" }: { rank: typeof RANKS[0]; size?: "sm" | "lg" }) {
  const isSm = size === "sm";
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full font-black ${isSm ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"}`}
      style={{ background: `${rank.color}22`, border: `1.5px solid ${rank.color}`, color: rank.color, boxShadow: `0 0 8px ${rank.glow}` }}
    >
      <Trophy size={isSm ? 10 : 13} fill={rank.color} />
      {rank.name}
    </div>
  );
}

// ================================================================
// ランク特典モーダル
// ================================================================
function RankBenefitsModal({ currentRank, onClose }: { currentRank: typeof RANKS[0]; onClose: () => void }) {
  const [selectedRankIndex, setSelectedRankIndex] = useState(RANKS.findIndex(r => r.name === currentRank.name));
  const selected = RANK_BENEFITS[selectedRankIndex];

  return (
    <motion.div
      className="absolute inset-0 z-40 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="absolute bottom-0 left-0 right-0 rounded-t-3xl overflow-hidden"
        style={{ background: "#0D1B3E", border: "1px solid rgba(255,255,255,0.1)", maxHeight: "85%" }}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <div className="text-white font-black text-base">ランク特典一覧</div>
            <div className="text-white/40 text-xs mt-0.5">ランクをタップして特典を確認</div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
            <X size={16} color="rgba(255,255,255,0.6)" />
          </button>
        </div>

        {/* ランク選択タブ */}
        <div className="flex gap-2 px-5 pb-3 overflow-x-auto">
          {RANKS.map((rank, i) => {
            const isCurrentUser = rank.name === currentRank.name;
            const isSelected = i === selectedRankIndex;
            return (
              <button
                key={rank.name}
                onClick={() => setSelectedRankIndex(i)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-black transition-all relative"
                style={{
                  background: isSelected ? `${rank.color}22` : "rgba(255,255,255,0.05)",
                  border: isSelected ? `1.5px solid ${rank.color}` : "1px solid rgba(255,255,255,0.1)",
                  color: isSelected ? rank.color : "rgba(255,255,255,0.5)",
                }}
              >
                {rank.name}
                {isCurrentUser && (
                  <span className="absolute -top-1.5 -right-1 text-[8px] font-black px-1 rounded-full" style={{ background: rank.color, color: "#0D1B3E" }}>現在</span>
                )}
              </button>
            );
          })}
        </div>

        {/* 特典テーブル */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedRankIndex}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="px-5 pb-6"
          >
            {/* ランクバッジ */}
            <div className="flex items-center gap-2 mb-3">
              <RankBadge rank={selected.rank} size="lg" />
              <span className="text-white/40 text-xs">{selected.rank.minPt.toLocaleString()} pt〜</span>
            </div>

            {/* 特典リスト */}
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${selected.rank.color}33` }}>
              {selected.benefits.map((b, i) => (
                <div
                  key={b.label}
                  className="flex items-center justify-between px-4 py-3"
                  style={{
                    borderBottom: i < selected.benefits.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                    background: b.highlight ? `${selected.rank.color}08` : "transparent",
                  }}
                >
                  <span className="text-white/60 text-sm">{b.label}</span>
                  <span
                    className="font-black text-sm"
                    style={{ color: b.highlight ? selected.rank.color : "rgba(255,255,255,0.7)" }}
                  >
                    {b.value}
                  </span>
                </div>
              ))}
            </div>

            {/* 次ランクへの案内 */}
            {selectedRankIndex < RANKS.length - 1 && (
              <button
                onClick={() => setSelectedRankIndex(selectedRankIndex + 1)}
                className="w-full mt-3 py-2 rounded-xl flex items-center justify-center gap-1 text-xs font-bold"
                style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)" }}
              >
                次のランク（{RANKS[selectedRankIndex + 1].name}）の特典を見る
                <ChevronRight size={12} />
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ================================================================
// 次ランクプログレスバー
// ================================================================
function NextRankProgress({ current, next, points }: { current: typeof RANKS[0]; next: typeof RANKS[0] | null; points: number }) {
  if (!next) {
    return <div className="text-center py-2"><span className="text-white/40 text-xs">最高ランク達成中！</span></div>;
  }
  const range = next.minPt - current.minPt;
  const progress = points - current.minPt;
  const pct = Math.min(100, Math.round((progress / range) * 100));
  const remaining = next.minPt - points;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <RankBadge rank={current} size="sm" />
        <div className="flex items-center gap-1 text-white/30 text-[10px]">
          <ChevronRight size={10} />
          <span className="font-bold" style={{ color: next.color }}>次: {next.name}</span>
        </div>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${current.color}, ${next.color})` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        />
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-white/30 text-[10px]">{pct}% 達成</span>
        <span className="text-xs font-bold" style={{ color: next.color }}>
          あと {remaining.toLocaleString()} pt で{next.name}
        </span>
      </div>
    </div>
  );
}

// ================================================================
// メイン
// ================================================================
export default function ConvertScreen() {
  const { state, setScreen, convertToPoints } = useApp();
  const gain = Math.floor(state.fuel * 10);
  const afterPoints = state.points + gain;
  const { current: currentRank, next: nextRank } = getRankInfo(afterPoints);
  const { current: beforeRank } = getRankInfo(state.points);
  const rankUp = currentRank.name !== beforeRank.name;
  const [showBenefits, setShowBenefits] = useState(false);

  const handleConvert = () => {
    convertToPoints();
    setScreen("convert-done");
  };

  return (
    <div className="w-full h-full relative flex flex-col overflow-y-auto" style={{ background: "linear-gradient(180deg, #0D1B3E 0%, #0a1e0a 100%)" }}>
      {/* ランク特典モーダル */}
      <AnimatePresence>
        {showBenefits && (
          <RankBenefitsModal currentRank={currentRank} onClose={() => setShowBenefits(false)} />
        )}
      </AnimatePresence>

      {/* ヘッダー */}
      <div className="flex items-center px-5 pt-10 pb-4 flex-shrink-0">
        <button onClick={() => setScreen("choose")} className="p-2 rounded-full mr-3" style={{ background: "rgba(255,255,255,0.08)" }}>
          <ArrowLeft size={18} color="white" />
        </button>
        <div className="text-white font-black text-xl">ポイントに変換</div>
      </div>

      <div className="px-5 flex flex-col gap-4 pb-8">
        {/* Fuel → ポイント変換カード */}
        <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-center">
              <div className="text-white/50 text-xs mb-1">現在のFuel</div>
              <div className="text-4xl font-black text-amber-400">{state.fuel}</div>
            </div>
            <ArrowRight size={24} color="rgba(255,255,255,0.3)" />
            <div className="text-center">
              <div className="text-white/50 text-xs mb-1">獲得ポイント</div>
              <div className="text-4xl font-black text-green-400">+{gain.toLocaleString()}</div>
              <div className="text-green-400/60 text-xs">pt</div>
            </div>
          </div>
          <div className="text-center text-white/30 text-xs">1 Fuel = 10 TOYOTAポイント</div>
        </div>

        {/* 変換後の保有ポイント */}
        <div className="rounded-xl p-4" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <div className="text-white/60 text-xs mb-1">変換後の保有ポイント</div>
          <div className="text-white font-bold text-2xl">{afterPoints.toLocaleString()} pt</div>
          {rankUp && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-2 flex items-center gap-1.5">
              <span className="text-xs text-amber-300 font-bold">🎉 この変換でランクアップ！</span>
              <RankBadge rank={currentRank} size="sm" />
            </motion.div>
          )}
        </div>

        {/* ランク・次ランクまで（タップで特典一覧） */}
        <button
          onClick={() => setShowBenefits(true)}
          className="w-full rounded-2xl p-4 text-left transition-all active:scale-[0.98]"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Trophy size={13} color="#F59E0B" />
              <span className="text-amber-400 text-xs font-bold tracking-wide">ランク状況（変換後）</span>
            </div>
            <div className="flex items-center gap-1 text-white/30 text-[10px]">
              <span>特典を見る</span>
              <ChevronDown size={11} />
            </div>
          </div>
          <NextRankProgress current={currentRank} next={nextRank} points={afterPoints} />
        </button>

        {/* 変換ボタン */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleConvert}
          className="w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #10B981, #059669)", color: "white", boxShadow: "0 4px 20px rgba(16,185,129,0.4)" }}
        >
          <Coins size={20} />
          変換を確定する
        </motion.button>
      </div>
    </div>
  );
}


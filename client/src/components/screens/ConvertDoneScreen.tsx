import { useApp } from "@/contexts/AppContext";
import { motion } from "framer-motion";
import { Home, Trophy, ChevronRight } from "lucide-react";

// ================================================================
// ランク定義（ConvertScreenと同一）
// ================================================================
const RANKS = [
  { name: "ブロンズ",     minPt: 0,     color: "#CD7F32", glow: "rgba(205,127,50,0.4)"  },
  { name: "シルバー",     minPt: 2000,  color: "#A8A9AD", glow: "rgba(168,169,173,0.4)" },
  { name: "ゴールド",     minPt: 5000,  color: "#F59E0B", glow: "rgba(245,158,11,0.4)"  },
  { name: "プラチナ",     minPt: 10000, color: "#60A5FA", glow: "rgba(96,165,250,0.4)"  },
  { name: "ダイヤモンド", minPt: 20000, color: "#c084fc", glow: "rgba(192,132,252,0.4)" },
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
// 今月累計（デモ固定値 + 今回変換分）
// ================================================================
const MONTHLY_BASE_PT = 840; // デモ：今月の既存累計

// ================================================================
// メイン
// ================================================================
export default function ConvertDoneScreen() {
  const { state, setScreen } = useApp();
  const { current: rank, next: nextRank } = getRankInfo(state.points);
  const monthlyTotal = MONTHLY_BASE_PT + state.points; // デモ簡略
  const remaining = nextRank ? nextRank.minPt - state.points : 0;
  const range = nextRank ? nextRank.minPt - rank.minPt : 1;
  const progress = state.points - rank.minPt;
  const pct = nextRank ? Math.min(100, Math.round((progress / range) * 100)) : 100;

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto" style={{ background: "linear-gradient(180deg, #0D1B3E 0%, #0a1e0a 100%)" }}>
      <div className="flex flex-col items-center pt-10 px-6 pb-6">
        {/* チェックマーク */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="text-center mb-4"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-6xl mb-3"
          >
            ✅
          </motion.div>
          <div className="text-2xl font-black text-white mb-1">変換完了！</div>
          <div className="text-white/50 text-sm">TOYOTAポイントに変換しました</div>
        </motion.div>

        {/* 保有ポイント */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="w-full rounded-2xl px-5 py-4 mb-3 text-center"
          style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}
        >
          <div className="text-white/60 text-xs mb-1">保有ポイント</div>
          <div className="text-5xl font-black text-green-400">{state.points.toLocaleString()}</div>
          <div className="text-green-400/60 text-sm mt-1">pt</div>
        </motion.div>

        {/* 今月の累計獲得ポイント */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="w-full rounded-2xl px-5 py-4 mb-3"
          style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-amber-400 text-xs font-bold">📅 今月の累計獲得ポイント</span>
          </div>
          <div className="text-amber-400 font-black text-3xl">{monthlyTotal.toLocaleString()} <span className="text-base font-bold text-amber-400/60">pt</span></div>
          <div className="text-white/30 text-[10px] mt-1">デモ値：先月比 +{Math.round(monthlyTotal * 0.18).toLocaleString()} pt</div>
        </motion.div>

        {/* ランク＋次ランクまで */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="w-full rounded-2xl px-5 py-4 mb-5"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center gap-1.5 mb-3">
            <Trophy size={13} color={rank.color} />
            <span className="text-xs font-bold" style={{ color: rank.color }}>現在のランク</span>
          </div>
          {/* ランクバッジ */}
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-sm mb-3"
            style={{ background: `${rank.color}22`, border: `1.5px solid ${rank.color}`, color: rank.color, boxShadow: `0 0 12px ${rank.glow}` }}
          >
            <Trophy size={14} fill={rank.color} />
            {rank.name}
          </div>

          {nextRank ? (
            <>
              {/* プログレスバー */}
              <div className="h-2 rounded-full overflow-hidden mb-1.5" style={{ background: "rgba(255,255,255,0.08)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${rank.color}, ${nextRank.color})` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: 0.5, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/30 text-[10px]">{pct}% 達成</span>
                <div className="flex items-center gap-1">
                  <ChevronRight size={10} color={nextRank.color} />
                  <span className="text-xs font-bold" style={{ color: nextRank.color }}>
                    あと {remaining.toLocaleString()} pt で{nextRank.name}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-white/40 text-xs text-center py-1">最高ランク達成中！</div>
          )}
        </motion.div>

        {/* ホームに戻るボタン */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setScreen("home")}
          className="flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-white"
          style={{ background: "linear-gradient(135deg, #E60012, #ff4444)", boxShadow: "0 4px 20px rgba(230,0,18,0.4)" }}
        >
          <Home size={18} />
          ホームに戻る
        </motion.button>
      </div>
    </div>
  );
}


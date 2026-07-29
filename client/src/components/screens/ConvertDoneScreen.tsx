import { useApp } from "@/contexts/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Trophy, ChevronRight, X } from "lucide-react";
import { useState, useRef } from "react";
import { useEffect } from "react";

// ================================================================
// ランク定義
// ================================================================
const RANKS = [
  { name: "ブロンズ",     minPt: 0,     color: "#CD7F32", glow: "rgba(205,127,50,0.5)"  },
  { name: "シルバー",     minPt: 2000,  color: "#A8A9AD", glow: "rgba(168,169,173,0.5)" },
  { name: "ゴールド",     minPt: 5000,  color: "#F59E0B", glow: "rgba(245,158,11,0.5)"  },
  { name: "プラチナ",     minPt: 10000, color: "#60A5FA", glow: "rgba(96,165,250,0.5)"  },
  { name: "ダイヤモンド", minPt: 20000, color: "#c084fc", glow: "rgba(192,132,252,0.5)" },
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
// 紙吹雪
// ================================================================
function Confetti({ active }: { active: boolean }) {
  const particles = useRef(
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 1.2,
      duration: 2 + Math.random() * 1.5,
      color: ["#F59E0B", "#a855f7", "#60A5FA", "#34D399", "#F87171", "#ffffff", "#CD7F32"][Math.floor(Math.random() * 7)],
      size: 5 + Math.random() * 7,
      rotate: Math.random() * 360,
      shape: Math.random() > 0.5 ? "rect" : "circle",
    }))
  ).current;

  if (!active) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className={p.shape === "circle" ? "absolute rounded-full" : "absolute rounded-sm"}
          style={{ left: `${p.x}%`, top: -12, width: p.size, height: p.shape === "circle" ? p.size : p.size * 0.55, background: p.color, rotate: p.rotate }}
          initial={{ y: -12, opacity: 1 }}
          animate={{ y: "110vh", opacity: [1, 1, 0.2] }}
          transition={{ duration: p.duration, delay: p.delay, ease: "linear" }}
        />
      ))}
    </div>
  );
}

// ================================================================
// ランクアップモーダル
// ================================================================
function RankUpModal({ rank, onClose }: { rank: typeof RANKS[0]; onClose: () => void }) {
  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="relative mx-6 rounded-3xl px-6 py-8 text-center"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${rank.color}22 0%, #0D1B3E 70%)`,
          border: `2px solid ${rank.color}`,
          boxShadow: `0 0 40px ${rank.glow}, 0 0 80px ${rank.glow}40`,
        }}
      >
        {/* 閉じるボタン */}
        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
          <X size={14} color="rgba(255,255,255,0.6)" />
        </button>

        {/* RANK UP テキスト */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xs font-black tracking-widest mb-2"
          style={{ color: rank.color }}
        >
          🎊 RANK UP!
        </motion.div>

        {/* ランクバッジ（大） */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: [0.5, 1.15, 1], opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xl mb-4"
          style={{
            background: `${rank.color}22`,
            border: `2px solid ${rank.color}`,
            color: rank.color,
            boxShadow: `0 0 24px ${rank.glow}`,
          }}
        >
          <Trophy size={24} fill={rank.color} />
          {rank.name}
        </motion.div>

        {/* 説明文 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white/70 text-sm leading-relaxed mb-6"
        >
          おめでとうございます！<br />
          <span style={{ color: rank.color }} className="font-bold">{rank.name}ランク</span>に昇格しました。<br />
          新しい特典が解放されました！
        </motion.div>

        {/* タップして閉じる */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="w-full py-3 rounded-2xl font-bold text-sm"
          style={{ background: `linear-gradient(135deg, ${rank.color}, ${rank.color}99)`, color: "#0D1B3E" }}
        >
          確認する
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ================================================================
// 今月累計（デモ固定値）
// ================================================================
const MONTHLY_BASE_PT = 840;

// ================================================================
// メイン
// ================================================================
export default function ConvertDoneScreen() {
  const { state, setScreen } = useApp();
  const { current: rank, next: nextRank } = getRankInfo(state.points);
  const monthlyTotal = MONTHLY_BASE_PT + state.points;
  const remaining = nextRank ? nextRank.minPt - state.points : 0;
  const range = nextRank ? nextRank.minPt - rank.minPt : 1;
  const progress = state.points - rank.minPt;
  const pct = nextRank ? Math.min(100, Math.round((progress / range) * 100)) : 100;

  // ランクアップ判定：変換前のポイントを保持する（デモ用：state.pointsから逆算）
  // デモ簡略：1240pt → 変換後 = state.points。ランクが変わった場合にモーダル表示
  const prevPoints = 1240; // デモ固定の変換前ポイント
  const { current: prevRank } = getRankInfo(prevPoints);
  const isRankUp = rank.name !== prevRank.name && state.points > prevPoints;

  const [showModal, setShowModal] = useState(isRankUp);
  const [showConfetti, setShowConfetti] = useState(isRankUp);

  // ポイントカウントアップアニメーション（0 → state.points）
  const [displayPoints, setDisplayPoints] = useState(0);
  const [countUpDone, setCountUpDone] = useState(false);
  const animFrameRef = useRef<number | null>(null);
  useEffect(() => {
    const target = state.points;
    if (target === 0) { setDisplayPoints(0); return; }
    const duration = 1400; // ms
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayPoints(Math.round(target * eased));
      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayPoints(target);
        setCountUpDone(true);
      }
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [state.points]);

  return (
    <div className="w-full h-full relative flex flex-col overflow-y-auto" style={{ background: "linear-gradient(180deg, #0D1B3E 0%, #0a1e0a 100%)" }}>
      {/* 紙吹雪 */}
      <Confetti active={showConfetti} />

      {/* ランクアップモーダル */}
      <AnimatePresence>
        {showModal && (
          <RankUpModal rank={rank} onClose={() => { setShowModal(false); setShowConfetti(false); }} />
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center pt-10 px-6 pb-nav">
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
          style={{
            background: "rgba(16,185,129,0.15)",
            border: `1px solid ${countUpDone ? "rgba(16,185,129,0.7)" : "rgba(16,185,129,0.3)"}`,
            boxShadow: countUpDone ? "0 0 24px rgba(16,185,129,0.35), 0 0 48px rgba(16,185,129,0.15)" : "none",
            transition: "box-shadow 0.5s ease-out, border-color 0.5s ease-out",
          }}
        >
          <div className="text-white/60 text-xs mb-1">保有ポイント</div>
          <motion.div
            className="text-5xl font-black text-green-400"
            animate={countUpDone ? { scale: [1, 1.18, 0.96, 1.06, 1], y: [0, -6, 2, -3, 0] } : {}}
            transition={countUpDone ? { duration: 0.55, ease: [0.23, 1, 0.32, 1] } : {}}
          >
            {displayPoints.toLocaleString()}
          </motion.div>
          {displayPoints < state.points && (
            <motion.div
              className="flex items-center justify-center gap-1 mt-1"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            >
              <div className="w-1 h-1 rounded-full bg-green-400" />
              <div className="w-1 h-1 rounded-full bg-green-400" />
              <div className="w-1 h-1 rounded-full bg-green-400" />
            </motion.div>
          )}
          {countUpDone && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 1, 0.8] }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xs font-bold mt-1"
              style={{ color: "rgba(52,211,153,0.8)" }}
            >
              ✨ 獲得完了！
            </motion.div>
          )}
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
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-sm mb-3"
            style={{ background: `${rank.color}22`, border: `1.5px solid ${rank.color}`, color: rank.color, boxShadow: `0 0 12px ${rank.glow}` }}
          >
            <Trophy size={14} fill={rank.color} />
            {rank.name}
          </div>
          {nextRank ? (
            <>
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

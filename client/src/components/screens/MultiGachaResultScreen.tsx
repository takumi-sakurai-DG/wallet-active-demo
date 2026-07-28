import { useApp, GachaResult } from "@/contexts/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Home, RotateCcw, Zap, Trophy, ChevronsRight } from "lucide-react";

// ================================================================
// サマリーFuelフラッシュ数値（単発ガチャと体験統一）
// ================================================================
function SummaryFuelFlash({ totalFuelChange, currentFuel }: { totalFuelChange: number; currentFuel: number }) {
  const isIncrease = totalFuelChange >= 0;
  const flashColor = isIncrease ? "#34D399" : "#F87171";
  const glowColor  = isIncrease ? "rgba(52,211,153,0.6)" : "rgba(248,113,113,0.6)";

  return (
    <div className="flex flex-col items-center">
      <div className="text-white/40 text-[10px] mb-0.5">合計Fuel変化</div>
      {/* 変化量フラッシュ */}
      <motion.div
        initial={{ y: -12, opacity: 0, scale: 1.4 }}
        animate={{ y: [-12, 0, 3, 0], opacity: [0, 1, 1, 0.8], scale: [1.4, 1.1, 1.02, 1] }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
        className="font-black text-base flex items-center gap-0.5"
        style={{ color: flashColor, textShadow: `0 0 12px ${glowColor}` }}
      >
        <Zap size={11} fill={flashColor} color={flashColor} />
        {isIncrease ? "+" : ""}{totalFuelChange}
      </motion.div>
      {/* 現在Fuel：バウンス＋グロー */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{
          scale: [0.7, 1.3, 0.94, 1.1, 1],
          opacity: [0, 1, 1, 1, 1],
          textShadow: [
            `0 0 0px ${glowColor}`,
            `0 0 24px ${glowColor}, 0 0 48px ${glowColor}`,
            `0 0 10px ${glowColor}`,
            `0 0 16px ${glowColor}`,
            `0 0 3px ${glowColor}`,
          ],
        }}
        transition={{ duration: 0.65, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="font-black text-xs mt-0.5"
        style={{ color: "#F59E0B" }}
      >
        現在: {currentFuel}
      </motion.div>
      {/* 波紋リング */}
      <motion.div
        initial={{ scale: 0.4, opacity: 0.7 }}
        animate={{ scale: 2.0, opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
        className="absolute rounded-full pointer-events-none"
        style={{ width: 44, height: 44, border: `1.5px solid ${flashColor}` }}
      />
    </div>
  );
}

// ================================================================
// 結果ごとのカラー・ランク定義
// ================================================================
const RESULT_STYLE: Record<string, { color: string; glow: string; bg: string; tier: string; icon: string }> = {
  jackpot:  { color: "#F59E0B", glow: "rgba(245,158,11,0.6)",  bg: "rgba(245,158,11,0.12)",  tier: "LEGENDARY", icon: "🎉" },
  "fuel-up-big": { color: "#a855f7", glow: "rgba(168,85,247,0.5)", bg: "rgba(168,85,247,0.1)", tier: "EPIC", icon: "⚡" },
  "fuel-up": { color: "#60A5FA", glow: "rgba(96,165,250,0.4)",  bg: "rgba(96,165,250,0.08)", tier: "RARE",      icon: "✨" },
  "fuel-down": { color: "#F87171", glow: "rgba(248,113,113,0.3)", bg: "rgba(248,113,113,0.06)", tier: "MISS",   icon: "▼" },
  boost:    { color: "#E60012", glow: "rgba(230,0,18,0.4)",    bg: "rgba(230,0,18,0.08)",    tier: "SPECIAL",   icon: "🚀" },
};

function getStyle(result: GachaResult) {
  if (result.type === "jackpot") return RESULT_STYLE.jackpot;
  if (result.type === "fuel-up" && result.fuelChange >= 30) return RESULT_STYLE["fuel-up-big"];
  if (result.type === "fuel-up") return RESULT_STYLE["fuel-up"];
  if (result.type === "fuel-down") return RESULT_STYLE["fuel-down"];
  if (result.type === "boost") return RESULT_STYLE.boost;
  return RESULT_STYLE["fuel-up"];
}

// ================================================================
// 紙吹雪パーティクル（JACKPOT含む場合）
// ================================================================
function Confetti({ active }: { active: boolean }) {
  const particles = useRef(
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 1.5,
      duration: 1.8 + Math.random() * 1.2,
      color: ["#F59E0B", "#a855f7", "#60A5FA", "#34D399", "#F87171", "#ffffff"][Math.floor(Math.random() * 6)],
      size: 4 + Math.random() * 6,
      rotate: Math.random() * 360,
    }))
  ).current;

  if (!active) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{ left: `${p.x}%`, top: -10, width: p.size, height: p.size * 0.6, background: p.color, rotate: p.rotate }}
          initial={{ y: -10, opacity: 1 }}
          animate={{ y: "110vh", opacity: [1, 1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, ease: "linear" }}
        />
      ))}
    </div>
  );
}

// ================================================================
// 個別結果カード
// ================================================================
function ResultCard({ result, index, revealed }: { result: GachaResult; index: number; revealed: boolean }) {
  const style = getStyle(result);
  return (
    <AnimatePresence>
      {revealed && (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
          className="rounded-xl px-3 py-3 flex items-center gap-3"
          style={{
            background: style.bg,
            border: `1.5px solid ${style.color}55`,
            boxShadow: result.type === "jackpot" ? `0 0 16px ${style.glow}` : "none",
          }}
        >
          {/* 番号 */}
          <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black"
            style={{ background: `${style.color}22`, color: style.color }}>
            {index + 1}
          </div>
          {/* アイコン */}
          <div className="text-2xl flex-shrink-0 leading-none">{style.icon}</div>
          {/* ラベル・説明 */}
          <div className="flex-1 min-w-0">
            <div className="font-black text-sm leading-tight" style={{ color: style.color }}>{result.label}</div>
            <div className="text-white/50 text-[10px] mt-0.5 truncate">{result.description}</div>
          </div>
          {/* Fuel変化 */}
          <div className="flex-shrink-0 text-right">
            {result.fuelChange !== 0 && (
              <div className="flex items-center gap-0.5">
                <Zap size={10} fill={result.fuelChange > 0 ? "#F59E0B" : "#F87171"} color={result.fuelChange > 0 ? "#F59E0B" : "#F87171"} />
                <span className="font-black text-sm" style={{ color: result.fuelChange > 0 ? "#F59E0B" : "#F87171" }}>
                  {result.fuelChange > 0 ? "+" : ""}{result.fuelChange}
                </span>
              </div>
            )}
            {result.type === "boost" && (
              <div className="text-[10px] font-bold text-red-400">×2.0</div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ================================================================
// メイン
// ================================================================
export default function MultiGachaResultScreen() {
  const { state, setScreen } = useApp();
  const results = state.multiGachaResults;
  const [revealedCount, setRevealedCount] = useState(0);
  const [allRevealed, setAllRevealed] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasJackpot = results.some(r => r.type === "jackpot");
  const totalFuelChange = results.reduce((sum, r) => sum + r.fuelChange, 0);
  const jackpotCount = results.filter(r => r.type === "jackpot").length;
  const winCount = results.filter(r => r.type === "fuel-up" || r.type === "jackpot" || r.type === "boost").length;

  // カードを順番に表示
  useEffect(() => {
    if (results.length === 0) return;
    intervalRef.current = setInterval(() => {
      setRevealedCount(prev => {
        if (prev >= results.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setAllRevealed(true);
          return prev;
        }
        return prev + 1;
      });
    }, 180);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [results.length]);

  // スキップ：全カードを即時表示
  const handleSkip = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRevealedCount(results.length);
    setAllRevealed(true);
  };

  if (results.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(180deg, #0D1B3E 0%, #1a0a2e 100%)" }}>
        <div className="text-white/40 text-sm">結果がありません</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative flex flex-col overflow-hidden" style={{ background: "linear-gradient(180deg, #0D1B3E 0%, #1a0a2e 100%)" }}>
      <Confetti active={hasJackpot && allRevealed} />

      {/* ヘッダー */}
      <div className="px-5 pt-8 pb-3 flex-shrink-0">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative text-center"
        >
          {/* スキップボタン（未完了時のみ表示） */}
          {!allRevealed && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleSkip}
              className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.5)" }}
            >
              スキップ
              <ChevronsRight size={13} />
            </motion.button>
          )}
          <div className="text-white/40 text-xs font-bold tracking-widest mb-1">
            {results.length}連ガチャ 結果
          </div>
          <div className="text-white font-black text-2xl">
            {hasJackpot ? "🎉 JACKPOT含み！" : winCount >= results.length * 0.7 ? "✨ 好結果！" : "結果発表"}
          </div>
        </motion.div>
      </div>

      {/* カード一覧（スクロール可能） */}
      <div className="flex-1 overflow-y-auto px-5 pb-3">
        <div className="flex flex-col gap-2">
          {results.map((result, i) => (
            <ResultCard key={i} result={result} index={i} revealed={i < revealedCount} />
          ))}
        </div>
      </div>

      {/* サマリー */}
      <AnimatePresence>
        {allRevealed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="flex-shrink-0 mx-5 mb-3 rounded-2xl px-4 py-3"
            style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="relative flex items-center justify-center">
                  <SummaryFuelFlash totalFuelChange={totalFuelChange} currentFuel={state.fuel} />
                </div>
              </div>
              <div>
                <div className="text-white/40 text-[10px] mb-0.5">当選数</div>
                <div className="font-black text-lg text-green-400">{winCount}<span className="text-white/40 text-xs font-normal">/{results.length}</span></div>
              </div>
              <div>
                <div className="text-white/40 text-[10px] mb-0.5">JACKPOT</div>
                <div className="font-black text-lg" style={{ color: jackpotCount > 0 ? "#F59E0B" : "rgba(255,255,255,0.2)" }}>
                  {jackpotCount > 0 ? (
                    <span className="flex items-center justify-center gap-0.5">
                      <Trophy size={14} fill="#F59E0B" color="#F59E0B" />
                      {jackpotCount}回
                    </span>
                  ) : "なし"}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ボタン */}
      <AnimatePresence>
        {allRevealed && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="flex-shrink-0 px-5 pb-8 flex gap-3"
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setScreen("gacha")}
              className="flex-1 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm"
              style={{ background: "rgba(168,85,247,0.2)", border: "1.5px solid rgba(168,85,247,0.5)", color: "#c084fc" }}
            >
              <RotateCcw size={15} />
              もう一度
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setScreen("home")}
              className="flex-1 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm text-white"
              style={{ background: "linear-gradient(135deg, #E60012, #ff4444)", boxShadow: "0 4px 16px rgba(230,0,18,0.4)" }}
            >
              <Home size={15} />
              ホームへ
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

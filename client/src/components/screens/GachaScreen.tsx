import { useApp, GachaResult } from "@/contexts/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, Info } from "lucide-react";

const ROULETTE_ITEMS = ["⚡", "✨", "🎉", "▲", "▼", "🚀", "⚡", "✨", "🎉"];

// ---- 確率テーブル定義（GACHA_WEIGHTSと同期） ----
// 合計 = 5+10+25+30+20+10 = 100
const PROB_TABLE = [
  { icon: "🎉", label: "JACKPOT",    reward: "Fuel +50 / ブースト×2.0", prob: 5,  color: "#F59E0B", tier: "LEGENDARY" },
  { icon: "⚡", label: "BIG WIN",    reward: "Fuel +30 / ブースト×1.5", prob: 10, color: "#a855f7", tier: "EPIC"      },
  { icon: "✨", label: "WIN",        reward: "Fuel +15",                 prob: 25, color: "#60A5FA", tier: "RARE"      },
  { icon: "▲", label: "SMALL WIN",  reward: "Fuel +5",                  prob: 30, color: "#34D399", tier: "COMMON"    },
  { icon: "▼", label: "MISS",       reward: "Fuel −10",                 prob: 20, color: "#F87171", tier: "MISS"      },
  { icon: "🚀", label: "BOOST UP",  reward: "次回ブースト×2.0",          prob: 10, color: "#E60012", tier: "SPECIAL"   },
];

// ---- 確率バー ----
function ProbBar({ prob, color }: { prob: number; color: string }) {
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${prob}%` }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        />
      </div>
      <span className="text-white/60 text-xs font-bold w-8 text-right">{prob}%</span>
    </div>
  );
}

// ---- 折りたたみ確率テーブル ----
function ProbabilityTable({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <div className="w-full px-5 mt-6">
      {/* トグルボタン */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all"
        style={{
          background: open ? "rgba(168,85,247,0.12)" : "rgba(255,255,255,0.05)",
          border: `1px solid ${open ? "rgba(168,85,247,0.4)" : "rgba(255,255,255,0.1)"}`,
        }}
      >
        <div className="flex items-center gap-2">
          <Info size={14} color={open ? "#c084fc" : "rgba(255,255,255,0.4)"} />
          <span className="text-xs font-bold" style={{ color: open ? "#c084fc" : "rgba(255,255,255,0.5)" }}>
            排出確率を確認する
          </span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown size={14} color={open ? "#c084fc" : "rgba(255,255,255,0.3)"} />
        </motion.div>
      </button>

      {/* テーブル本体（AnimatePresence で展開） */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="prob-table"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-xl overflow-hidden" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(168,85,247,0.2)" }}>
              {/* ヘッダー行 */}
              <div className="grid grid-cols-[28px_1fr_1fr] gap-2 px-3 py-2 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <span className="text-white/30 text-[10px] font-bold">絵柄</span>
                <span className="text-white/30 text-[10px] font-bold">報酬</span>
                <span className="text-white/30 text-[10px] font-bold">確率</span>
              </div>
              {/* データ行 */}
              {PROB_TABLE.map((row, i) => (
                <motion.div
                  key={row.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                  className="grid grid-cols-[28px_1fr_1fr] gap-2 items-center px-3 py-2.5"
                  style={{
                    borderBottom: i < PROB_TABLE.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    background: row.tier === "LEGENDARY" ? "rgba(245,158,11,0.05)" : "transparent",
                  }}
                >
                  {/* アイコン */}
                  <div className="text-base leading-none">{row.icon}</div>
                  {/* ラベル＋報酬 */}
                  <div>
                    <div className="text-xs font-black leading-none" style={{ color: row.color }}>
                      {row.label}
                    </div>
                    <div className="text-white/40 text-[10px] mt-0.5 leading-tight">{row.reward}</div>
                  </div>
                  {/* 確率バー */}
                  <ProbBar prob={row.prob} color={row.color} />
                </motion.div>
              ))}
              {/* フッター注記 */}
              <div className="px-3 py-2 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <p className="text-white/25 text-[9px] leading-relaxed">
                  ※ 確率は各ガチャ独立試行です。過去の結果は次回に影響しません。<br />
                  ※ このデモは提案用プロトタイプです。実際の確率設計とは異なります。
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---- メイン ----
export default function GachaScreen() {
  const { state, setScreen, spinGacha, applyGachaResult } = useApp();
  const [spinning, setSpinning] = useState(false);
  const [offset, setOffset] = useState(0);
  const [done, setDone] = useState(false);
  const [probOpen, setProbOpen] = useState(false);

  const handleSpin = () => {
    if (spinning || done) return;
    setSpinning(true);
    const result: GachaResult = spinGacha();
    const spins = 5 + Math.random() * 3;
    const finalOffset = -(spins * ROULETTE_ITEMS.length * 60);
    setOffset(finalOffset);
    setTimeout(() => {
      setSpinning(false);
      setDone(true);
      applyGachaResult(result);
      setTimeout(() => setScreen("gacha-result"), 800);
    }, 2000);
  };

  return (
    <div className="w-full h-full flex flex-col items-center overflow-y-auto" style={{ background: "linear-gradient(180deg, #0D1B3E 0%, #1a0a2e 100%)" }}>
      {/* ヘッダー */}
      <div className="flex items-center w-full px-5 pt-10 pb-4 flex-shrink-0">
        <button onClick={() => setScreen("choose")} className="p-2 rounded-full mr-3" style={{ background: "rgba(255,255,255,0.08)" }}>
          <ArrowLeft size={18} color="white" />
        </button>
        <div>
          <div className="text-white font-black text-xl">ガチャに挑戦！</div>
          <div className="text-white/40 text-xs mt-0.5">現在のFuel: {state.fuel}</div>
        </div>
      </div>

      <div className="text-white/50 text-sm mb-8">Fuel 10を消費してガチャを回す</div>

      {/* ルーレット */}
      <div className="relative w-64 overflow-hidden rounded-2xl flex-shrink-0" style={{ height: 80, background: "rgba(0,0,0,0.4)", border: "2px solid rgba(168,85,247,0.5)" }}>
        <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: "linear-gradient(90deg, rgba(13,27,62,0.9) 0%, transparent 30%, transparent 70%, rgba(13,27,62,0.9) 100%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-xl z-20 pointer-events-none" style={{ border: "2px solid #a855f7", boxShadow: "0 0 20px rgba(168,85,247,0.5)" }} />
        <motion.div
          className="flex items-center"
          style={{ height: 80 }}
          animate={{ x: offset }}
          transition={spinning ? { duration: 2, ease: [0.25, 0.1, 0.25, 1] } : { duration: 0 }}
        >
          {[...ROULETTE_ITEMS, ...ROULETTE_ITEMS, ...ROULETTE_ITEMS, ...ROULETTE_ITEMS, ...ROULETTE_ITEMS].map((item, i) => (
            <div key={i} className="flex-shrink-0 w-16 h-16 flex items-center justify-center text-3xl mx-1">
              {item}
            </div>
          ))}
        </motion.div>
      </div>

      {/* スピンボタン */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleSpin}
        disabled={spinning || done}
        className="mt-10 px-12 py-4 rounded-2xl font-black text-lg transition-all flex-shrink-0"
        style={{
          background: spinning || done ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, #a855f7, #7c3aed)",
          color: "white",
          boxShadow: spinning || done ? "none" : "0 4px 20px rgba(168,85,247,0.5)",
        }}
      >
        {spinning ? "回転中..." : done ? "結果へ..." : "SPIN!"}
      </motion.button>

      {spinning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="mt-6 text-purple-300 text-sm font-bold tracking-widest"
        >
          ドキドキ...
        </motion.div>
      )}

      {/* 折りたたみ確率テーブル */}
      {!spinning && !done && (
        <ProbabilityTable open={probOpen} onToggle={() => setProbOpen(v => !v)} />
      )}

      {/* 下部余白 */}
      <div className="h-8 flex-shrink-0" />
    </div>
  );
}

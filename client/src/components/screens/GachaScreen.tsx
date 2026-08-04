import { useApp } from "@/contexts/AppContext";
import type { GachaResult } from "@/contexts/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Zap, Star, Crown, Package, ChevronDown } from "lucide-react";
import { useState, useCallback } from "react";

// ================================================================
// GachaScreen — ポイント消費型ガチャ（アイテム取得）
// ================================================================

const RARITY_STYLE: Record<GachaResult["type"], { bg: string; border: string; color: string; icon: React.ReactNode; label: string; pct: string }> = {
  legendary: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.5)", color: "#B45309", icon: <Crown size={14} />, label: "LEGENDARY", pct: "5%" },
  epic:      { bg: "rgba(168,85,247,0.08)",  border: "rgba(168,85,247,0.4)", color: "#7C3AED", icon: <Zap size={14} />,   label: "EPIC",      pct: "18%" },
  rare:      { bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.4)", color: "#1D4ED8", icon: <Star size={14} />,  label: "RARE",      pct: "25%" },
  common:    { bg: "rgba(0,0,0,0.03)",       border: "rgba(0,0,0,0.10)",     color: "#374151", icon: <Package size={14} />, label: "COMMON",  pct: "52%" },
};

const GACHA_MODES = [
  { count: 1,  cost: 10, label: "1回",  sub: "10 pt",  badge: null },
  { count: 3,  cost: 28, label: "3回",  sub: "28 pt",  badge: null },
  { count: 10, cost: 80, label: "10回", sub: "80 pt",  badge: "RARE確定" },
] as const;

export default function GachaScreen() {
  const { state, setScreen, spinGacha, applyGachaResult, applyMultiGachaResults, setPreferredGachaMode } = useApp();
  const [selectedMode, setSelectedMode] = useState<1 | 3 | 10>(state.preferredGachaMode ?? 1);
  const [spinning, setSpinning] = useState(false);
  const [probOpen, setProbOpen] = useState(false);

  const currentMode = GACHA_MODES.find(m => m.count === selectedMode)!;
  const canAfford = state.points >= currentMode.cost;
  const equipped = state.avatar.equippedItem;

  const handleSpin = useCallback(() => {
    if (!canAfford || spinning) return;
    setSpinning(true);
    setPreferredGachaMode(selectedMode);

    setTimeout(() => {
      if (selectedMode === 1) {
        const result = spinGacha();
        applyGachaResult(result);
        setScreen("gacha-result");
      } else {
        const results: GachaResult[] = Array.from({ length: selectedMode }, () => spinGacha());
        // 10連はRARE以上を1枚保証
        if (selectedMode === 10) {
          const hasRareOrAbove = results.some(r => ["rare","epic","legendary"].includes(r.type));
          if (!hasRareOrAbove) {
            // 最後の1枚をrareに差し替え
            const lastResult = results[results.length - 1];
            results[results.length - 1] = { ...lastResult, type: "rare" };
          }
        }
        applyMultiGachaResults(results, currentMode.cost);
        setScreen("multi-gacha-result");
      }
      setSpinning(false);
    }, 1200);
  }, [canAfford, spinning, selectedMode, spinGacha, applyGachaResult, applyMultiGachaResults, setScreen, setPreferredGachaMode, currentMode.cost]);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden" style={{ background: "linear-gradient(180deg, #F8F9FA 0%, #F1F3F5 100%)" }}>
      {/* ヘッダー */}
      <div className="flex items-center px-5 pb-4" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
        <button onClick={() => setScreen("choose")} className="p-2 rounded-full mr-3" style={{ background: "rgba(0,0,0,0.05)" }}>
          <ArrowLeft size={18} color="#212529" />
        </button>
        <div className="flex-1">
          <div className="text-gray-800 font-black text-xl">アイテムガチャ</div>
          <div className="text-pink-500 text-sm font-bold mt-0.5">現在のポイント: {state.points} pt</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-nav flex flex-col gap-4" style={{ scrollbarWidth: "none" }}>
        {/* 装備中アイテム */}
        {equipped ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl px-4 py-3 flex items-center gap-3"
            style={{ background: "linear-gradient(135deg, #EDFAF4, #D9F5E8)", border: "1px solid rgba(16,185,129,0.3)" }}
          >
            <span className="text-2xl">{equipped.emoji}</span>
            <div className="flex-1">
              <div className="text-green-800 font-bold text-sm">{equipped.name} 装備中</div>
              <div className="text-green-600 text-xs mt-0.5">移動ポイント ×{equipped.multiplier} / 残り耐久 {equipped.durability}回</div>
            </div>
          </motion.div>
        ) : (
          <div className="rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)" }}>
            <span className="text-xl">⚪</span>
            <div className="text-gray-500 text-sm">装備なし — ガチャでアイテムを入手しよう！</div>
          </div>
        )}

        {/* ガチャ演出エリア */}
        <div
          className="rounded-3xl overflow-hidden relative flex items-center justify-center"
          style={{ minHeight: 180, background: "linear-gradient(135deg, #1A0533 0%, #2D0A5C 50%, #1A0533 100%)" }}
        >
          <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at 50% 50%, #E91E8C 0%, transparent 70%)" }} />
          <AnimatePresence mode="wait">
            {spinning ? (
              <motion.div
                key="spinning"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex flex-col items-center gap-3 py-8"
              >
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}>
                  <Sparkles size={52} color="#F59E0B" />
                </motion.div>
                <div className="text-white font-black text-lg tracking-widest">抽選中...</div>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-3 py-8"
              >
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                  <Sparkles size={56} color="#F59E0B" />
                </motion.div>
                <div className="text-center px-6">
                  <div className="text-white font-black text-xl">移動ブーストアイテムをGET！</div>
                  <div className="text-white/60 text-sm mt-1">装備すると移動ポイントが最大2倍に</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 確率テーブル（開閉式） */}
        <div>
          <button
            onClick={() => setProbOpen(v => !v)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl"
            style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)" }}
          >
            <span className="text-xs font-bold text-gray-500">排出確率を確認する</span>
            <motion.div animate={{ rotate: probOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={14} color="#9CA3AF" />
            </motion.div>
          </button>
          <AnimatePresence>
            {probOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-2 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
                  {(["legendary","epic","rare","common"] as const).map((r, i) => {
                    const s = RARITY_STYLE[r];
                    return (
                      <div key={r} className="flex items-center gap-3 px-4 py-2.5" style={{ background: s.bg, borderBottom: i < 3 ? "1px solid rgba(0,0,0,0.06)" : "none" }}>
                        <span style={{ color: s.color }}>{s.icon}</span>
                        <span className="font-bold text-sm flex-1" style={{ color: s.color }}>{s.label}</span>
                        <span className="text-gray-500 text-xs font-bold">{s.pct}</span>
                      </div>
                    );
                  })}
                  <div className="px-4 py-2 text-gray-400 text-[9px] leading-relaxed" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                    ※ 確率は各ガチャ独立試行です。このデモは提案用プロトタイプです。
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 回数選択 */}
        <div>
          <div className="text-xs font-bold text-gray-500 tracking-wide mb-2">回数を選ぶ</div>
          <div className="flex gap-3">
            {GACHA_MODES.map(mode => {
              const afford = state.points >= mode.cost;
              const sel = selectedMode === mode.count;
              return (
                <motion.button
                  key={mode.count}
                  whileTap={{ scale: afford ? 0.96 : 1 }}
                  onClick={() => afford && setSelectedMode(mode.count)}
                  className="flex-1 rounded-2xl p-4 text-center relative"
                  style={{
                    background: sel ? "linear-gradient(135deg, #F5F0FF, #EDE0FF)" : afford ? "white" : "rgba(0,0,0,0.04)",
                    border: sel ? "2px solid rgba(168,85,247,0.6)" : "1.5px solid rgba(0,0,0,0.10)",
                    boxShadow: sel ? "0 4px 20px rgba(168,85,247,0.20)" : "0 2px 8px rgba(0,0,0,0.06)",
                    opacity: afford ? 1 : 0.45,
                    cursor: afford ? "pointer" : "not-allowed",
                  }}
                >
                  {mode.badge && (
                    <span className="absolute top-1.5 right-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{ background: "rgba(233,30,140,0.15)", color: "#E91E8C" }}>
                      {mode.badge}
                    </span>
                  )}
                  <div className="text-2xl font-black" style={{ color: sel ? "#7C3AED" : "#212529" }}>{mode.label}</div>
                  <div className="text-xs font-bold mt-1" style={{ color: sel ? "#9333EA" : "#E91E8C" }}>{mode.sub}</div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* 実行ボタン */}
        <motion.button
          whileTap={{ scale: canAfford && !spinning ? 0.97 : 1 }}
          onClick={handleSpin}
          disabled={!canAfford || spinning}
          className="w-full py-4 rounded-2xl font-black text-lg"
          style={{
            background: canAfford && !spinning ? "linear-gradient(135deg, #E91E8C 0%, #9333EA 100%)" : "rgba(0,0,0,0.12)",
            color: canAfford && !spinning ? "white" : "#aaa",
            boxShadow: canAfford && !spinning ? "0 4px 20px rgba(233,30,140,0.35)" : "none",
          }}
        >
          {spinning ? "抽選中..." : canAfford ? `${currentMode.label}引く（${currentMode.cost} pt）` : `ポイント不足（必要: ${currentMode.cost} pt）`}
        </motion.button>

        {!canAfford && (
          <div className="text-center text-gray-400 text-xs leading-relaxed">
            ホーム画面で「受け取る」ボタンを押してポイントを確定させてください。
          </div>
        )}
      </div>
    </div>
  );
}

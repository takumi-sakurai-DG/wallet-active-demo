import { useApp } from "@/contexts/AppContext";
import type { GachaResult } from "@/contexts/AppContext";
import { useEffect } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Crown, Zap, Star, Package, ArrowLeft, Repeat } from "lucide-react";

// ================================================================
// GachaResultScreen — 1回ガチャ結果（アイテム取得型）
// ================================================================

const RARITY_CONFIG: Record<GachaResult["type"], {
  bg: string; border: string; color: string; textColor: string;
  icon: React.ReactNode; label: string; glow: string; particles: string;
}> = {
  legendary: {
    bg: "linear-gradient(135deg, #FFF8E1 0%, #FFF3CD 100%)",
    border: "rgba(245,158,11,0.6)", color: "#B45309", textColor: "#92400E",
    glow: "0 0 40px rgba(245,158,11,0.5)", particles: "#F59E0B",
    icon: <Crown size={28} />, label: "LEGENDARY",
  },
  epic: {
    bg: "linear-gradient(135deg, #F5F0FF 0%, #EDE0FF 100%)",
    border: "rgba(168,85,247,0.5)", color: "#7C3AED", textColor: "#5B21B6",
    glow: "0 0 32px rgba(168,85,247,0.4)", particles: "#A855F7",
    icon: <Zap size={28} />, label: "EPIC",
  },
  rare: {
    bg: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
    border: "rgba(59,130,246,0.5)", color: "#1D4ED8", textColor: "#1E40AF",
    glow: "0 0 24px rgba(59,130,246,0.35)", particles: "#3B82F6",
    icon: <Star size={28} />, label: "RARE",
  },
  common: {
    bg: "linear-gradient(135deg, #F8F9FA 0%, #F1F3F5 100%)",
    border: "rgba(0,0,0,0.12)", color: "#374151", textColor: "#374151",
    glow: "none", particles: "#9CA3AF",
    icon: <Package size={28} />, label: "COMMON",
  },
};

export default function GachaResultScreen() {
  const { state, setScreen, spinGacha, applyGachaResult } = useApp();
  const result = state.lastGachaResult;

  if (!result) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <button onClick={() => setScreen("choose")} className="text-gray-500">← 戻る</button>
      </div>
    );
  }

  const cfg = RARITY_CONFIG[result.type];
  const item = result.item;
  const isEquipped = state.avatar.equippedItem?.id === item.id;

  // アイテム取得フィードバックtoast（画面表示時に1回発火）
  useEffect(() => {
    if (!result) return;
    const multiplierLabel = `×${item.multiplier.toFixed(1)}倍`;
    const durabilityLabel = item.maxDurability === 0 ? "次回移動で消耗" : `耐久${item.maxDurability}回`;
    const toastStyle = result.type === "legendary"
      ? { background: "linear-gradient(135deg, #F59E0B, #FBBF24)", color: "#fff", border: "none", fontWeight: "800" }
      : result.type === "epic"
      ? { background: "linear-gradient(135deg, #7C3AED, #A855F7)", color: "#fff", border: "none", fontWeight: "800" }
      : { background: "linear-gradient(135deg, #E91E8C, #FF6EB4)", color: "#fff", border: "none", fontWeight: "800" };
    toast.success(`${item.emoji} ${item.name}を取得！`, {
      description: `次の移動から${multiplierLabel} / ${durabilityLabel}`,
      duration: 4000,
      style: toastStyle,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAgain = () => {
    if (state.points >= 10) {
      const next = spinGacha();
      applyGachaResult(next);
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden" style={{ background: "linear-gradient(180deg, #1A0533 0%, #0D0020 100%)" }}>
      {/* ヘッダー */}
      <div className="flex items-center px-5 pb-4" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
        <button onClick={() => setScreen("choose")} className="p-2 rounded-full mr-3" style={{ background: "rgba(255,255,255,0.1)" }}>
          <ArrowLeft size={18} color="white" />
        </button>
        <div className="text-white font-black text-xl">ガチャ結果</div>
      </div>

      <div className="flex-1 overflow-y-auto">
      <div className="flex flex-col items-center px-6 pt-2 pb-4 gap-5">
        {/* レアリティバッジ */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="px-6 py-2 rounded-full font-black text-lg tracking-widest"
          style={{ background: cfg.bg, border: `2px solid ${cfg.border}`, color: cfg.color, boxShadow: cfg.glow }}
        >
          {cfg.icon && <span className="inline-flex items-center gap-2">{cfg.icon} {cfg.label}</span>}
        </motion.div>

        {/* アイテムカード */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="w-full rounded-3xl p-6 flex flex-col items-center gap-4"
          style={{ background: cfg.bg, border: `2px solid ${cfg.border}`, boxShadow: cfg.glow }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-6xl leading-none"
            style={{ fontFamily: "Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif" }}
          >
            {item.emoji}
          </motion.div>
          <div className="text-center">
            <div className="font-black text-2xl" style={{ color: cfg.textColor }}>{item.name}</div>
            <div className="text-gray-600 text-sm mt-2 leading-relaxed">{item.description}</div>
          </div>
          <div className="w-full rounded-2xl px-4 py-3 flex items-center justify-between" style={{ background: "rgba(0,0,0,0.06)" }}>
            <div className="text-center">
              <div className="text-xs text-gray-500 font-bold">倍率</div>
              <div className="font-black text-xl" style={{ color: cfg.color }}>×{item.multiplier}</div>
            </div>
            <div className="w-px h-8" style={{ background: "rgba(0,0,0,0.1)" }} />
            <div className="text-center">
              <div className="text-xs text-gray-500 font-bold">耐久</div>
              <div className="font-black text-xl" style={{ color: cfg.color }}>{item.maxDurability}回</div>
            </div>
            <div className="w-px h-8" style={{ background: "rgba(0,0,0,0.1)" }} />
            <div className="text-center">
              <div className="text-xs text-gray-500 font-bold">カテゴリ</div>
              <div className="font-black text-sm" style={{ color: cfg.color }}>
                {{ tire: "タイヤ", engine: "エンジン", oil: "オイル", special: "特殊" }[item.category]}
              </div>
            </div>
          </div>
          {isEquipped && (
            <div className="w-full rounded-xl px-3 py-2 text-center text-sm font-bold text-green-700" style={{ background: "rgba(16,185,129,0.12)" }}>
              ✅ 自動装備されました！次の移動から×{item.multiplier}倍
            </div>
          )}
        </motion.div>

        {/* 残りポイント */}
        <div className="text-white/60 text-sm">残りポイント: <span className="font-black text-white">{state.points} pt</span></div>

        {/* ボタン */}
        <div className="w-full flex flex-col gap-3">
          {state.points >= 10 && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAgain}
              className="w-full py-4 rounded-2xl font-black text-lg text-white flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #E91E8C 0%, #9333EA 100%)", boxShadow: "0 4px 20px rgba(233,30,140,0.35)" }}
            >
              <Repeat size={18} />
              もう1回（10 pt）
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setScreen("avatar")}
            className="w-full py-3 rounded-2xl font-bold text-base"
            style={{ background: "rgba(255,255,255,0.12)", color: "white", border: "1px solid rgba(255,255,255,0.2)" }}
          >
            アバター画面で確認
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setScreen("home")}
            className="w-full py-3 rounded-2xl font-bold text-base"
            style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}
          >
            ホームへ戻る
          </motion.button>
        </div>
      </div>
      </div>

    </div>
  );
}

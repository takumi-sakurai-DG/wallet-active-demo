import { useApp } from "@/contexts/AppContext";
import { motion } from "framer-motion";
import { Home, Repeat, Share2, Copy, Check } from "lucide-react";
import { useState, useCallback } from "react";
import { toast } from "sonner";

// ---- コンフェッティ ----
const CONFETTI_COLORS = ["#E60012", "#F59E0B", "#10B981", "#a855f7", "#60A5FA", "#FBBF24", "#34D399"];
const CONFETTI_PIECES = Array.from({ length: 36 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  delay: Math.random() * 1.0,
  duration: 1.8 + Math.random() * 1.4,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  rotate: Math.random() * 360,
  rotateDir: Math.random() > 0.5 ? 1 : -1,
  size: 6 + Math.floor(Math.random() * 6),
  shape: i % 3, // 0=square, 1=circle, 2=rect
}));

function Confetti() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {CONFETTI_PIECES.map(p => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.left}%`,
            top: "-12px",
            width: p.shape === 2 ? p.size * 2 : p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.shape === 1 ? "50%" : p.shape === 2 ? "2px" : "1px",
            rotate: p.rotate,
          }}
          animate={{
            y: ["0vh", "115vh"],
            rotate: [p.rotate, p.rotate + 360 * p.rotateDir],
            opacity: [1, 1, 0.8, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

// ---- 心理バッジ ----
function PsychBadge({ theory, cite, color = "#93C5FD" }: { theory: string; cite: string; color?: string }) {
  return (
    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{ background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.3)", color }}>
      🧠 {theory} <span className="opacity-60">{cite}</span>
    </div>
  );
}

// ---- SNSシェアボタン ----
function SharePanel({ result }: { result: { label: string; fuelChange: number; description: string } }) {
  const [copied, setCopied] = useState(false);

  const shareText = `🎉 Wallet active で ${result.label} を引いた！\nFuel +${result.fuelChange} 獲得！\n移動するだけでポイントが貯まる #WalletActive #TOYOTA`;
  const encodedText = encodeURIComponent(shareText);
  const demoUrl = encodeURIComponent("https://walletdemo-ediolang.manus.space");

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success("テキストをコピーしました");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("コピーに失敗しました");
    }
  }, [shareText]);

  const handleTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${demoUrl}`, "_blank", "noopener");
  };

  const handleLine = () => {
    window.open(`https://social-plugins.line.me/lineit/share?url=${demoUrl}&text=${encodedText}`, "_blank", "noopener");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="w-full rounded-2xl px-4 py-3 mb-4"
      style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}
    >
      <div className="flex items-center gap-1.5 mb-2.5">
        <Share2 size={13} color="#F59E0B" />
        <span className="text-amber-400 text-xs font-bold tracking-wide">結果をシェアする</span>
      </div>
      <div className="flex gap-2">
        {/* X (Twitter) */}
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={handleTwitter}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white transition-all"
          style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)" }}
        >
          {/* X logo */}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          X でシェア
        </motion.button>

        {/* LINE */}
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={handleLine}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white transition-all"
          style={{ background: "rgba(6,199,85,0.25)", border: "1px solid rgba(6,199,85,0.4)" }}
        >
          {/* LINE logo */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#06C755">
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
          </svg>
          LINE
        </motion.button>

        {/* コピー */}
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={handleCopy}
          className="px-3 py-2.5 rounded-xl text-xs font-bold transition-all"
          style={{
            background: copied ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.08)",
            border: `1px solid ${copied ? "rgba(16,185,129,0.5)" : "rgba(255,255,255,0.15)"}`,
            color: copied ? "#34D399" : "rgba(255,255,255,0.6)",
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </motion.button>
      </div>
    </motion.div>
  );
}

// ---- メイン ----
export default function GachaResultScreen() {
  const { state, setScreen } = useApp();
  const result = state.lastGachaResult;
  if (!result) return null;

  const isGood = result.fuelChange >= 0 || result.type === "boost";
  const color = result.type === "jackpot" ? "#F59E0B" : isGood ? "#10B981" : "#E60012";
  const bgColor = result.type === "jackpot" ? "rgba(245,158,11,0.15)" : isGood ? "rgba(16,185,129,0.15)" : "rgba(230,0,18,0.15)";
  const isJackpot = result.type === "jackpot";

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-6 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #0D1B3E 0%, #0a1530 100%)" }}>
      {isJackpot && <Confetti />}

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="text-center w-full"
      >
        {/* アイコン */}
        <motion.div
          animate={isJackpot ? { rotate: [0, -8, 8, -8, 8, 0], scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-7xl mb-4"
        >
          {isJackpot ? "🎉" : result.type === "boost" ? "🚀" : isGood ? "⚡" : "💨"}
        </motion.div>

        {/* ラベル */}
        <motion.div
          animate={isJackpot ? { scale: [1, 1.08, 1], textShadow: ["0 0 0px #F59E0B", "0 0 24px #F59E0B", "0 0 0px #F59E0B"] } : {}}
          transition={{ duration: 1.2, repeat: isJackpot ? 2 : 0, delay: 0.4 }}
          className="text-4xl font-black mb-2"
          style={{ color }}
        >
          {result.label}
        </motion.div>

        {/* 結果カード */}
        <div className="rounded-2xl px-6 py-4 mb-4" style={{ background: bgColor, border: `1px solid ${color}40` }}>
          <div className="text-white font-bold text-base mb-1">{result.description}</div>
          {result.fuelChange !== 0 && (
            <div className="text-2xl font-black" style={{ color }}>
              Fuel {result.fuelChange > 0 ? "+" : ""}{result.fuelChange}
            </div>
          )}
          {result.boostMultiplier && (
            <div className="text-sm mt-1" style={{ color: "#E60012" }}>
              次回ブースト ×{result.boostMultiplier}
            </div>
          )}
          {state.showPsychBadge && (
            <div className="mt-3 flex flex-wrap gap-1 justify-center">
              {isGood ? (
                <PsychBadge theory="保有効果" cite="Thaler, 1980" />
              ) : (
                <PsychBadge theory="損失回避バイアス" cite="Kahneman & Tversky, 1979" color="#FCA5A5" />
              )}
              {result.boostMultiplier && (
                <PsychBadge theory="拡張自己" cite="Belk, 1988" />
              )}
            </div>
          )}
        </div>

        {/* Fuel表示 */}
        <div className="text-white/60 text-sm mb-1">現在のFuel</div>
        <div className="text-5xl font-black text-amber-400 mb-5">{state.fuel}</div>

        {/* JACKPOT時シェアパネル */}
        {isJackpot && <SharePanel result={result} />}

        {/* アクションボタン */}
        <div className="flex gap-3 justify-center">
          {state.fuel >= 10 && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setScreen("gacha")}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-white"
              style={{ background: "rgba(168,85,247,0.3)", border: "1px solid rgba(168,85,247,0.5)" }}
            >
              <Repeat size={16} />
              もう一回
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setScreen("home")}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white"
            style={{ background: "linear-gradient(135deg, #E60012, #ff4444)", boxShadow: "0 4px 20px rgba(230,0,18,0.4)" }}
          >
            <Home size={18} />
            ホームへ
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

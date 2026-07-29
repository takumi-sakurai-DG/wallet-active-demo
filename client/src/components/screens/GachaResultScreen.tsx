import { useApp } from "@/contexts/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Repeat, Copy, Check, Share2 } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

// ================================================================
// レアリティ別パーティクルエフェクト
// ================================================================
type Rarity = "jackpot" | "big-win" | "win" | "boost" | "miss";

function getRarity(type: string, fuelChange: number): Rarity {
  if (type === "jackpot") return "jackpot";
  if (type === "boost") return "boost";
  if (type === "fuel-up" && fuelChange >= 30) return "big-win";
  if (type === "fuel-up") return "win";
  return "miss";
}

const RARITY_CONFIG: Record<Rarity, {
  particleCount: number;
  colors: string[];
  bgGlow: string;
  bgGlow2: string;
  particleSize: [number, number]; // [min, max]
  speed: [number, number];
}> = {
  jackpot: {
    particleCount: 55,
    colors: ["#F59E0B", "#FBBF24", "#ffffff", "#a855f7", "#60A5FA", "#34D399", "#E60012"],
    bgGlow: "rgba(245,158,11,0.22)",
    bgGlow2: "rgba(168,85,247,0.12)",
    particleSize: [5, 11],
    speed: [1.6, 3.2],
  },
  "big-win": {
    particleCount: 30,
    colors: ["#a855f7", "#c084fc", "#e879f9", "#ffffff"],
    bgGlow: "rgba(168,85,247,0.18)",
    bgGlow2: "rgba(96,165,250,0.08)",
    particleSize: [4, 8],
    speed: [1.8, 2.8],
  },
  win: {
    particleCount: 16,
    colors: ["#60A5FA", "#93C5FD", "#34D399"],
    bgGlow: "rgba(96,165,250,0.12)",
    bgGlow2: "transparent",
    particleSize: [3, 6],
    speed: [2.0, 3.0],
  },
  boost: {
    particleCount: 20,
    colors: ["#E60012", "#ff4444", "#F59E0B"],
    bgGlow: "rgba(230,0,18,0.15)",
    bgGlow2: "rgba(245,158,11,0.08)",
    particleSize: [4, 8],
    speed: [1.5, 2.5],
  },
  miss: {
    particleCount: 0,
    colors: [],
    bgGlow: "transparent",
    bgGlow2: "transparent",
    particleSize: [3, 5],
    speed: [2, 3],
  },
};

// 浮遊パーティクル（上昇・漂う）
const _floatParticles = (rarity: Rarity) => {
  const cfg = RARITY_CONFIG[rarity];
  return Array.from({ length: cfg.particleCount }, (_, i) => ({
    id: i,
    x: 5 + Math.random() * 90,
    startY: 60 + Math.random() * 40, // 画面下部から
    color: cfg.colors[i % cfg.colors.length],
    size: cfg.particleSize[0] + Math.random() * (cfg.particleSize[1] - cfg.particleSize[0]),
    delay: Math.random() * 1.5,
    duration: cfg.speed[0] + Math.random() * (cfg.speed[1] - cfg.speed[0]),
    drift: (Math.random() - 0.5) * 60,
    shape: i % 3, // 0=circle, 1=square, 2=diamond
  }));
};

function RarityParticles({ rarity }: { rarity: Rarity }) {
  const cfg = RARITY_CONFIG[rarity];
  if (cfg.particleCount === 0) return null;
  // useMemoなしでOK（初回レンダリング時のみ生成）
  const particles = _floatParticles(rarity);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.startY}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.shape === 0 ? "50%" : p.shape === 1 ? "2px" : "0",
            transform: p.shape === 2 ? "rotate(45deg)" : undefined,
            opacity: 0,
          }}
          animate={{
            y: [0, -(120 + Math.random() * 80)],
            x: [0, p.drift],
            opacity: [0, 0.9, 0.7, 0],
            scale: [0.5, 1.2, 0.8],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeOut",
            repeat: rarity === "jackpot" ? Infinity : 1,
            repeatDelay: rarity === "jackpot" ? 0.5 : 0,
          }}
        />
      ))}
      {/* 背景グロー */}
      <motion.div
        className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse at 50% 60%, ${cfg.bgGlow} 0%, ${cfg.bgGlow2} 40%, transparent 70%)` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.8] }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}

// ---- Fuel変化フラッシュ数値 ----
function FuelFlashNumber({ fuel, fuelChange, color }: { fuel: number; fuelChange: number; color: string }) {
  // 増減ゼロ（boost等）は通常表示
  if (fuelChange === 0) {
    return <div className="text-5xl font-black text-amber-400 mb-5">{fuel}</div>;
  }

  const isIncrease = fuelChange > 0;
  const flashColor = isIncrease ? "#34D399" : "#F87171";
  const glowColor  = isIncrease ? "rgba(52,211,153,0.6)" : "rgba(248,113,113,0.6)";

  return (
    <div className="relative flex flex-col items-center mb-5">
      {/* 変化量フラッシュ（上から降ってくる） */}
      <motion.div
        initial={{ y: -20, opacity: 0, scale: 1.6 }}
        animate={{ y: [-20, 0, 4, 0], opacity: [0, 1, 1, 0.7], scale: [1.6, 1.2, 1.05, 1] }}
        transition={{ duration: 0.7, delay: 0.25, ease: [0.23, 1, 0.32, 1] }}
        className="text-2xl font-black mb-0.5"
        style={{ color: flashColor, textShadow: `0 0 16px ${glowColor}` }}
      >
        {isIncrease ? `+${fuelChange}` : `${fuelChange}`}
      </motion.div>

      {/* Fuel現在値：スケールアップ→バウンス→落ち着く */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{
          scale:   [0.7, 1.35, 0.92, 1.12, 1],
          opacity: [0,   1,    1,    1,    1],
          textShadow: [
            `0 0 0px ${glowColor}`,
            `0 0 32px ${glowColor}, 0 0 64px ${glowColor}`,
            `0 0 12px ${glowColor}`,
            `0 0 20px ${glowColor}`,
            `0 0 4px ${glowColor}`,
          ],
        }}
        transition={{ duration: 0.75, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="text-5xl font-black"
        style={{ color: "#F59E0B" }}
      >
        {fuel}
      </motion.div>

      {/* 波紋リング */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0.8 }}
        animate={{ scale: 2.2, opacity: 0 }}
        transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 60, height: 60,
          border: `2px solid ${flashColor}`,
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
    </div>
  );
}

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
function SharePanel({ result, rarity, carLabel }: {
  result: { label: string; fuelChange: number; description: string; type: string };
  rarity: Rarity;
  carLabel: string;
}) {
  const [copied, setCopied] = useState(false);
  const [twitterBounce, setTwitterBounce] = useState(false);
  const [lineBounce, setLineBounce] = useState(false);

  // レアリティ別の絵文字・フレーズ
  const rarityEmoji = rarity === "jackpot" ? "🏆🎉✨" : rarity === "big-win" ? "🎊⚡" : "🎯";
  const rarityPhrase = rarity === "jackpot"
    ? "最高レアリティ JACKPOT を引いた！"
    : rarity === "big-win"
    ? `BIG WIN！Fuel +${result.fuelChange} 大量獲得！`
    : `${result.label} 獲得！`;
  const carPhrase = carLabel ? `${carLabel}で走って` : "移動して";
  const fuelLine = result.fuelChange > 0
    ? `Fuel +${result.fuelChange} 獲得！`
    : result.type === "boost"
    ? "ブーストアップ！次回2倍！"
    : "";

  const shareText = `${rarityEmoji} Wallet active で ${rarityPhrase}\n${carPhrase}${fuelLine}\n移動するだけでポイントが貯まる！\n#WalletActive #ウォレットアクティブ`;
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
    setTwitterBounce(true);
    setTimeout(() => setTwitterBounce(false), 400);
    window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${demoUrl}`, "_blank", "noopener");
  };

  const handleLine = () => {
    setLineBounce(true);
    setTimeout(() => setLineBounce(false), 400);
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
      {/* プレビューテキスト */}
      <div className="text-white/40 text-[10px] leading-relaxed mb-2.5 px-1 italic line-clamp-2">
        {shareText.split("\n")[0]}
      </div>
      <div className="flex gap-2">
        {/* X (Twitter) */}
        <motion.button
          animate={twitterBounce ? { scale: [1, 1.18, 0.92, 1.06, 1], y: [0, -6, 2, -2, 0] } : {}}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          whileTap={{ scale: 0.92 }}
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
          animate={lineBounce ? { scale: [1, 1.18, 0.92, 1.06, 1], y: [0, -6, 2, -2, 0] } : {}}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          whileTap={{ scale: 0.92 }}
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
  const rarity = getRarity(result.type, result.fuelChange);
  const isHighRarity = rarity === "jackpot" || rarity === "big-win";

  // JACKPOT時：画面フラッシュ（白→透明）
  const [flashVisible, setFlashVisible] = useState(isJackpot);
  useEffect(() => {
    if (isJackpot) {
      const t = setTimeout(() => setFlashVisible(false), 500);
      return () => clearTimeout(t);
    }
  }, [isJackpot]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-6 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #0D1B3E 0%, #0a1530 100%)" }}>
      {/* JACKPOT画面フラッシュ */}
      <AnimatePresence>
        {flashVisible && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-50"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ background: "white" }}
          />
        )}
      </AnimatePresence>

      {isJackpot && <Confetti />}
      <RarityParticles rarity={rarity} />

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
        <FuelFlashNumber fuel={state.fuel} fuelChange={result.fuelChange} color={color} />

        {/* JACKPOT時シェアパネル */}
        {/* JACKPOT・BIG WIN時シェアパネル */}
        {isHighRarity && (
          <SharePanel
            result={result}
            rarity={rarity}
            carLabel={state.carConfig ? `${state.carConfig.colorLabel}の${state.carConfig.modelLabel}` : ""}
          />
        )}

        {/* アクションボタン */}
        <div className="flex gap-3 justify-center safe-bottom">
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

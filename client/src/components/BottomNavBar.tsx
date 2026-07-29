import { motion, AnimatePresence } from "framer-motion";
import { Home, Zap, Car, Trophy, Share2, Copy, Check } from "lucide-react";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useApp } from "@/contexts/AppContext";

// ================================================================
// BottomNavBar — 全画面共通ボトムナビゲーション
// 表示対象画面: home / history / collection / gacha-result / multi-gacha-result / convert / convert-done
// 非表示画面: onboarding / car-register / gacha / choose / settings
// ================================================================

// ボトムナビを表示する画面一覧
const NAV_VISIBLE_SCREENS = new Set([
  "home",
  "history",
  "collection",
  "gacha-result",
  "multi-gacha-result",
  "convert",
  "convert-done",
]);

// バイブレーション（Haptic Feedback）ユーティリティ
function vibrate(pattern: number | number[] = 10) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

export default function BottomNavBar() {
  const { state, setScreen } = useApp();
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  // バウンスアニメ用：タップされたアイテムIDを追跡
  const [bouncingId, setBouncingId] = useState<string | null>(null);

  const fuelEnabled = state.fuel >= 10;
  const currentScreen = state.screen;

  // 表示対象画面以外では非表示
  if (!NAV_VISIBLE_SCREENS.has(currentScreen)) return null;

  // アクティブタブの判定
  const getActiveTab = () => {
    if (currentScreen === "home") return "home";
    if (currentScreen === "history") return "history";
    if (currentScreen === "collection") return "collection";
    if (["gacha-result", "multi-gacha-result", "convert", "convert-done"].includes(currentScreen)) return "fuel";
    return "home";
  };
  const activeTab = getActiveTab();

  // バウンス＋バイブレーション付きタップハンドラー
  const handleNavTap = useCallback((id: string) => {
    vibrate(10);
    setBouncingId(id);
    setTimeout(() => setBouncingId(null), 400);

    if (id === "home") { setShareOpen(false); setScreen("home"); }
    else if (id === "fuel") {
      if (fuelEnabled) {
        setShareOpen(false);
        setScreen("choose");
      } else {
        toast.warning(`Fuelが足りません（現在: ${state.fuel} / 必要: 10）`, {
          description: "移動シミュレートでFuelを貯めてください",
          duration: 3000,
        });
      }
    }
    else if (id === "history") { setShareOpen(false); setScreen("history"); }
    else if (id === "collection") { setShareOpen(false); setScreen("collection"); }
    else if (id === "share") { setShareOpen(prev => !prev); }
  }, [fuelEnabled, state.fuel, setScreen]);

  // シェアテキスト
  const carShareText = `🚗 Wallet active でマイカーを登録しました！\n${state.carConfig.colorLabel}の${state.carConfig.modelLabel}がアバターになりました。\n移動するだけでFuelが貯まる！\n#WalletActive #ウォレットアクティブ`;
  const encodedText = encodeURIComponent(carShareText);
  const demoUrl = encodeURIComponent("https://walletdemo-ediolang.manus.space");

  const handleShareX = useCallback(() => {
    vibrate([10, 30, 10]);
    window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${demoUrl}`, "_blank", "noopener");
  }, [encodedText, demoUrl]);

  const handleShareLine = useCallback(() => {
    vibrate([10, 30, 10]);
    window.open(`https://social-plugins.line.me/lineit/share?url=${demoUrl}&text=${encodedText}`, "_blank", "noopener");
  }, [encodedText, demoUrl]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(carShareText);
      setCopied(true);
      vibrate([10, 20]);
      toast.success("テキストをコピーしました");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("コピーに失敗しました");
    }
  }, [carShareText]);

  const navItems = [
    {
      id: "home",
      icon: <Home size={20} />,
      label: "ホーム",
    },
    {
      id: "fuel",
      icon: <Zap size={20} fill={fuelEnabled ? "#E60012" : "none"} />,
      label: "Fuelを使う",
    },
    {
      id: "history",
      icon: <Car size={20} />,
      label: "移動履歴",
    },
    {
      id: "collection",
      icon: <Trophy size={20} />,
      label: "コレクション",
      badge: state.gachaCollection.length > 0 ? state.gachaCollection.length : undefined,
    },
    {
      id: "share",
      icon: <Share2 size={20} />,
      label: "シェア",
    },
  ] as const;

  const getItemColor = (id: string) => {
    if (id === "fuel" && !fuelEnabled) return "rgba(255,255,255,0.2)";
    if (id === activeTab) return "#E60012";
    if (id === "share" && shareOpen) return "#F59E0B";
    if (id === "collection") return "rgba(192,132,252,0.8)";
    return "rgba(255,255,255,0.55)";
  };

  return (
    <>
      {/* シェアパネル（ボトムナビの上に展開） */}
      <AnimatePresence>
        {shareOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="absolute bottom-[72px] left-4 right-4 z-50 rounded-2xl px-4 py-3"
            style={{
              background: "rgba(10,21,48,0.97)",
              border: "1px solid rgba(245,158,11,0.3)",
              boxShadow: "0 -4px 24px rgba(0,0,0,0.5)",
            }}
          >
            <div className="flex items-center gap-1.5 mb-2.5">
              <Share2 size={13} color="#F59E0B" />
              <span className="text-amber-400 text-xs font-bold tracking-wide">マイカーをシェアする</span>
              <button
                onClick={() => setShareOpen(false)}
                className="ml-auto text-white/30 hover:text-white/60 transition-colors text-sm"
              >
                ✕
              </button>
            </div>
            <div className="text-white/40 text-[10px] leading-relaxed mb-2.5 italic">
              {carShareText.split("\n")[0]}
            </div>
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={handleShareX}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white"
                style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                X でシェア
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={handleShareLine}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white"
                style={{ background: "rgba(6,199,85,0.2)", border: "1px solid rgba(6,199,85,0.4)" }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#06C755">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                </svg>
                LINE
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={handleCopy}
                className="px-3 py-2.5 rounded-xl text-xs font-bold"
                style={{
                  background: copied ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.08)",
                  border: `1px solid ${copied ? "rgba(16,185,129,0.45)" : "rgba(255,255,255,0.15)"}`,
                  color: copied ? "#34D399" : "rgba(255,255,255,0.5)",
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ボトムナビゲーションバー */}
      <div
        className="absolute bottom-0 left-0 right-0 z-40 flex items-stretch"
        style={{
          background: "rgba(5,13,31,0.96)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(16px)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {navItems.map((item) => {
          const color = getItemColor(item.id);
          const isBouncing = bouncingId === item.id;
          const isActive = item.id === activeTab || (item.id === "share" && shareOpen);

          return (
            <motion.button
              key={item.id}
              onClick={() => handleNavTap(item.id)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 relative transition-colors select-none"
              style={{ color, WebkitTapHighlightColor: "transparent" }}
              // バウンスアニメーション：タップ時に弾む
              animate={isBouncing ? { y: [0, -6, 2, -3, 0] } : { y: 0 }}
              transition={isBouncing ? { duration: 0.35, ease: "easeOut" } : { duration: 0.1 }}
            >
              {/* アクティブインジケーター（上部ライン） */}
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full"
                  style={{ width: 28, height: 2, background: item.id === "share" ? "#F59E0B" : "#E60012" }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              {/* バッジ */}
              {"badge" in item && item.badge !== undefined && (
                <span
                  className="absolute top-1.5 right-[calc(50%-16px)] min-w-[16px] h-4 rounded-full text-[9px] font-black flex items-center justify-center px-1"
                  style={{ background: "#a855f7", color: "white" }}
                >
                  {item.badge}
                </span>
              )}
              {/* アイコン */}
              <span style={{ color }}>{item.icon}</span>
              {/* ラベル */}
              <span className="text-[9px] font-bold leading-none" style={{ color }}>
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </>
  );
}

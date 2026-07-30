import { useApp } from "@/contexts/AppContext";
import PhoneFrame from "@/components/PhoneFrame";
import HomeScreen from "@/components/screens/HomeScreen";
import ChooseScreen from "@/components/screens/ChooseScreen";
import GachaScreen from "@/components/screens/GachaScreen";
import GachaResultScreen from "@/components/screens/GachaResultScreen";
import MultiGachaResultScreen from "@/components/screens/MultiGachaResultScreen";
import ConvertScreen from "@/components/screens/ConvertScreen";
import ConvertDoneScreen from "@/components/screens/ConvertDoneScreen";
import CarRegisterScreen from "@/components/screens/CarRegisterScreen";
import HistoryScreen from "@/components/screens/HistoryScreen";
import OnboardingScreen from "@/components/screens/OnboardingScreen";
import SettingsScreen from "@/components/screens/SettingsScreen";
import CollectionScreen from "@/components/screens/CollectionScreen";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { useState, useLayoutEffect, useCallback, useRef } from "react";
import BottomNavBar from "@/components/BottomNavBar";

// ================================================================
// 画面階層（数値が大きいほど「深い」画面 → 進む方向）
// 同じ値 = BottomNavタブ切替（フェードのみ）
// ================================================================
const SCREEN_DEPTH: Record<string, number> = {
  onboarding: 0,
  home: 1,
  history: 1,
  collection: 1,
  settings: 1,
  choose: 2,
  gacha: 3,
  "gacha-result": 4,
  "multi-gacha-result": 4,
  convert: 3,
  "convert-done": 4,
  "car-register": 2,
};

// タッチデバイス（スマートフォン・タブレット）かどうかを確実に判定する
function detectMobile(): boolean {
  const ua = navigator.userAgent;
  const isSmartphone = /Android.*Mobile|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  if (isSmartphone) return true;
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (w <= 430 && h > w) return true;
  return false;
}

// ================================================================
// 遷移バリアント生成
// direction: 1=進む(右→左), -1=戻る(左→右), 0=フェードのみ
// ================================================================
function makeVariants(direction: number) {
  if (direction === 0) {
    return {
      initial: { opacity: 0, scale: 0.98 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.98 },
    };
  }
  const xIn = direction > 0 ? 40 : -40;
  const xOut = direction > 0 ? -40 : 40;
  return {
    initial: { opacity: 0, x: xIn },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: xOut },
  };
}

export default function Home() {
  const { state, completeOnboarding } = useApp();
  const { setScreen } = useApp();
  const [fadingOut, setFadingOut] = useState(false);

  // 前の画面を記憶して遷移方向を計算
  const prevScreenRef = useRef(state.screen);
  const directionRef = useRef(0);

  const prevDepth = SCREEN_DEPTH[prevScreenRef.current] ?? 1;
  const currDepth = SCREEN_DEPTH[state.screen] ?? 1;
  if (prevScreenRef.current !== state.screen) {
    directionRef.current = currDepth > prevDepth ? 1 : currDepth < prevDepth ? -1 : 0;
    prevScreenRef.current = state.screen;
  }

  const handleOnboardingComplete = useCallback(() => {
    setFadingOut(true);
    setTimeout(() => {
      completeOnboarding();
      setFadingOut(false);
    }, 500);
  }, [completeOnboarding]);

  const handleCarRegisterComplete = useCallback(() => {
    setFadingOut(true);
    setTimeout(() => {
      setScreen("home");
      setFadingOut(false);
    }, 500);
  }, [setScreen]);

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return detectMobile();
  });
  useLayoutEffect(() => {
    setIsMobile(detectMobile());
    const onResize = () => setIsMobile(detectMobile());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const screens: Record<string, React.ReactNode> = {
    onboarding: <OnboardingScreen onComplete={handleOnboardingComplete} />,
    home: <HomeScreen />,
    settings: <SettingsScreen />,
    choose: <ChooseScreen />,
    gacha: <GachaScreen />,
    "gacha-result": <GachaResultScreen />,
    "multi-gacha-result": <MultiGachaResultScreen />,
    convert: <ConvertScreen />,
    "convert-done": <ConvertDoneScreen />,
    "car-register": <CarRegisterScreen onNavigateHome={handleCarRegisterComplete} />,
    "history": <HistoryScreen />,
    "collection": <CollectionScreen />,
  };

  const variants = makeVariants(directionRef.current);
  const transition = { duration: 0.28, ease: "easeOut" as const };
  // framer-motion v11はcubicBezier配列をEasing型として受け付けるが
  // TypeScript定義上はstring型のみ許容するため型アサーションを使用

  // スマートフォン：全画面表示
  if (isMobile) {
    return (
      <div
        className="w-full relative"
        style={{
          height: "100dvh",
          maxHeight: "100dvh",
          overflow: "hidden",
          background: "linear-gradient(180deg, #F8F9FA 0%, #F1F3F5 100%)",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={state.screen}
            initial={variants.initial}
            animate={variants.animate}
            exit={variants.exit}
            transition={transition}
            style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
          >
            {screens[state.screen]}
          </motion.div>
        </AnimatePresence>
        <BottomNavBar />
        {/* オンボーディング完了フェードアウトオーバーレイ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: fadingOut ? 1 : 0 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          style={{
            position: "fixed",
            inset: 0,
            background: "#F8F9FA",
            pointerEvents: fadingOut ? "all" : "none",
            zIndex: 9999,
          }}
        />
      </div>
    );
  }

  // PC・タブレット：PhoneFrame表示
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #F8F9FA 0%, #F1F3F5 50%, #EDE8F5 100%)" }}>
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <div className="text-gray-400 text-xs tracking-widest uppercase mb-1">PROTOTYPE DEMO</div>
          <h1 className="text-gray-800 font-black text-2xl tracking-tight">Wallet <span style={{ color: "#E91E8C" }}>active</span></h1>
        </div>
        <PhoneFrame>
          <AnimatePresence mode="wait">
            <motion.div
              key={state.screen}
              initial={variants.initial}
              animate={variants.animate}
              exit={variants.exit}
              transition={transition}
              className="w-full h-full"
            >
              {screens[state.screen]}
            </motion.div>
          </AnimatePresence>
          <BottomNavBar />
          {/* オンボーディング完了フェードアウトオーバーレイ（PhoneFrame内） */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: fadingOut ? 1 : 0 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            style={{
              position: "absolute",
              inset: 0,
              background: "#F8F9FA",
              pointerEvents: fadingOut ? "all" : "none",
              zIndex: 9999,
              borderRadius: "inherit",
            }}
          />
        </PhoneFrame>
        <p className="text-gray-400 text-xs text-center max-w-xs">
          このデモはUIUX提案用プロトタイプです。実際のTOYOTA Walletとは連携していません。
        </p>
        <div className="text-gray-400 text-[10px] text-center max-w-xs leading-relaxed space-y-1">
          <div className="flex items-center justify-center gap-1.5">
            <span style={{ color: "#F59E0B" }}>⚡</span>
            <span>自動付与：30秒ごとに <span style={{ color: "#F59E0B" }}>+3 pt</span> が自動で貯まります</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <span style={{ color: "#34D399" }}>🚗</span>
            <span>移動ボーナス：クルマで移動すると <span style={{ color: "#34D399" }}>+6〜12 pt</span> 追加獲得</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <span style={{ color: "#60A5FA" }}>🎰</span>
            <span>10 pt 以上でガチャを回してポイントを消費・増幅</span>
          </div>
        </div>
      </div>
    </div>
  );
}

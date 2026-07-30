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
import { useState, useEffect, useLayoutEffect, useCallback } from "react";
import BottomNavBar from "@/components/BottomNavBar";

// タッチデバイス（スマートフォン・タブレット）かどうかを確実に判定する
function detectMobile(): boolean {
  const ua = navigator.userAgent;
  // UserAgentでスマートフォンを判定（タブレット・PCは除外）
  const isSmartphone = /Android.*Mobile|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  if (isSmartphone) return true;
  // UserAgentでスマートフォンと判定できない場合は画面幅のみで判定
  // （タブレット・PCはPhoneFrame表示を維持）
  const w = window.innerWidth;
  const h = window.innerHeight;
  // 縦向き・幅430px以下のみモバイル扱い（タブレット幅768px以上は除外）
  if (w <= 430 && h > w) return true;
  return false;
}

export default function Home() {
  const { state, completeOnboarding } = useApp();
  const { setScreen } = useApp();
  // オンボーディング完了時のフェードアニメーション制御
  const [fadingOut, setFadingOut] = useState(false);

  // 「さっそく始める」押下時：フェードアウト→completeOnboarding
  const handleOnboardingComplete = useCallback(() => {
    setFadingOut(true);
    setTimeout(() => {
      completeOnboarding();
      setFadingOut(false);
    }, 500);
  }, [completeOnboarding]);

  // マイカー登録完了時：フェードアウト→setScreen("home")
  const handleCarRegisterComplete = useCallback(() => {
    setFadingOut(true);
    setTimeout(() => {
      setScreen("home");
      setFadingOut(false);
    }, 500);
  }, [setScreen]);

  // useLayoutEffectで初回レンダリング前に判定し、フラッシュを防ぐ
  const [isMobile, setIsMobile] = useState(() => {
    // SSRでは常にfalse、ブラウザでは即時判定
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

  // スマートフォン：全画面表示
  if (isMobile) {
    return (
      <div
        className="w-full overflow-hidden"
        style={{
          height: "100dvh",
          background: "linear-gradient(180deg, #F8F9FA 0%, #F1F3F5 100%)",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={state.screen}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            style={{ width: "100%", height: "100dvh" }}
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
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
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

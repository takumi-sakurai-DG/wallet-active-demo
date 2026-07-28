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
import { AnimatePresence, motion } from "framer-motion";
import React from "react";

export default function Home() {
  const { state } = useApp();

  const screens: Record<string, React.ReactNode> = {
    onboarding: <OnboardingScreen />,
    home: <HomeScreen />,
    settings: <SettingsScreen />,
    choose: <ChooseScreen />,
    gacha: <GachaScreen />,
    "gacha-result": <GachaResultScreen />,
    "multi-gacha-result": <MultiGachaResultScreen />,
    convert: <ConvertScreen />,
    "convert-done": <ConvertDoneScreen />,
    "car-register": <CarRegisterScreen />,
    "history": <HistoryScreen />,
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #060d1f 0%, #0d1b3e 50%, #1a0a1e 100%)" }}>
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <div className="text-white/40 text-xs tracking-widest uppercase mb-1">PROTOTYPE DEMO</div>
          <h1 className="text-white font-black text-2xl tracking-tight">Wallet <span style={{ color: "#E60012" }}>active</span></h1>
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
        </PhoneFrame>
        <p className="text-white/30 text-xs text-center max-w-xs">
          このデモはUIUX提案用プロトタイプです。実際のTOYOTA Walletとは連携していません。
        </p>
        <div className="text-white/20 text-[10px] text-center max-w-xs leading-relaxed">
          🧠 心理設計バッジ：各画面右上のボタンで表示/非表示を切り替えられます
        </div>
      </div>
    </div>
  );
}

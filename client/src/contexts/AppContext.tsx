import React, { createContext, useContext, useState } from "react";

export type Screen = "home" | "choose" | "gacha" | "gacha-result" | "convert" | "convert-done" | "car-register";

export interface CarConfig {
  model: string;
  modelLabel: string;
  color: string;
  colorLabel: string;
  colorHex: string;
}

export interface AppState {
  fuel: number;
  maxFuel: number;
  points: number;
  isCarMoving: boolean;
  isHighBoost: boolean;
  lastGachaResult: GachaResult | null;
  screen: Screen;
  carConfig: CarConfig;
  showPsychBadge: boolean;
  fuelFullNotified: boolean;
}

export interface GachaResult {
  type: "fuel-up" | "fuel-down" | "boost" | "jackpot";
  label: string;
  fuelChange: number;
  boostMultiplier?: number;
  description: string;
}

interface AppContextType {
  state: AppState;
  setScreen: (screen: Screen) => void;
  simulateMovement: () => void;
  spinGacha: () => GachaResult;
  applyGachaResult: (result: GachaResult) => void;
  convertToPoints: () => void;
  setCarConfig: (config: CarConfig) => void;
  togglePsychBadge: () => void;
  dismissFuelNotification: () => void;
}

const GACHA_TABLE: GachaResult[] = [
  { type: "jackpot", label: "🎉 JACKPOT!", fuelChange: 50, description: "Fuelが50増加！次回移動もハイブースト継続！", boostMultiplier: 2.0 },
  { type: "fuel-up", label: "⚡ BIG WIN", fuelChange: 30, description: "Fuelが30増加！次回移動のブーストが強化！", boostMultiplier: 1.5 },
  { type: "fuel-up", label: "✨ WIN", fuelChange: 15, description: "Fuelが15増加！" },
  { type: "fuel-up", label: "▲ SMALL WIN", fuelChange: 5, description: "Fuelが5増加！" },
  { type: "fuel-down", label: "▼ MISS", fuelChange: -10, description: "Fuelが10減少…次回頑張ろう！" },
  { type: "boost", label: "🚀 BOOST UP", fuelChange: 0, description: "次回の車移動ブーストが2倍に！", boostMultiplier: 2.0 },
];

const GACHA_WEIGHTS = [5, 10, 25, 30, 20, 10];

function weightedRandom(): GachaResult {
  const total = GACHA_WEIGHTS.reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < GACHA_TABLE.length; i++) {
    rand -= GACHA_WEIGHTS[i];
    if (rand <= 0) return GACHA_TABLE[i];
  }
  return GACHA_TABLE[GACHA_TABLE.length - 1];
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    fuel: 68,
    maxFuel: 100,
    points: 1240,
    isCarMoving: false,
    isHighBoost: true,
    lastGachaResult: null,
    screen: "home",
    carConfig: {
      model: "crown",
      modelLabel: "CROWN HYBRID",
      color: "white",
      colorLabel: "プラチナホワイト",
      colorHex: "#F5F5F0",
    },
    showPsychBadge: true,
    fuelFullNotified: false,
  });

  const setScreen = (screen: Screen) => setState((s) => ({ ...s, screen }));

  const simulateMovement = () => {
    setState((s) => {
      const newFuel = s.isCarMoving ? s.fuel : Math.min(s.maxFuel, s.fuel + (s.isHighBoost ? 12 : 6));
      return {
        ...s,
        isCarMoving: !s.isCarMoving,
        fuel: newFuel,
        fuelFullNotified: !s.isCarMoving && newFuel >= s.maxFuel ? true : s.fuelFullNotified,
      };
    });
  };

  const spinGacha = (): GachaResult => weightedRandom();

  const applyGachaResult = (result: GachaResult) => {
    setState((s) => ({
      ...s,
      fuel: Math.max(0, Math.min(s.maxFuel, s.fuel + result.fuelChange)),
      lastGachaResult: result,
      isHighBoost: result.boostMultiplier ? true : s.isHighBoost,
    }));
  };

  const convertToPoints = () => {
    setState((s) => ({
      ...s,
      points: s.points + Math.floor(s.fuel * 10),
      fuel: 0,
      fuelFullNotified: false,
    }));
  };

  const setCarConfig = (config: CarConfig) => setState((s) => ({ ...s, carConfig: config }));
  const togglePsychBadge = () => setState((s) => ({ ...s, showPsychBadge: !s.showPsychBadge }));
  const dismissFuelNotification = () => setState((s) => ({ ...s, fuelFullNotified: false }));

  return (
    <AppContext.Provider value={{ state, setScreen, simulateMovement, spinGacha, applyGachaResult, convertToPoints, setCarConfig, togglePsychBadge, dismissFuelNotification }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

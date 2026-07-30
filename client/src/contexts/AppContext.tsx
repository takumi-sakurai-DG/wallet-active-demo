import React, { createContext, useContext, useState, useEffect, useRef } from "react";

export type Screen = "onboarding" | "home" | "choose" | "gacha" | "gacha-result" | "multi-gacha-result" | "convert" | "convert-done" | "car-register" | "history" | "settings" | "collection";


export interface MovementRecord {
  id: string;
  date: string;       // "07/28 (月)" 形式
  time: string;       // "08:32" 形式
  route: string;      // "自宅 → 渋谷"
  distance: number;   // km
  fuelGained: number;
  isHighBoost: boolean;
  transportType: "car" | "train" | "walk";
}

export interface CarConfig {
  model: string;
  modelLabel: string;
  color: string;
  colorLabel: string;
  colorHex: string;
  imgUrl?: string;
}

export interface AppState {
  fuel: number;
  maxFuel: number;
  points: number;
  isCarMoving: boolean;
  isHighBoost: boolean;
  lastGachaResult: GachaResult | null;
  multiGachaResults: GachaResult[];
  screen: Screen;
  carConfig: CarConfig;
  showPsychBadge: boolean;
  fuelFullNotified: boolean;
  movementHistory: MovementRecord[];
  onboardingDone: boolean;
  hapticsEnabled: boolean;
  preferredGachaMode: 1 | 3 | 10 | null; // MISSIONボタンからの遷移時に最大モードをハイライト
  gachaCollection: GachaCollectionItem[];
}

export interface GachaCollectionItem {
  id: string;
  timestamp: string;
  result: GachaResult;
  isMulti: boolean;
  multiCount?: number;
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
  setPreferredGachaMode: (mode: 1 | 3 | 10 | null) => void;
  simulateMovement: () => void;
  spinGacha: () => GachaResult;
  applyGachaResult: (result: GachaResult) => void;
  applyMultiGachaResults: (results: GachaResult[], fuelCost: number) => void;
  convertToPoints: () => void;
  setCarConfig: (config: CarConfig) => void;
  togglePsychBadge: () => void;
  dismissFuelNotification: () => void;
  addMovementHistory: (record: Omit<MovementRecord, "id">) => void;
  completeOnboarding: () => void;
  resetDemo: () => void;
  showOnboarding: () => void;
  toggleHaptics: () => void;
  clearCollection: () => void;
}

// ---- 初期履歴データ（デモ用） ----
const INITIAL_HISTORY: MovementRecord[] = [
  { id: "h1", date: "07/28 (月)", time: "08:32", route: "自宅 → 渋谷", distance: 12.4, fuelGained: 12, isHighBoost: true,  transportType: "car" },
  { id: "h2", date: "07/28 (月)", time: "12:15", route: "渋谷 → 六本木",  distance: 4.2,  fuelGained: 4,  isHighBoost: false, transportType: "car" },
  { id: "h3", date: "07/27 (日)", time: "10:05", route: "自宅 → 横浜",    distance: 18.7, fuelGained: 18, isHighBoost: true,  transportType: "car" },
  { id: "h4", date: "07/27 (日)", time: "15:48", route: "横浜 → 川崎",    distance: 9.1,  fuelGained: 9,  isHighBoost: false, transportType: "car" },
  { id: "h5", date: "07/26 (土)", time: "09:20", route: "自宅 → 新宿",    distance: 14.3, fuelGained: 14, isHighBoost: true,  transportType: "car" },
  { id: "h6", date: "07/26 (土)", time: "19:30", route: "新宿 → 自宅",    distance: 14.3, fuelGained: 8,  isHighBoost: false, transportType: "car" },
  { id: "h7", date: "07/25 (金)", time: "07:55", route: "自宅 → 品川",    distance: 16.0, fuelGained: 16, isHighBoost: true,  transportType: "car" },
];

  const GACHA_TABLE: GachaResult[] = [
  { type: "jackpot", label: "🎉 JACKPOT!", fuelChange: 50, description: "ポイントが50増加！次回移動もハイブースト継続！", boostMultiplier: 2.0 },
  { type: "fuel-up", label: "⚡ BIG WIN", fuelChange: 30, description: "ポイントが30増加！次回移動のブーストが強化！", boostMultiplier: 1.5 },
  { type: "fuel-up", label: "✨ WIN", fuelChange: 15, description: "ポイントが15増加！" },
  { type: "fuel-up", label: "▲ SMALL WIN", fuelChange: 5, description: "ポイントが5増加！" },
  { type: "fuel-down", label: "▼ MISS", fuelChange: -10, description: "ポイントが10減少…次回頑張ろう！" },
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
    screen: "onboarding",
    carConfig: {
      model: "crown",
      modelLabel: "CROWN HYBRID",
      color: "white",
      colorLabel: "プラチナホワイト",
      colorHex: "#F5F5F0",
      imgUrl: "/manus-storage/car_crown_d3b82223.png",
    },
    showPsychBadge: true,
    fuelFullNotified: false,
    movementHistory: INITIAL_HISTORY,
    multiGachaResults: [],
    onboardingDone: false,
    hapticsEnabled: true,
    preferredGachaMode: null,
    gachaCollection: [],
  });

  const setScreen = (screen: Screen) => setState((s) => ({ ...s, screen }));

  const simulateMovement = () => {
    setState((s) => {
      const newFuel = s.isCarMoving ? s.fuel : Math.min(s.maxFuel, s.fuel + (s.isHighBoost ? 12 : 6));
      const gained = s.isHighBoost ? 12 : 6;
      const now = new Date();
      const days = ["日","月","火","水","木","金","土"];
      const dateStr = `${(now.getMonth()+1).toString().padStart(2,"0")}/${now.getDate().toString().padStart(2,"0")} (${days[now.getDay()]})`;
      const timeStr = `${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`;
      const newRecord: MovementRecord = {
        id: `h${Date.now()}`,
        date: dateStr,
        time: timeStr,
        route: "シミュレート移動",
        distance: s.isHighBoost ? 12.0 : 6.0,
        fuelGained: gained,
        isHighBoost: s.isHighBoost,
        transportType: "car",
      };
      const newHistory = !s.isCarMoving
        ? [newRecord, ...s.movementHistory].slice(0, 20)
        : s.movementHistory;
      return {
        ...s,
        isCarMoving: !s.isCarMoving,
        fuel: newFuel,
        fuelFullNotified: !s.isCarMoving && newFuel >= s.maxFuel ? true : s.fuelFullNotified,
        movementHistory: newHistory,
      };
    });
  };

  const spinGacha = (): GachaResult => weightedRandom();

  const applyGachaResult = (result: GachaResult) => {
    setState((s) => {
      const now = new Date();
      const ts = `${(now.getMonth()+1).toString().padStart(2,"0")}/${now.getDate().toString().padStart(2,"0")} ${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`;
      const item: GachaCollectionItem = { id: `c${Date.now()}`, timestamp: ts, result, isMulti: false };
      return {
        ...s,
        fuel: Math.max(0, Math.min(s.maxFuel, s.fuel + result.fuelChange)),
        lastGachaResult: result,
        isHighBoost: result.boostMultiplier ? true : s.isHighBoost,
        gachaCollection: [item, ...s.gachaCollection].slice(0, 100),
      };
    });
  };

  const applyMultiGachaResults = (results: GachaResult[], fuelCost: number) => {
    setState((s) => {
      const totalFuelChange = results.reduce((sum, r) => sum + r.fuelChange, 0);
      const hasBoost = results.some(r => r.boostMultiplier);
      const bestResult = results.find(r => r.type === "jackpot") ?? results.find(r => r.type === "boost") ?? results[results.length - 1];
      const now = new Date();
      const ts = `${(now.getMonth()+1).toString().padStart(2,"0")}/${now.getDate().toString().padStart(2,"0")} ${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`;
      const items: GachaCollectionItem[] = results.map((r, i) => ({
        id: `c${Date.now()}_${i}`,
        timestamp: ts,
        result: r,
        isMulti: true,
        multiCount: results.length,
      }));
      return {
        ...s,
        fuel: Math.max(0, Math.min(s.maxFuel, s.fuel + totalFuelChange - fuelCost)),
        lastGachaResult: bestResult,
        multiGachaResults: results,
        isHighBoost: hasBoost ? true : s.isHighBoost,
        gachaCollection: [...items, ...s.gachaCollection].slice(0, 100),
      };
    });
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
  const addMovementHistory = (record: Omit<MovementRecord, "id">) => {
    setState((s) => ({
      ...s,
      movementHistory: [{ ...record, id: `h${Date.now()}` }, ...s.movementHistory].slice(0, 20),
    }));
  };

  const completeOnboarding = () => {
    setState((s) => ({ ...s, onboardingDone: true, screen: "home" }));
  };

  const resetDemo = () => {
    setState({
      fuel: 68,
      maxFuel: 100,
      points: 1240,
      isCarMoving: false,
      isHighBoost: true,
      lastGachaResult: null,
      screen: "onboarding",
      carConfig: {
        model: "crown",
        modelLabel: "CROWN HYBRID",
        color: "white",
        colorLabel: "プラチナホワイト",
        colorHex: "#F5F5F0",
        imgUrl: "/manus-storage/car_crown_d3b82223.png",
      },
      showPsychBadge: true,
      fuelFullNotified: false,
      movementHistory: INITIAL_HISTORY,
      multiGachaResults: [],
      onboardingDone: false,
      hapticsEnabled: true,
      preferredGachaMode: null,
      gachaCollection: [],
    });
  };

  const showOnboarding = () => {
    setState((s) => ({ ...s, screen: "onboarding", onboardingDone: false }));
  };

  const toggleHaptics = () => setState((s) => ({ ...s, hapticsEnabled: !s.hapticsEnabled }));
  const clearCollection = () => setState((s) => ({ ...s, gachaCollection: [] }));

  const setPreferredGachaMode = (mode: 1 | 3 | 10 | null) => setState((s) => ({ ...s, preferredGachaMode: mode }));

  // ── 自動ポイント付与タイマー（30秒ごとに +3 pt）──
  // デモ用に30秒間隔。実運用では24時間ごとの想定。
  const AUTO_GRANT_PT = 3;
  const AUTO_GRANT_INTERVAL_MS = 30_000;
  const autoGrantTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    autoGrantTimerRef.current = setInterval(() => {
      setState((s) => {
        if (!s.onboardingDone) return s; // オンボーディング中は付与しない
        const newFuel = Math.min(s.maxFuel, s.fuel + AUTO_GRANT_PT);
        return {
          ...s,
          fuel: newFuel,
          fuelFullNotified: newFuel >= s.maxFuel ? true : s.fuelFullNotified,
        };
      });
    }, AUTO_GRANT_INTERVAL_MS);
    return () => {
      if (autoGrantTimerRef.current) clearInterval(autoGrantTimerRef.current);
    };
  }, []);

  return (
    <AppContext.Provider value={{ state, setScreen, setPreferredGachaMode, simulateMovement, spinGacha, applyGachaResult, applyMultiGachaResults, convertToPoints, setCarConfig, togglePsychBadge, dismissFuelNotification, addMovementHistory, completeOnboarding, resetDemo, showOnboarding, toggleHaptics, clearCollection }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

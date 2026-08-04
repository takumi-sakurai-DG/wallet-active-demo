import { createContext, useContext, useState, useRef, useEffect } from "react";

export type Screen = "onboarding" | "home" | "choose" | "gacha" | "gacha-result" | "multi-gacha-result" | "convert" | "convert-done" | "car-register" | "history" | "settings" | "collection" | "notifications" | "avatar";

// ── マイカーアバター育成 ──
export type AvatarItemCategory = "wheel" | "body" | "interior" | "special";
export type AvatarItemRarity = "common" | "rare" | "epic" | "legendary";

export interface AvatarItem {
  id: string;
  name: string;
  category: AvatarItemCategory;
  rarity: AvatarItemRarity;
  emoji: string;
  description: string;
  acquiredAt: string;
  fromGachaType: GachaResult["type"];
}

export interface AvatarState {
  level: number;
  exp: number;
  expToNext: number;
  equippedItems: Partial<Record<AvatarItemCategory, AvatarItem>>;
  collectedItems: AvatarItem[];
  totalGachaCount: number;
}

export type NotificationType = "fuel_full" | "point_grant" | "boost_active" | "mission_near" | "campaign";

export interface NotificationPrefs {
  fuel_full: boolean;
  point_grant: boolean;
  boost_active: boolean;
  mission_near: boolean;
  campaign: boolean;
}

export const DEFAULT_NOTIF_PREFS: NotificationPrefs = {
  fuel_full: true,
  point_grant: true,
  boost_active: true,
  mission_near: true,
  campaign: true,
};

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  actionScreen?: Screen;
}

export interface MovementRecord {
  id: string;
  date: string;
  time: string;
  route: string;
  distance: number;
  fuelGained: number;
  isHighBoost: boolean;
  transportType: "car" | "train" | "walk";
  carModel?: string;
}

export interface CarConfig {
  model: string;
  modelLabel: string;
  color: string;
  colorLabel: string;
  colorHex: string;
  imgUrl?: string;
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

export interface AppState {
  fuel: number;
  maxFuel: number;
  points: number;
  pendingPoints: number;
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
  preferredGachaMode: 1 | 3 | 10 | null;
  gachaCollection: GachaCollectionItem[];
  notificationsEnabled: boolean;
  notifications: AppNotification[];
  notificationPrefs: NotificationPrefs;
  avatar: AvatarState;
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
  toggleNotifications: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  claimPendingPoints: () => void;
  toggleNotifPref: (type: keyof NotificationPrefs) => void;
  addNotification: (notif: Omit<AppNotification, "id" | "timestamp" | "read">) => void;
  equipAvatarItem: (item: AvatarItem) => void;
}

// ---- 初期通知データ（デモ用） ----
const INITIAL_NOTIFICATIONS: AppNotification[] = [
  { id: "n1", type: "fuel_full",    title: "⛽ Fuelが満タンになりました", body: "今すぐガチャを回してポイントを獲得しましょう。満タンのまま放置すると損です！", timestamp: "08/03 09:15", read: false, actionScreen: "choose" },
  { id: "n2", type: "point_grant",  title: "🎁 デイリーポイントを受け取りました", body: "+3pt が自動付与されました。毎日ログインで継続ボーナスが増えていきます。", timestamp: "08/03 09:00", read: false, actionScreen: "home" },
  { id: "n3", type: "boost_active", title: "🚀 ハイブーストが発動中です", body: "次回の車移動でポイント獲得量が2倍になります。お早めにご利用ください。", timestamp: "08/02 22:30", read: true, actionScreen: "home" },
  { id: "n4", type: "mission_near", title: "🎯 MISSIONまであと1回です", body: "あと1回ガチャを回すとFuelが満タンになります。今がチャンスです！", timestamp: "08/02 18:45", read: true, actionScreen: "choose" },
  { id: "n5", type: "campaign",     title: "🎉 期間限定キャンペーン開催中", body: "8/10まで毎日ガチャ1回無料！JACKPOTの確率が通常の1.5倍にアップしています。", timestamp: "08/01 10:00", read: true, actionScreen: "choose" },
  { id: "n6", type: "point_grant",  title: "🎁 デイリーポイントを受け取りました", body: "+3pt が自動付与されました。", timestamp: "08/01 09:00", read: true, actionScreen: "home" },
  { id: "n7", type: "fuel_full",    title: "⛽ Fuelが満タンになりました", body: "ガチャを回してポイントに変換しましょう。", timestamp: "07/31 14:20", read: true, actionScreen: "choose" },
];

// ---- 初期履歴データ（デモ用） ----
const INITIAL_HISTORY: MovementRecord[] = [
  { id: "h1", date: "07/28 (月)", time: "08:32", route: "自宅 → 渋谷",   distance: 12.4, fuelGained: 12, isHighBoost: true,  transportType: "car", carModel: "crown" },
  { id: "h2", date: "07/28 (月)", time: "12:15", route: "渋谷 → 六本木", distance: 4.2,  fuelGained: 4,  isHighBoost: false, transportType: "car", carModel: "crown" },
  { id: "h3", date: "07/27 (日)", time: "10:05", route: "自宅 → 横浜",   distance: 18.7, fuelGained: 18, isHighBoost: true,  transportType: "car", carModel: "crown" },
  { id: "h4", date: "07/27 (日)", time: "15:48", route: "横浜 → 川崎",   distance: 9.1,  fuelGained: 9,  isHighBoost: false, transportType: "car", carModel: "crown" },
  { id: "h5", date: "07/26 (土)", time: "09:20", route: "自宅 → 新宿",   distance: 14.3, fuelGained: 14, isHighBoost: true,  transportType: "car", carModel: "crown" },
  { id: "h6", date: "07/26 (土)", time: "19:30", route: "新宿 → 自宅",   distance: 14.3, fuelGained: 8,  isHighBoost: false, transportType: "car", carModel: "crown" },
  { id: "h7", date: "07/25 (金)", time: "07:55", route: "自宅 → 品川",   distance: 16.0, fuelGained: 16, isHighBoost: true,  transportType: "car", carModel: "crown" },
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

function makeTs(): string {
  const now = new Date();
  return `${(now.getMonth()+1).toString().padStart(2,"0")}/${now.getDate().toString().padStart(2,"0")} ${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`;
}

// ── アバターアイテムマスタ ──
const AVATAR_ITEM_POOL: Record<GachaResult["type"], AvatarItem[]> = {
  jackpot: [
    { id: "ai_jackpot_1", name: "ゴールドホイール", category: "wheel", rarity: "legendary", emoji: "🏆", description: "伝説のゴールドホイール。走るたびに輝きを増す。", acquiredAt: "", fromGachaType: "jackpot" },
    { id: "ai_jackpot_2", name: "レーシングストライプ", category: "body", rarity: "legendary", emoji: "⚡", description: "車体に稲妻のストライプが走る。速さの証。", acquiredAt: "", fromGachaType: "jackpot" },
  ],
  "fuel-up": [
    { id: "ai_fuelup_1", name: "スポーツホイール", category: "wheel", rarity: "rare", emoji: "🔵", description: "軽量スポーツホイール。走行効率がアップ。", acquiredAt: "", fromGachaType: "fuel-up" },
    { id: "ai_fuelup_2", name: "ルーフデカール", category: "body", rarity: "rare", emoji: "🌟", description: "ルーフに輝くデカール。個性を演出。", acquiredAt: "", fromGachaType: "fuel-up" },
    { id: "ai_fuelup_3", name: "プレミアムシート", category: "interior", rarity: "epic", emoji: "🪑", description: "上質なレザーシート。乗るたびに特別感。", acquiredAt: "", fromGachaType: "fuel-up" },
  ],
  boost: [
    { id: "ai_boost_1", name: "ターボエンブレム", category: "special", rarity: "epic", emoji: "🚀", description: "ブーストの証。エンジンルームに輝く。", acquiredAt: "", fromGachaType: "boost" },
    { id: "ai_boost_2", name: "スポーツマフラー", category: "body", rarity: "rare", emoji: "💨", description: "低音が響くスポーツマフラー。存在感抜群。", acquiredAt: "", fromGachaType: "boost" },
  ],
  "fuel-down": [
    { id: "ai_miss_1", name: "ベーシックホイールキャップ", category: "wheel", rarity: "common", emoji: "⚪", description: "シンプルなホイールキャップ。次回に期待！", acquiredAt: "", fromGachaType: "fuel-down" },
  ],
};

function pickAvatarItem(gachaType: GachaResult["type"], ts: string): AvatarItem | null {
  const pool = AVATAR_ITEM_POOL[gachaType];
  if (!pool || pool.length === 0) return null;
  const base = pool[Math.floor(Math.random() * pool.length)];
  return { ...base, id: `${base.id}_${Date.now()}`, acquiredAt: ts };
}

function calcExpGain(gachaType: GachaResult["type"]): number {
  const map: Record<GachaResult["type"], number> = { jackpot: 50, "fuel-up": 20, boost: 30, "fuel-down": 5 };
  return map[gachaType] ?? 10;
}

const LEVEL_THRESHOLDS = [50, 100, 200, 400, 800];

function calcLevel(exp: number): { level: number; expToNext: number } {
  let level = 1;
  let remaining = exp;
  for (const t of LEVEL_THRESHOLDS) {
    if (remaining >= t) { remaining -= t; level++; }
    else return { level, expToNext: t - remaining };
  }
  return { level: LEVEL_THRESHOLDS.length + 1, expToNext: 9999 };
}

const RARITY_RANK: Record<AvatarItemRarity, number> = { common: 0, rare: 1, epic: 2, legendary: 3 };

function applyAvatarGacha(avatar: AvatarState, result: GachaResult, ts: string): AvatarState {
  const avatarItem = pickAvatarItem(result.type, ts);
  const newExp = avatar.exp + calcExpGain(result.type);
  const { level, expToNext } = calcLevel(newExp);
  const newCollected = avatarItem
    ? [avatarItem, ...avatar.collectedItems].slice(0, 50)
    : avatar.collectedItems;
  const newEquipped = { ...avatar.equippedItems };
  if (avatarItem) {
    const current = newEquipped[avatarItem.category];
    if (!current || RARITY_RANK[avatarItem.rarity] >= RARITY_RANK[current.rarity]) {
      newEquipped[avatarItem.category] = avatarItem;
    }
  }
  return {
    ...avatar,
    level,
    exp: newExp,
    expToNext,
    equippedItems: newEquipped,
    collectedItems: newCollected,
    totalGachaCount: avatar.totalGachaCount + 1,
  };
}

const INITIAL_AVATAR: AvatarState = {
  level: 1,
  exp: 0,
  expToNext: 50,
  equippedItems: {},
  collectedItems: [],
  totalGachaCount: 0,
};

const AppContext = createContext<AppContextType | null>(null);

const INITIAL_STATE: AppState = {
  fuel: 68,
  maxFuel: 100,
  points: 1240,
  pendingPoints: 320,
  isCarMoving: false,
  isHighBoost: true,
  lastGachaResult: null,
  multiGachaResults: [],
  screen: "onboarding",
  carConfig: {
    model: "crown",
    modelLabel: "CROWN HYBRID",
    color: "white",
    colorLabel: "プラチナホワイト",
    colorHex: "#F5F5F0",
    imgUrl: "/car_images/car_crown.webp",
  },
  showPsychBadge: true,
  fuelFullNotified: false,
  movementHistory: INITIAL_HISTORY,
  onboardingDone: false,
  hapticsEnabled: true,
  preferredGachaMode: null,
  gachaCollection: [],
  notificationsEnabled: true,
  notifications: INITIAL_NOTIFICATIONS,
  notificationPrefs: DEFAULT_NOTIF_PREFS,
  avatar: INITIAL_AVATAR,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(INITIAL_STATE);

  const setScreen = (screen: Screen) => setState((s) => ({ ...s, screen }));

  const addNotification = (notif: Omit<AppNotification, "id" | "timestamp" | "read">) => {
    setState((s) => {
      if (!s.notificationsEnabled) return s;
      if (!s.notificationPrefs[notif.type]) return s;
      const newNotif: AppNotification = {
        ...notif,
        id: `n${Date.now()}`,
        timestamp: makeTs(),
        read: false,
      };
      return { ...s, notifications: [newNotif, ...s.notifications].slice(0, 50) };
    });
  };

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
        carModel: s.carConfig.model,
      };
      const justArrived = !s.isCarMoving;
      const newFuelFull = justArrived && newFuel >= s.maxFuel;
      const newHistory = justArrived
        ? [newRecord, ...s.movementHistory].slice(0, 20)
        : s.movementHistory;
      const ts = makeTs();
      const newNotifs: AppNotification[] = [];
      if (justArrived && s.notificationsEnabled) {
        if (s.notificationPrefs.point_grant) {
          newNotifs.push({
            id: `n${Date.now()}_move`,
            type: "point_grant",
            title: `🚗 移動ポイント +${gained}pt 獲得`,
            body: `${s.isHighBoost ? "ハイブースト" : "通常"}移動でFuelが${gained}増加しました。`,
            timestamp: ts,
            read: false,
            actionScreen: "home",
          });
        }
        if (newFuelFull && s.notificationPrefs.fuel_full) {
          newNotifs.push({
            id: `n${Date.now()}_full`,
            type: "fuel_full",
            title: "⛽ Fuelが満タンになりました",
            body: "今すぐガチャを回してポイントを獲得しましょう。満タンのまま放置すると損です！",
            timestamp: ts,
            read: false,
            actionScreen: "choose",
          });
        }
      }
      return {
        ...s,
        isCarMoving: !s.isCarMoving,
        fuel: newFuel,
        fuelFullNotified: justArrived && newFuel >= s.maxFuel ? true : s.fuelFullNotified,
        movementHistory: newHistory,
        notifications: newNotifs.length > 0
          ? [...newNotifs, ...s.notifications].slice(0, 50)
          : s.notifications,
      };
    });
  };

  const spinGacha = (): GachaResult => weightedRandom();

  const applyGachaResult = (result: GachaResult) => {
    setState((s) => {
      const ts = makeTs();
      const item: GachaCollectionItem = { id: `c${Date.now()}`, timestamp: ts, result, isMulti: false };
      const newAvatar = applyAvatarGacha(s.avatar, result, ts);
      return {
        ...s,
        fuel: Math.max(0, Math.min(s.maxFuel, s.fuel + result.fuelChange)),
        lastGachaResult: result,
        isHighBoost: result.boostMultiplier ? true : s.isHighBoost,
        gachaCollection: [item, ...s.gachaCollection].slice(0, 100),
        avatar: newAvatar,
      };
    });
  };

  const applyMultiGachaResults = (results: GachaResult[], fuelCost: number) => {
    setState((s) => {
      const totalFuelChange = results.reduce((sum, r) => sum + r.fuelChange, 0);
      const hasBoost = results.some(r => r.boostMultiplier);
      const bestResult = results.find(r => r.type === "jackpot") ?? results.find(r => r.type === "boost") ?? results[results.length - 1];
      const ts = makeTs();
      const items: GachaCollectionItem[] = results.map((r, i) => ({
        id: `c${Date.now()}_${i}`,
        timestamp: ts,
        result: r,
        isMulti: true,
        multiCount: results.length,
      }));
      let newAvatar = s.avatar;
      for (const r of results) {
        newAvatar = applyAvatarGacha(newAvatar, r, ts);
      }
      return {
        ...s,
        fuel: Math.max(0, Math.min(s.maxFuel, s.fuel + totalFuelChange - fuelCost)),
        lastGachaResult: bestResult,
        multiGachaResults: results,
        isHighBoost: hasBoost ? true : s.isHighBoost,
        gachaCollection: [...items, ...s.gachaCollection].slice(0, 100),
        avatar: newAvatar,
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

  const claimPendingPoints = () => {
    setState((s) => ({
      ...s,
      points: s.points + s.pendingPoints,
      pendingPoints: 0,
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

  const resetDemo = () => setState({ ...INITIAL_STATE });

  const showOnboarding = () => {
    setState((s) => ({ ...s, screen: "onboarding", onboardingDone: false }));
  };

  const toggleHaptics = () => setState((s) => ({ ...s, hapticsEnabled: !s.hapticsEnabled }));
  const clearCollection = () => setState((s) => ({ ...s, gachaCollection: [] }));
  const toggleNotifications = () => setState((s) => ({ ...s, notificationsEnabled: !s.notificationsEnabled }));
  const markNotificationRead = (id: string) => setState((s) => ({
    ...s,
    notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n),
  }));
  const markAllNotificationsRead = () => setState((s) => ({
    ...s,
    notifications: s.notifications.map(n => ({ ...n, read: true })),
  }));
  const toggleNotifPref = (type: keyof NotificationPrefs) => {
    setState((s) => ({
      ...s,
      notificationPrefs: { ...s.notificationPrefs, [type]: !s.notificationPrefs[type] },
    }));
  };
  const setPreferredGachaMode = (mode: 1 | 3 | 10 | null) => setState((s) => ({ ...s, preferredGachaMode: mode }));
  const equipAvatarItem = (item: AvatarItem) => {
    setState((s) => ({
      ...s,
      avatar: { ...s.avatar, equippedItems: { ...s.avatar.equippedItems, [item.category]: item } },
    }));
  };

  // ── 自動ポイント付与タイマー（30秒ごとに +3 pt）──
  const AUTO_GRANT_PT = 3;
  const AUTO_GRANT_INTERVAL_MS = 30_000;
  const autoGrantTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    autoGrantTimerRef.current = setInterval(() => {
      setState((s) => {
        if (!s.onboardingDone) return s;
        const newFuel = Math.min(s.maxFuel, s.fuel + AUTO_GRANT_PT);
        const newFuelFull = newFuel >= s.maxFuel && s.fuel < s.maxFuel;
        const ts = makeTs();
        const autoNotifs: AppNotification[] = [];
        if (s.notificationsEnabled) {
          if (s.notificationPrefs.point_grant) {
            autoNotifs.push({
              id: `n${Date.now()}_auto`,
              type: "point_grant",
              title: `🎁 デイリーポイント +${AUTO_GRANT_PT}pt 自動付与`,
              body: `毎日自動でFuelが${AUTO_GRANT_PT}増加しました。継続ボーナスが積み上がっています。`,
              timestamp: ts,
              read: false,
              actionScreen: "home",
            });
          }
          if (newFuelFull && s.notificationPrefs.fuel_full) {
            autoNotifs.push({
              id: `n${Date.now()}_autofull`,
              type: "fuel_full",
              title: "⛽ Fuelが満タンになりました",
              body: "今すぐガチャを回してポイントを獲得しましょう。満タンのまま放置すると損です！",
              timestamp: ts,
              read: false,
              actionScreen: "choose",
            });
          }
        }
        return {
          ...s,
          fuel: newFuel,
          fuelFullNotified: newFuel >= s.maxFuel ? true : s.fuelFullNotified,
          notifications: autoNotifs.length > 0
            ? [...autoNotifs, ...s.notifications].slice(0, 50)
            : s.notifications,
        };
      });
    }, AUTO_GRANT_INTERVAL_MS);
    return () => {
      if (autoGrantTimerRef.current) clearInterval(autoGrantTimerRef.current);
    };
  }, []);

  return (
    <AppContext.Provider value={{
      state, setScreen, setPreferredGachaMode, simulateMovement, spinGacha,
      applyGachaResult, applyMultiGachaResults, convertToPoints, setCarConfig,
      togglePsychBadge, dismissFuelNotification, addMovementHistory, completeOnboarding,
      resetDemo, showOnboarding, toggleHaptics, clearCollection, toggleNotifications,
      markNotificationRead, markAllNotificationsRead, claimPendingPoints,
      toggleNotifPref, addNotification, equipAvatarItem,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

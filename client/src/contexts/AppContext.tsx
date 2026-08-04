import { createContext, useContext, useState, useRef, useEffect } from "react";

export type Screen = "onboarding" | "home" | "choose" | "gacha" | "gacha-result" | "multi-gacha-result" | "convert" | "convert-done" | "car-register" | "history" | "settings" | "collection" | "notifications" | "avatar";

// ── ブーストアイテム（消耗型） ──
export type BoostItemCategory = "tire" | "engine" | "oil" | "special";
export type BoostItemRarity = "common" | "rare" | "epic" | "legendary";

export interface BoostItem {
  id: string;
  name: string;
  category: BoostItemCategory;
  rarity: BoostItemRarity;
  emoji: string;
  description: string;
  multiplier: number;       // 移動ポイント倍率 (例: 1.5, 2.0)
  maxDurability: number;    // 最大耐久回数 (0 = 使い切り1回)
  durability: number;       // 残り耐久回数
  acquiredAt: string;
  equipped: boolean;
}

// ── アバター状態 ──
export interface AvatarState {
  level: number;
  exp: number;
  expToNext: number;
  equippedItem: BoostItem | null;   // 装備中のタイヤ/アイテム（1枠）
  inventory: BoostItem[];           // 所持アイテム一覧
  totalGachaCount: number;
}

export type NotificationType = "point_grant" | "boost_active" | "mission_near" | "campaign" | "item_acquired";

export interface NotificationPrefs {
  point_grant: boolean;
  boost_active: boolean;
  mission_near: boolean;
  campaign: boolean;
  item_acquired: boolean;
}

export const DEFAULT_NOTIF_PREFS: NotificationPrefs = {
  point_grant: true,
  boost_active: true,
  mission_near: true,
  campaign: true,
  item_acquired: true,
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
  pointsGained: number;
  multiplierApplied: number;
  itemUsed: string | null;
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
  item: BoostItem;
  isMulti: boolean;
  multiCount?: number;
}

// ガチャ結果型（アイテム取得に変更）
export interface GachaResult {
  type: "legendary" | "epic" | "rare" | "common";
  label: string;
  item: BoostItem;
  description: string;
}

export interface AppState {
  points: number;
  pendingPoints: number;
  isCarMoving: boolean;
  lastGachaResult: GachaResult | null;
  multiGachaResults: GachaResult[];
  screen: Screen;
  carConfig: CarConfig;
  showPsychBadge: boolean;
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
  applyMultiGachaResults: (results: GachaResult[], pointCost: number) => void;
  convertToPoints: () => void;
  setCarConfig: (config: CarConfig) => void;
  togglePsychBadge: () => void;
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
  equipItem: (item: BoostItem) => void;
  unequipItem: () => void;
  dismissFuelNotification: () => void;
}

// ── 初期通知データ ──
const INITIAL_NOTIFICATIONS: AppNotification[] = [
  { id: "n1", type: "item_acquired",  title: "🎉 新アイテムを取得しました", body: "スポーツタイヤ（RARE）を入手！装備すると移動ポイントが1.5倍になります。", timestamp: "08/03 09:15", read: false, actionScreen: "avatar" },
  { id: "n2", type: "point_grant",    title: "🎁 デイリーポイントを受け取りました", body: "+3pt が自動付与されました。毎日継続でボーナスが積み上がります。", timestamp: "08/03 09:00", read: false, actionScreen: "home" },
  { id: "n3", type: "boost_active",   title: "🚀 ブーストアイテム装備中", body: "スポーツタイヤを装備中。次回の車移動でポイント獲得量が1.5倍になります。", timestamp: "08/02 22:30", read: true, actionScreen: "avatar" },
  { id: "n4", type: "mission_near",   title: "🎯 アバターLv2まであと少し！", body: "あと1回ガチャを回すとアバターがレベルアップします。今がチャンスです！", timestamp: "08/02 18:45", read: true, actionScreen: "gacha" },
  { id: "n5", type: "campaign",       title: "🎉 期間限定キャンペーン開催中", body: "8/10まで毎日ガチャ1回無料！LEGENDARYアイテムの排出率が通常の1.5倍にアップ。", timestamp: "08/01 10:00", read: true, actionScreen: "gacha" },
  { id: "n6", type: "point_grant",    title: "🎁 デイリーポイントを受け取りました", body: "+3pt が自動付与されました。", timestamp: "08/01 09:00", read: true, actionScreen: "home" },
];

// ── 初期移動履歴 ──
const INITIAL_HISTORY: MovementRecord[] = [
  { id: "h1", date: "07/28 (月)", time: "08:32", route: "自宅 → 渋谷",   distance: 12.4, pointsGained: 18, multiplierApplied: 1.5, itemUsed: "スポーツタイヤ", transportType: "car", carModel: "crown" },
  { id: "h2", date: "07/28 (月)", time: "12:15", route: "渋谷 → 六本木", distance: 4.2,  pointsGained: 6,  multiplierApplied: 1.0, itemUsed: null, transportType: "car", carModel: "crown" },
  { id: "h3", date: "07/27 (日)", time: "10:05", route: "自宅 → 横浜",   distance: 18.7, pointsGained: 24, multiplierApplied: 2.0, itemUsed: "ブーストタイヤ", transportType: "car", carModel: "crown" },
  { id: "h4", date: "07/27 (日)", time: "15:48", route: "横浜 → 川崎",   distance: 9.1,  pointsGained: 9,  multiplierApplied: 1.0, itemUsed: null, transportType: "car", carModel: "crown" },
  { id: "h5", date: "07/26 (土)", time: "09:20", route: "自宅 → 新宿",   distance: 14.3, pointsGained: 21, multiplierApplied: 1.5, itemUsed: "スポーツタイヤ", transportType: "car", carModel: "crown" },
  { id: "h6", date: "07/26 (土)", time: "19:30", route: "新宿 → 自宅",   distance: 14.3, pointsGained: 12, multiplierApplied: 1.0, itemUsed: null, transportType: "car", carModel: "crown" },
  { id: "h7", date: "07/25 (金)", time: "07:55", route: "自宅 → 品川",   distance: 16.0, pointsGained: 32, multiplierApplied: 2.0, itemUsed: "ブーストタイヤ", transportType: "car", carModel: "crown" },
];

// ── ブーストアイテムマスタ ──
function makeItem(
  base: Omit<BoostItem, "id" | "acquiredAt" | "equipped" | "durability">,
  ts = ""
): BoostItem {
  return { ...base, id: `item_${Date.now()}_${Math.random().toString(36).slice(2,7)}`, acquiredAt: ts, equipped: false, durability: base.maxDurability };
}

const ITEM_TEMPLATES: Record<string, Omit<BoostItem, "id" | "acquiredAt" | "equipped" | "durability">> = {
  boost_tire:    { name: "ブーストタイヤ",    category: "tire",    rarity: "legendary", emoji: "🏆", description: "伝説のタイヤ。装備中は移動ポイント2倍。耐久3回。", multiplier: 2.0, maxDurability: 3 },
  sports_tire:   { name: "スポーツタイヤ",    category: "tire",    rarity: "epic",      emoji: "🔵", description: "軽量スポーツタイヤ。移動ポイント1.5倍。耐久5回。", multiplier: 1.5, maxDurability: 5 },
  turbo_engine:  { name: "ターボエンジン",    category: "engine",  rarity: "rare",      emoji: "🚀", description: "高出力エンジン。移動ポイント1.3倍。耐久8回。", multiplier: 1.3, maxDurability: 8 },
  std_tire:      { name: "スタンダードタイヤ", category: "tire",    rarity: "common",    emoji: "⚪", description: "標準タイヤ。移動ポイント1.2倍。耐久10回。", multiplier: 1.2, maxDurability: 10 },
  boost_oil:     { name: "ブーストオイル",    category: "oil",     rarity: "common",    emoji: "💧", description: "次回移動のみ1.5倍。使い切りタイプ。", multiplier: 1.5, maxDurability: 1 },
  gold_wheel:    { name: "ゴールドホイール",  category: "tire",    rarity: "legendary", emoji: "✨", description: "伝説のゴールドホイール。移動ポイント2.0倍。耐久3回。", multiplier: 2.0, maxDurability: 3 },
  racing_engine: { name: "レーシングエンジン", category: "engine", rarity: "epic",      emoji: "⚡", description: "レーシング仕様エンジン。移動ポイント1.5倍。耐久5回。", multiplier: 1.5, maxDurability: 5 },
};

// ガチャテーブル（アイテム付与）
type GachaEntry = { rarity: GachaResult["type"]; label: string; templateKey: string; weight: number };
const GACHA_TABLE: GachaEntry[] = [
  { rarity: "legendary", label: "🎉 LEGENDARY!", templateKey: "boost_tire",    weight: 3  },
  { rarity: "legendary", label: "🎉 LEGENDARY!", templateKey: "gold_wheel",    weight: 2  },
  { rarity: "epic",      label: "⚡ EPIC",       templateKey: "sports_tire",   weight: 10 },
  { rarity: "epic",      label: "⚡ EPIC",       templateKey: "racing_engine", weight: 8  },
  { rarity: "rare",      label: "✨ RARE",       templateKey: "turbo_engine",  weight: 25 },
  { rarity: "common",    label: "▲ COMMON",     templateKey: "std_tire",      weight: 35 },
  { rarity: "common",    label: "▲ COMMON",     templateKey: "boost_oil",     weight: 17 },
];

function weightedRandom(ts: string): GachaResult {
  const total = GACHA_TABLE.reduce((a, b) => a + b.weight, 0);
  let rand = Math.random() * total;
  for (const entry of GACHA_TABLE) {
    rand -= entry.weight;
    if (rand <= 0) {
      const item = makeItem(ITEM_TEMPLATES[entry.templateKey], ts);
      return {
        type: entry.rarity,
        label: entry.label,
        item,
        description: item.description,
      };
    }
  }
  const fallback = GACHA_TABLE[GACHA_TABLE.length - 1];
  const item = makeItem(ITEM_TEMPLATES[fallback.templateKey], ts);
  return { type: fallback.rarity, label: fallback.label, item, description: item.description };
}

function makeTs(): string {
  const now = new Date();
  return `${(now.getMonth()+1).toString().padStart(2,"0")}/${now.getDate().toString().padStart(2,"0")} ${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`;
}

function calcExpGain(rarity: GachaResult["type"]): number {
  const map: Record<GachaResult["type"], number> = { legendary: 50, epic: 30, rare: 20, common: 5 };
  return map[rarity] ?? 5;
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

function applyAvatarGacha(avatar: AvatarState, result: GachaResult, ts: string): AvatarState {
  const newExp = avatar.exp + calcExpGain(result.type);
  const { level, expToNext } = calcLevel(newExp);
  const newItem = { ...result.item, acquiredAt: ts };
  const newInventory = [newItem, ...avatar.inventory].slice(0, 50);
  // RARE以上は自動装備（現在の装備より強い場合）
  const RARITY_RANK: Record<BoostItemRarity, number> = { common: 0, rare: 1, epic: 2, legendary: 3 };
  let newEquipped = avatar.equippedItem;
  if (["rare", "epic", "legendary"].includes(result.type)) {
    if (!newEquipped || RARITY_RANK[result.item.rarity] > RARITY_RANK[newEquipped.rarity]) {
      newEquipped = { ...newItem, equipped: true };
    }
  }
  return {
    ...avatar,
    level,
    exp: newExp,
    expToNext,
    equippedItem: newEquipped,
    inventory: newInventory,
    totalGachaCount: avatar.totalGachaCount + 1,
  };
}

// 初期装備済みアイテム（デモ用）
const INITIAL_EQUIPPED: BoostItem = makeItem(ITEM_TEMPLATES["sports_tire"], "07/25 08:00");
const INITIAL_EQUIPPED_WITH_FLAG: BoostItem = { ...INITIAL_EQUIPPED, equipped: true, durability: 3 };

const INITIAL_AVATAR: AvatarState = {
  level: 2,
  exp: 55,
  expToNext: 45,
  equippedItem: INITIAL_EQUIPPED_WITH_FLAG,
  inventory: [
    INITIAL_EQUIPPED_WITH_FLAG,
    makeItem(ITEM_TEMPLATES["boost_oil"], "07/24 10:00"),
    makeItem(ITEM_TEMPLATES["std_tire"], "07/23 09:00"),
  ],
  totalGachaCount: 3,
};

const AppContext = createContext<AppContextType | null>(null);

const INITIAL_STATE: AppState = {
  points: 1240,
  pendingPoints: 320,
  isCarMoving: false,
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
      const newNotif: AppNotification = { ...notif, id: `n${Date.now()}`, timestamp: makeTs(), read: false };
      return { ...s, notifications: [newNotif, ...s.notifications].slice(0, 50) };
    });
  };

  // ── 移動シミュレート ──
  const simulateMovement = () => {
    setState((s) => {
      const equipped = s.avatar.equippedItem;
      const multiplier = equipped ? equipped.multiplier : 1.0;
      const basePoints = s.isCarMoving ? 0 : 6;
      const gained = s.isCarMoving ? 0 : Math.round(basePoints * multiplier);
      const now = new Date();
      const days = ["日","月","火","水","木","金","土"];
      const dateStr = `${(now.getMonth()+1).toString().padStart(2,"0")}/${now.getDate().toString().padStart(2,"0")} (${days[now.getDay()]})`;
      const timeStr = `${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`;
      const newRecord: MovementRecord = {
        id: `h${Date.now()}`,
        date: dateStr,
        time: timeStr,
        route: "シミュレート移動",
        distance: 6.0,
        pointsGained: gained,
        multiplierApplied: multiplier,
        itemUsed: equipped ? equipped.name : null,
        transportType: "car",
        carModel: s.carConfig.model,
      };
      const justArrived = !s.isCarMoving;
      const newHistory = justArrived
        ? [newRecord, ...s.movementHistory].slice(0, 20)
        : s.movementHistory;

      // 装備アイテムの耐久消耗
      let newAvatar = s.avatar;
      if (justArrived && equipped) {
        const newDurability = equipped.durability - 1;
        if (newDurability <= 0) {
          // 耐久切れ → 装備解除
          newAvatar = {
            ...s.avatar,
            equippedItem: null,
            inventory: s.avatar.inventory.map(i =>
              i.id === equipped.id ? { ...i, durability: 0, equipped: false } : i
            ),
          };
        } else {
          newAvatar = {
            ...s.avatar,
            equippedItem: { ...equipped, durability: newDurability },
            inventory: s.avatar.inventory.map(i =>
              i.id === equipped.id ? { ...i, durability: newDurability } : i
            ),
          };
        }
      }

      const ts = makeTs();
      const newNotifs: AppNotification[] = [];
      if (justArrived && s.notificationsEnabled) {
        if (s.notificationPrefs.point_grant) {
          newNotifs.push({
            id: `n${Date.now()}_move`,
            type: "point_grant",
            title: `🚗 移動ポイント +${gained}pt 獲得`,
            body: `${multiplier > 1.0 ? `${equipped?.name}装備で×${multiplier}倍！` : "通常移動で"}${gained}pt 獲得しました。`,
            timestamp: ts,
            read: false,
            actionScreen: "home",
          });
        }
        // 耐久切れ通知
        if (equipped && equipped.durability - 1 <= 0 && s.notificationPrefs.boost_active) {
          newNotifs.push({
            id: `n${Date.now()}_worn`,
            type: "boost_active",
            title: `⚠️ ${equipped.name}の耐久が切れました`,
            body: "ノーマルに戻りました。ガチャで新しいアイテムを入手しましょう！",
            timestamp: ts,
            read: false,
            actionScreen: "gacha",
          });
        }
      }

      return {
        ...s,
        isCarMoving: !s.isCarMoving,
        pendingPoints: justArrived ? s.pendingPoints + gained : s.pendingPoints,
        movementHistory: newHistory,
        avatar: newAvatar,
        notifications: newNotifs.length > 0
          ? [...newNotifs, ...s.notifications].slice(0, 50)
          : s.notifications,
      };
    });
  };

  const spinGacha = (): GachaResult => weightedRandom(makeTs());

  const applyGachaResult = (result: GachaResult) => {
    setState((s) => {
      if (s.points < 10) return s;
      const ts = makeTs();
      const item: GachaCollectionItem = { id: `c${Date.now()}`, timestamp: ts, item: result.item, isMulti: false };
      const newAvatar = applyAvatarGacha(s.avatar, result, ts);
      const newNotifs: AppNotification[] = [];
      if (s.notificationsEnabled && s.notificationPrefs.item_acquired) {
        newNotifs.push({
          id: `n${Date.now()}_item`,
          type: "item_acquired",
          title: `${result.item.emoji} ${result.item.name}を取得！`,
          body: result.item.description,
          timestamp: ts,
          read: false,
          actionScreen: "avatar",
        });
      }
      return {
        ...s,
        points: s.points - 10,
        lastGachaResult: result,
        gachaCollection: [item, ...s.gachaCollection].slice(0, 100),
        avatar: newAvatar,
        notifications: newNotifs.length > 0
          ? [...newNotifs, ...s.notifications].slice(0, 50)
          : s.notifications,
      };
    });
  };

  const applyMultiGachaResults = (results: GachaResult[], pointCost: number) => {
    setState((s) => {
      if (s.points < pointCost) return s;
      const bestResult = results.find(r => r.type === "legendary") ?? results.find(r => r.type === "epic") ?? results[results.length - 1];
      const ts = makeTs();
      const items: GachaCollectionItem[] = results.map((r, i) => ({
        id: `c${Date.now()}_${i}`,
        timestamp: ts,
        item: r.item,
        isMulti: true,
        multiCount: results.length,
      }));
      let newAvatar = s.avatar;
      for (const r of results) {
        newAvatar = applyAvatarGacha(newAvatar, r, ts);
      }
      return {
        ...s,
        points: s.points - pointCost,
        lastGachaResult: bestResult,
        multiGachaResults: results,
        gachaCollection: [...items, ...s.gachaCollection].slice(0, 100),
        avatar: newAvatar,
      };
    });
  };

  // ポイント変換（TOYOTAポイントへ）
  const convertToPoints = () => {
    setState((s) => ({ ...s, points: 0 }));
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
  // 後方互換のためダミー関数として残す
  const dismissFuelNotification = () => {};
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
  const showOnboarding = () => setState((s) => ({ ...s, screen: "onboarding", onboardingDone: false }));
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

  const equipItem = (item: BoostItem) => {
    setState((s) => ({
      ...s,
      avatar: {
        ...s.avatar,
        equippedItem: { ...item, equipped: true },
        inventory: s.avatar.inventory.map(i =>
          i.id === item.id ? { ...i, equipped: true } : { ...i, equipped: false }
        ),
      },
    }));
  };

  const unequipItem = () => {
    setState((s) => ({
      ...s,
      avatar: {
        ...s.avatar,
        equippedItem: null,
        inventory: s.avatar.inventory.map(i => ({ ...i, equipped: false })),
      },
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
        const ts = makeTs();
        const autoNotifs: AppNotification[] = [];
        if (s.notificationsEnabled && s.notificationPrefs.point_grant) {
          autoNotifs.push({
            id: `n${Date.now()}_auto`,
            type: "point_grant",
            title: `🎁 デイリーポイント +${AUTO_GRANT_PT}pt 自動付与`,
            body: `毎日自動で${AUTO_GRANT_PT}pt が積み上がりました。`,
            timestamp: ts,
            read: false,
            actionScreen: "home",
          });
        }
        return {
          ...s,
          pendingPoints: s.pendingPoints + AUTO_GRANT_PT,
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
      toggleNotifPref, addNotification, equipItem, unequipItem,
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

import { useApp, CarConfig } from "@/contexts/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { CheckCircle, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { toast } from "sonner";

// デザイン方針: 車種変更はアバター画面から滑らかに遷移し、共通ナビはアプリ全体のレイアウトで一元表示する。

const ALL_COLORS = {
  white:    { id: "white",    label: "プラチナホワイトパールマイカ", hex: "#F5F5F0", border: "#ddd" },
  black:    { id: "black",    label: "アティチュードブラックマイカ", hex: "#1a1a1a", border: "#555" },
  red:      { id: "red",      label: "スーパーレッドV",              hex: "#C0392B", border: "#C0392B" },
  blue:     { id: "blue",     label: "エモーショナルブルー",          hex: "#5B8DB8", border: "#5B8DB8" },
  silver:   { id: "silver",   label: "シルバーメタリック",           hex: "#A8A9AD", border: "#A8A9AD" },
  navy:     { id: "navy",     label: "ダークブルーマイカ",           hex: "#1B2A4A", border: "#1B2A4A" },
  gray:     { id: "gray",     label: "グレーメタリック",             hex: "#6B7280", border: "#6B7280" },
  green:    { id: "green",    label: "プレシャスメタル",             hex: "#2D6A4F", border: "#2D6A4F" },
  bronze:   { id: "bronze",   label: "ブロンズメタリック",           hex: "#8B6914", border: "#8B6914" },
  orange:   { id: "orange",   label: "オレンジメタリック",           hex: "#D4622A", border: "#D4622A" },
  pearl:    { id: "pearl",    label: "ホワイトパールクリスタルシャイン", hex: "#EEF0EC", border: "#ccc" },
  darkgray: { id: "darkgray", label: "ダークグレーメタリック",       hex: "#3D3D3D", border: "#3D3D3D" },
};

const CATEGORIES = [
  { id: "compact",  label: "コンパクト", icon: "\uD83C\uDFD9\uFE0F" },
  { id: "minivan",  label: "ミニバン",   icon: "\uD83D\uDE90" },
  { id: "sedan",    label: "セダン",     icon: "\uD83D\uDE97" },
  { id: "wagon",    label: "ワゴン",     icon: "\uD83D\uDE99" },
  { id: "suv",      label: "SUV",        icon: "\uD83C\uDFD4\uFE0F" },
  { id: "sports",   label: "スポーツ",   icon: "\uD83C\uDFCE\uFE0F" },
] as const;
type CategoryId = typeof CATEGORIES[number]["id"];

const TOYOTA_IMG = (id: string) => `https://toyota.jp/pages/contents/carlineup/image/car/${id}/30.png`;

const CAR_MODELS_BY_CATEGORY: Record<CategoryId, Array<{
  id: string; label: string; desc: string; imgId: string; colors: string[];
}>> = {
  compact: [
    { id: "yaris",        label: "ヤリス",         desc: "スマートなコンパクトカー",     imgId: "yaris",        colors: ["white","black","red","silver","blue","orange"] },
    { id: "aqua",         label: "アクア",         desc: "低燃費ハイブリッドコンパクト", imgId: "aqua",         colors: ["white","black","red","silver","blue","gray","green"] },
    { id: "roomy",        label: "ルーミー",       desc: "使い勝手抜群のトールワゴン",   imgId: "roomy",        colors: ["white","black","red","silver","navy","gray"] },
    { id: "corollasport", label: "カローラスポーツ", desc: "スポーティなハッチバック",   imgId: "corollasport", colors: ["white","black","red","silver","gray","blue"] },
  ],
  minivan: [
    { id: "alphard",  label: "アルファード", desc: "ラグジュアリーミニバン",   imgId: "alphard", colors: ["white","black","silver","navy","gray"] },
    { id: "voxy",     label: "ヴォクシー",   desc: "スタイリッシュミニバン",   imgId: "voxy",    colors: ["white","black","silver","navy","gray","red"] },
    { id: "sienta",   label: "シエンタ",     desc: "コンパクトファミリーカー", imgId: "sienta",  colors: ["white","black","red","silver","blue","green","orange"] },
    { id: "noah",     label: "ノア",         desc: "広々ファミリーミニバン",   imgId: "noah",    colors: ["white","black","silver","navy","gray","blue"] },
  ],
  sedan: [
    { id: "corolla", label: "カローラ", desc: "信頼のファミリーセダン",   imgId: "corolla", colors: ["white","black","silver","navy","gray","blue"] },
    { id: "crown",   label: "クラウン", desc: "上質なハイブリッドセダン", imgId: "crown",   colors: ["white","black","red","silver","navy","gray"] },
    { id: "prius",   label: "プリウス", desc: "次世代エコハイブリッド",   imgId: "prius",   colors: ["white","black","red","silver","blue","gray"] },
  ],
  wagon: [
    { id: "corollatouring", label: "カローラ ツーリング", desc: "実用的なステーションワゴン", imgId: "corollatouring", colors: ["white","black","silver","navy","gray","blue"] },
    { id: "corollacross",   label: "カローラ クロス",    desc: "クロスオーバーワゴン",       imgId: "corollacross",   colors: ["white","black","red","silver","gray","blue","green"] },
    { id: "harrier",        label: "ハリアー",            desc: "プレミアムクロスオーバー",   imgId: "harrier",        colors: ["white","black","silver","navy","gray","bronze"] },
  ],
  suv: [
    { id: "rav4",        label: "RAV4",          desc: "タフなコンパクトSUV",     imgId: "rav4",        colors: ["white","black","red","silver","gray","green"] },
    { id: "yariscross",  label: "ヤリスクロス",  desc: "コンパクトクロスオーバー", imgId: "yariscross",  colors: ["white","black","red","silver","blue","gray","green"] },
    { id: "landcruiser", label: "ランドクルーザー", desc: "本格オフロードSUV",     imgId: "landcruiser", colors: ["white","black","silver","gray","darkgray"] },
    { id: "raize",       label: "ライズ",         desc: "コンパクトSUV",           imgId: "raize",       colors: ["white","black","red","silver","gray","blue"] },
  ],
  sports: [
    { id: "gr86",    label: "GR86",     desc: "純粋スポーツクーペ",       imgId: "gr86",    colors: ["white","black","red","silver","gray","blue"] },
    { id: "gryaris", label: "GRヤリス", desc: "WRCベースのホットハッチ",   imgId: "gryaris", colors: ["white","black","red","silver","gray"] },
  ],
};

interface ColorFilter { hue: string; sat: string; bright: string; sepia?: string; }
const COLOR_FILTER: Record<string, ColorFilter> = {
  white:    { hue: "0deg",   sat: "5%",   bright: "100%" },
  pearl:    { hue: "0deg",   sat: "8%",   bright: "98%" },
  silver:   { hue: "0deg",   sat: "8%",   bright: "82%" },
  gray:     { hue: "0deg",   sat: "5%",   bright: "55%" },
  darkgray: { hue: "0deg",   sat: "5%",   bright: "30%" },
  black:    { hue: "0deg",   sat: "0%",   bright: "12%" },
  red:      { hue: "355deg", sat: "400%", bright: "70%" },
  blue:     { hue: "195deg", sat: "300%", bright: "65%" },
  navy:     { hue: "210deg", sat: "350%", bright: "28%" },
  green:    { hue: "120deg", sat: "350%", bright: "45%" },
  bronze:   { hue: "30deg",  sat: "200%", bright: "60%", sepia: "60%" },
  orange:   { hue: "15deg",  sat: "400%", bright: "72%" },
};
function buildFilter(colorId: string, glowHex: string, glowSize = 16): string {
  const f = COLOR_FILTER[colorId] ?? COLOR_FILTER.white;
  const sepia = f.sepia ? ` sepia(${f.sepia})` : "";
  return [
    `drop-shadow(0 0 ${glowSize}px ${glowHex}aa)`,
    `hue-rotate(${f.hue})`,
    `saturate(${f.sat})`,
    `brightness(${f.bright})`,
    sepia,
  ].join(" ").trim();
}

function SpeedLines({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 8 }, (_, i) => (
        <motion.div key={i} className="absolute h-px rounded-full"
          style={{ top: `${20 + i * 9}%`, right: 0, width: `${30 + (i * 7) % 40}%`,
            background: `linear-gradient(to left, transparent, ${color}88, transparent)` }}
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: [-80, -300], opacity: [0, 0.8, 0] }}
          transition={{ duration: 0.5 + i * 0.06, delay: i * 0.04, ease: "easeOut", repeat: Infinity, repeatDelay: 0.1 }}
        />
      ))}
    </div>
  );
}

function DriveAnimation({ modelLabel, colorLabel, colorHex, imgId, colorId, onDone }: {
  modelLabel: string; colorLabel: string; colorHex: string; imgId: string; colorId: string; onDone: () => void;
}) {
  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0a0010 0%, #1a0030 50%, #0a0010 100%)" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onAnimationComplete={() => setTimeout(onDone, 2400)}
    >
      <SpeedLines color={colorHex} />
      <motion.div className="relative z-10"
        initial={{ x: -380, opacity: 0 }} animate={{ x: [-380, 0, 0, 32] }}
        transition={{ x: { times: [0, 0.38, 0.82, 1], duration: 2.0, ease: ["circOut", "linear", "easeIn"] }, opacity: { duration: 0.3 } }}>
        <motion.img src={TOYOTA_IMG(imgId)} alt="マイカー" className="w-56 h-auto object-contain"
          style={{ filter: buildFilter(colorId, colorHex, 24), mixBlendMode: "screen" }}
          animate={{ y: [0, -4, 0, -3, 0], rotate: [-0.4, 0.4, -0.4, 0.4, -0.4] }}
          transition={{ duration: 0.32, repeat: Infinity, ease: "easeInOut" }} />
      </motion.div>
      <motion.div className="mt-8 text-center z-10 relative"
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}>
        <div className="text-white font-black text-xl mb-1">{colorLabel}の{modelLabel}</div>
        <div className="text-white/50 text-sm">があなたのアバターになりました</div>
        <motion.div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white"
          style={{ background: "rgba(16,185,129,0.25)", border: "1px solid rgba(16,185,129,0.5)" }}
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}>
          <CheckCircle size={16} color="#10B981" /> 登録完了！ホームに戻ります…
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: "カテゴリー" },
    { n: 2, label: "車種" },
    { n: 3, label: "カラー" },
  ];
  return (
    <div className="flex items-center justify-center gap-1 px-4 py-2 flex-shrink-0">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center gap-1">
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition-all"
              style={{
                background: step >= s.n ? "#E91E8C" : "rgba(0,0,0,0.08)",
                color: step >= s.n ? "#fff" : "#9CA3AF",
              }}>
              {step > s.n ? "✓" : s.n}
            </div>
            <span className="text-[10px] font-bold transition-all"
              style={{ color: step >= s.n ? "#E91E8C" : "#9CA3AF" }}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <ChevronRight size={10} className="text-gray-300 mx-0.5" />
          )}
        </div>
      ))}
    </div>
  );
}

function CategoryStep({ onSelect }: { onSelect: (id: CategoryId) => void }) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-3">
      <p className="text-gray-400 text-xs mb-4 text-center">車種カテゴリーを選んでください</p>
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((cat) => (
          <motion.button
            key={cat.id}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelect(cat.id)}
            className="flex flex-col items-center justify-center gap-2 py-5 rounded-2xl transition-all"
            style={{
              background: "#FFFFFF",
              border: "1px solid rgba(0,0,0,0.09)",
              boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
            }}
          >
            <span className="text-3xl">{cat.icon}</span>
            <span className="text-gray-700 font-bold text-sm">{cat.label}</span>
            <span className="text-gray-400 text-[10px]">
              {CAR_MODELS_BY_CATEGORY[cat.id].length}車種
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function ModelStep({
  categoryId,
  onSelect,
  onBack,
}: {
  categoryId: CategoryId;
  onSelect: (modelIdx: number) => void;
  onBack: () => void;
}) {
  const models = CAR_MODELS_BY_CATEGORY[categoryId];
  const cat = CATEGORIES.find(c => c.id === categoryId)!;
  return (
    <div className="flex-1 overflow-y-auto px-4 py-3">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={onBack} className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.05)" }}>
          <ChevronLeft size={14} className="text-gray-500" />
        </button>
        <span className="text-gray-500 text-xs">{cat.icon} {cat.label}</span>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-gray-700 text-xs font-bold">車種を選ぶ</span>
      </div>
      <div className="flex flex-col gap-3">
        {models.map((model, idx) => (
          <motion.button
            key={model.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(idx)}
            className="flex items-center gap-3 px-3 py-3 rounded-2xl transition-all text-left"
            style={{
              background: "#FFFFFF",
              border: "1px solid rgba(0,0,0,0.09)",
              boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
            }}
          >
            <div className="w-24 h-16 flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden"
              style={{ background: "linear-gradient(135deg, #f0f4f8 0%, #e8edf2 100%)" }}>
              <img
                src={TOYOTA_IMG(model.imgId)}
                alt={model.label}
                className="w-full h-full object-contain p-1"
                style={{ mixBlendMode: "multiply" }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-gray-800 font-black text-sm">{model.label}</div>
              <div className="text-gray-400 text-[11px] mt-0.5">{model.desc}</div>
              <div className="flex gap-1 mt-1.5 flex-wrap">
                {model.colors.slice(0, 6).map(cid => {
                  const c = ALL_COLORS[cid as keyof typeof ALL_COLORS];
                  return c ? (
                    <div key={cid} className="w-3 h-3 rounded-full border"
                      style={{ background: c.hex, borderColor: c.border }} />
                  ) : null;
                })}
                {model.colors.length > 6 && (
                  <span className="text-gray-400 text-[10px] self-center">+{model.colors.length - 6}</span>
                )}
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function ColorStep({
  categoryId,
  modelIdx,
  selectedColor,
  onColorChange,
  onBack,
  onConfirm,
}: {
  categoryId: CategoryId;
  modelIdx: number;
  selectedColor: string;
  onColorChange: (id: string) => void;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const model = CAR_MODELS_BY_CATEGORY[categoryId][modelIdx];
  const cat = CATEGORIES.find(c => c.id === categoryId)!;
  const modelColors = model.colors.map(cid => ALL_COLORS[cid as keyof typeof ALL_COLORS]).filter(Boolean);
  const currentColor = modelColors.find(c => c.id === selectedColor) ?? modelColors[0];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-2 flex-shrink-0">
        <button onClick={onBack} className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.05)" }}>
          <ChevronLeft size={14} className="text-gray-500" />
        </button>
        <span className="text-gray-400 text-[10px]">{cat.icon} {cat.label}</span>
        <ChevronRight size={10} className="text-gray-300" />
        <span className="text-gray-400 text-[10px]">{model.label}</span>
        <ChevronRight size={10} className="text-gray-300" />
        <span className="text-gray-600 text-[10px] font-bold">カラー選択</span>
      </div>

      <div className="flex-shrink-0 mx-4 rounded-2xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, #f0f4f8 0%, #e8edf2 100%)", border: "1px solid rgba(0,0,0,0.08)" }}>
        <div className="flex flex-col items-center py-5 px-4">
          <AnimatePresence mode="wait">
            <motion.img
              key={selectedColor}
              src={TOYOTA_IMG(model.imgId)}
              alt={model.label}
              className="h-36 w-auto object-contain"
              style={{
                filter: buildFilter(currentColor?.id ?? "white", currentColor?.hex ?? "#fff", 20),
                mixBlendMode: "multiply",
                maxWidth: "85%",
              }}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
            />
          </AnimatePresence>
          <div className="mt-2 text-center">
            <div className="text-gray-800 font-black text-base">{model.label}</div>
            <AnimatePresence mode="wait">
              <motion.div key={currentColor?.id}
                initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-center gap-1.5 mt-1">
                <div className="w-2.5 h-2.5 rounded-full border"
                  style={{ background: currentColor?.hex, borderColor: currentColor?.border }} />
                <span className="text-gray-500 text-xs">{currentColor?.label}</span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 mx-4 mt-3 rounded-2xl px-4 py-3"
        style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.09)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <div className="text-gray-500 text-[10px] font-bold tracking-widest mb-3">
          カラーを選ぶ（{modelColors.length}色）
        </div>
        <div className="flex gap-3 flex-wrap">
          {modelColors.map(color => (
            <motion.button key={color.id} whileTap={{ scale: 0.88 }}
              onClick={() => onColorChange(color.id)}
              className="w-9 h-9 rounded-full relative transition-all"
              style={{
                background: color.hex,
                border: `3px solid ${selectedColor === color.id ? "#E91E8C" : "rgba(0,0,0,0.14)"}`,
                boxShadow: selectedColor === color.id
                  ? `0 0 0 2px rgba(233,30,140,0.25), 0 0 10px ${color.hex}88`
                  : "none",
              }}>
              {selectedColor === color.id && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <CheckCircle size={14} color={["white","silver","pearl"].includes(color.id) ? "#333" : "white"} />
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="flex-1" />

      <div className="flex-shrink-0 px-4 pt-2"
        style={{ paddingBottom: "max(1.25rem, calc(env(safe-area-inset-bottom) + 4rem))" }}>
        <motion.button whileTap={{ scale: 0.97 }} onClick={onConfirm}
          className="w-full py-3.5 rounded-2xl font-black text-base text-white transition-all"
          style={{ background: "linear-gradient(135deg, #E91E8C, #C0166F)", boxShadow: "0 4px 20px rgba(233,30,140,0.35)" }}>
          \uD83D\uDE97 このクルマで登録する
        </motion.button>
        <div className="text-center text-gray-400 text-xs mt-1.5">マイカーはいつでも変更できます</div>
      </div>
    </div>
  );
}

interface CarRegisterScreenProps {
  onNavigateHome?: () => void;
}
export default function CarRegisterScreen({ onNavigateHome }: CarRegisterScreenProps) {
  const { state, setScreen, setCarConfig } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [selectedModelIdx, setSelectedModelIdx] = useState<number>(0);
  const [selectedColor, setSelectedColor] = useState(state.carConfig.color || "white");
  const [showDriveAnim, setShowDriveAnim] = useState(false);

  const currentModels = selectedCategory ? CAR_MODELS_BY_CATEGORY[selectedCategory] : [];
  const currentModel = selectedCategory ? currentModels[selectedModelIdx] : null;
  const currentColorObj = currentModel
    ? (ALL_COLORS[selectedColor as keyof typeof ALL_COLORS] ?? ALL_COLORS.white)
    : ALL_COLORS.white;

  const handleCategorySelect = (id: CategoryId) => {
    setSelectedCategory(id);
    setSelectedModelIdx(0);
    setStep(2);
  };

  const handleModelSelect = (idx: number) => {
    setSelectedModelIdx(idx);
    const model = CAR_MODELS_BY_CATEGORY[selectedCategory!][idx];
    if (!model.colors.includes(selectedColor)) {
      setSelectedColor(model.colors[0]);
    }
    setStep(3);
  };

  const handleSave = () => {
    if (!currentModel || !selectedCategory) return;
    const config: CarConfig = {
      model: currentModel.id,
      modelLabel: currentModel.label,
      color: currentColorObj.id,
      colorLabel: currentColorObj.label,
      colorHex: currentColorObj.hex,
      imgUrl: TOYOTA_IMG(currentModel.imgId),
    };
    setCarConfig(config);
    setShowDriveAnim(true);
  };

  const handleAnimDone = () => {
    toast.success("マイカーを更新しました", {
      description: `${state.carConfig.modelLabel} · ${state.carConfig.colorLabel}`,
      duration: 3000,
      style: {
        background: "linear-gradient(135deg, #E91E8C, #FF6EB4)",
        color: "#fff",
        border: "none",
        fontWeight: "800",
      },
    });
    if (onNavigateHome) onNavigateHome();
    else setScreen("home");
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden relative"
      style={{ background: "linear-gradient(180deg, #F8F9FA 0%, #F1F3F5 100%)" }}>

      <AnimatePresence>
        {showDriveAnim && currentModel && (
          <DriveAnimation
            modelLabel={currentModel.label}
            colorLabel={currentColorObj.label}
            colorHex={currentColorObj.hex}
            imgId={currentModel.imgId}
            colorId={currentColorObj.id}
            onDone={handleAnimDone}
          />
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3 px-4 flex-shrink-0"
        style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))", paddingBottom: "0.25rem" }}>
        <motion.button whileTap={{ scale: 0.9 }}
          onClick={() => {
            if (step === 1) setScreen("home");
            else if (step === 2) setStep(1);
            else setStep(2);
          }}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.05)" }}>
          <ChevronLeft size={16} className="text-gray-500" />
        </motion.button>
        <div className="flex-1">
          <h2 className="text-gray-800 font-black text-base">マイカーを選ぶ</h2>
        </div>
        {step === 3 && currentModel && (
          <button onClick={() => setStep(1)}
            className="text-[10px] text-pink-500 font-bold flex items-center gap-0.5">
            最初から <ChevronDown size={10} className="rotate-90" />
          </button>
        )}
      </div>

      <StepIndicator step={step} />

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" className="flex-1 flex flex-col overflow-hidden"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}>
            <CategoryStep onSelect={handleCategorySelect} />
          </motion.div>
        )}
        {step === 2 && selectedCategory && (
          <motion.div key="step2" className="flex-1 flex flex-col overflow-hidden"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}>
            <ModelStep
              categoryId={selectedCategory}
              onSelect={handleModelSelect}
              onBack={() => setStep(1)}
            />
          </motion.div>
        )}
        {step === 3 && selectedCategory && currentModel && (
          <motion.div key="step3" className="flex-1 flex flex-col overflow-hidden"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}>
            <ColorStep
              categoryId={selectedCategory}
              modelIdx={selectedModelIdx}
              selectedColor={selectedColor}
              onColorChange={setSelectedColor}
              onBack={() => setStep(2)}
              onConfirm={handleSave}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

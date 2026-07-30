import { useApp, CarConfig } from "@/contexts/AppContext";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { useState, useRef } from "react";
import { CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import BottomNavBar from "@/components/BottomNavBar";

// ================================================================
// カラー定義
// ================================================================
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
};

const CAR_MODELS = [
  { id: "crown",           label: "CROWN HYBRID",     icon: "👑",         imgUrl: "/car_images/car_crown.webp",           desc: "上質なハイブリッドセダン",     colors: ["white","black","red","silver","navy","gray"] },
  { id: "prius",           label: "PRIUS",             icon: "🌿",         imgUrl: "/car_images/car_prius.webp",           desc: "次世代エコハイブリッド",       colors: ["white","black","red","silver","blue","gray"] },
  { id: "harrier",         label: "HARRIER",           icon: "🦅",         imgUrl: "/car_images/car_harrier.webp",         desc: "プレミアムSUVクロスオーバー", colors: ["white","black","silver","navy","gray","bronze"] },
  { id: "rav4",            label: "RAV4",              icon: "🏔️",        imgUrl: "/car_images/car_rav4.webp",            desc: "タフなコンパクトSUV",         colors: ["white","black","red","silver","gray","green"] },
  { id: "alphard",         label: "ALPHARD",           icon: "✨",         imgUrl: "/car_images/car_alphard.webp",         desc: "ラグジュアリーミニバン",       colors: ["white","black","silver","navy","gray"] },
  { id: "yaris",           label: "YARIS",             icon: "🏙️",        imgUrl: "/car_images/car_yaris.webp",           desc: "スマートなコンパクトカー",     colors: ["white","black","red","silver","blue","orange"] },
  { id: "corolla",         label: "COROLLA",           icon: "🚗",         imgUrl: "/car_images/car_corolla.webp",         desc: "信頼のファミリーセダン",       colors: ["white","black","silver","navy","gray","blue"] },
  { id: "landcruiser",     label: "LAND CRUISER",      icon: "🏕️",        imgUrl: "/car_images/car_landcruiser.webp",     desc: "本格オフロードSUV",           colors: ["white","black","silver","gray","green","bronze"] },
  { id: "gr86",            label: "GR86",              icon: "🏎️",        imgUrl: "/car_images/car_86.webp",              desc: "純粋スポーツクーペ",           colors: ["white","black","red","silver","gray","orange"] },
  { id: "noah",            label: "NOAH",              icon: "🚐",         imgUrl: "/car_images/car_noah.webp",            desc: "広々ファミリーミニバン",       colors: ["white","black","silver","navy","gray"] },
  { id: "fj_cruiser",      label: "FJ CRUISER",        icon: "🟡",         imgUrl: "/car_images/car_fj_cruiser.webp",      desc: "個性派レトロオフローダー",     colors: ["white","black","orange","green","gray"] },
  { id: "landcruiser_fj",  label: "LAND CRUISER FJ",  icon: "🪖",         imgUrl: "/car_images/car_landcruiser_fj.webp",  desc: "伝説のクラシック4×4",         colors: ["white","black","green","bronze","gray"] },
  { id: "landcruiser_250", label: "LAND CRUISER 250", icon: "🏔️",        imgUrl: "/car_images/car_landcruiser_250.webp", desc: "最新世代フルサイズSUV",       colors: ["white","black","silver","gray","bronze"] },
];

// ================================================================
// CSS filter でカラーを表現
// ================================================================
interface ColorFilter { hue: string; sat: string; bright: string; sepia?: string; }
const COLOR_FILTER: Record<string, ColorFilter> = {
  white:  { hue: "0deg",   sat: "5%",   bright: "100%" },
  silver: { hue: "0deg",   sat: "8%",   bright: "82%" },
  gray:   { hue: "0deg",   sat: "5%",   bright: "55%" },
  black:  { hue: "0deg",   sat: "0%",   bright: "12%" },
  red:    { hue: "355deg", sat: "400%", bright: "70%" },
  blue:   { hue: "195deg", sat: "300%", bright: "65%" },
  navy:   { hue: "210deg", sat: "350%", bright: "28%" },
  green:  { hue: "120deg", sat: "350%", bright: "45%" },
  bronze: { hue: "30deg",  sat: "200%", bright: "60%", sepia: "60%" },
  orange: { hue: "15deg",  sat: "400%", bright: "72%" },
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

// ================================================================
// 走行演出オーバーレイ
// ================================================================
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

function DriveAnimation({ model, color, colorHex, onDone }: {
  model: typeof CAR_MODELS[0];
  color: typeof ALL_COLORS[keyof typeof ALL_COLORS];
  colorHex: string;
  onDone: () => void;
}) {
  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0a0010 0%, #1a0030 50%, #0a0010 100%)" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onAnimationComplete={() => setTimeout(onDone, 2400)}
    >
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.05)" }} />
      <motion.div className="absolute bottom-10 left-0 flex gap-10 items-center pointer-events-none"
        animate={{ x: [0, -140] }} transition={{ duration: 0.55, repeat: Infinity, ease: "linear" }}
        style={{ width: "220%" }}>
        {Array.from({ length: 14 }, (_, i) => (
          <div key={i} className="flex-shrink-0 h-px w-14 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} />
        ))}
      </motion.div>
      <SpeedLines color={colorHex} />
      <motion.div className="relative z-10"
        initial={{ x: -380, opacity: 0 }} animate={{ x: [-380, 0, 0, 32] }}
        transition={{ x: { times: [0, 0.38, 0.82, 1], duration: 2.0, ease: ["circOut", "linear", "easeIn"] }, opacity: { duration: 0.3 } }}>
        <motion.img src={model.imgUrl} alt="マイカー" className="w-56 h-auto object-contain"
          style={{ filter: buildFilter(color.id, colorHex, 24) }}
          animate={{ y: [0, -4, 0, -3, 0], rotate: [-0.4, 0.4, -0.4, 0.4, -0.4] }}
          transition={{ duration: 0.32, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
          style={{ width: 150, height: 10, background: "radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 72%)" }}
          animate={{ scaleX: [1, 0.9, 1, 0.92, 1], opacity: [0.7, 0.5, 0.7, 0.55, 0.7] }}
          transition={{ duration: 0.32, repeat: Infinity, ease: "easeInOut" }} />
      </motion.div>
      <motion.div className="mt-8 text-center z-10 relative"
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}>
        <div className="text-white font-black text-xl mb-1">{color.label}の{model.label}</div>
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

// ================================================================
// スワイプ式カルーセル
// ================================================================
function CarCarousel({
  currentIndex,
  selectedColor,
  onChange,
}: {
  currentIndex: number;
  selectedColor: string;
  onChange: (i: number) => void;
}) {
  const dragX = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const model = CAR_MODELS[currentIndex];
  const colorObj = ALL_COLORS[selectedColor as keyof typeof ALL_COLORS] ?? ALL_COLORS.white;

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    const threshold = 50;
    if (info.offset.x < -threshold && currentIndex < CAR_MODELS.length - 1) {
      onChange(currentIndex + 1);
    } else if (info.offset.x > threshold && currentIndex > 0) {
      onChange(currentIndex - 1);
    }
    dragX.set(0);
  };

  return (
    <div className="relative w-full select-none" ref={containerRef}>
      {/* 左矢印 */}
      <button
        onClick={() => currentIndex > 0 && onChange(currentIndex - 1)}
        className="absolute left-2 top-[45%] -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all"
        style={{
          background: currentIndex > 0 ? "rgba(233,30,140,0.10)" : "rgba(0,0,0,0.04)",
          border: `1px solid ${currentIndex > 0 ? "rgba(233,30,140,0.35)" : "rgba(0,0,0,0.10)"}`,
        }}
      >
        <ChevronLeft size={16} color={currentIndex > 0 ? "#E91E8C" : "#9CA3AF"} />
      </button>
      {/* 右矢印 */}
      <button
        onClick={() => currentIndex < CAR_MODELS.length - 1 && onChange(currentIndex + 1)}
        className="absolute right-2 top-[45%] -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all"
        style={{
          background: currentIndex < CAR_MODELS.length - 1 ? "rgba(233,30,140,0.10)" : "rgba(0,0,0,0.04)",
          border: `1px solid ${currentIndex < CAR_MODELS.length - 1 ? "rgba(233,30,140,0.35)" : "rgba(0,0,0,0.10)"}`,
        }}
      >
        <ChevronRight size={16} color={currentIndex < CAR_MODELS.length - 1 ? "#E91E8C" : "#9CA3AF"} />
      </button>

      {/* スワイプ領域 */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        style={{ x: dragX }}
        onDragEnd={handleDragEnd}
        className="cursor-grab active:cursor-grabbing"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={model.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="flex flex-col items-center px-12 pt-3 pb-2"
          >
            {/* カー画像 — mix-blend-mode:multiply で白背景を透過 */}
            <div className="relative w-full flex justify-center items-center" style={{ height: 130 }}>
              <motion.img
                src={model.imgUrl}
                alt={`TOYOTA ${model.label}`}
                className="h-full w-auto object-contain"
                style={{
                  filter: buildFilter(colorObj.id, colorObj.hex, 18),
                  mixBlendMode: "multiply",
                  maxWidth: "88%",
                }}
                onError={(e) => { (e.target as HTMLImageElement).src = "/car_images/car_crown.webp"; }}
              />
            </div>
            {/* 車種名・説明 */}
            <div className="text-center mt-1.5">
              <div className="text-gray-800 font-black text-sm tracking-wide">{model.icon} {model.label}</div>
              <div className="text-gray-400 text-[11px] mt-0.5">{model.desc}</div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ドットインジケーター */}
      <div className="flex justify-center gap-1 pb-2.5 mt-0.5">
        {CAR_MODELS.map((_, i) => (
          <button key={i} onClick={() => onChange(i)}
            className="rounded-full transition-all"
            style={{
              width: i === currentIndex ? 14 : 5,
              height: 5,
              background: i === currentIndex ? "#E91E8C" : "rgba(0,0,0,0.18)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ================================================================
// メイン
// ================================================================
interface CarRegisterScreenProps {
  onNavigateHome?: () => void;
}
export default function CarRegisterScreen({ onNavigateHome }: CarRegisterScreenProps) {
  const { state, setScreen, setCarConfig } = useApp();

  const initialModelIndex = Math.max(0, CAR_MODELS.findIndex(m => m.id === state.carConfig.model));
  const [modelIndex, setModelIndex] = useState(initialModelIndex);
  const [selectedColor, setSelectedColor] = useState(state.carConfig.color || "white");
  const [showDriveAnim, setShowDriveAnim] = useState(false);

  const currentModel = CAR_MODELS[modelIndex];
  const modelColors = currentModel.colors.map(cid => ALL_COLORS[cid as keyof typeof ALL_COLORS]);
  const currentColor = modelColors.find(col => col.id === selectedColor) ?? modelColors[0];

  const handleModelChange = (newIndex: number) => {
    setModelIndex(newIndex);
    const newModel = CAR_MODELS[newIndex];
    if (!newModel.colors.includes(selectedColor)) {
      setSelectedColor(newModel.colors[0]);
    }
  };

  const handleSave = () => {
    const config: CarConfig = {
      model: currentModel.id,
      modelLabel: currentModel.label,
      color: currentColor.id,
      colorLabel: currentColor.label,
      colorHex: currentColor.hex,
      imgUrl: currentModel.imgUrl,
    };
    setCarConfig(config);
    setShowDriveAnim(true);
  };

  const handleAnimDone = () => {
    if (onNavigateHome) onNavigateHome();
    else setScreen("home");
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden relative"
      style={{ background: "linear-gradient(180deg, #F8F9FA 0%, #F1F3F5 100%)" }}>

      {/* 走行アニメーションオーバーレイ */}
      <AnimatePresence>
        {showDriveAnim && (
          <DriveAnimation model={currentModel} color={currentColor} colorHex={currentColor.hex} onDone={handleAnimDone} />
        )}
      </AnimatePresence>

      {/* ヘッダー */}
      <div className="flex items-center gap-3 px-4 flex-shrink-0"
        style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))", paddingBottom: "0.5rem" }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen("home")}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.05)" }}>
          <ChevronLeft size={16} className="text-gray-500" />
        </motion.button>
        <div className="flex-1">
          <h2 className="text-gray-800 font-black text-base">マイカーを選ぶ</h2>
          <p className="text-gray-400 text-[10px]">スワイプして車種を切り替え</p>
        </div>
        <div className="text-gray-400 text-xs font-bold tabular-nums">{modelIndex + 1} / {CAR_MODELS.length}</div>
      </div>

      {/* カルーセル（車種選択） */}
      <div className="flex-shrink-0 mx-3 rounded-2xl overflow-hidden"
        style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.10)", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
        <CarCarousel currentIndex={modelIndex} selectedColor={currentColor.id} onChange={handleModelChange} />
      </div>

      {/* カラー選択 */}
      <div className="flex-shrink-0 mx-3 mt-3 rounded-2xl px-4 py-3"
        style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.10)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <div className="text-gray-500 text-[10px] font-bold tracking-widest mb-2.5">カラーを選ぶ</div>
        <div className="flex gap-2.5 flex-wrap">
          {modelColors.map(color => (
            <motion.button key={color.id} whileTap={{ scale: 0.88 }}
              onClick={() => setSelectedColor(color.id)}
              className="w-9 h-9 rounded-full relative transition-all"
              style={{
                background: color.hex,
                border: `3px solid ${selectedColor === color.id ? "#E91E8C" : "rgba(0,0,0,0.14)"}`,
                boxShadow: selectedColor === color.id ? `0 0 0 2px rgba(233,30,140,0.25), 0 0 10px ${color.hex}88` : "none",
              }}>
              {selectedColor === color.id && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <CheckCircle size={14} color={["white","silver"].includes(color.id) ? "#333" : "white"} />
                </div>
              )}
            </motion.button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={currentColor.id}
            initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="flex items-center gap-1.5 mt-2">
            <div className="w-2.5 h-2.5 rounded-full border" style={{ background: currentColor.hex, borderColor: currentColor.border }} />
            <span className="text-gray-500 text-[11px]">{currentColor.label}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* スペーサー */}
      <div className="flex-1" />

      {/* 固定フッター：登録ボタン */}
      <div className="flex-shrink-0 px-4 pt-2"
        style={{ paddingBottom: "max(1.25rem, calc(env(safe-area-inset-bottom) + 4rem))" }}>
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave}
          className="w-full py-3.5 rounded-2xl font-black text-base text-white transition-all"
          style={{ background: "linear-gradient(135deg, #E91E8C, #C0166F)", boxShadow: "0 4px 20px rgba(233,30,140,0.35)" }}>
          🚗 このクルマで登録する
        </motion.button>
        <div className="text-center text-gray-400 text-xs mt-1.5">マイカーはいつでも変更できます</div>
      </div>

      <BottomNavBar />
    </div>
  );
}

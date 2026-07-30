import { useApp, CarConfig } from "@/contexts/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { CheckCircle } from "lucide-react";
import BottomNavBar from "@/components/BottomNavBar";

// ================================================================
// トヨタ10車種定義（各車種に専用カラーセット）
// ================================================================
const ALL_COLORS = {
  white:    { id: "white",    label: "プラチナホワイトパールマイカ", hex: "#F5F5F0", border: "#ddd" },
  black:    { id: "black",    label: "アティチュードブラックマイカ", hex: "#1a1a1a", border: "#555" },
  red:      { id: "red",      label: "スーパーレッドV",              hex: "#C0392B", border: "#C0392B" },
  blue:     { id: "blue",     label: "エモーショナルレッドII",        hex: "#5B8DB8", border: "#5B8DB8" },
  silver:   { id: "silver",   label: "シルバーメタリック",           hex: "#A8A9AD", border: "#A8A9AD" },
  navy:     { id: "navy",     label: "ダークブルーマイカ",           hex: "#1B2A4A", border: "#1B2A4A" },
  gray:     { id: "gray",     label: "グレーメタリック",             hex: "#6B7280", border: "#6B7280" },
  green:    { id: "green",    label: "プレシャスメタル",             hex: "#2D6A4F", border: "#2D6A4F" },
  bronze:   { id: "bronze",   label: "ブロンズメタリック",           hex: "#8B6914", border: "#8B6914" },
  orange:   { id: "orange",   label: "オレンジメタリック",           hex: "#D4622A", border: "#D4622A" },
};

const CAR_MODELS = [
  {
    id: "crown",
    label: "CROWN HYBRID",
    icon: "👑",
    imgUrl: "/manus-storage/car_crown_b652cbbb.png",
    desc: "上質なハイブリッドセダン",
    colors: ["white", "black", "red", "silver", "navy", "gray"],
  },
  {
    id: "prius",
    label: "PRIUS",
    icon: "🌿",
    imgUrl: "/manus-storage/car_prius_c97ac1d1.png",
    desc: "次世代エコハイブリッド",
    colors: ["white", "black", "red", "silver", "blue", "gray"],
  },
  {
    id: "harrier",
    label: "HARRIER",
    icon: "🦅",
    imgUrl: "/manus-storage/car_harrier_37b1080c.png",
    desc: "プレミアムSUVクロスオーバー",
    colors: ["white", "black", "silver", "navy", "gray", "bronze"],
  },
  {
    id: "rav4",
    label: "RAV4",
    icon: "🏔️",
    imgUrl: "/manus-storage/car_rav4_d2fcdf08.png",
    desc: "タフなコンパクトSUV",
    colors: ["white", "black", "red", "silver", "gray", "green"],
  },
  {
    id: "alphard",
    label: "ALPHARD",
    icon: "✨",
    imgUrl: "/manus-storage/car_alphard_5df84c37.png",
    desc: "ラグジュアリーミニバン",
    colors: ["white", "black", "silver", "navy", "gray"],
  },
  {
    id: "yaris",
    label: "YARIS",
    icon: "🏙️",
    imgUrl: "/manus-storage/car_yaris_a56a1aed.png",
    desc: "スマートなコンパクトカー",
    colors: ["white", "black", "red", "silver", "blue", "orange"],
  },
  {
    id: "corolla",
    label: "COROLLA",
    icon: "🚗",
    imgUrl: "/manus-storage/car_corolla_ab1e2a9d.png",
    desc: "信頼のファミリーセダン",
    colors: ["white", "black", "silver", "navy", "gray", "blue"],
  },
  {
    id: "landcruiser",
    label: "LAND CRUISER",
    icon: "🏕️",
    imgUrl: "/manus-storage/car_landcruiser_c3ff3921.png",
    desc: "本格オフロードSUV",
    colors: ["white", "black", "silver", "gray", "green", "bronze"],
  },
  {
    id: "gr86",
    label: "GR86",
    icon: "🏎️",
    imgUrl: "/manus-storage/car_86_2ab31efa.png",
    desc: "純粋スポーツクーペ",
    colors: ["white", "black", "red", "silver", "gray", "orange"],
  },
  {
    id: "noah",
    label: "NOAH",
    icon: "👨‍👩‍👧‍👦",
    imgUrl: "/manus-storage/car_noah_b1a4d476.png",
    desc: "広々ファミリーミニバン",
    colors: ["white", "black", "silver", "navy", "gray"],
  },
];

// hue-rotate マッピング（画像の白ベースに対してカラーフィルターを適用）
function hueForColor(colorId: string) {
  const map: Record<string, string> = {
    red: "0deg", blue: "200deg", navy: "220deg",
    black: "0deg", silver: "0deg", white: "0deg",
    gray: "0deg", green: "100deg", bronze: "35deg", orange: "20deg",
  };
  return map[colorId] ?? "0deg";
}
function satForColor(colorId: string) {
  const map: Record<string, string> = {
    black: "0%", silver: "10%", white: "0%", gray: "10%",
    red: "120%", blue: "130%", navy: "120%", green: "150%", bronze: "130%", orange: "140%",
  };
  return map[colorId] ?? "100%";
}
function brightnessForColor(colorId: string) {
  const map: Record<string, string> = {
    black: "20%", silver: "90%", white: "100%", gray: "70%",
    red: "80%", blue: "75%", navy: "40%", green: "60%", bronze: "70%", orange: "85%",
  };
  return map[colorId] ?? "100%";
}


// 速度線パーティクル
function SpeedLines({ color }: { color: string }) {
  const lines = Array.from({ length: 8 }, (_, i) => i);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {lines.map(i => (
        <motion.div
          key={i}
          className="absolute h-px rounded-full"
          style={{
            top: `${20 + i * 9}%`,
            right: 0,
            width: `${30 + Math.random() * 40}%`,
            background: `linear-gradient(to left, transparent, ${color}88, transparent)`,
          }}
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: [-80, -300], opacity: [0, 0.8, 0] }}
          transition={{
            duration: 0.5 + i * 0.06,
            delay: i * 0.04,
            ease: "easeOut",
            repeat: Infinity,
            repeatDelay: 0.1,
          }}
        />
      ))}
    </div>
  );
}

// 走行演出オーバーレイ
function DriveAnimation({ model, color, colorHex, onDone }: {
  model: typeof CAR_MODELS[0];
  color: typeof ALL_COLORS[keyof typeof ALL_COLORS];
  colorHex: string;
  onDone: () => void;
}) {
  return (
    <motion.div
      className="absolute inset-0 z-40 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(180deg, #050d1f 0%, #0a1530 100%)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onAnimationComplete={() => {
        // 走行演出が終わったら自動で戻る（3秒後）
        setTimeout(onDone, 2500);
      }}
    >
      {/* 背景の道路ライン */}
      <div className="absolute bottom-0 left-0 right-0 h-24"
        style={{ background: "linear-gradient(to top, rgba(255,255,255,0.03), transparent)" }} />
      <div className="absolute bottom-10 left-0 right-0 h-px"
        style={{ background: "rgba(255,255,255,0.08)" }} />

      {/* 路面ダッシュライン（流れるアニメーション） */}
      <motion.div
        className="absolute bottom-10 left-0 flex gap-10 items-center pointer-events-none"
        animate={{ x: [0, -140] }}
        transition={{ duration: 0.55, repeat: Infinity, ease: "linear" }}
        style={{ width: "220%" }}
      >
        {Array.from({ length: 14 }, (_, i) => (
          <div key={i} className="flex-shrink-0 h-px w-14 rounded-full"
            style={{ background: "rgba(255,255,255,0.14)" }} />
        ))}
      </motion.div>

      {/* 速度線 */}
      <SpeedLines color={colorHex} />

      {/* 車アバター：左から走り込んでくる */}
      <motion.div
        className="relative z-10"
        initial={{ x: -380, opacity: 0 }}
        animate={{ x: [-380, 0, 0, 32] }}
        transition={{
          x: { times: [0, 0.38, 0.82, 1], duration: 2.0, ease: ["circOut", "linear", "easeIn"] },
          opacity: { duration: 0.3 },
        }}
      >
        <motion.img
          src={model.imgUrl}
          alt="マイカー"
          className="w-56 h-auto object-contain"
          style={{
            filter: `drop-shadow(0 0 24px ${colorHex}cc) hue-rotate(${hueForColor(color.id)})`,
          }}
          animate={{ y: [0, -4, 0, -3, 0], rotate: [-0.4, 0.4, -0.4, 0.4, -0.4] }}
          transition={{ duration: 0.32, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* タイヤ接地影（リアルな接地感） */}
        <motion.div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
          style={{ width: 150, height: 10, background: "radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 72%)" }}
          animate={{ scaleX: [1, 0.9, 1, 0.92, 1], opacity: [0.7, 0.5, 0.7, 0.55, 0.7] }}
          transition={{ duration: 0.32, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* テキスト */}
      <motion.div
        className="mt-8 text-center z-10 relative"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="text-white font-black text-xl mb-1">
          {color.label}の{model.label}
        </div>
        <div className="text-white/50 text-sm">があなたのアバターになりました</div>
        <motion.div
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white"
          style={{ background: "rgba(16,185,129,0.25)", border: "1px solid rgba(16,185,129,0.5)" }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        >
          <CheckCircle size={16} color="#10B981" />
          登録完了！ホームに戻ります…
        </motion.div>
      </motion.div>

      {/* 拡張自己バッジ */}
      <motion.div
        className="absolute bottom-8 left-0 right-0 flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
</motion.div>
    </motion.div>
  );
}

// ---- メイン ----
interface CarRegisterScreenProps {
  onNavigateHome?: () => void;
}

export default function CarRegisterScreen({ onNavigateHome }: CarRegisterScreenProps) {
  const { state, setScreen, setCarConfig } = useApp();
  const [selectedModel, setSelectedModel] = useState(
    CAR_MODELS.find(m => m.id === state.carConfig.model) ? state.carConfig.model : "crown"
  );
  const [selectedColor, setSelectedColor] = useState(state.carConfig.color);
  const [showDriveAnim, setShowDriveAnim] = useState(false);

  const currentModel = CAR_MODELS.find(m => m.id === selectedModel)!;
  // 車種別カラーセット
  const modelColors = currentModel.colors.map(cid => ALL_COLORS[cid as keyof typeof ALL_COLORS]);
  const currentColor = modelColors.find(col => col.id === selectedColor) ?? modelColors[0];

  const handleSave = () => {
    const config: CarConfig = {
      model: selectedModel,
      modelLabel: currentModel.label,
      color: selectedColor,
      colorLabel: currentColor.label,
      colorHex: currentColor.hex,
      imgUrl: currentModel.imgUrl,
    };
    setCarConfig(config);
    setShowDriveAnim(true);
  };

  const handleAnimDone = () => {
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      setScreen("home");
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden relative" style={{ background: "linear-gradient(180deg, #0D1B3E 0%, #0a1530 100%)" }}>

      {/* 走行アニメーションオーバーレイ */}
      <AnimatePresence>
        {showDriveAnim && (
          <DriveAnimation
            model={currentModel}
            color={currentColor}
            colorHex={currentColor.hex}
            onDone={handleAnimDone}
          />
        )}
      </AnimatePresence>

      {/* ヘッダー（固定） */}
      <div className="flex-shrink-0 flex items-center px-5 pb-3 safe-top">
        <button onClick={() => setScreen("home")} className="p-2 rounded-full mr-3" style={{ background: "rgba(255,255,255,0.08)" }}>
          <span className="text-white text-sm">←</span>
        </button>
        <div>
          <div className="text-white font-black text-xl">マイカー登録</div>
          <div className="text-white/50 text-xs mt-0.5">あなたの愛車がアバターになります</div>
        </div>
      </div>

      {/* スクロール領域 */}
      <div className="flex-1 overflow-y-auto pb-nav">

        {/* アバタープレビュー */}
        <div className="mx-5 rounded-2xl p-4 mb-4 relative overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="text-center mb-2">
            <div className="text-white font-bold text-base">TOYOTA {currentModel.label}</div>
            <div className="text-white/50 text-xs mt-0.5">{currentModel.desc}</div>
            <div className="flex items-center justify-center gap-2 mt-1">
              <div className="w-3.5 h-3.5 rounded-full border-2" style={{ background: currentColor.hex, borderColor: currentColor.border }} />
              <span className="text-white/60 text-xs">{currentColor.label}</span>
            </div>
          </div>
          {/* 車種別アバター画像 */}
          <div className="flex justify-center">
            <motion.img
              key={`${selectedModel}-${selectedColor}`}
              src={currentModel.imgUrl}
              alt={`TOYOTA ${currentModel.label}`}
              className="w-44 h-auto object-contain"
              style={{ filter: `drop-shadow(0 0 16px ${currentColor.hex}88) hue-rotate(${hueForColor(selectedColor)}) saturate(${satForColor(selectedColor)}) brightness(${brightnessForColor(selectedColor)})` }}
              initial={{ scale: 0.88, opacity: 0.4, x: -20 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
              onError={(e) => {
                // 画像生成中はフォールバックとして既存画像を表示
                (e.target as HTMLImageElement).src = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663496374098/TkKAMagOEFaCrKKi.png";
              }}
            />
          </div>
        </div>
        {/* 拡張自己バッジ：カード外・車種選択の上に配置して車種名と被らないようにする */}
        <div className="px-5 mb-2 flex justify-end">
        </div>

        {/* 車種選択 */}
        <div className="px-5 mb-4">
          <div className="text-white/60 text-xs font-bold tracking-widest mb-2">車種を選ぶ（全10車種）</div>
          <div className="grid grid-cols-2 gap-2">
            {CAR_MODELS.map(model => (
              <motion.button
                key={model.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  const newModel = CAR_MODELS.find(m => m.id === model.id)!;
                  setSelectedModel(model.id);
                  if (!newModel.colors.includes(selectedColor)) {
                    setSelectedColor(newModel.colors[0]);
                  }
                }}
                className="py-3 px-3 rounded-xl text-left transition-all"
                style={{
                  background: selectedModel === model.id ? "rgba(230,0,18,0.15)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${selectedModel === model.id ? "#E60012" : "rgba(255,255,255,0.1)"}`,
                }}
              >
                <div className="text-lg mb-0.5">{model.icon}</div>
                <div className="text-white text-xs font-bold">{model.label}</div>
                <div className="text-white/40 text-[10px] mt-0.5 leading-tight">{model.desc}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* カラー選択 */}
        <div className="px-5 mb-4">
          <div className="text-white/60 text-xs font-bold tracking-widest mb-2">カラーを選ぶ</div>
          <div className="flex gap-3 flex-wrap">
            {modelColors.map(color => (
              <motion.button
                key={color.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedColor(color.id)}
                className="w-9 h-9 rounded-full transition-all relative"
                style={{
                  background: color.hex,
                  border: `3px solid ${selectedColor === color.id ? "#E60012" : "rgba(255,255,255,0.2)"}`,
                  boxShadow: selectedColor === color.id ? `0 0 12px ${color.hex}` : "none",
                }}
              >
                {selectedColor === color.id && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CheckCircle size={14} color={color.id === "white" ? "#333" : "white"} />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
          <div className="text-white/40 text-xs mt-2">{currentColor.label}</div>
        </div>

      </div>{/* /スクロール領域 */}

      {/* 固定フッター：登録ボタン */}
      <div
        className="flex-shrink-0 px-5 pt-2"
        style={{ paddingBottom: "max(1.25rem, calc(env(safe-area-inset-bottom) + 4rem))" }}
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          className="w-full py-4 rounded-2xl font-black text-base text-white transition-all"
          style={{
            background: "linear-gradient(135deg, #E60012, #ff4444)",
            boxShadow: "0 4px 20px rgba(230,0,18,0.4)",
          }}
        >
          🚗 このクルマで登録する
        </motion.button>
        <div className="text-center text-white/30 text-xs mt-2">
          マイカーはいつでも変更できます
        </div>
      </div>
      <BottomNavBar />
    </div>
  );
}

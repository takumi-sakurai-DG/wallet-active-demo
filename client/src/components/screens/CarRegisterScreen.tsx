import { useApp, CarConfig } from "@/contexts/AppContext";
import { motion } from "framer-motion";
import { useState } from "react";
import { CheckCircle } from "lucide-react";

const CAR_MODELS = [
  { id: "crown", label: "CROWN HYBRID", icon: "👑" },
  { id: "prius", label: "PRIUS", icon: "🌿" },
  { id: "harrier", label: "HARRIER", icon: "🦅" },
  { id: "rav4", label: "RAV4", icon: "🏔️" },
];

const CAR_COLORS = [
  { id: "white", label: "プラチナホワイト", hex: "#F5F5F0", border: "#ddd" },
  { id: "black", label: "アティチュードブラック", hex: "#1a1a1a", border: "#555" },
  { id: "red", label: "スーパーレッド", hex: "#C0392B", border: "#C0392B" },
  { id: "blue", label: "プレシャスシルバー", hex: "#5B8DB8", border: "#5B8DB8" },
  { id: "silver", label: "シルバーメタリック", hex: "#A8A9AD", border: "#A8A9AD" },
  { id: "navy", label: "ダークブルーマイカ", hex: "#1B2A4A", border: "#1B2A4A" },
];

// 心理バッジ
function PsychBadge({ theory, cite }: { theory: string; cite: string }) {
  return (
    <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold z-30"
      style={{ background: "rgba(96,165,250,0.15)", border: "1px solid rgba(96,165,250,0.4)", color: "#93C5FD" }}>
      🧠 {theory}<span className="opacity-60 ml-1">{cite}</span>
    </div>
  );
}

export default function CarRegisterScreen() {
  const { state, setScreen, setCarConfig } = useApp();
  const [selectedModel, setSelectedModel] = useState(state.carConfig.model);
  const [selectedColor, setSelectedColor] = useState(state.carConfig.color);
  const [saved, setSaved] = useState(false);

  const currentModel = CAR_MODELS.find(m => m.id === selectedModel)!;
  const currentColor = CAR_COLORS.find(c => c.id === selectedColor)!;

  const handleSave = () => {
    const config: CarConfig = {
      model: selectedModel,
      modelLabel: currentModel.label,
      color: selectedColor,
      colorLabel: currentColor.label,
      colorHex: currentColor.hex,
    };
    setCarConfig(config);
    setSaved(true);
    setTimeout(() => setScreen("home"), 1200);
  };

  return (
    <div className="w-full h-full flex flex-col relative" style={{ background: "linear-gradient(180deg, #0D1B3E 0%, #0a1530 100%)" }}>
      {/* ヘッダー */}
      <div className="flex items-center px-5 pt-10 pb-4">
        <button onClick={() => setScreen("home")} className="p-2 rounded-full mr-3" style={{ background: "rgba(255,255,255,0.08)" }}>
          <span className="text-white text-sm">←</span>
        </button>
        <div>
          <div className="text-white font-black text-xl">マイカー登録</div>
          <div className="text-white/50 text-xs mt-0.5">あなたの愛車がアバターになります</div>
        </div>
      </div>

      {/* アバタープレビュー */}
      <div className="mx-5 rounded-2xl p-5 mb-4 relative overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="text-center mb-3">
          <div className="text-4xl mb-1">{currentModel.icon}</div>
          <div className="text-white font-bold text-base">TOYOTA {currentModel.label}</div>
          <div className="flex items-center justify-center gap-2 mt-1">
            <div className="w-4 h-4 rounded-full border-2" style={{ background: currentColor.hex, borderColor: currentColor.border }} />
            <span className="text-white/60 text-xs">{currentColor.label}</span>
          </div>
        </div>
        {/* カラー反映のビジュアル */}
        <div className="flex justify-center">
          <div className="relative">
            <img
              src="/manus-storage/car-avatar_5742fb71.png"
              alt="マイカー"
              className="w-40 h-auto object-contain transition-all duration-500"
              style={{ filter: `drop-shadow(0 0 16px ${currentColor.hex}88) hue-rotate(${selectedColor === 'red' ? '180deg' : selectedColor === 'blue' ? '200deg' : selectedColor === 'navy' ? '220deg' : '0deg'})` }}
            />
          </div>
        </div>
        <PsychBadge theory="拡張自己" cite="Belk, 1988" />
      </div>

      {/* 車種選択 */}
      <div className="px-5 mb-4">
        <div className="text-white/60 text-xs font-bold tracking-widest mb-2">車種を選ぶ</div>
        <div className="grid grid-cols-2 gap-2">
          {CAR_MODELS.map(model => (
            <motion.button
              key={model.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedModel(model.id)}
              className="py-3 px-3 rounded-xl text-left transition-all"
              style={{
                background: selectedModel === model.id ? "rgba(230,0,18,0.15)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${selectedModel === model.id ? "#E60012" : "rgba(255,255,255,0.1)"}`,
              }}
            >
              <div className="text-lg mb-0.5">{model.icon}</div>
              <div className="text-white text-xs font-bold">{model.label}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* カラー選択 */}
      <div className="px-5 mb-5">
        <div className="text-white/60 text-xs font-bold tracking-widest mb-2">カラーを選ぶ</div>
        <div className="flex gap-3 flex-wrap">
          {CAR_COLORS.map(color => (
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
                  <CheckCircle size={14} color={color.id === 'white' ? '#333' : 'white'} />
                </div>
              )}
            </motion.button>
          ))}
        </div>
        <div className="text-white/40 text-xs mt-2">{currentColor.label}</div>
      </div>

      {/* 登録ボタン */}
      <div className="px-5">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={saved}
          className="w-full py-4 rounded-2xl font-black text-base text-white transition-all"
          style={{
            background: saved ? "rgba(16,185,129,0.3)" : "linear-gradient(135deg, #E60012, #ff4444)",
            boxShadow: saved ? "none" : "0 4px 20px rgba(230,0,18,0.4)",
          }}
        >
          {saved ? "✓ 登録完了！" : "このクルマで登録する"}
        </motion.button>
        <div className="text-center text-white/30 text-xs mt-2">
          マイカーはいつでも変更できます
        </div>
      </div>
    </div>
  );
}

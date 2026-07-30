import { useApp } from "@/contexts/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, BookOpen, AlertTriangle, ChevronRight, Check } from "lucide-react";
import { Smartphone } from "lucide-react";
import { useState } from "react";

// ================================================================
// 確認ダイアログ（デモリセット用）
// ================================================================
function ResetConfirmDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="mx-6 rounded-3xl px-6 py-7 text-center"
        style={{ background: "#F8F9FA", border: "1px solid rgba(233,30,140,0.4)", boxShadow: "0 0 40px rgba(233,30,140,0.2)" }}
      >
        <div className="text-4xl mb-3">⚠️</div>
        <div className="text-gray-800 font-black text-lg mb-2">デモをリセットしますか？</div>
        <div className="text-gray-500 text-sm leading-relaxed mb-6">
          ポイント・移動履歴・マイカー設定がすべて初期状態に戻ります。この操作は取り消せません。
        </div>
        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl font-bold text-sm"
            style={{ background: "rgba(0,0,0,0.06)", color: "#6B7280" }}
          >
            キャンセル
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl font-bold text-sm text-gray-800"
            style={{ background: "linear-gradient(135deg, #E91E8C, #ff4444)", boxShadow: "0 4px 16px rgba(233,30,140,0.4)" }}
          >
            リセット
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ================================================================
// 設定メニュー行
// ================================================================
function SettingRow({
  icon,
  label,
  description,
  onClick,
  variant = "default",
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick: () => void;
  variant?: "default" | "danger" | "success";
  badge?: string;
}) {
  const colors = {
    default: { bg: "rgba(0,0,0,0.04)", border: "rgba(0,0,0,0.08)", icon: "#6B7280", text: "#374151" },
    danger:  { bg: "rgba(233,30,140,0.08)",    border: "rgba(233,30,140,0.3)",     icon: "#F87171",               text: "#F87171" },
    success: { bg: "rgba(52,211,153,0.08)",   border: "rgba(52,211,153,0.3)",   icon: "#34D399",               text: "#34D399" },
  };
  const c = colors[variant];

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left transition-all"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${c.border}`, color: c.icon }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm" style={{ color: c.text }}>{label}</div>
        {description && <div className="text-gray-500 text-xs mt-0.5 leading-snug">{description}</div>}
      </div>
      {badge && (
        <div className="px-2 py-0.5 rounded-full text-[10px] font-black" style={{ background: "rgba(245,158,11,0.2)", color: "#F59E0B" }}>
          {badge}
        </div>
      )}
      <ChevronRight size={16} color="rgba(0,0,0,0.12)" />
    </motion.button>
  );
}

// ================================================================
// メイン
// ================================================================
export default function SettingsScreen() {
  const { state, setScreen, resetDemo, showOnboarding, toggleHaptics } = useApp();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const handleReset = () => {
    setShowResetConfirm(false);
    setResetDone(true);
    setTimeout(() => {
      resetDemo();
    }, 600);
  };

  return (
    <div className="w-full h-full relative flex flex-col overflow-y-auto" style={{ background: "linear-gradient(180deg, #F8F9FA 0%, #F1F3F5 100%)" }}>
      {/* 確認ダイアログ */}
      <AnimatePresence>
        {showResetConfirm && (
          <ResetConfirmDialog onConfirm={handleReset} onCancel={() => setShowResetConfirm(false)} />
        )}
      </AnimatePresence>

      {/* リセット完了フラッシュ */}
      <AnimatePresence>
        {resetDone && (
          <motion.div
            className="absolute inset-0 z-40 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: "rgba(0,0,0,0.6)" }}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(16,185,129,0.2)", border: "2px solid #10B981" }}>
                <Check size={32} color="#10B981" />
              </div>
              <div className="text-gray-800 font-black text-base">リセット完了</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ヘッダー */}
      <div className="flex items-center px-5 pb-5 flex-shrink-0 safe-top">
        <button onClick={() => setScreen("home")} className="p-2 rounded-full mr-3" style={{ background: "rgba(0,0,0,0.05)" }}>
          <ArrowLeft size={18} color="#374151" />
        </button>
        <div className="text-gray-800 font-black text-xl">設定</div>
      </div>

        <div className="px-5 flex flex-col gap-5 safe-bottom-lg">
        {/* デモ操作セクション */}
        <div>
          <div className="text-gray-500 text-[10px] font-bold tracking-widest mb-2 px-1">デモ操作</div>
          <div className="flex flex-col gap-2">
            <SettingRow
              icon={<BookOpen size={18} />}
              label="使い方を見る"
              description="ポイント・ガチャ・変換の仕組みをもう一度確認"
              onClick={() => showOnboarding()}
              variant="success"
              badge="オンボーディング"
            />
            <SettingRow
              icon={<RotateCcw size={18} />}
              label="デモをリセット"
              description="ポイント・履歴・マイカーをすべて初期状態に戻す"
              onClick={() => setShowResetConfirm(true)}
              variant="danger"
              badge="初期化"
            />
          </div>
        </div>

        {/* 表示設定セクション */}
        <div>
          <div className="text-gray-500 text-[10px] font-bold tracking-widest mb-2 px-1">表示設定</div>
          <div className="flex flex-col gap-2">

            {/* ハプティクスON/OFFトグル */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={toggleHaptics}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left"
              style={{
                background: state.hapticsEnabled ? "rgba(52,211,153,0.08)" : "rgba(0,0,0,0.06)",
                border: `1px solid ${state.hapticsEnabled ? "rgba(52,211,153,0.3)" : "rgba(0,0,0,0.05)"}`,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: state.hapticsEnabled ? "rgba(52,211,153,0.2)" : "rgba(0,0,0,0.06)" }}
              >
                <Smartphone size={18} color={state.hapticsEnabled ? "#34D399" : "#9CA3AF"} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm" style={{ color: state.hapticsEnabled ? "#34D399" : "#6B7280" }}>
                  ハプティクス（振動）
                </div>
                <div className="text-gray-500 text-xs mt-0.5">
                  {state.hapticsEnabled ? "ガチャ時に端末が振動します（対応端末のみ）" : "振動フィードバックは無効です"}
                </div>
              </div>
              {/* トグル */}
              <div
                className="w-11 h-6 rounded-full relative transition-all flex-shrink-0"
                style={{ background: state.hapticsEnabled ? "#34D399" : "rgba(0,0,0,0.10)" }}
              >
                <motion.div
                  animate={{ x: state.hapticsEnabled ? 20 : 2 }}
                  transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                  className="absolute top-1 w-4 h-4 rounded-full bg-white"
                />
              </div>
            </motion.button>
          </div>
        </div>

        {/* デモ情報 */}
        <div className="rounded-2xl px-4 py-4" style={{ background: "rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.06)" }}>
          <div className="text-gray-500 text-[10px] font-bold tracking-widest mb-3">デモ情報</div>
          <div className="flex flex-col gap-2">
            {[
              { label: "現在のFuel", value: `${state.fuel} / ${state.maxFuel}` },
              { label: "保有ポイント", value: `${state.points.toLocaleString()} pt` },
              { label: "移動履歴件数", value: `${state.movementHistory.length} 件` },
              { label: "マイカー", value: `${state.carConfig.colorLabel}の${state.carConfig.modelLabel}` },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-gray-500 text-xs">{item.label}</span>
                <span className="text-gray-500 text-xs font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 注記 */}
        <div className="text-center">
          <p className="text-gray-500 text-[10px] leading-relaxed">
            このデモはUIUX提案用プロトタイプです。<br />
            実際のTOYOTA Walletとは連携していません。
          </p>
        </div>
      </div>
    </div>
  );
}

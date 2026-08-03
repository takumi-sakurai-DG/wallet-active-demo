import { useApp } from "@/contexts/AppContext";
import type { AppNotification, NotificationType } from "@/contexts/AppContext";
import type { NotificationPrefs } from "@/contexts/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Bell, BellOff, Zap, Gift, Rocket, Target, Megaphone, CheckCheck } from "lucide-react";
import { useState } from "react";

// 通知タイプ別アイコン・カラー
function NotifIcon({ type }: { type: NotificationType }) {
  const map: Record<NotificationType, { icon: React.ReactNode; bg: string; color: string }> = {
    fuel_full:    { icon: <Zap size={16} fill="#F59E0B" />,    bg: "rgba(245,158,11,0.15)", color: "#F59E0B" },
    point_grant:  { icon: <Gift size={16} />,                  bg: "rgba(52,211,153,0.15)", color: "#34D399" },
    boost_active: { icon: <Rocket size={16} />,                bg: "rgba(233,30,140,0.15)", color: "#E91E8C" },
    mission_near: { icon: <Target size={16} />,                bg: "rgba(99,102,241,0.15)", color: "#6366F1" },
    campaign:     { icon: <Megaphone size={16} />,             bg: "rgba(251,146,60,0.15)", color: "#FB923C" },
  };
  const m = map[type];
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: m.bg, color: m.color }}>
      {m.icon}
    </div>
  );
}

function NotifCard({ notif, onTap }: { notif: AppNotification; onTap: (n: AppNotification) => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onTap(notif)}
      className="w-full flex items-start gap-3 px-4 py-3.5 rounded-2xl text-left transition-all"
      style={{
        background: notif.read ? "rgba(0,0,0,0.03)" : "rgba(233,30,140,0.06)",
        border: notif.read ? "1px solid rgba(0,0,0,0.07)" : "1px solid rgba(233,30,140,0.25)",
      }}
    >
      <NotifIcon type={notif.type} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-bold text-sm text-gray-800 leading-snug flex-1">{notif.title}</span>
          {!notif.read && (
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#E91E8C" }} />
          )}
        </div>
        <div className="text-gray-500 text-xs leading-relaxed">{notif.body}</div>
        <div className="text-gray-400 text-[10px] mt-1">{notif.timestamp}</div>
      </div>
    </motion.button>
  );
}

export default function NotificationScreen() {
  const { state, setScreen, toggleNotifications, markNotificationRead, markAllNotificationsRead, toggleNotifPref } = useApp();
  const { notifications, notificationsEnabled, notificationPrefs } = state;
  const [showPrefPanel, setShowPrefPanel] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleTap = (n: AppNotification) => {
    markNotificationRead(n.id);
    if (n.actionScreen) setScreen(n.actionScreen);
  };

  // 通知種別ラベル定義
  const PREF_LABELS: { key: keyof NotificationPrefs; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "fuel_full",    label: "Fuel満タン通知",   icon: <Zap size={14} />,      color: "#F59E0B" },
    { key: "point_grant",  label: "ポイント付与通知", icon: <Gift size={14} />,     color: "#34D399" },
    { key: "boost_active", label: "ブースト通知",     icon: <Rocket size={14} />,   color: "#E91E8C" },
    { key: "mission_near", label: "MISSION通知",      icon: <Target size={14} />,   color: "#6366F1" },
    { key: "campaign",     label: "キャンペーン通知", icon: <Megaphone size={14} />, color: "#FB923C" },
  ];

  return (
    <div className="w-full h-full flex flex-col overflow-hidden" style={{ background: "linear-gradient(180deg, #F8F9FA 0%, #F1F3F5 100%)" }}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-5 pb-4 flex-shrink-0" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("home")} className="p-2 rounded-full" style={{ background: "rgba(0,0,0,0.06)" }}>
            <ArrowLeft size={18} color="#374151" />
          </button>
          <div>
            <div className="text-gray-800 font-black text-xl">通知</div>
            {unreadCount > 0 && (
              <div className="text-pink-500 text-xs font-bold">未読 {unreadCount}件</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* すべて既読 */}
          {unreadCount > 0 && (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={markAllNotificationsRead}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold"
              style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)", color: "#34D399" }}
            >
              <CheckCheck size={12} />
              すべて既読
            </motion.button>
          )}
          {/* 通知ON/OFFトグル */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={toggleNotifications}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold"
            style={{
              background: notificationsEnabled ? "rgba(233,30,140,0.12)" : "rgba(0,0,0,0.06)",
              border: notificationsEnabled ? "1px solid rgba(233,30,140,0.3)" : "1px solid rgba(0,0,0,0.10)",
              color: notificationsEnabled ? "#E91E8C" : "#9CA3AF",
            }}
          >
            {notificationsEnabled ? <Bell size={12} /> : <BellOff size={12} />}
            {notificationsEnabled ? "通知ON" : "通知OFF"}
          </motion.button>
        </div>
      </div>

      {/* 通知種別設定パネル */}
      <div className="mx-5 mb-3 flex-shrink-0">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowPrefPanel(v => !v)}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold"
          style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)", color: "#374151" }}
        >
          <span className="flex items-center gap-1.5"><Bell size={12} color="#6366F1" /> 通知種別の設定</span>
          <motion.span
            animate={{ rotate: showPrefPanel ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-gray-400"
          >▼</motion.span>
        </motion.button>
        <AnimatePresence>
          {showPrefPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-2 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.08)", background: "#fff" }}>
                {PREF_LABELS.map((item, i) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between px-4 py-3"
                    style={{ borderBottom: i < PREF_LABELS.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none" }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${item.color}20`, color: item.color }}>
                        {item.icon}
                      </div>
                      <span className="text-xs font-bold text-gray-700">{item.label}</span>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={() => toggleNotifPref(item.key)}
                      className="relative w-11 h-6 rounded-full flex-shrink-0 transition-colors duration-200"
                      style={{
                        background: notificationPrefs[item.key] ? item.color : "rgba(0,0,0,0.15)",
                      }}
                    >
                      <motion.div
                        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
                        animate={{ left: notificationPrefs[item.key] ? "calc(100% - 1.375rem)" : "0.125rem" }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </motion.button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 通知OFF バナー */}
      <AnimatePresence>
        {!notificationsEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-5 mb-3 rounded-xl px-4 py-3 flex items-center gap-3"
            style={{ background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.10)" }}
          >
            <BellOff size={16} color="#9CA3AF" />
            <div>
              <div className="text-gray-500 text-xs font-bold">通知がオフになっています</div>
              <div className="text-gray-400 text-[10px] mt-0.5">新しいポイント付与・満タン通知などが届きません。</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 通知リスト */}
      <div className="flex-1 overflow-y-auto pb-nav px-5">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Bell size={40} className="mb-3 opacity-20" />
            <div className="text-sm">通知はありません</div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {notifications.map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
              >
                <NotifCard notif={n} onTap={handleTap} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

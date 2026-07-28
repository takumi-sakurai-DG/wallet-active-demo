import { useApp, MovementRecord } from "@/contexts/AppContext";
import { motion } from "framer-motion";
import { ArrowLeft, Car, Zap, TrendingUp } from "lucide-react";

// ---- 輸送手段アイコン ----
function TransportIcon({ type }: { type: MovementRecord["transportType"] }) {
  if (type === "car") return <Car size={14} color="#60A5FA" />;
  if (type === "train") return <span className="text-xs">🚃</span>;
  return <span className="text-xs">🚶</span>;
}

// ---- 1件の履歴カード ----
function HistoryCard({ record, index }: { record: MovementRecord; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* 輸送手段アイコン */}
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.2)" }}>
        <TransportIcon type={record.transportType} />
      </div>

      {/* ルート・時刻 */}
      <div className="flex-1 min-w-0">
        <div className="text-white text-sm font-bold truncate">{record.route}</div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-white/40 text-xs">{record.time}</span>
          <span className="text-white/30 text-xs">·</span>
          <span className="text-white/40 text-xs">{record.distance} km</span>
        </div>
      </div>

      {/* Fuel獲得 */}
      <div className="flex flex-col items-end flex-shrink-0">
        <div className="flex items-center gap-1">
          {record.isHighBoost && (
            <motion.div
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              <Zap size={10} fill="#E60012" color="#E60012" />
            </motion.div>
          )}
          <span className="text-amber-400 font-black text-base">+{record.fuelGained}</span>
        </div>
        <span className="text-white/30 text-[10px]">Fuel</span>
      </div>
    </motion.div>
  );
}

// ---- 日付グループヘッダー ----
function DateHeader({ date, totalFuel }: { date: string; totalFuel: number }) {
  return (
    <div className="flex items-center justify-between px-1 py-1 mt-4 mb-1.5">
      <span className="text-white/50 text-xs font-bold tracking-wide">{date}</span>
      <span className="text-amber-400/70 text-xs font-bold">合計 +{totalFuel} Fuel</span>
    </div>
  );
}

// ---- サマリーカード ----
function SummaryCard({ records }: { records: MovementRecord[] }) {
  const totalFuel = records.reduce((a, r) => a + r.fuelGained, 0);
  const totalDist = records.reduce((a, r) => a + r.distance, 0);
  const highBoostCount = records.filter(r => r.isHighBoost).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-5 mb-4 rounded-2xl px-5 py-4"
      style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(230,0,18,0.08))", border: "1px solid rgba(245,158,11,0.25)" }}
    >
      <div className="flex items-center gap-1.5 mb-3">
        <TrendingUp size={14} color="#F59E0B" />
        <span className="text-amber-400 text-xs font-bold tracking-wide">今週の移動サマリー</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="text-amber-400 font-black text-2xl">{totalFuel}</div>
          <div className="text-white/40 text-[10px] mt-0.5">獲得Fuel</div>
        </div>
        <div className="text-center" style={{ borderLeft: "1px solid rgba(255,255,255,0.08)", borderRight: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="text-white font-black text-2xl">{totalDist.toFixed(0)}</div>
          <div className="text-white/40 text-[10px] mt-0.5">走行 km</div>
        </div>
        <div className="text-center">
          <div className="text-red-400 font-black text-2xl">{highBoostCount}</div>
          <div className="text-white/40 text-[10px] mt-0.5">ハイブースト</div>
        </div>
      </div>
    </motion.div>
  );
}

// ---- メイン ----
export default function HistoryScreen() {
  const { state, setScreen } = useApp();
  const { movementHistory } = state;

  // 日付でグループ化
  const grouped = movementHistory.reduce<Record<string, MovementRecord[]>>((acc, r) => {
    if (!acc[r.date]) acc[r.date] = [];
    acc[r.date].push(r);
    return acc;
  }, {});
  const groupedEntries = Object.entries(grouped);

  return (
    <div className="w-full h-full flex flex-col" style={{ background: "linear-gradient(180deg, #0D1B3E 0%, #0a1530 100%)" }}>
      {/* ヘッダー */}
      <div className="flex items-center px-5 pt-10 pb-4 flex-shrink-0">
        <button onClick={() => setScreen("home")} className="p-2 rounded-full mr-3" style={{ background: "rgba(255,255,255,0.08)" }}>
          <ArrowLeft size={18} color="white" />
        </button>
        <div>
          <div className="text-white font-black text-xl">移動履歴</div>
          <div className="text-white/50 text-xs mt-0.5">移動するたびにFuelが自動蓄積されます</div>
        </div>
      </div>

      {/* スクロールコンテンツ */}
      <div className="flex-1 overflow-y-auto pb-6">
        {/* サマリー */}
        <SummaryCard records={movementHistory} />

        {/* 履歴リスト */}
        {movementHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-white/30">
            <Car size={40} className="mb-3 opacity-30" />
            <div className="text-sm">まだ移動履歴がありません</div>
            <div className="text-xs mt-1">ホームで「移動シミュレート」を試してみてください</div>
          </div>
        ) : (
          <div className="px-5">
            {groupedEntries.map(([date, records]) => {
              const dayFuel = records.reduce((a, r) => a + r.fuelGained, 0);
              return (
                <div key={date}>
                  <DateHeader date={date} totalFuel={dayFuel} />
                  <div className="flex flex-col gap-2">
                    {records.map((record, i) => (
                      <HistoryCard key={record.id} record={record} index={i} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 心理バッジ説明 */}
        {state.showPsychBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mx-5 mt-5 rounded-xl px-4 py-3"
            style={{ background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.15)" }}
          >
            <div className="text-blue-300 text-xs font-bold mb-1.5">🧠 UX設計の根拠</div>
            <div className="text-white/50 text-xs leading-relaxed">
              履歴の可視化は<span className="text-blue-300">保有効果（Thaler, 1980）</span>を強化します。
              蓄積したFuelを「自分の資産」として認識させることで、継続利用の動機付けになります。
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

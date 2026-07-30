import { useApp, MovementRecord } from "@/contexts/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Car, Zap, TrendingUp, Gamepad2, ChevronRight, BarChart2 } from "lucide-react";
import { useState, useMemo } from "react";

// ================================================================
// 型
// ================================================================
type GraphPeriod = "week" | "month";

// ================================================================
// 輸送手段アイコン
// ================================================================
function TransportIcon({ type }: { type: MovementRecord["transportType"] }) {
  if (type === "car") return <Car size={14} color="#60A5FA" />;
  if (type === "train") return <span className="text-xs">🚃</span>;
  return <span className="text-xs">🚶</span>;
}

// ================================================================
// 1件の履歴カード
// ================================================================
function HistoryCard({ record, index }: { record: MovementRecord; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.2)" }}>
        <TransportIcon type={record.transportType} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white text-sm font-bold truncate">{record.route}</div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-white/40 text-xs">{record.time}</span>
          <span className="text-white/30 text-xs">·</span>
          <span className="text-white/40 text-xs">{record.distance} km</span>
        </div>
      </div>
      <div className="flex flex-col items-end flex-shrink-0">
        <div className="flex items-center gap-1">
          {record.isHighBoost && (
            <motion.div animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.2, repeat: Infinity }}>
              <Zap size={10} fill="#E60012" color="#E60012" />
            </motion.div>
          )}
          <span className="text-amber-400 font-black text-base">+{record.fuelGained}</span>
        </div>
        <span className="text-white/30 text-[10px]">pt</span>
      </div>
    </motion.div>
  );
}

// ================================================================
// 日付グループヘッダー
// ================================================================
function DateHeader({ date, totalFuel }: { date: string; totalFuel: number }) {
  return (
    <div className="flex items-center justify-between px-1 py-1 mt-4 mb-1.5">
      <span className="text-white/50 text-xs font-bold tracking-wide">{date}</span>
      <span className="text-amber-400/70 text-xs font-bold">合計 +{totalFuel} pt</span>
    </div>
  );
}

// ================================================================
// サマリーカード
// ================================================================
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
          <div className="text-white/40 text-[10px] mt-0.5">獲得pt</div>
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

// ================================================================
// SVGバーチャート（週間 / 月間）
// ================================================================

// 週間データ（デモ固定値）
const WEEKLY_DATA = [
  { label: "月", fuel: 16 },
  { label: "火", fuel: 0  },
  { label: "水", fuel: 22 },
  { label: "木", fuel: 18 },
  { label: "金", fuel: 16 },
  { label: "土", fuel: 22 },
  { label: "日", fuel: 27 },
];

// 月間データ（週別集計デモ固定値）
const MONTHLY_DATA = [
  { label: "第1週", fuel: 58  },
  { label: "第2週", fuel: 74  },
  { label: "第3週", fuel: 62  },
  { label: "第4週", fuel: 121 },
];

function FuelBarChart({ data, period }: { data: { label: string; fuel: number }[]; period: GraphPeriod }) {
  const CHART_H = 100;
  const BAR_W = period === "week" ? 28 : 44;
  const GAP = period === "week" ? 8 : 14;
  const maxFuel = Math.max(...data.map(d => d.fuel), 1);
  const totalW = data.length * (BAR_W + GAP) - GAP;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${totalW + 8} ${CHART_H + 28}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* グリッド線（3本） */}
      {[0.33, 0.66, 1].map((ratio, i) => (
        <line
          key={i}
          x1={0} y1={CHART_H * (1 - ratio)}
          x2={totalW + 8} y2={CHART_H * (1 - ratio)}
          stroke="rgba(255,255,255,0.06)" strokeWidth="1"
        />
      ))}

      {data.map((d, i) => {
        const barH = d.fuel === 0 ? 2 : Math.max(4, (d.fuel / maxFuel) * CHART_H);
        const x = i * (BAR_W + GAP) + 4;
        const y = CHART_H - barH;
        const isToday = period === "week" && i === 6; // 日曜=今日
        const isThisWeek = period === "month" && i === 3;
        const highlight = isToday || isThisWeek;
        return (
          <g key={d.label}>
            {/* バー背景 */}
            <rect
              x={x} y={0} width={BAR_W} height={CHART_H}
              rx={4} fill="rgba(255,255,255,0.03)"
            />
            {/* バー本体（アニメーション） */}
            <motion.rect
              x={x} y={y} width={BAR_W} height={barH}
              rx={4}
              fill={highlight ? "#F59E0B" : "rgba(245,158,11,0.45)"}
              initial={{ scaleY: 0, originY: 1 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: i * 0.06, duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
              style={{ transformOrigin: `${x + BAR_W / 2}px ${CHART_H}px` }}
            />
            {/* Fuel数値（0以外） */}
            {d.fuel > 0 && (
              <motion.text
                x={x + BAR_W / 2} y={y - 4}
                textAnchor="middle"
                fontSize={9}
                fill={highlight ? "#F59E0B" : "rgba(255,255,255,0.5)"}
                fontWeight={highlight ? "900" : "600"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.06 + 0.3 }}
              >
                {d.fuel}
              </motion.text>
            )}
            {/* X軸ラベル */}
            <text
              x={x + BAR_W / 2} y={CHART_H + 14}
              textAnchor="middle"
              fontSize={9}
              fill={highlight ? "#F59E0B" : "rgba(255,255,255,0.35)"}
              fontWeight={highlight ? "900" : "400"}
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ================================================================
// グラフセクション（タブ切替）
// ================================================================
function FuelGraphSection() {
  const [period, setPeriod] = useState<GraphPeriod>("week");
  const data = period === "week" ? WEEKLY_DATA : MONTHLY_DATA;
  const totalFuel = data.reduce((a, d) => a + d.fuel, 0);
  const avgFuel = Math.round(totalFuel / data.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="mx-5 mb-4 rounded-2xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* セクションヘッダー */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-1.5">
          <BarChart2 size={14} color="#F59E0B" />
          <span className="text-amber-400 text-xs font-bold tracking-wide">ポイント獲得推移</span>
        </div>
        {/* タブ */}
        <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
          {(["week", "month"] as GraphPeriod[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-3 py-1 text-[10px] font-bold transition-all"
              style={{
                background: period === p ? "rgba(245,158,11,0.25)" : "transparent",
                color: period === p ? "#F59E0B" : "rgba(255,255,255,0.35)",
              }}
            >
              {p === "week" ? "週間" : "月間"}
            </button>
          ))}
        </div>
      </div>

      {/* サブ指標 */}
      <div className="flex gap-4 px-4 pb-3">
        <div>
          <span className="text-white/30 text-[10px]">{period === "week" ? "今週合計" : "今月合計"}</span>
          <span className="text-amber-400 font-black text-sm ml-1.5">{totalFuel} pt</span>
        </div>
        <div>
          <span className="text-white/30 text-[10px]">{period === "week" ? "日平均" : "週平均"}</span>
          <span className="text-white/60 font-bold text-sm ml-1.5">{avgFuel} pt</span>
        </div>
      </div>

      {/* チャート */}
      <AnimatePresence mode="wait">
        <motion.div
          key={period}
          initial={{ opacity: 0, x: period === "week" ? -10 : 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: period === "week" ? 10 : -10 }}
          transition={{ duration: 0.25 }}
          className="px-4 pb-4"
        >
          <FuelBarChart data={data} period={period} />
        </motion.div>
      </AnimatePresence>

      {/* 凡例 */}
      <div className="flex items-center gap-3 px-4 pb-3">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: "#F59E0B" }} />
          <span className="text-white/30 text-[9px]">{period === "week" ? "今日" : "今週"}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: "rgba(245,158,11,0.45)" }} />
          <span className="text-white/30 text-[9px]">その他</span>
        </div>
      </div>
    </motion.div>
  );
}

// ================================================================
// CTAバナー（ガチャ誘導）
// ================================================================
function GachaCTABanner({ fuel, onGo }: { fuel: number; onGo: () => void }) {
  const canGacha = fuel >= 10;
  const shouldBounce = fuel >= 50;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={
        shouldBounce
          ? { opacity: 1, y: [0, -7, 0, -4, 0], scale: [1, 1.02, 1, 1.01, 1] }
          : { opacity: 1, y: 0 }
      }
      transition={
        shouldBounce
          ? {
              opacity: { duration: 0.4, delay: 0.2 },
              y: { duration: 0.7, delay: 0.5, ease: "easeOut" },
              scale: { duration: 0.7, delay: 0.5, ease: "easeOut" },
            }
          : { duration: 0.4, delay: 0.2 }
      }
      className="mx-5 mb-4 rounded-2xl overflow-hidden"
      style={{
        background: canGacha
          ? "linear-gradient(135deg, rgba(168,85,247,0.18), rgba(124,58,237,0.12))"
          : "rgba(255,255,255,0.04)",
        border: `1px solid ${canGacha ? "rgba(168,85,247,0.45)" : "rgba(255,255,255,0.08)"}`,
      }}
    >
      <div className="flex items-center gap-3 px-4 py-4">
        {/* アイコン */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: canGacha ? "rgba(168,85,247,0.25)" : "rgba(255,255,255,0.06)" }}>
          <Gamepad2 size={20} color={canGacha ? "#c084fc" : "rgba(255,255,255,0.2)"} />
        </div>

        {/* テキスト */}
        <div className="flex-1 min-w-0">
          {canGacha ? (
            <>
              <div className="text-purple-300 font-black text-sm">Fuel {fuel} 貯まっています！</div>
              <div className="text-white/50 text-xs mt-0.5">今すぐガチャに使って報酬を獲得しよう</div>
            </>
          ) : (
            <>
              <div className="text-white/40 font-bold text-sm">10 pt以上でガチャ可能</div>
              <div className="text-white/30 text-xs mt-0.5">移動してポイントを貯めましょう</div>
            </>
          )}
        </div>

        {/* 矢印ボタン */}
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={canGacha ? onGo : undefined}
          disabled={!canGacha}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-black flex-shrink-0 transition-all"
          style={{
            background: canGacha ? "rgba(168,85,247,0.35)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${canGacha ? "rgba(168,85,247,0.6)" : "rgba(255,255,255,0.08)"}`,
            color: canGacha ? "#c084fc" : "rgba(255,255,255,0.2)",
          }}
        >
          ガチャへ <ChevronRight size={12} />
        </motion.button>
      </div>

      {/* 損失回避フレーミング（Fuel多め時） */}
      {canGacha && fuel >= 50 && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{ background: "rgba(230,0,18,0.1)", border: "1px solid rgba(230,0,18,0.25)" }}>
            <span className="text-[10px]">⚠️</span>
            <span className="text-red-300 text-[10px] font-bold">
              ポイントが上限に近づいています。使わないと損になります。
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ================================================================
// メイン
// ================================================================
export default function HistoryScreen() {
  const { state, setScreen } = useApp();
  const { movementHistory } = state;

  // 日付でグループ化
  const grouped = useMemo(() =>
    movementHistory.reduce<Record<string, MovementRecord[]>>((acc, r) => {
      if (!acc[r.date]) acc[r.date] = [];
      acc[r.date].push(r);
      return acc;
    }, {}),
    [movementHistory]
  );
  const groupedEntries = Object.entries(grouped);

  const handleGachaNav = () => setScreen("choose");

  return (
    <div className="w-full h-full flex flex-col overflow-hidden" style={{ background: "linear-gradient(180deg, #0D1B3E 0%, #0a1530 100%)" }}>
      {/* ヘッダー */}
      <div className="flex items-center px-5 pb-4 flex-shrink-0 safe-top">
        <button onClick={() => setScreen("home")} className="p-2 rounded-full mr-3" style={{ background: "rgba(255,255,255,0.08)" }}>
          <ArrowLeft size={18} color="white" />
        </button>
        <div>
          <div className="text-white font-black text-xl">移動履歴</div>
          <div className="text-white/50 text-xs mt-0.5">何もしないでも自動蓄積・移動でボーナス獲得</div>
        </div>
      </div>

      {/* スクロールコンテンツ */}
        <div className="flex-1 overflow-y-auto pb-nav">

        {/* サマリーカード */}
        <SummaryCard records={movementHistory} />

        {/* ── Fuel獲得推移グラフ ── */}
        <FuelGraphSection />

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

        {/* ── CTAバナー（ガチャ誘導） ── */}
        <div className="mt-5">
          <GachaCTABanner fuel={state.fuel} onGo={handleGachaNav} />
        </div>

        {/* 心理バッジ説明 */}
        {state.showPsychBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mx-5 mt-2 rounded-xl px-4 py-3"
            style={{ background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.15)" }}
          >
            <div className="text-blue-300 text-xs font-bold mb-1.5">🧠 UX設計の根拠</div>
            <div className="text-white/50 text-xs leading-relaxed">
              履歴の可視化は<span className="text-blue-300">保有効果（Thaler, 1980）</span>を強化します。
              蓄積したポイントを「自分の資産」として認識させることで、継続利用の動機付けになります。
              CTAバナーは<span className="text-red-300">損失回避バイアス（Kahneman & Tversky, 1979）</span>を活用し、
              ポイント消費を促します。
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

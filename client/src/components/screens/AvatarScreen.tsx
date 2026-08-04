import { useApp } from "@/contexts/AppContext";
import type { AvatarItem, AvatarItemCategory, AvatarItemRarity } from "@/contexts/AppContext";

const RARITY_COLORS: Record<AvatarItemRarity, string> = {
  common: "text-gray-400 bg-gray-800/60 border-gray-600",
  rare: "text-blue-300 bg-blue-900/60 border-blue-500",
  epic: "text-purple-300 bg-purple-900/60 border-purple-500",
  legendary: "text-yellow-300 bg-yellow-900/60 border-yellow-500",
};

const RARITY_LABEL: Record<AvatarItemRarity, string> = {
  common: "COMMON",
  rare: "RARE",
  epic: "EPIC",
  legendary: "LEGENDARY",
};

const CATEGORY_LABEL: Record<AvatarItemCategory, string> = {
  wheel: "ホイール",
  body: "ボディ",
  interior: "インテリア",
  special: "スペシャル",
};

const CATEGORY_ICON: Record<AvatarItemCategory, string> = {
  wheel: "🔄",
  body: "🚗",
  interior: "🪑",
  special: "⭐",
};

function LevelBar({ exp, expToNext, level }: { exp: number; expToNext: number; level: number }) {
  const totalForLevel = exp + expToNext;
  const progress = totalForLevel > 0 ? Math.round((exp / totalForLevel) * 100) : 0;
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-400">Lv.{level} → Lv.{level + 1}</span>
        <span className="text-xs text-gray-400">あと {expToNext} EXP</span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function ItemCard({ item, isEquipped, onEquip }: { item: AvatarItem; isEquipped: boolean; onEquip: () => void }) {
  return (
    <button
      onClick={onEquip}
      className={`relative w-full text-left rounded-xl border p-3 transition-all duration-200 ${RARITY_COLORS[item.rarity]} ${isEquipped ? "ring-2 ring-cyan-400 ring-offset-1 ring-offset-gray-900" : "hover:brightness-110"}`}
    >
      {isEquipped && (
        <span className="absolute top-1.5 right-1.5 text-[10px] bg-cyan-500 text-white rounded px-1.5 py-0.5 font-bold">装備中</span>
      )}
      <div className="flex items-start gap-2">
        <span className="text-2xl leading-none mt-0.5">{item.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-sm truncate">{item.name}</span>
            <span className={`text-[9px] font-bold px-1 rounded border ${RARITY_COLORS[item.rarity]}`}>{RARITY_LABEL[item.rarity]}</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{item.description}</p>
          <p className="text-[10px] text-gray-500 mt-1">{item.acquiredAt} 取得</p>
        </div>
      </div>
    </button>
  );
}

export function AvatarScreen() {
  const { state, setScreen, equipAvatarItem } = useApp();
  const { avatar, carConfig } = state;

  const equippedCount = Object.keys(avatar.equippedItems).length;
  const categories: AvatarItemCategory[] = ["wheel", "body", "interior", "special"];

  // 装備中アイテムのカテゴリ別表示
  const equippedSlots = categories.map(cat => ({
    cat,
    item: avatar.equippedItems[cat] ?? null,
  }));

  return (
    <div className="flex flex-col h-full bg-gray-950 text-white overflow-hidden">
      {/* ヘッダー */}
      <div className="flex items-center gap-3 px-4 pt-10 pb-3 bg-gray-900/80 border-b border-gray-800">
        <button
          onClick={() => setScreen("home")}
          className="text-gray-400 hover:text-white transition-colors p-1"
        >
          ← 戻る
        </button>
        <h1 className="text-base font-bold flex-1">マイカーアバター育成</h1>
        <span className="text-xs text-gray-400">ガチャ {avatar.totalGachaCount}回</span>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        {/* 車両カード */}
        <div className="mx-4 mt-4 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-lg font-bold">
              {avatar.level}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{carConfig.modelLabel}</span>
                <span className="text-[10px] bg-blue-600/40 text-blue-300 border border-blue-500/40 rounded px-1.5 py-0.5">Lv.{avatar.level}</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">アイテム装備数：{equippedCount} / {categories.length}</p>
            </div>
          </div>
          <LevelBar exp={avatar.exp} expToNext={avatar.expToNext} level={avatar.level} />
          <p className="text-[11px] text-gray-500 mt-2 text-center">ガチャを引くたびにEXPが増え、アイテムが育ちます</p>
        </div>

        {/* 装備スロット */}
        <div className="mx-4 mt-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">現在の装備</h2>
          <div className="grid grid-cols-2 gap-2">
            {equippedSlots.map(({ cat, item }) => (
              <div
                key={cat}
                className={`rounded-xl border p-3 flex flex-col items-center gap-1 ${item ? "border-gray-600 bg-gray-800/60" : "border-dashed border-gray-700 bg-gray-900/40"}`}
              >
                <span className="text-xl">{item ? item.emoji : CATEGORY_ICON[cat]}</span>
                <span className="text-[10px] text-gray-400">{CATEGORY_LABEL[cat]}</span>
                {item ? (
                  <span className="text-[11px] font-medium text-center leading-tight">{item.name}</span>
                ) : (
                  <span className="text-[10px] text-gray-600">未装備</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 提案書P.9の説明バッジ */}
        <div className="mx-4 mt-4 rounded-xl bg-blue-950/60 border border-blue-800/60 p-3">
          <p className="text-[11px] text-blue-300 leading-relaxed">
            <span className="font-bold text-blue-200">「自分の車を育てる原資」</span>としてポイントを使うことで、単なる数字が自己投影の対象に変わります。ガチャで獲得したアイテムがマイカーに反映されるたびに、愛着と資産感覚が育ちます。
          </p>
        </div>

        {/* 獲得アイテム一覧 */}
        <div className="mx-4 mt-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            獲得アイテム（{avatar.collectedItems.length}件）
          </h2>
          {avatar.collectedItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-700 p-6 text-center">
              <p className="text-gray-500 text-sm">まだアイテムがありません</p>
              <p className="text-gray-600 text-xs mt-1">ガチャを引くとアイテムが育ちます</p>
              <button
                onClick={() => setScreen("choose")}
                className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg font-semibold transition-colors"
              >
                ガチャを引く
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {avatar.collectedItems.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  isEquipped={avatar.equippedItems[item.category]?.id === item.id}
                  onEquip={() => equipAvatarItem(item)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative rounded-[3rem] overflow-hidden"
      style={{
        width: 375,
        height: 812,
        background: "#0D1B3E",
        boxShadow: "0 0 0 2px #1E2D52, 0 0 0 4px #0D1B3E, 0 40px 80px rgba(0,0,0,0.8), 0 0 60px rgba(230,0,18,0.15)",
      }}
    >
      {/* ノッチ */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 rounded-b-2xl z-50" style={{ background: "#060d1f" }} />
      {/* コンテンツ */}
      <div className="w-full h-full overflow-hidden">
        {children}
      </div>
    </div>
  );
}


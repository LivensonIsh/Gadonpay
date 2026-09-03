export function LiquidBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute -left-24 -top-24 h-72 w-72 rounded-[60%_40%_50%_50%/50%_60%_40%_50%] opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle at 30% 30%, #E3A542, transparent 70%)" }}
      />
      <div
        className="absolute -right-16 top-10 h-96 w-96 rounded-[40%_60%_50%_50%/60%_40%_60%_40%] opacity-25 blur-3xl"
        style={{ background: "radial-gradient(circle at 60% 40%, #3FB6A8, transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-64 w-64 rounded-[50%_50%_60%_40%/40%_50%_50%_60%] opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle at 50% 50%, #E3A542, transparent 70%)" }}
      />
    </div>
  );
}

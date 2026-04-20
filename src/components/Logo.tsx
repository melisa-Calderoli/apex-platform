export default function Logo({ size = 48 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="relative flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-[#f97316] rounded-full" />
      <span
        className="relative font-[family-name:var(--font-playfair)] font-bold text-black"
        style={{ fontSize: size * 0.42 }}
      >
        C<span className="text-black/90">&</span>co
      </span>
    </div>
  );
}

export function LogoText({
  size = "md",
  withIcon = true,
}: {
  size?: "sm" | "md" | "lg";
  withIcon?: boolean;
}) {
  const iconSize = size === "sm" ? 32 : size === "lg" ? 56 : 40;
  const textSize =
    size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";
  const subtextSize =
    size === "sm" ? "text-[8px]" : size === "lg" ? "text-xs" : "text-[10px]";

  return (
    <div className="flex items-center gap-3">
      {withIcon && <Logo size={iconSize} />}
      <div>
        <h1
          className={`font-[family-name:var(--font-playfair)] ${textSize} font-bold text-black leading-tight`}
        >
          Calderoli & Co
        </h1>
        <p
          className={`${subtextSize} uppercase tracking-[0.2em] text-[#f97316] font-medium`}
        >
          Strategic Platform
        </p>
      </div>
    </div>
  );
}

import Image from "next/image";

export default function Logo({ size = 48 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="relative flex items-center justify-center shrink-0"
    >
      <Image
        src="/logo.png"
        alt="Calderoli & Co"
        width={size}
        height={size}
        className="object-contain"
        priority
      />
    </div>
  );
}

export function LogoText({
  size = "md",
  withIcon = true,
  showSubtitle = true,
}: {
  size?: "sm" | "md" | "lg";
  withIcon?: boolean;
  showSubtitle?: boolean;
}) {
  const iconSize = size === "sm" ? 36 : size === "lg" ? 64 : 44;
  const textSize =
    size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";
  const subtextSize =
    size === "sm" ? "text-[8px]" : size === "lg" ? "text-xs" : "text-[10px]";

  return (
    <div className="flex items-center gap-3">
      {withIcon && <Logo size={iconSize} />}
      {showSubtitle && (
        <div className="leading-tight">
          <h1 className={`font-[family-name:var(--font-playfair)] ${textSize} font-bold text-black leading-tight`}>
            Calderoli & Co
          </h1>
          <p className={`${subtextSize} uppercase tracking-[0.2em] text-[#f97316] font-medium`}>
            Strategic Platform
          </p>
        </div>
      )}
    </div>
  );
}

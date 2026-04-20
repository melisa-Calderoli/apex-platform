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
}: {
  size?: "sm" | "md" | "lg";
  withIcon?: boolean;
  showSubtitle?: boolean;
}) {
  const iconSize = size === "sm" ? 40 : size === "lg" ? 90 : 56;
  return <Logo size={iconSize} />;
}

import { cn } from "../lib/utils";

export type BrandLogoVariant = "light" | "dark" | "iconOnly";
export type BrandLogoSize = "sm" | "md" | "lg" | "xl" | "2xl";

interface BrandLogoProps {
  className?: string;
  variant?: BrandLogoVariant;
  size?: BrandLogoSize;
}

const sizeMap: Record<BrandLogoSize, { icon: string; text: string; gap: string }> = {
  sm: { icon: "h-6 w-6", text: "text-xl", gap: "gap-2" },
  md: { icon: "h-8 w-8", text: "text-2xl", gap: "gap-3" },
  lg: { icon: "h-10 w-10", text: "text-3xl", gap: "gap-3" },
  xl: { icon: "h-14 w-14", text: "text-5xl", gap: "gap-4" },
  "2xl": { icon: "h-20 w-20", text: "text-7xl", gap: "gap-5" },
};

export function BrandLogo({ className, variant = "light", size = "md" }: BrandLogoProps) {
  const isDark = variant === "dark";
  const isIconOnly = variant === "iconOnly";
  const { icon: iconClass, text: textClass, gap } = sizeMap[size];

  // The geometrically perfect "H" with upward slant
  const Icon = () => (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("flex-shrink-0", iconClass)}
    >
      <defs>
        <linearGradient id="hisabkit-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4F46E5" /> {/* Indigo-600 */}
          <stop offset="100%" stopColor="#8B5CF6" /> {/* Violet-500 */}
        </linearGradient>
      </defs>

      <g fill="url(#hisabkit-gradient)">
        {/* Left vertical pill */}
        <rect x="15" y="15" width="22" height="70" rx="11" />

        {/* Right vertical pill */}
        <rect x="63" y="15" width="22" height="70" rx="11" />

        {/* Connecting upward slant line (growth chart motif) */}
        {/* We use a polygon to perfectly intersect the round pills with a slant */}
        {/* Bottom-left to top-right slant */}
        <path d="M 26 65 L 74 35 L 74 48 L 26 78 Z" rx="2" />
      </g>
    </svg>
  );

  if (isIconOnly) {
    return (
      <div className={cn("inline-flex items-center justify-center", className)}>
        <Icon />
      </div>
    );
  }

  return (
    <div className={cn("inline-flex items-center select-none", gap, className)}>
      <Icon />
      <span
        className={cn(
          "font-heading font-bold tracking-tight",
          textClass,
          isDark ? "text-white" : "text-[#312E81]", // Indigo-900 for light mode
        )}
      >
        HisabKit
      </span>
    </div>
  );
}

import { cn } from "@/lib/utils";

export function BrandMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.svg"
      alt="SiteLenz"
      width={size}
      height={size}
      className={cn("shrink-0 drop-shadow-lg", className)}
      style={{ width: size, height: size }}
    />
  );
}

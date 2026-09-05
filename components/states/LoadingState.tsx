export function LoadingState() {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/loader.svg" alt="Loading" width={72} height={72} className="drop-shadow-lg" />
      <span className="font-heading text-lg font-medium tracking-tight text-foreground">
        SiteLenz
      </span>
    </div>
  );
}

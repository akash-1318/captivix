export function Loading({
  label = "Loading...",
  fullPage = true,
}: {
  label?: string;
  fullPage?: boolean;
}) {
  return (
    <div
      className={
        fullPage
          ? "flex min-h-[60vh] w-full flex-col items-center justify-center gap-3"
          : "flex w-full items-center justify-center gap-3 py-6"
      }
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />

      <span className="text-sm text-gray-600">{label}</span>
    </div>
  );
}

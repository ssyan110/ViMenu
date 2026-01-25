export default function Loading() {
  return (
    <div className="min-h-dvh bg-background-light text-slate-900 dark:bg-background-dark dark:text-white">
      <header className="sticky top-0 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-black/5 dark:border-white/5">
        <div className="px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-10 rounded-full bg-black/5 dark:bg-white/5 shimmer" />
            <div className="min-w-0">
              <div className="h-4 w-44 rounded bg-black/5 dark:bg-white/5 shimmer" />
              <div className="mt-2 h-3 w-28 rounded bg-black/5 dark:bg-white/5 shimmer" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-12 rounded-full bg-black/5 dark:bg-white/5 shimmer" />
            <div className="size-8 rounded-full bg-black/5 dark:bg-white/5 shimmer" />
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="snap-start shrink-0 h-9 w-24 rounded-full bg-black/5 dark:bg-white/5 shimmer"
              />
            ))}
          </div>
        </div>
      </header>

      <main className="px-4 pt-6 flex flex-col gap-5">
        <div className="flex items-baseline justify-between px-1">
          <div className="h-6 w-40 rounded bg-black/5 dark:bg-white/5 shimmer" />
          <div className="h-3 w-20 rounded bg-black/5 dark:bg-white/5 shimmer" />
        </div>

        {Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={idx}
            className="glass-card rounded-2xl p-3 flex gap-4 shadow-lg"
          >
            <div className="w-28 shrink-0 aspect-square rounded-xl bg-black/5 dark:bg-white/5 shimmer" />
            <div className="flex flex-col flex-1 justify-between py-1 min-w-0">
              <div className="space-y-2">
                <div className="h-5 w-3/4 rounded bg-black/5 dark:bg-white/5 shimmer" />
                <div className="h-4 w-1/2 rounded bg-black/5 dark:bg-white/5 shimmer" />
              </div>
              <div className="flex items-end justify-between">
                <div className="flex gap-2">
                  <div className="size-7 rounded-full bg-black/5 dark:bg-white/5 shimmer" />
                  <div className="size-7 rounded-full bg-black/5 dark:bg-white/5 shimmer" />
                </div>
                <div className="size-8 rounded-full bg-black/5 dark:bg-white/5 shimmer" />
              </div>
            </div>
          </div>
        ))}

        <div className="h-20" />
      </main>
    </div>
  );
}

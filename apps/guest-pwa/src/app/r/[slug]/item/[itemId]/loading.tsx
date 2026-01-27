export default function LoadingItemDetail() {
  return (
    <div className="bg-background-light dark:bg-background-dark min-h-[100dvh] font-display text-white">
      <div className="animate-pulse">
        <div className="h-72 w-full bg-white/5" />
        <div className="px-5 -mt-10">
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-5">
            <div className="h-6 w-2/3 bg-white/10 rounded" />
            <div className="h-4 w-1/2 bg-white/10 rounded mt-3" />
            <div className="h-20 w-full bg-white/10 rounded mt-6" />
          </div>
        </div>
      </div>
    </div>
  );
}

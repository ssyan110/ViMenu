"use client";

import * as React from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("[vimenu][app-error]", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[max(884px,100dvh)] w-full max-w-md flex-col items-center justify-center p-6 text-center">
      <h1 className="font-[var(--font-heading)] text-2xl font-bold text-white">
        Something went wrong
      </h1>
      <p className="mt-2 text-sm text-white/70">Có lỗi xảy ra.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-lg bg-primary px-5 py-3 font-extrabold text-white"
      >
        Try again
      </button>
      {process.env.NODE_ENV === "development" ? (
        <pre className="mt-6 w-full overflow-auto rounded-xl bg-black/30 p-4 text-left text-[11px] text-white/70">
          {String(error?.message ?? error)}
        </pre>
      ) : null}
    </main>
  );
}

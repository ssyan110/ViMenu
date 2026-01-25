import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[max(884px,100dvh)] w-full max-w-md flex-col items-center justify-center p-6 text-center">
      <h1 className="font-[var(--font-heading)] text-2xl font-bold text-white">
        Not found
      </h1>
      <p className="mt-2 text-sm text-white/70">Không tìm thấy trang này.</p>
      <Link
        href="/entry"
        className="mt-6 rounded-lg bg-white/10 px-5 py-3 font-bold text-white hover:bg-white/15"
      >
        Back to entry
      </Link>
    </main>
  );
}

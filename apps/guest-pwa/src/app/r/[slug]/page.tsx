import { getLanguageOrDefault } from "@/domain/language";

export default function RestaurantPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { lang?: string };
}) {
  const lang = getLanguageOrDefault(searchParams.lang);

  return (
    <main className="mx-auto flex min-h-[max(884px,100dvh)] w-full max-w-md flex-col p-6">
      <h1 className="font-[var(--font-heading)] text-2xl font-bold">
        Menu (placeholder)
      </h1>
      <p className="mt-2 text-white/80">
        Restaurant:{" "}
        <span className="font-semibold text-white">{params.slug}</span>
      </p>
      <p className="mt-1 text-white/80">
        Selected language:{" "}
        <span className="font-semibold text-white">{lang}</span>
      </p>
      <p className="mt-6 text-sm text-white/70">
        Next step: replace this placeholder with the published menu screen.
      </p>
    </main>
  );
}

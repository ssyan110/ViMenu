"use client";

import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { formatLanguageLabel } from "@/domain/i18n/worldLanguages";
import {
  DEFAULT_LANGUAGE,
  type LanguageCode,
  normalizeLanguageCode,
} from "@/domain/language";
import { cn } from "@/shared/cn";
import { useLanguageSelection } from "@/ui/hooks/useLanguageSelection";
import { IconArrowRight, IconBolt, IconCheckCircle } from "@/ui/icons";

type Props = {
  restaurant: {
    id: string;
    slug: string;
    name: string;
    logoUrl?: string;
  };
  availableLanguages?: LanguageCode[];
  hero?: {
    greetingVi?: string;
    greetingEn?: string;
  };
  onContinue?: (params: {
    restaurantSlug: string;
    language: LanguageCode;
  }) => void;
};

function LanguageBadge({ code }: { code: LanguageCode }) {
  const label = code.toUpperCase();

  return (
    <div
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border text-[11px] font-extrabold tracking-wider",
        "border-white/15 bg-white/5 text-white",
      )}
      aria-hidden="true"
    >
      {label}
    </div>
  );
}

export function LanguageEntryScreen(props: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryLang = searchParams.get("lang");

  const availableLanguages = React.useMemo(() => {
    const raw = props.availableLanguages ?? [DEFAULT_LANGUAGE];
    const normalized = raw.map((c) => normalizeLanguageCode(c));
    const unique = Array.from(new Set([DEFAULT_LANGUAGE, ...normalized]));
    return unique;
  }, [props.availableLanguages]);

  const languageOptions = React.useMemo(() => {
    return availableLanguages.map(
      (code): { code: LanguageCode; primary: string; secondary: string } => {
        const label = formatLanguageLabel(code);
        return { code, primary: label.primary, secondary: label.secondary };
      },
    );
  }, [availableLanguages]);

  const { selected, select, persist } = useLanguageSelection({
    restaurantSlug: props.restaurant.slug,
    queryLang,
  });

  React.useEffect(() => {
    // Client-side debug hook: helps confirm the screen received API-driven props.
    // (API call itself runs server-side; logs for that appear in the terminal.)
    // eslint-disable-next-line no-console
    console.info("[vimenu][entry-ui] props", {
      restaurantSlug: props.restaurant.slug,
      availableLanguages,
      selected,
    });
  }, [availableLanguages, props.restaurant.slug, selected]);

  const onContinue = React.useCallback(() => {
    persist();
    if (props.onContinue) {
      props.onContinue({
        restaurantSlug: props.restaurant.slug,
        language: selected,
      });
      return;
    }

    router.push(`/r/${props.restaurant.slug}?lang=${selected}`);
  }, [persist, props, router, selected]);

  return (
    <div className="relative min-h-[max(884px,100dvh)] overflow-hidden">
      <div className="absolute inset-0 bg-animated motion-safe:animate-gradient motion-reduce:animate-none" />
      <div className="absolute inset-0 bg-black/55" />

      <main className="relative z-10 mx-auto flex min-h-[max(884px,100dvh)] w-full max-w-md flex-col p-4">
        <header className="flex flex-1 flex-col items-center justify-center pb-4 pt-8">
          <div className="glass-panel mb-6 rounded-full p-6">
            <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-primary/20 bg-white shadow-lg shadow-primary/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={`${props.restaurant.name} logo`}
                className="h-full w-full object-cover"
                src={
                  props.restaurant.logoUrl ??
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Crect width='96' height='96' fill='%23f3f4f6'/%3E%3Cpath d='M18 62c10-14 50-14 60 0' stroke='%239ca3af' stroke-width='6' fill='none' stroke-linecap='round'/%3E%3Ccircle cx='36' cy='40' r='6' fill='%239ca3af'/%3E%3Ccircle cx='60' cy='40' r='6' fill='%239ca3af'/%3E%3C/svg%3E"
                }
              />
            </div>
          </div>

          <h1 className="text-center font-[var(--font-heading)] text-3xl font-extrabold tracking-tight text-white drop-shadow md:text-4xl">
            {props.hero?.greetingVi ?? "Xin chào!"}
          </h1>
          <p className="mt-2 max-w-[80%] text-center text-base font-medium text-white/80">
            {props.hero?.greetingEn ?? "Welcome"}{" "}
            <span className="font-bold text-primary">
              {props.restaurant.name}
            </span>
          </p>
        </header>

        <section
          className="glass-panel mb-8 w-full rounded-xl p-6 shadow-2xl"
          aria-label="Language selection"
        >
          <h2 className="mb-4 text-center text-xs font-bold uppercase tracking-wider text-white/80">
            Select Language
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {languageOptions.map((lang) => {
              const isSelected = selected === lang.code;

              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => select(lang.code)}
                  className={cn(
                    "group relative flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border p-4 text-left",
                    "transition-colors duration-200",
                    isSelected
                      ? "border-primary/60 bg-primary/20"
                      : "border-white/10 bg-white/5 hover:border-primary hover:bg-primary",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-dark",
                  )}
                  aria-pressed={isSelected}
                >
                  <div
                    className={cn(
                      "absolute right-2 top-2 transition-opacity",
                      isSelected
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100",
                    )}
                    aria-hidden="true"
                  >
                    <IconCheckCircle
                      className={cn(
                        "h-5 w-5",
                        isSelected ? "text-primary" : "text-white",
                      )}
                    />
                  </div>

                  <LanguageBadge code={lang.code} />

                  <div className="mt-1 text-center">
                    <div className="text-lg font-extrabold text-white">
                      {lang.primary}
                    </div>
                    <div
                      className={cn(
                        "text-xs font-medium",
                        isSelected ? "text-white/85" : "text-white/70",
                      )}
                    >
                      {lang.secondary}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onContinue}
            className={cn(
              "mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-6 py-4",
              "text-base font-extrabold text-white shadow-lg shadow-primary/20",
              "transition-colors duration-200 hover:bg-[#0fa0d0]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-dark",
              "active:scale-[0.99]",
            )}
          >
            <span>View Menu</span>
            <IconArrowRight className="h-5 w-5" />
          </button>
        </section>

        <footer className="pb-6 text-center opacity-70">
          <p className="inline-flex items-center justify-center gap-1 text-[10px] text-white/80">
            <IconBolt className="h-3 w-3" />
            <span>
              Powered by <span className="font-bold tracking-wide">Vimenu</span>
            </span>
          </p>
        </footer>
      </main>
    </div>
  );
}

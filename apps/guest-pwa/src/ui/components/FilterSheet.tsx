"use client";

import * as React from "react";

import type {
  MenuAllergenCode,
  MenuDietaryTagCode,
} from "@/domain/menu/models";
import { cn } from "@/shared/cn";
import { BottomSheet } from "@/ui/components/BottomSheet";
import { useGuestFilters } from "@/ui/hooks/useGuestFilters";
import {
  IconBlock,
  IconCheckCircle,
  IconClose,
  IconInfo,
  IconVerified,
} from "@/ui/icons";

const DIETARY_FALLBACK: Array<{ code: MenuDietaryTagCode; labelVi: string }> = [
  { code: "halal", labelVi: "Halal" },
  { code: "kosher", labelVi: "Kosher" },
  { code: "vegetarian", labelVi: "Ăn chay" },
  { code: "vegan", labelVi: "Thuần chay" },
  { code: "gluten_free", labelVi: "Không Gluten" },
];

const ALLERGEN_FALLBACK: Array<{
  code: MenuAllergenCode;
  labelVi: string;
}> = [
  { code: "egg", labelVi: "Trứng" },
  { code: "fish", labelVi: "Cá" },
  { code: "gluten", labelVi: "Gluten" },
  { code: "milk", labelVi: "Sữa" },
  { code: "peanut", labelVi: "Đậu phộng" },
  { code: "shrimp", labelVi: "Tôm" },
  { code: "soy", labelVi: "Đậu nành" },
];

const ALLERGEN_SHORT: Record<MenuAllergenCode, string> = {
  egg: "EG",
  fish: "FS",
  gluten: "GF",
  milk: "MK",
  peanut: "PN",
  shrimp: "SH",
  soy: "SY",
};

const ALLERGEN_TONE: Record<MenuAllergenCode, { bg: string; border: string }> =
  {
    peanut: { bg: "bg-orange-500/20", border: "border-orange-500/40" },
    shrimp: { bg: "bg-red-500/20", border: "border-red-500/40" },
    milk: { bg: "bg-blue-500/20", border: "border-blue-500/40" },
    egg: { bg: "bg-yellow-500/20", border: "border-yellow-500/40" },
    soy: { bg: "bg-green-500/20", border: "border-green-500/40" },
    gluten: { bg: "bg-cyan-500/20", border: "border-cyan-500/40" },
    fish: { bg: "bg-sky-500/20", border: "border-sky-500/40" },
  };

function isDietaryCode(v: string): v is MenuDietaryTagCode {
  return (
    v === "halal" ||
    v === "kosher" ||
    v === "vegetarian" ||
    v === "vegan" ||
    v === "gluten_free"
  );
}

function isAllergenCode(v: string): v is MenuAllergenCode {
  return (
    v === "peanut" ||
    v === "shrimp" ||
    v === "egg" ||
    v === "gluten" ||
    v === "soy" ||
    v === "fish" ||
    v === "milk"
  );
}

function titleFromCode(code: string) {
  return code
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.slice(0, 1).toUpperCase() + w.slice(1))
    .join(" ");
}

function isInlineSvg(icon: string) {
  return icon.trim().startsWith("<svg");
}

export type MenuFilters = {
  dietary: MenuDietaryTagCode[];
  excludeAllergens: MenuAllergenCode[];
};

export function FilterSheet(props: {
  open: boolean;
  onClose: () => void;
  value: MenuFilters;
  onChange: (next: MenuFilters) => void;
  onApply: () => void;
}) {
  const guestFilters = useGuestFilters({ enabled: props.open });
  const [draft, setDraft] = React.useState<MenuFilters>(props.value);

  // When opening the sheet, start from the currently applied filters.
  React.useEffect(() => {
    if (!props.open) return;
    setDraft(props.value);
  }, [props.open, props.value]);

  const toggleDietary = React.useCallback((code: MenuDietaryTagCode) => {
    setDraft((prev) => {
      const has = prev.dietary.includes(code);
      return {
        ...prev,
        dietary: has
          ? prev.dietary.filter((c) => c !== code)
          : [...prev.dietary, code],
      };
    });
  }, []);

  const toggleAllergen = React.useCallback((code: MenuAllergenCode) => {
    setDraft((prev) => {
      const has = prev.excludeAllergens.includes(code);
      return {
        ...prev,
        excludeAllergens: has
          ? prev.excludeAllergens.filter((c) => c !== code)
          : [...prev.excludeAllergens, code],
      };
    });
  }, []);

  const dietaryOptions = React.useMemo(() => {
    const list = guestFilters.data?.dietary_tags ?? [];
    const mapped = list
      .filter((t): t is { code: MenuDietaryTagCode; display_vi: string } =>
        isDietaryCode(t.code),
      )
      .map((t) => ({ code: t.code, labelVi: t.display_vi }));
    return mapped.length ? mapped : DIETARY_FALLBACK;
  }, [guestFilters.data]);

  const allergenOptions = React.useMemo(() => {
    const list = guestFilters.data?.allergens ?? [];
    const mapped = list
      .filter(
        (
          a,
        ): a is {
          code: MenuAllergenCode;
          display_vi: string;
          icon: string | null;
        } => isAllergenCode(a.code),
      )
      .map((a) => ({ code: a.code, labelVi: a.display_vi, icon: a.icon }));
    return mapped.length ? mapped : ALLERGEN_FALLBACK;
  }, [guestFilters.data]);

  return (
    <BottomSheet
      open={props.open}
      onClose={props.onClose}
      className="deep-glass"
      contentClassName="p-0"
    >
      <header className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white leading-tight">
            Filters
          </h2>
          <p className="text-sm text-white/40 font-medium">Bộ lọc</p>
        </div>
        <button
          type="button"
          className="size-10 rounded-full bg-white/5 flex items-center justify-center text-white/60"
          onClick={props.onClose}
          aria-label="Close filters"
        >
          <IconClose className="h-5 w-5" />
        </button>
      </header>

      <div className="p-6 space-y-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary">
              Dietary Preferences
            </h3>
            <IconInfo className="h-5 w-5 text-white/30" />
          </div>

          <div className="flex flex-wrap gap-2">
            {guestFilters.status === "loading" && !guestFilters.data ? (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    // eslint-disable-next-line react/no-array-index-key
                    key={i}
                    className="h-10 w-28 rounded-full bg-white/5 border border-white/10 animate-pulse"
                    aria-hidden="true"
                  />
                ))}
              </>
            ) : (
              dietaryOptions.map((t) => {
                const active = draft.dietary.includes(t.code);
                return (
                  <button
                    key={t.code}
                    type="button"
                    onClick={() => toggleDietary(t.code)}
                    className={cn(
                      "flex items-center gap-2 h-10 px-4 rounded-full text-sm transition-colors duration-200",
                      active
                        ? "bg-primary text-background-dark font-bold shadow-[0_4px_12px_rgba(19,182,236,0.3)]"
                        : "bg-white/5 border border-white/10 text-white/80 font-medium hover:bg-white/10",
                    )}
                  >
                    {active ? <IconVerified className="h-5 w-5" /> : null}
                    <span className="truncate">{t.labelVi}</span>
                  </button>
                );
              })
            )}
          </div>

          <div className="mt-3 flex items-center gap-2 px-1">
            <IconInfo className="h-4 w-4 text-white/40" />
            <p className="text-[10px] text-white/40 italic">
              Verified by restaurant tags
            </p>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary">
              Allergen Exclusion
            </h3>
            <IconInfo className="h-5 w-5 text-white/30" />
          </div>
          <p className="text-xs text-white/50 mb-4 px-1">
            Exclude items containing the following:
          </p>

          <div className="grid grid-cols-2 gap-3">
            {guestFilters.status === "loading" && !guestFilters.data ? (
              <>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    // eslint-disable-next-line react/no-array-index-key
                    key={i}
                    className="h-[74px] rounded-2xl bg-white/5 border border-white/10 animate-pulse"
                    aria-hidden="true"
                  />
                ))}
              </>
            ) : (
              allergenOptions.map((a) => {
                const active = draft.excludeAllergens.includes(a.code);
                const tone = ALLERGEN_TONE[a.code];
                const backendIcon =
                  "icon" in a && typeof a.icon === "string"
                    ? a.icon.trim()
                    : "";
                const canUseBackendIcon = backendIcon.length > 0;

                return (
                  <button
                    key={a.code}
                    type="button"
                    onClick={() => toggleAllergen(a.code)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-2xl border transition-colors duration-200 group",
                      active
                        ? "bg-red-500/20 border-red-500/50 ring-1 ring-red-500/20"
                        : "bg-white/5 border-white/10 hover:bg-red-500/10 hover:border-red-500/30",
                    )}
                  >
                    <div
                      className={cn(
                        "size-10 rounded-xl flex items-center justify-center",
                        active
                          ? "bg-red-500/30"
                          : "bg-white/5 group-hover:bg-red-500/30",
                        tone?.bg,
                        tone?.border,
                        "border",
                      )}
                      aria-hidden="true"
                    >
                      {canUseBackendIcon ? (
                        isInlineSvg(backendIcon) ? (
                          // eslint-disable-next-line react/no-danger
                          <span
                            className="h-5 w-5 [&>svg]:h-5 [&>svg]:w-5 text-white/90"
                            dangerouslySetInnerHTML={{ __html: backendIcon }}
                          />
                        ) : (
                          <span
                            className="text-[16px] leading-none"
                            aria-hidden="true"
                          >
                            {backendIcon}
                          </span>
                        )
                      ) : (
                        <span className="text-[11px] font-extrabold tracking-wider text-white/90">
                          {ALLERGEN_SHORT[a.code]}
                        </span>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-white truncate">
                        {a.labelVi}
                      </p>
                      <p className="text-[10px] text-white/40 uppercase tracking-tighter">
                        {titleFromCode(a.code)}
                      </p>
                    </div>

                    {active ? (
                      <IconBlock className="ml-auto h-5 w-5 text-red-400" />
                    ) : null}
                  </button>
                );
              })
            )}
          </div>

          {guestFilters.status === "error" ? (
            <div className="mt-3 flex items-center gap-2 px-1">
              <IconInfo className="h-4 w-4 text-white/40" />
              <p className="text-[10px] text-white/40 italic">
                Couldn’t load the latest filter list. Showing defaults.
              </p>
            </div>
          ) : null}
        </section>
      </div>

      <div className="sticky bottom-0 p-6 bg-gradient-to-t from-background-dark via-background-dark/95 to-transparent pt-10">
        <button
          type="button"
          onClick={() => {
            props.onChange(draft);
            props.onApply();
          }}
          className="w-full h-14 bg-primary text-background-dark font-bold text-lg rounded-2xl shadow-[0_12px_30px_rgba(19,182,236,0.4)] active:scale-[0.98] transition-transform duration-200 flex items-center justify-center gap-2"
        >
          Apply Filters
          <IconCheckCircle className="h-6 w-6" />
        </button>
        <div className="h-6" />
      </div>
    </BottomSheet>
  );
}

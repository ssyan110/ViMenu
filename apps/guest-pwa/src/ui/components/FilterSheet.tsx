"use client";

import * as React from "react";

import type {
  MenuAllergenCode,
  MenuDietaryTagCode,
} from "@/domain/menu/models";
import { cn } from "@/shared/cn";
import { BottomSheet } from "@/ui/components/BottomSheet";
import {
  IconBlock,
  IconCheckCircle,
  IconClose,
  IconInfo,
  IconVerified,
} from "@/ui/icons";

const DIETARY: Array<{ code: MenuDietaryTagCode; label: string }> = [
  { code: "halal", label: "Halal" },
  { code: "kosher", label: "Kosher" },
  { code: "vegetarian", label: "Vegetarian" },
  { code: "vegan", label: "Vegan" },
  { code: "gluten_free", label: "Gluten-free" },
];

const ALLERGENS: Array<{
  code: MenuAllergenCode;
  primary: string;
  secondary: string;
}> = [
  { code: "peanut", primary: "Peanuts", secondary: "Lạc" },
  { code: "shrimp", primary: "Shellfish", secondary: "Hải sản" },
  { code: "milk", primary: "Dairy", secondary: "Sữa" },
  { code: "egg", primary: "Eggs", secondary: "Trứng" },
  { code: "soy", primary: "Soy", secondary: "Đậu nành" },
];

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
            {DIETARY.map((t) => {
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
                  {t.label}
                </button>
              );
            })}
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
            {ALLERGENS.map((a) => {
              const active = draft.excludeAllergens.includes(a.code);
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
                        ? "bg-red-500/30 text-red-400"
                        : "bg-white/5 text-white/70 group-hover:bg-red-500/30 group-hover:text-red-400",
                    )}
                    aria-hidden="true"
                  >
                    {active ? (
                      <IconBlock className="h-5 w-5" />
                    ) : (
                      <IconBlock className="h-5 w-5" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">{a.primary}</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-tighter">
                      {a.secondary}
                    </p>
                  </div>

                  {active ? (
                    <IconBlock className="ml-auto h-5 w-5 text-red-400" />
                  ) : null}
                </button>
              );
            })}
          </div>
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

"use client";

import { getCountryFlagForLanguage } from "@/domain/i18n/languageToCountryFlag";
import { formatLanguageLabel } from "@/domain/i18n/worldLanguages";
import type { LanguageCode } from "@/domain/language";
import { cn } from "@/shared/cn";
import { BottomSheet } from "@/ui/components/BottomSheet";
import { CountryFlag } from "@/ui/components/CountryFlag";
import { IconCheck, IconClose } from "@/ui/icons";

function FlagBadge({ code }: { code: LanguageCode }) {
  const country = getCountryFlagForLanguage(code);
  return (
    <div className="size-10 rounded-full overflow-hidden flex items-center justify-center bg-white/5 border-2 border-white/10">
      {country ? (
        <CountryFlag country={country} className="h-full w-full scale-[1.18]" />
      ) : (
        <span className="text-xs font-extrabold tracking-wider text-white/80">
          {code.toUpperCase()}
        </span>
      )}
    </div>
  );
}

export function LanguageSwitcherSheet(props: {
  open: boolean;
  onClose: () => void;
  availableLanguages: LanguageCode[];
  selected: LanguageCode;
  onSelect: (code: LanguageCode) => void;
}) {
  return (
    <BottomSheet open={props.open} onClose={props.onClose}>
      <div className="px-2 pb-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex-1 text-center">
          <h3 className="text-lg font-bold text-white/95 leading-tight">
            Select Language
            <br />
            <span className="text-sm font-medium text-white/40 italic">
              Chọn ngôn ngữ
            </span>
          </h3>
        </div>
        <button
          type="button"
          onClick={props.onClose}
          className="ml-2 size-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 flex items-center justify-center"
          aria-label="Close"
        >
          <IconClose className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-col gap-2 pt-4">
        {props.availableLanguages.map((code) => {
          const isSelected = props.selected === code;
          const label = formatLanguageLabel(code);

          return (
            <button
              key={code}
              type="button"
              onClick={() => props.onSelect(code)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all",
                isSelected
                  ? "bg-primary/10 border-primary/30 ring-1 ring-primary/20"
                  : "bg-white/5 border-white/5 active:bg-white/10",
              )}
            >
              <FlagBadge code={code} />
              <div className="flex-1 text-left min-w-0">
                <p className="font-bold text-white text-base truncate">
                  {label.primary}
                </p>
                <p className="text-xs text-white/50 font-medium italic truncate">
                  {label.secondary}
                </p>
              </div>

              {isSelected ? (
                <div className="flex items-center justify-center size-6 rounded-full bg-primary shadow-[0_0_10px_rgba(19,182,236,0.5)]">
                  <IconCheck className="h-4 w-4 text-background-dark" />
                </div>
              ) : null}
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}

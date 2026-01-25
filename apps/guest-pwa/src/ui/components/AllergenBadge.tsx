"use client";

import type { MenuAllergenCode } from "@/domain/menu/models";
import { cn } from "@/shared/cn";
import { useState } from "react";

const STYLE: Record<
  MenuAllergenCode,
  { bg: string; border: string; text: string; label: string }
> = {
  peanut: {
    bg: "bg-orange-500/20",
    border: "border-orange-500/50",
    text: "text-orange-500",
    label: "PN",
  },
  shrimp: {
    bg: "bg-red-500/20",
    border: "border-red-500/50",
    text: "text-red-400",
    label: "SH",
  },
  milk: {
    bg: "bg-blue-500/20",
    border: "border-blue-500/50",
    text: "text-blue-300",
    label: "MK",
  },
  egg: {
    bg: "bg-yellow-500/20",
    border: "border-yellow-500/50",
    text: "text-yellow-400",
    label: "EG",
  },
  soy: {
    bg: "bg-green-500/20",
    border: "border-green-500/50",
    text: "text-green-400",
    label: "SY",
  },
  gluten: {
    bg: "bg-blue-500/20",
    border: "border-blue-500/50",
    text: "text-blue-400",
    label: "GF",
  },
  fish: {
    bg: "bg-cyan-500/20",
    border: "border-cyan-500/50",
    text: "text-cyan-300",
    label: "FS",
  },
};

export function AllergenBadge(props: {
  code: MenuAllergenCode;
  title?: string;
  icon?: string;
}) {
  const s = STYLE[props.code];
  const [open, setOpen] = useState(false);

  const tooltipText = props.title?.trim() ? props.title.trim() : undefined;

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        className={cn(
          "size-7 rounded-full border flex items-center justify-center select-none",
          "transition-colors cursor-pointer",
          s.bg,
          s.border,
          s.text,
        )}
        title={tooltipText}
        aria-label={tooltipText}
        aria-expanded={open}
      >
        <span
          className={cn(
            props.icon
              ? "text-[14px] leading-none"
              : "text-[10px] font-extrabold tracking-wider",
          )}
          aria-hidden="true"
        >
          {props.icon ?? s.label}
        </span>
      </button>

      {tooltipText ? (
        <div
          role="tooltip"
          className={cn(
            "pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2",
            "rounded-lg px-2 py-1 text-[11px] font-semibold whitespace-nowrap",
            "bg-background-light/95 text-slate-900 border border-black/10 shadow-lg",
            "dark:bg-[#0b1417]/95 dark:text-white dark:border-white/10",
            "opacity-0 translate-y-1 transition-all duration-150",
            "group-hover:opacity-100 group-hover:translate-y-0",
            "group-focus-within:opacity-100 group-focus-within:translate-y-0",
            open && "opacity-100 translate-y-0",
          )}
        >
          {tooltipText}
        </div>
      ) : null}
    </div>
  );
}

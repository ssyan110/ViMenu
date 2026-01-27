"use client";

import { cn } from "@/shared/cn";
import { useState } from "react";

function hashString(text: string): number {
  // FNV-1a 32-bit
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  // Ensure unsigned
  return hash >>> 0;
}

function colorFromCode(code: string): {
  bg: string;
  border: string;
  text: string;
} {
  const c = code.trim().toLowerCase();
  const hue = hashString(c || "allergen") % 360;
  return {
    bg: `hsla(${hue}, 85%, 55%, 0.18)`,
    border: `hsla(${hue}, 85%, 60%, 0.35)`,
    text: `hsl(${hue}, 90%, 78%)`,
  };
}

function shortLabelFromCode(code: string): string {
  const compact = code
    .trim()
    .replace(/[^a-z0-9]/gi, "")
    .toUpperCase();
  if (compact.length >= 2) return compact.slice(0, 2);
  const raw = code.trim().toUpperCase();
  return raw.length >= 2 ? raw.slice(0, 2) : raw || "AL";
}

export function AllergenBadge(props: {
  code: string;
  title?: string;
  icon?: string;
}) {
  const normalized = props.code.trim().toLowerCase();
  const colors = colorFromCode(normalized);
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
          "bg-transparent",
        )}
        style={{
          backgroundColor: colors.bg,
          borderColor: colors.border,
          color: colors.text,
        }}
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
          {props.icon ?? shortLabelFromCode(normalized)}
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

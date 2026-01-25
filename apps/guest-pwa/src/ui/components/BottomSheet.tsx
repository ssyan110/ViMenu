"use client";

import * as React from "react";

import { cn } from "@/shared/cn";

export function BottomSheet(props: {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  React.useEffect(() => {
    if (!props.open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") props.onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [props]);

  React.useEffect(() => {
    if (!props.open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [props.open]);

  if (!props.open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Close"
        className="fixed inset-0 bg-black/60"
        onClick={props.onClose}
      />

      <div
        className={cn(
          "bottom-sheet relative w-full rounded-t-[32px]",
          "max-h-[85vh] overflow-hidden",
          props.className,
        )}
      >
        <div className="flex justify-center pt-3 pb-4">
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>

        {props.title ? (
          <div className="px-6 pb-6 border-b border-white/5">
            <h3 className="text-center text-lg font-bold text-white/95 leading-tight">
              {props.title}
            </h3>
          </div>
        ) : null}

        <div
          className={cn(
            "no-scrollbar overflow-y-auto px-4 py-4",
            props.contentClassName,
          )}
        >
          {props.children}
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}

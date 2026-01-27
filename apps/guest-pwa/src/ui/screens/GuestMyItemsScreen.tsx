"use client";

import * as React from "react";

import { getBilingualName } from "@/application/bilingualMenuText";
import type { LanguageCode } from "@/domain/language";
import type { MenuItem } from "@/domain/menu/models";
import { cn } from "@/shared/cn";
import { IconArrowLeft, IconEye, IconMinus, IconPlus, IconX } from "@/ui/icons";

type MyItemWithDetails = {
  itemId: string;
  quantity: number;
  item: MenuItem;
};

export function GuestMyItemsScreen(props: {
  restaurantSlug: string;
  items: MyItemWithDetails[];
  selectedLanguage: LanguageCode;
  currency: string;
  onBack: () => void;
  onIncrease: (itemId: string, currentQty: number) => void;
  onDecrease: (itemId: string, currentQty: number) => void;
  onRemove: (itemId: string) => void;
  onClearAll: () => void;
}) {
  const [presentationMode, setPresentationMode] = React.useState(false);

  // Calculate total
  const total = React.useMemo(() => {
    return props.items.reduce((sum, myItem) => {
      const price = myItem.item.price ?? 0;
      return sum + price * myItem.quantity;
    }, 0);
  }, [props.items]);

  const totalText = React.useMemo(() => {
    if (total === 0) return null;
    // Simple format for VND (no decimals)
    if (props.currency === "VND") {
      return new Intl.NumberFormat("vi-VN").format(total) + " ₫";
    }
    // Default format with 2 decimals
    return (
      new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(total) +
      " " +
      props.currency
    );
  }, [total, props.currency]);

  const handleClearAll = React.useCallback(() => {
    if (
      window.confirm(
        "Clear all items from your list?\nXoá tất cả món khỏi danh sách?",
      )
    ) {
      props.onClearAll();
    }
  }, [props]);

  if (props.items.length === 0) {
    return (
      <div className="min-h-[100dvh] bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased selection:bg-primary selection:text-white">
        <div className="relative min-h-[100dvh]">
          {/* Background Ambient Glow */}
          <div className="absolute top-[-10%] right-[-10%] w-[420px] h-[420px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[360px] h-[360px] bg-blue-600/10 rounded-full blur-[110px] pointer-events-none" />

          <header className="sticky top-0 z-20 border-b border-white/10 bg-background-light/80 dark:bg-background-dark/75 backdrop-blur-xl">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <button
                type="button"
                onClick={props.onBack}
                className="text-slate-900 dark:text-white flex size-10 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Back"
              >
                <IconArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex-1 text-center">
                <h2 className="text-slate-900 dark:text-white text-lg sm:text-xl font-bold leading-tight">
                  My Items
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">
                  Món của tôi
                </p>
              </div>
              <div className="w-10" />
            </div>
          </header>

          <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
            <div className="mx-auto max-w-xl text-center">
              <div className="mx-auto mb-5 h-12 w-12 rounded-full border border-white/10 bg-white/20 dark:bg-white/[0.04]" />
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
                No items yet
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Add items from the menu to see them here
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Thêm món từ menu để xem ở đây
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased overflow-hidden selection:bg-primary selection:text-white">
      <div className="relative min-h-[100dvh]">
        {/* Background Ambient Glow */}
        <div className="absolute top-[-10%] right-[-10%] w-[520px] h-[520px] bg-primary/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[460px] h-[460px] bg-blue-600/10 rounded-full blur-[130px] pointer-events-none" />

        {/* HEADER */}
        <header className="sticky top-0 z-20 border-b border-white/10 bg-background-light/80 dark:bg-background-dark/75 backdrop-blur-xl">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <button
              type="button"
              onClick={props.onBack}
              className="text-slate-900 dark:text-white flex size-10 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Back"
            >
              <IconArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1 text-center">
              <h2 className="text-slate-900 dark:text-white text-lg sm:text-xl font-bold leading-tight">
                My Items
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">
                Món của tôi
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearAll}
              className="flex items-center justify-end text-right cursor-pointer"
            >
              <span className="text-primary text-sm sm:text-base font-bold hover:text-primary/80 transition-colors">
                Clear All
              </span>
            </button>
          </div>
        </header>

        {/* MAIN CONTENT LIST */}
        <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 pb-40">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
            {props.items.map((myItem) => {
              const bilingual = getBilingualName({
                nameVi: myItem.item.nameVi,
                nameByLang: myItem.item.nameByLang,
                selectedLanguage: props.selectedLanguage,
              });

              return (
                <SwipeableMyItemCard
                  key={myItem.itemId}
                  bilingual={bilingual}
                  myItem={myItem}
                  onIncrease={props.onIncrease}
                  onDecrease={props.onDecrease}
                  onRemove={props.onRemove}
                />
              );
            })}
          </div>

          {/* Summary */}
          {totalText ? (
            <div className="mt-8">
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/[0.02] backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.08)]">
                <div className="p-5 sm:p-6 flex items-center justify-between">
                  <div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                      Subtotal
                    </div>
                    <div className="text-slate-400 text-xs">Tạm tính</div>
                  </div>
                  <div className="text-slate-900 dark:text-white font-extrabold text-xl">
                    {totalText}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </main>

        {/* FOOTER WITH TOTAL */}
        <footer
          className={cn(
            "fixed bottom-0 inset-x-0 z-30",
            "border-t border-white/10",
            "bg-background-light/80 dark:bg-background-dark/75 backdrop-blur-xl",
            "pb-[calc(2rem+env(safe-area-inset-bottom))]",
          )}
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
              <div className="flex-1">
                <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                  Total / Tổng
                </div>
                <div className="text-slate-900 dark:text-white text-2xl sm:text-3xl font-black tracking-tight">
                  {totalText ?? ""}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPresentationMode(true)}
                className={cn(
                  "w-full md:w-auto md:min-w-[320px] bg-primary hover:bg-primary/90 text-white font-bold text-lg h-14 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/20 transition-all active:scale-[0.98]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70",
                )}
              >
                <IconEye className="h-5 w-5" />
                <span>Show to Staff</span>
                <span className="opacity-60 font-normal text-sm ml-1">
                  / Đưa cho nhân viên
                </span>
              </button>
            </div>
          </div>
        </footer>

        {/* PRESENTATION MODE OVERLAY */}
        {presentationMode ? (
          <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-200">
            {/* Warning Banner Top */}
            <div
              className="h-12 flex items-center justify-center shrink-0"
              style={{
                background:
                  "repeating-linear-gradient(45deg, #f59e0b, #f59e0b 10px, #d97706 10px, #d97706 20px)",
              }}
            >
              <span className="bg-black/80 px-4 md:px-6 py-1 md:py-2 rounded text-yellow-500 font-bold tracking-wider text-xs md:text-sm border border-yellow-500/50">
                NOT A BILL / KHÔNG PHẢI HOÁ ĐƠN
              </span>
            </div>

            {/* Close Button Area */}
            <div className="flex justify-end p-4">
              <button
                type="button"
                onClick={() => setPresentationMode(false)}
                className="size-12 rounded-full bg-[#18282e] flex items-center justify-center text-white border border-white/20 cursor-pointer active:scale-95 transition-transform"
                aria-label="Close presentation"
              >
                <IconX className="h-8 w-8" />
              </button>
            </div>

            {/* High Contrast List */}
            <div className="flex-1 px-6 flex flex-col justify-center gap-8 overflow-y-auto">
              {props.items.map((myItem) => {
                const bilingual = getBilingualName({
                  nameVi: myItem.item.nameVi,
                  nameByLang: myItem.item.nameByLang,
                  selectedLanguage: props.selectedLanguage,
                });

                return (
                  <div
                    key={`pres-${myItem.itemId}`}
                    className="flex items-baseline gap-4 border-b border-white/10 pb-6 last:border-b-0"
                  >
                    <span className="text-primary text-5xl font-black shrink-0 tracking-tighter">
                      {myItem.quantity}
                      <span className="text-3xl ml-1">x</span>
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-white text-3xl font-extrabold leading-tight uppercase break-words">
                        {myItem.item.nameVi}
                      </span>
                      {bilingual.primary !== myItem.item.nameVi ? (
                        <span className="text-slate-500 text-xl font-medium mt-1 break-words">
                          {bilingual.primary}
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Warning */}
            <div className="p-6 text-center shrink-0">
              {totalText ? (
                <div className="mx-auto mb-5 max-w-sm rounded-xl border border-primary/30 bg-primary/10 px-5 py-4">
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                    Total Amount / Tổng cộng
                  </div>
                  <div className="text-primary text-4xl font-black tracking-tight mt-1">
                    {totalText}
                  </div>
                </div>
              ) : null}
              <p className="text-slate-500 text-sm mb-4">
                Please show this screen to the waiter.
                <br />
                Vui lòng đưa màn hình này cho nhân viên.
              </p>
            </div>

            {/* Warning Banner Bottom */}
            <div
              className="h-6 shrink-0"
              style={{
                background:
                  "repeating-linear-gradient(45deg, #f59e0b, #f59e0b 10px, #d97706 10px, #d97706 20px)",
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SwipeableMyItemCard(props: {
  myItem: MyItemWithDetails;
  bilingual: { primary: string; secondary?: string | null };
  onIncrease: (itemId: string, currentQty: number) => void;
  onDecrease: (itemId: string, currentQty: number) => void;
  onRemove: (itemId: string) => void;
}) {
  const [imageFailed, setImageFailed] = React.useState(false);
  const hasImage = Boolean(props.myItem.item.imageUrl) && !imageFailed;
  const startX = React.useRef<number | null>(null);
  const [offsetX, setOffsetX] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      startX.current = event.clientX;
      setIsDragging(true);
    },
    [],
  );

  const handlePointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging || startX.current === null) return;
      const deltaX = event.clientX - startX.current;
      const next = Math.max(-120, Math.min(0, deltaX));
      setOffsetX(next);
    },
    [isDragging],
  );

  const handlePointerEnd = React.useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    if (offsetX <= -80) {
      props.onRemove(props.myItem.itemId);
      setOffsetX(0);
      return;
    }
    setOffsetX(0);
  }, [isDragging, offsetX, props]);

  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center justify-end pr-4 rounded-2xl bg-red-500/20 border border-red-500/30">
        <button
          type="button"
          onClick={() => props.onRemove(props.myItem.itemId)}
          className="flex items-center gap-2 text-red-300 hover:text-red-200 transition-colors"
          aria-label="Delete item"
        >
          <IconX className="h-5 w-5" />
          <span className="text-sm font-semibold">Delete</span>
        </button>
      </div>
      <div
        className={cn(
          "relative z-10 rounded-2xl p-4 flex gap-4 items-center group transition-transform active:scale-[0.99] touch-pan-y",
          "bg-gradient-to-br from-white/10 via-white/[0.06] to-white/[0.02] dark:from-white/[0.08] dark:via-white/[0.04] dark:to-white/[0.02]",
          "backdrop-blur-xl border border-white/10",
          "shadow-[0_10px_35px_rgba(0,0,0,0.10)]",
          "hover:border-primary/30 hover:shadow-[0_14px_45px_rgba(0,0,0,0.14)]",
        )}
        style={{ transform: `translateX(${offsetX}px)` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        {hasImage ? (
          <div className="rounded-xl w-[76px] h-[76px] sm:w-[84px] sm:h-[84px] shrink-0 overflow-hidden shadow-[0_10px_25px_rgba(0,0,0,0.25)] ring-1 ring-white/10 bg-black/5 dark:bg-white/5">
            <img
              src={props.myItem.item.imageUrl}
              alt={props.bilingual.primary}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={() => setImageFailed(true)}
            />
          </div>
        ) : null}

        <div className="flex flex-1 flex-col justify-center min-w-0">
          <div className="flex justify-between items-start">
            <p className="text-slate-900 dark:text-white text-base sm:text-[15px] font-extrabold truncate pr-2 leading-snug">
              {props.bilingual.primary}
            </p>
          </div>
          {props.bilingual.secondary ? (
            <p className="text-slate-500 dark:text-slate-400 text-sm font-normal">
              {props.bilingual.secondary}
            </p>
          ) : null}
          {props.myItem.item.priceText ? (
            <p className="text-primary font-extrabold text-sm sm:text-base mt-1 tracking-tight">
              {props.myItem.item.priceText}
            </p>
          ) : null}
        </div>

        <div className="shrink-0 flex flex-col items-end gap-2">
          <div className="flex items-center rounded-full border border-white/10 p-1 shadow-inner bg-black/10 dark:bg-black/40 backdrop-blur">
            <button
              type="button"
              onClick={() =>
                props.onDecrease(props.myItem.itemId, props.myItem.quantity)
              }
              className="size-8 flex items-center justify-center rounded-full text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Decrease quantity"
            >
              <IconMinus className="h-[18px] w-[18px]" />
            </button>
            <span className="w-9 text-center text-sm font-extrabold text-slate-900 dark:text-white tabular-nums">
              {props.myItem.quantity}
            </span>
            <button
              type="button"
              onClick={() =>
                props.onIncrease(props.myItem.itemId, props.myItem.quantity)
              }
              className="size-8 flex items-center justify-center rounded-full bg-primary text-white shadow-md hover:bg-primary/90 transition-colors cursor-pointer"
              aria-label="Increase quantity"
            >
              <IconPlus className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

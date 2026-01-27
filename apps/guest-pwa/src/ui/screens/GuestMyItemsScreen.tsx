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
      <div className="min-h-[100dvh] bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 font-display">
        <div className="w-full flex flex-col h-screen">
          <header className="flex items-center px-5 md:px-8 lg:px-12 py-4 md:py-6 justify-between bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 border-b border-white/5 z-10 max-w-7xl mx-auto w-full">
            <button
              type="button"
              onClick={props.onBack}
              className="text-white flex size-10 md:size-12 items-center justify-center rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Back"
            >
              <IconArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
            </button>
            <div className="flex-1 text-center">
              <h2 className="text-white text-xl md:text-2xl font-bold leading-tight">
                My Items
              </h2>
              <p className="text-gray-400 text-sm md:text-base font-medium">
                Món của tôi
              </p>
            </div>
            <div className="w-12" />
          </header>

          <main className="flex-1 flex items-center justify-center p-8 max-w-7xl mx-auto w-full">
            <div className="text-center">
              <div className="text-6xl md:text-8xl mb-4">🍽️</div>
              <h3 className="text-xl md:text-3xl font-bold text-gray-300 mb-2">
                No items yet
              </h3>
              <p className="text-gray-500 md:text-lg">
                Add items from the menu to see them here
              </p>
              <p className="text-gray-500 text-sm md:text-base mt-1">
                Thêm món từ menu để xem ở đây
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 font-display antialiased selection:bg-primary selection:text-white">
      <div className="relative flex flex-col min-h-[100dvh] w-full overflow-hidden">
        {/* HEADER */}
        <header className="flex items-center px-5 md:px-8 lg:px-12 py-4 md:py-6 justify-between z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 border-b border-white/5 max-w-7xl mx-auto w-full">
          <button
            type="button"
            onClick={props.onBack}
            className="text-white flex size-10 md:size-12 items-center justify-center rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Back"
          >
            <IconArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
          </button>
          <div className="flex-1 text-center">
            <h2 className="text-white text-xl md:text-2xl font-bold leading-tight">
              My Items
            </h2>
            <p className="text-gray-400 text-sm md:text-base font-medium">
              Món của tôi
            </p>
          </div>
          <button
            type="button"
            onClick={handleClearAll}
            className="flex items-center justify-end text-right cursor-pointer"
          >
            <span className="text-primary text-sm md:text-base font-bold hover:text-primary/80 transition-colors">
              Clear All
            </span>
          </button>
        </header>

        {/* MAIN CONTENT LIST */}
        <main className="flex-1 overflow-y-auto no-scrollbar px-5 md:px-8 lg:px-12 py-6 md:py-8 pb-40 z-0 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
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
        </main>

        {/* FOOTER WITH TOTAL */}
        <footer
          className={cn(
            "fixed bottom-0 w-full border-t border-white/5 p-5 md:p-6 lg:p-8 z-20 left-0 right-0",
            "pb-[calc(1.5rem+env(safe-area-inset-bottom))]",
            "bg-gradient-to-br from-white/5 to-white/[0.01] backdrop-blur-xl",
          )}
        >
          <div className="max-w-7xl mx-auto space-y-4">
            {/* Total Section */}
            {totalText ? (
              <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-white/5 border border-white/10 rounded-lg">
                <div className="flex flex-col">
                  <span className="text-gray-400 text-xs md:text-sm font-medium uppercase tracking-wide">
                    Total Amount
                  </span>
                  <span className="text-gray-500 text-[10px] md:text-xs">
                    Tổng cộng
                  </span>
                </div>
                <span className="text-primary text-2xl md:text-3xl font-bold tracking-tight">
                  {totalText}
                </span>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => setPresentationMode(true)}
              className={cn(
                "w-full md:max-w-md md:mx-auto bg-primary hover:bg-primary/90 text-white font-bold text-base md:text-lg h-14 md:h-16 rounded-xl flex items-center justify-center gap-2 md:gap-3 cursor-pointer shadow-lg shadow-primary/20 transition-all active:scale-[0.98]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70",
              )}
            >
              <IconEye className="h-6 w-6 md:h-7 md:w-7" />
              <span>Show to Staff</span>
              <span className="opacity-60 font-normal text-sm md:text-base ml-1">
                / Đưa cho nhân viên
              </span>
            </button>
          </div>
        </footer>

        {/* PRESENTATION MODE OVERLAY */}
        {presentationMode ? (
          <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-200">
            {/* Warning Banner Top */}
            <div
              className="h-12 md:h-16 flex items-center justify-center shrink-0"
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
            <div className="flex justify-end p-4 md:p-6 max-w-7xl mx-auto w-full">
              <button
                type="button"
                onClick={() => setPresentationMode(false)}
                className="size-12 md:size-14 rounded-full bg-surface-dark flex items-center justify-center text-white border border-white/20 cursor-pointer active:scale-95 transition-transform"
                aria-label="Close presentation"
              >
                <IconX className="h-8 w-8 md:h-10 md:w-10" />
              </button>
            </div>

            {/* High Contrast List */}
            <div className="flex-1 px-6 md:px-12 lg:px-16 flex flex-col justify-center gap-6 md:gap-10 overflow-y-auto max-w-7xl mx-auto w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {props.items.map((myItem) => {
                  const bilingual = getBilingualName({
                    nameVi: myItem.item.nameVi,
                    nameByLang: myItem.item.nameByLang,
                    selectedLanguage: props.selectedLanguage,
                  });

                  return (
                    <div
                      key={`pres-${myItem.itemId}`}
                      className="flex items-start gap-4 md:gap-6 border-b border-white/10 pb-6 md:pb-8 last:border-b-0"
                    >
                      <span className="text-primary text-5xl md:text-6xl lg:text-7xl font-black shrink-0 tracking-tighter">
                        {myItem.quantity}
                        <span className="text-3xl md:text-4xl lg:text-5xl ml-1">
                          ×
                        </span>
                      </span>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-white text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight uppercase break-words">
                          {myItem.item.nameVi}
                        </span>
                        {bilingual.primary !== myItem.item.nameVi ? (
                          <span className="text-gray-500 text-lg md:text-xl lg:text-2xl font-medium mt-1 md:mt-2 break-words">
                            {bilingual.primary}
                          </span>
                        ) : null}
                        {myItem.item.priceText ? (
                          <span className="text-primary/70 text-base md:text-lg lg:text-xl font-bold mt-2 md:mt-3">
                            {myItem.item.priceText}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Warning and Total */}
            <div className="p-6 md:p-8 shrink-0 space-y-6">
              {totalText ? (
                <div className="flex items-center justify-between px-6 md:px-8 py-4 md:py-6 bg-primary/10 border-2 border-primary/30 rounded-xl">
                  <div className="flex flex-col">
                    <span className="text-gray-400 text-sm md:text-base lg:text-lg font-bold uppercase tracking-wider">
                      TOTAL AMOUNT
                    </span>
                    <span className="text-gray-500 text-xs md:text-sm">
                      Tổng cộng
                    </span>
                  </div>
                  <span className="text-primary text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">
                    {totalText}
                  </span>
                </div>
              ) : null}

              <p className="text-gray-500 text-sm md:text-base lg:text-lg text-center">
                Please show this screen to the waiter.
                <br />
                Vui lòng đưa màn hình này cho nhân viên.
              </p>
            </div>

            {/* Warning Banner Bottom */}
            <div
              className="h-6 md:h-8 shrink-0"
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
      <div className="absolute inset-0 flex items-center justify-end pr-4 rounded-xl bg-red-500/20 border border-red-500/30">
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
          "relative z-10 rounded-xl p-4 md:p-5 flex gap-4 md:gap-5 items-center group transition-transform active:scale-[0.99] touch-pan-y",
          "bg-gradient-to-br from-white/5 to-white/[0.01] backdrop-blur-xl border border-white/[0.08]",
          "shadow-lg hover:shadow-primary/10",
        )}
        style={{ transform: `translateX(${offsetX}px)` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        {props.myItem.item.imageUrl ? (
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg w-16 h-16 md:w-20 md:h-20 shrink-0 shadow-lg"
            style={{
              backgroundImage: `url(${props.myItem.item.imageUrl})`,
            }}
            aria-label={props.bilingual.primary}
          />
        ) : (
          <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg w-16 h-16 md:w-20 md:h-20 shrink-0 shadow-lg flex items-center justify-center">
            <span className="text-2xl md:text-3xl">🍽️</span>
          </div>
        )}

        <div className="flex flex-1 flex-col justify-center min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-white text-base md:text-lg font-bold line-clamp-2">
                {props.bilingual.primary}
              </p>
              {props.bilingual.secondary ? (
                <p className="text-gray-400 text-sm md:text-base font-normal line-clamp-1 mt-0.5">
                  {props.bilingual.secondary}
                </p>
              ) : null}
            </div>
            <div className="flex items-center bg-background-dark rounded-full border border-white/10 p-1 shadow-inner shrink-0">
              <button
                type="button"
                onClick={() =>
                  props.onDecrease(props.myItem.itemId, props.myItem.quantity)
                }
                className="size-8 md:size-9 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Decrease quantity"
              >
                <IconMinus className="h-5 w-5" />
              </button>
              <span className="w-10 md:w-12 text-center text-base md:text-lg font-bold text-white">
                {props.myItem.quantity}
              </span>
              <button
                type="button"
                onClick={() =>
                  props.onIncrease(props.myItem.itemId, props.myItem.quantity)
                }
                className="size-8 md:size-9 flex items-center justify-center rounded-full bg-primary text-white shadow-md hover:bg-primary/90 transition-colors cursor-pointer"
                aria-label="Increase quantity"
              >
                <IconPlus className="h-5 w-5" />
              </button>
            </div>
          </div>
          {props.myItem.item.priceText ? (
            <p className="text-primary font-bold text-base md:text-lg mt-2">
              {props.myItem.item.priceText}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

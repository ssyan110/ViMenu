export type VimenuDebugMode = "off" | "on" | "full";

function normalize(v: string | undefined): string {
  return (v ?? "").trim().toLowerCase();
}

/**
 * Single, unified debug switch for the whole Guest PWA.
 *
 * Usage:
 * - NEXT_PUBLIC_VIMENU_DEBUG=1      -> enable concise logs
 * - NEXT_PUBLIC_VIMENU_DEBUG=full   -> enable logs + longer payload previews
 */
export function getVimenuDebugMode(): VimenuDebugMode {
  const v = normalize(process.env.NEXT_PUBLIC_VIMENU_DEBUG);
  if (!v) return "off";
  if (v === "full") return "full";
  if (v === "1" || v === "true" || v === "on" || v === "debug") return "on";
  return "off";
}

export function isVimenuDebugEnabled(): boolean {
  return getVimenuDebugMode() !== "off";
}

export function isVimenuDebugFull(): boolean {
  return getVimenuDebugMode() === "full";
}

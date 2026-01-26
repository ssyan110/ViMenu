"use client";

import * as React from "react";

import type { GuestFiltersRpcResponse } from "@/data/guest/getGuestFilters";

export type GuestFiltersStatus = "idle" | "loading" | "success" | "error";

export type GuestFiltersData = GuestFiltersRpcResponse;

const CACHE_KEY = "vimenu_guest_filters_v1";
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24h
const REFRESH_MIN_INTERVAL_MS = 1000 * 60 * 5; // 5 min

let memoryCache:
  | {
      data: GuestFiltersData;
      updatedAt: number;
    }
  | undefined;

// Per-session throttle for network refreshes. This prevents spamming when the
// user opens/closes the sheet repeatedly, while still allowing a fresh request
// after a full page reload (memory is cleared on reload).
let lastNetworkFetchAt: number | undefined;

function readLocalCache(): typeof memoryCache {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as {
      data?: GuestFiltersData;
      updatedAt?: number;
    };
    if (!parsed.data || !parsed.updatedAt) return undefined;
    if (Date.now() - parsed.updatedAt > CACHE_TTL_MS) return undefined;
    return { data: parsed.data, updatedAt: parsed.updatedAt };
  } catch {
    return undefined;
  }
}

function writeLocalCache(next: { data: GuestFiltersData; updatedAt: number }) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function useGuestFilters(params?: { enabled?: boolean }) {
  const enabled = params?.enabled ?? true;

  const [status, setStatus] = React.useState<GuestFiltersStatus>(
    enabled ? "loading" : "idle",
  );
  const [data, setData] = React.useState<GuestFiltersData | null>(null);

  React.useEffect(() => {
    if (!enabled) {
      setStatus("idle");
      return;
    }

    const now = Date.now();
    const memFresh =
      memoryCache && now - memoryCache.updatedAt <= CACHE_TTL_MS
        ? memoryCache
        : undefined;

    const local = memFresh ?? readLocalCache();

    if (local) {
      memoryCache = local;
      setData(local.data);
      setStatus("success");
    } else {
      setStatus("loading");
    }

    // Avoid spamming the endpoint if the user opens/closes the sheet rapidly.
    // IMPORTANT: do NOT use cached.updatedAt here, because localStorage can be
    // fresh across reloads and would prevent any network request from firing.
    if (
      lastNetworkFetchAt &&
      now - lastNetworkFetchAt < REFRESH_MIN_INTERVAL_MS
    ) {
      return;
    }

    const controller = new AbortController();

    (async () => {
      try {
        lastNetworkFetchAt = Date.now();
        const res = (await fetch("/api/guest/filters", {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        }).then(async (r) => {
          if (!r.ok) throw new Error("failed_to_load_filters");
          return (await r.json()) as GuestFiltersData;
        })) satisfies GuestFiltersData;
        if (controller.signal.aborted) return;

        const next = { data: res, updatedAt: Date.now() };
        memoryCache = next;
        writeLocalCache(next);

        setData(res);
        setStatus("success");
      } catch {
        if (controller.signal.aborted) return;
        setStatus((prev) => (prev === "success" ? prev : "error"));
      }
    })();

    return () => {
      controller.abort();
    };
  }, [enabled]);

  return {
    status,
    data,
  } as const;
}

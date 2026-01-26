import * as React from "react";

export type RestaurantWeatherToday = {
  temperatureC: number;
  weatherCode?: number;
  resolvedLocation?: string;
  updatedAt: number;
};

type Status = "idle" | "loading" | "error";

const WEATHER_TTL_MS = 30 * 60 * 1000;

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function normalizeQuery(text: string) {
  return text.trim().replace(/\s+/g, " ").slice(0, 80);
}

function toNumber(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return null;
  return n;
}

async function geocodeLocation(params: {
  query: string;
  signal?: AbortSignal;
  language?: string;
}): Promise<{
  latitude: number;
  longitude: number;
  resolvedLocation?: string;
} | null> {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", params.query);
  url.searchParams.set("count", "1");
  url.searchParams.set("format", "json");
  if (params.language) url.searchParams.set("language", params.language);

  const res = await fetch(url.toString(), {
    method: "GET",
    signal: params.signal,
    cache: "no-store",
  });

  if (!res.ok) return null;

  const json = (await res.json()) as {
    results?: Array<{
      latitude?: number;
      longitude?: number;
      name?: string;
      admin1?: string;
      country?: string;
    }>;
  };

  const first = json.results?.[0];
  const lat = toNumber(first?.latitude);
  const lon = toNumber(first?.longitude);
  if (lat == null || lon == null) return null;

  const parts = [first?.name, first?.admin1, first?.country]
    .map((s) => (s ?? "").trim())
    .filter(Boolean);

  return {
    latitude: lat,
    longitude: lon,
    resolvedLocation: parts.length ? parts.join(", ") : undefined,
  };
}

async function fetchCurrentWeather(params: {
  latitude: number;
  longitude: number;
  signal?: AbortSignal;
}): Promise<{ temperatureC: number; weatherCode?: number } | null> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(params.latitude));
  url.searchParams.set("longitude", String(params.longitude));
  url.searchParams.set("current", "temperature_2m,weather_code");
  url.searchParams.set("timezone", "auto");

  const res = await fetch(url.toString(), {
    method: "GET",
    signal: params.signal,
    cache: "no-store",
  });

  if (!res.ok) return null;

  const json = (await res.json()) as {
    current?: { temperature_2m?: number; weather_code?: number };
  };

  const temperatureC = toNumber(json.current?.temperature_2m);
  if (temperatureC == null) return null;
  return { temperatureC, weatherCode: json.current?.weather_code };
}

async function getIpLocation(params: { signal?: AbortSignal }): Promise<{
  latitude: number;
  longitude: number;
  resolvedLocation?: string;
} | null> {
  // No-permission fallback so weather still works when restaurant location is missing.
  // ipwho.is supports CORS and doesn't require an API key.
  const res = await fetch("https://ipwho.is/", {
    method: "GET",
    signal: params.signal,
    cache: "no-store",
  });

  if (!res.ok) return null;

  const json = (await res.json()) as {
    success?: boolean;
    latitude?: number;
    longitude?: number;
    city?: string;
    region?: string;
    country?: string;
  };

  if (json.success === false) return null;

  const lat = toNumber(json.latitude);
  const lon = toNumber(json.longitude);
  if (lat == null || lon == null) return null;

  const parts = [json.city, json.region, json.country]
    .map((s) => (s ?? "").trim())
    .filter(Boolean);

  return {
    latitude: lat,
    longitude: lon,
    resolvedLocation: parts.length ? parts.join(", ") : undefined,
  };
}

export function useRestaurantWeatherToday(params: {
  restaurantSlug: string;
  locationText?: string;
  language?: string;
}) {
  const storageKey = `vimenu_weather_${params.restaurantSlug}_${(
    params.language ?? "en"
  )
    .trim()
    .toLowerCase()}`;

  const [data, setData] = React.useState<RestaurantWeatherToday | null>(null);
  const [status, setStatus] = React.useState<Status>("idle");

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const cached = safeJsonParse<RestaurantWeatherToday>(
      localStorage.getItem(storageKey),
    );
    if (cached && Date.now() - cached.updatedAt < WEATHER_TTL_MS) {
      setData(cached);
    }
  }, [storageKey]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (data && Date.now() - data.updatedAt < WEATHER_TTL_MS) return;

    const query = normalizeQuery(params.locationText ?? "");

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10_000);

    setStatus("loading");

    (async () => {
      try {
        const language = (params.language ?? "en").split("-")[0];

        const geo = query
          ? await geocodeLocation({
              query,
              signal: controller.signal,
              language,
            })
          : null;

        const fallbackGeo =
          geo ?? (await getIpLocation({ signal: controller.signal }));
        if (!fallbackGeo) {
          setStatus("error");
          return;
        }

        const weather = await fetchCurrentWeather({
          latitude: fallbackGeo.latitude,
          longitude: fallbackGeo.longitude,
          signal: controller.signal,
        });
        if (!weather) {
          setStatus("error");
          return;
        }

        const next: RestaurantWeatherToday = {
          temperatureC: weather.temperatureC,
          weatherCode: weather.weatherCode,
          resolvedLocation: fallbackGeo.resolvedLocation,
          updatedAt: Date.now(),
        };

        setData(next);
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          // ignore
        }
        setStatus("idle");
      } catch {
        setStatus("error");
      } finally {
        window.clearTimeout(timeout);
      }
    })();

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [data, params.language, params.locationText, storageKey]);

  return { data, status };
}

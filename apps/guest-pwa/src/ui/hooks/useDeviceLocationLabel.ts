import * as React from "react";

function firstNonEmpty(...values: Array<string | undefined | null>) {
  for (const value of values) {
    const v = (value ?? "").trim();
    if (v) return v;
  }
  return undefined;
}

type Status = "idle" | "loading" | "denied" | "error";

type StoredLocation = {
  label: string;
  lat: number;
  lon: number;
  updatedAt: number;
};

const LOCATION_TTL_MS = 24 * 60 * 60 * 1000;

function readStored(key: string): StoredLocation | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredLocation;
    if (!parsed?.label || !parsed.updatedAt) return null;
    if (Date.now() - parsed.updatedAt > LOCATION_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStored(key: string, value: StoredLocation) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore (storage quota/private mode)
  }
}

async function reverseGeocode(params: {
  lat: number;
  lon: number;
  signal?: AbortSignal;
  language?: string;
}): Promise<string | null> {
  // Prefer Open-Meteo reverse geocoding (stable CORS + lighter payload),
  // fallback to BigDataCloud (CORS-friendly) for extra coverage.
  try {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/reverse");
    url.searchParams.set("latitude", String(params.lat));
    url.searchParams.set("longitude", String(params.lon));
    url.searchParams.set("count", "1");
    if (params.language) url.searchParams.set("language", params.language);

    const res = await fetch(url.toString(), {
      method: "GET",
      signal: params.signal,
      cache: "no-store",
    });

    if (res.ok) {
      const json = (await res.json()) as {
        results?: Array<{ name?: string; admin1?: string; country?: string }>;
      };
      const first = json.results?.[0];
      const admin = (first?.admin1 ?? "").trim();
      const country = (first?.country ?? "").trim();
      const name = (first?.name ?? "").trim();

      if (admin && country) return `${admin}, ${country}`;
      if (name && country) return `${name}, ${country}`;
      if (country) return country;
    }
  } catch {
    // ignore and fallback
  }

  try {
    const url = new URL(
      "https://api.bigdatacloud.net/data/reverse-geocode-client",
    );
    url.searchParams.set("latitude", String(params.lat));
    url.searchParams.set("longitude", String(params.lon));
    url.searchParams.set("localityLanguage", params.language ?? "en");

    const res = await fetch(url.toString(), {
      method: "GET",
      signal: params.signal,
      cache: "no-store",
    });

    if (!res.ok) return null;

    const json = (await res.json()) as {
      city?: string;
      locality?: string;
      principalSubdivision?: string;
      countryName?: string;
    };

    const adminArea = firstNonEmpty(
      json.city,
      json.locality,
      json.principalSubdivision,
    );
    const country = firstNonEmpty(json.countryName);

    if (adminArea && country) return `${adminArea}, ${country}`;
    if (country) return country;
    if (adminArea) return adminArea;
    return null;
  } catch {
    return null;
  }
}

export function useDeviceLocationLabel(params: {
  restaurantSlug: string;
  language?: string;
}) {
  const langKey = (params.language ?? "en").trim().toLowerCase();
  const storageKey = `vimenu_device_location_${params.restaurantSlug}_${langKey}`;

  const [label, setLabel] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<Status>("idle");

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = readStored(storageKey);
    if (stored?.label) setLabel(stored.label);
  }, [langKey, storageKey]);

  const request = React.useCallback(async () => {
    if (typeof window === "undefined") return;

    if (!navigator.geolocation) {
      setStatus("error");
      return;
    }

    setStatus("loading");

    const position = await new Promise<GeolocationPosition>(
      (resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          maximumAge: 10 * 60 * 1000,
          timeout: 20 * 1000,
        });
      },
    ).catch((err: GeolocationPositionError) => {
      if (err?.code === err.PERMISSION_DENIED) setStatus("denied");
      else setStatus("error");
      return null;
    });

    if (!position) return;

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12_000);

    try {
      const nextLabel = await reverseGeocode({
        lat,
        lon,
        signal: controller.signal,
        language: langKey,
      });

      if (nextLabel) {
        setLabel(nextLabel);
        writeStored(storageKey, {
          label: nextLabel,
          lat,
          lon,
          updatedAt: Date.now(),
        });
        setStatus("idle");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      window.clearTimeout(timeout);
    }
  }, [langKey, storageKey]);

  // If the user has already granted permission previously, auto-refresh once.
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (label) return;
    if (!navigator.geolocation) return;
    if (!("permissions" in navigator)) return;

    let cancelled = false;

    (async () => {
      try {
        // TS lib.dom types don't always include the exact overload.
        const permission = await (
          navigator as Navigator & {
            permissions: Permissions;
          }
        ).permissions.query({ name: "geolocation" as PermissionName });

        if (cancelled) return;
        if (permission.state === "granted") {
          void request();
        }
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [label, request]);

  return { label, status, request };
}

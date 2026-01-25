import { normalizeLanguageCode, type LanguageCode } from "@/domain/language";

export type CountryCode =
  | "VN"
  | "US"
  | "GB"
  | "FR"
  | "JP"
  | "KR"
  | "CN"
  | "TW"
  | "HK"
  | "TH"
  | "ES"
  | "DE"
  | "IT"
  | "PT"
  | "BR"
  | "RU"
  | "UA"
  | "SA"
  | "AE"
  | "TR"
  | "ID"
  | "MY"
  | "SG"
  | "PH"
  | "IN"
  | "IL";

// NOTE:
// - A language does not map 1:1 to a country (e.g. English, Arabic).
// - We pick a reasonable default flag for the language selection UI.
// - If not mapped, UI falls back to a neutral code badge.
const LANGUAGE_TO_COUNTRY: Readonly<Record<string, CountryCode>> = {
  vi: "VN",
  en: "US",
  "en-gb": "GB",
  fr: "FR",
  ja: "JP",
  ko: "KR",
  zh: "CN",
  "zh-hant": "TW",
  "zh-tw": "TW",
  "zh-hk": "HK",
  th: "TH",
  es: "ES",
  de: "DE",
  it: "IT",
  pt: "PT",
  "pt-br": "BR",
  ru: "RU",
  uk: "UA",
  ar: "SA",
  "ar-ae": "AE",
  tr: "TR",
  id: "ID",
  ms: "MY",
  "ms-sg": "SG",
  tl: "PH",
  hi: "IN",
  he: "IL",
};

export function getCountryFlagForLanguage(
  code: LanguageCode,
): CountryCode | null {
  const normalized = normalizeLanguageCode(code);
  const base = normalized.split(/[-_]/)[0] ?? normalized;

  return LANGUAGE_TO_COUNTRY[normalized] ?? LANGUAGE_TO_COUNTRY[base] ?? null;
}

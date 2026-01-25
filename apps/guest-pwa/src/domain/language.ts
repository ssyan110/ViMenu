export type LanguageCode = string;

export const DEFAULT_LANGUAGE: LanguageCode = "vi";

export function normalizeLanguageCode(
  value: string | null | undefined,
): LanguageCode {
  const code = (value ?? "").trim().toLowerCase();
  return code.length > 0 ? code : DEFAULT_LANGUAGE;
}

export function getLanguageOrDefault(
  code: string | null | undefined,
): LanguageCode {
  return normalizeLanguageCode(code);
}

import { DEFAULT_LANGUAGE, type LanguageCode } from "@/domain/language";

export function getBilingualName(params: {
  nameVi: string;
  nameByLang?: Record<string, string | undefined>;
  selectedLanguage: LanguageCode;
  fallbackSecondaryLanguage?: LanguageCode;
}): { primary: string; secondary?: string } {
  const { nameVi, nameByLang, selectedLanguage } = params;

  if (selectedLanguage === DEFAULT_LANGUAGE) {
    const secondary =
      params.fallbackSecondaryLanguage &&
      params.fallbackSecondaryLanguage !== DEFAULT_LANGUAGE
        ? nameByLang?.[params.fallbackSecondaryLanguage]
        : undefined;

    return { primary: nameVi, secondary };
  }

  const primary = nameByLang?.[selectedLanguage] ?? nameVi;
  return primary === nameVi ? { primary } : { primary, secondary: nameVi };
}

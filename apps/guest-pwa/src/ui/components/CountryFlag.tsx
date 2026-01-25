import * as React from "react";

import type { CountryCode } from "@/domain/i18n/languageToCountryFlag";

// country-flag-icons exports React components by country code (US, VN, ...)
import * as FlagIcons from "country-flag-icons/react/3x2";

export function CountryFlag({
  country,
  title,
  className,
}: {
  country: CountryCode;
  title?: string;
  className?: string;
}) {
  const Flag = (
    FlagIcons as unknown as Record<string, React.ComponentType<any>>
  )[country];

  if (!Flag) return null;

  return (
    <Flag
      className={className}
      title={title}
      aria-hidden={title ? undefined : true}
      focusable={false}
      // `country-flag-icons` uses a 3x2 viewBox; inside a circle we want a "cover" crop.
      // Many SVGs respect preserveAspectRatio; if not, the parent can still scale-crop.
      preserveAspectRatio="xMidYMid slice"
    />
  );
}

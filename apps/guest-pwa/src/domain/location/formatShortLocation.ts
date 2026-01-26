export type ReverseGeocodeAddress = {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state?: string;
  region?: string;
  province?: string;
  country?: string;
};

function firstNonEmpty(...values: Array<string | undefined | null>) {
  for (const value of values) {
    const v = (value ?? "").trim();
    if (v) return v;
  }
  return undefined;
}

/**
 * Format a short human-friendly location like "Ho Chi Minh City, Vietnam".
 * Requirement: only province/city + country.
 */
export function formatShortLocationFromAddress(
  address: ReverseGeocodeAddress | null | undefined,
): string | null {
  if (!address) return null;

  const adminArea = firstNonEmpty(
    address.city,
    address.town,
    address.village,
    address.municipality,
    address.province,
    address.state,
    address.region,
    address.county,
  );
  const country = firstNonEmpty(address.country);

  if (adminArea && country) return `${adminArea}, ${country}`;
  if (country) return country;
  if (adminArea) return adminArea;
  return null;
}

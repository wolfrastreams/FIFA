/**
 * Converts a 2-letter ISO 3166-1 alpha-2 country code to a flag emoji.
 * getFlag('QA') → 🇶🇦, getFlag('GB') → 🇬🇧
 */
export function getFlag(countryCode: string | undefined): string {
  if (!countryCode) return "🌐";
  // Regional Indicator Symbol offset
  const offset = 127397;
  const chars = [...countryCode.toUpperCase()].map((c) =>
    String.fromCodePoint(c.charCodeAt(0) + offset),
  );
  return chars.join("");
}

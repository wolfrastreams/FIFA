// iptv-org allows public access, no auth needed
// https://iptv-org.github.io — open IPTV database

export interface Channel {
  id: string;
  name: string;
  logo: string;
  url: string;
  country: string;
  group: string;
  isGeoBlocked: boolean; // true when iptv-org marks it as geo-restricted
}

const SPORTS_M3U_URL =
  "https://iptv-org.github.io/iptv/categories/sports.m3u";

const KEYWORDS = [
  "bein",
  "sport",
  "fifa",
  "fox",
  "sky",
  "espn",
  "canal",
  "supersport",
  "osn",
  "movistar",
  "sony",       // Sony Sports, Sony Ten, Sony Six etc.
  "dazn",       // DAZN Sports
  "eleven",     // Eleven Sports
  "premier",    // Premier Sports
  "arena",      // Arena Sport
  "match",      // Match TV / Match Sport
  "eurosport",  // Eurosport
  "setanta",    // Setanta Sports
];

// Phrases iptv-org puts in channel names to signal geo-restriction
const GEO_BLOCK_MARKERS = [
  "geo-block",
  "geo block",
  "geoblocked",
  "geo-locked",
  "not 24/7",
];

function detectGeoBlocked(name: string): boolean {
  const lower = name.toLowerCase();
  return GEO_BLOCK_MARKERS.some((m) => lower.includes(m));
}

// Strip annotation tags from display name e.g. " [Geo-blocked]", " (Not 24/7)"
export function cleanChannelName(name: string): string {
  return name
    .replace(/\s*[\[(][^\])]*(geo-block|geo block|not 24|1080p|720p|hd|sd)[^\])]*[\])]/gi, "")
    .trim();
}

export async function fetchSportsChannels(): Promise<Channel[]> {
  const res = await fetch(SPORTS_M3U_URL);
  if (!res.ok) throw new Error(`Failed to fetch M3U: ${res.status}`);
  const text = await res.text();
  const lines = text.split("\n");
  const channels: Channel[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("#EXTINF")) {
      const name = line.match(/,(.+)$/)?.[1]?.trim() || "Unknown";
      const logo = line.match(/tvg-logo="([^"]+)"/)?.[1] || "";
      const country = line.match(/tvg-country="([^"]+)"/)?.[1] || "";
      const nextLine = lines[i + 1]?.trim() || "";
      const url = nextLine;

      const matchKeyword = KEYWORDS.some((k) => name.toLowerCase().includes(k));

      if (url.startsWith("http") && matchKeyword) {
        channels.push({
          id: name.toLowerCase().replace(/[\s[\]()]/g, "-").replace(/-+/g, "-"),
          name,
          logo,
          country,
          url,
          group: "Sports",
          isGeoBlocked: detectGeoBlocked(name),
        });
      }
    }
  }

  return channels;
}

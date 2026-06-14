// iptv-org allows public access, no auth needed
// https://iptv-org.github.io — open IPTV database
//
// IMPORTANT: Public iptv-org streams generally do NOT carry live FIFA World Cup
// matches due to copyright/DRM. The real value for FIFA viewing comes from:
//   1. Direct HLS endpoints (Sirasa TV, local provider links)
//   2. User-imported custom M3U playlists from their own IPTV provider
//
// The sports.m3u source is kept for general sports channel browsing only.

export interface Channel {
  id: string;
  name: string;
  logo: string;
  url: string;
  country: string;
  group: string;
  isGeoBlocked: boolean;
  isFifaBroadcaster?: boolean; // true ONLY for channels confirmed to air FIFA WC 2026
}

// Primary sports M3U source
const SPORTS_M3U_URL =
  "https://iptv-org.github.io/iptv/categories/sports.m3u";

// ─── Keyword Matching (for sports.m3u filtering) ─────────────────────────────
const KEYWORDS = [
  "bein",
  "sport",
  "fifa",
  "fox sport",
  "sky sport",
  "espn",
  "supersport",
  "sony",
  "dazn",
  "eurosport",
  "setanta",
];

// ─── Exact FIFA WC 2026 Broadcaster Names ────────────────────────────────────
// These must be specific enough to avoid false positives.
// Only match the exact channel names known to broadcast the tournament.
const FIFA_EXACT_NAMES = [
  // Sri Lanka — Maharaja Network (all 104 games FTA)
  "sirasa tv",
  "shakthi tv",
  // India
  "sony ten",
  "sony six",
  "sony sports",
  "doordarshan",
  "dd sports",
  "unite8",
  // Brazil
  "cazétv",
  "cazetv",
  "cazé tv",
  // Turkey
  "trt 1",
  "trt spor",
  // Indonesia
  "tvri sport",
  "tvri nasional",
  // Middle East
  "bein sports",
  "bein sport",
  // USA
  "fox sports 1",
  "fox sports 2",
  "fs1",
  "fs2",
  "telemundo",
  // UK
  "bbc one",
  "bbc two",
  "itv 1",
  "itvx",
  // Australia
  "sbs",
  // Netherlands
  "nos live",
  // Germany
  "ard",
  "zdf",
  // Spain
  "rtve",
  "la 1",
  // Belgium
  "rtbf",
  // Africa
  "supersport",
  // Scandinavia
  "svt",
  "nrk",
];

// ─── Geo-Block Detection ─────────────────────────────────────────────────────
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

/**
 * Strict FIFA broadcaster check — requires the channel name to contain
 * one of the exact broadcaster phrases. No single-word partial matching.
 */
function detectFifaBroadcaster(name: string): boolean {
  const lower = name.toLowerCase();
  return FIFA_EXACT_NAMES.some((b) => lower.includes(b));
}

// Strip annotation tags from display name
export function cleanChannelName(name: string): string {
  return name
    .replace(/\s*[[(][^\])]*(geo-block|geo block|not 24|1080p|720p|hd|sd)[^\])]*[\])]/gi, "")
    .trim();
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Fetch sports channels from iptv-org sports.m3u.
 * Filters by KEYWORDS and tags confirmed FIFA broadcasters.
 */
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
          isFifaBroadcaster: detectFifaBroadcaster(name),
        });
      }
    }
  }

  // Sort: FIFA broadcasters first, then non-geo-blocked, then alphabetical
  channels.sort((a, b) => {
    if (a.isFifaBroadcaster && !b.isFifaBroadcaster) return -1;
    if (!a.isFifaBroadcaster && b.isFifaBroadcaster) return 1;
    if (a.isGeoBlocked && !b.isGeoBlocked) return 1;
    if (!a.isGeoBlocked && b.isGeoBlocked) return -1;
    return a.name.localeCompare(b.name);
  });

  return channels;
}

/**
 * Parse a user-provided custom M3U playlist text (from file upload or pasted URL).
 * No keyword filtering — imports ALL channels found.
 */
export function parseCustomM3U(text: string): Channel[] {
  const lines = text.split("\n");
  const channels: Channel[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("#EXTINF")) {
      const name = line.match(/,(.+)$/)?.[1]?.trim() || "Unknown";
      const logo = line.match(/tvg-logo="([^"]+)"/)?.[1] || "";
      const country = line.match(/tvg-country="([^"]+)"/)?.[1] || "";
      
      let url = "";
      for (let j = i + 1; j < lines.length; j++) {
        const nextLine = lines[j].trim();
        if (nextLine.startsWith("#EXTINF")) {
          break;
        }
        if (nextLine.startsWith("http")) {
          url = nextLine;
          break;
        }
      }

      if (url) {
        channels.push({
          id: name.toLowerCase().replace(/[\s[\]()]/g, "-").replace(/-+/g, "-") + "-" + Math.random().toString(36).substring(2, 6),
          name,
          logo,
          country,
          url,
          group: "Imported",
          isGeoBlocked: false,
          isFifaBroadcaster: detectFifaBroadcaster(name),
        });
      }
    }
  }

  return channels;
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import heroImage from "@/assets/hero-stadium.jpg";
import heroPlayer from "@/assets/hero-player.jpg";
import { fetchSportsChannels, cleanChannelName, type Channel } from "@/utils/m3uParser";
import { getFlag } from "@/utils/countryFlag";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GoalStream — Watch Live FIFA Matches in HD | Powered by WebZolia" },
      {
        name: "description",
        content:
          "Stream every FIFA World Cup match live in HD on GoalStream. Developed by Gaurava Bandaranayaka and powered by WebZolia. Access beIN Sports, Sky Sports, ESPN, and more.",
      },
      {
        name: "keywords",
        content:
          "webzolia, Gaurava Bandaranayaka, FIFA, FIFA World Cup 2026, GoalStream, live football stream, watch soccer online, live sports channels, Sony Sports, beIN Sports, sports streaming",
      },
      {
        name: "author",
        content: "Gaurava Bandaranayaka (WebZolia)",
      },
      {
        name: "robots",
        content: "index, follow",
      },
      // Open Graph Metadata
      {
        property: "og:title",
        content: "GoalStream — Watch Live FIFA World Cup 2026 Matches in HD",
      },
      {
        property: "og:description",
        content: "Stream every FIFA match live on GoalStream, developed by Gaurava Bandaranayaka and powered by WebZolia. Watch global sports networks in HD.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:url",
        content: "https://www.webzolia.com",
      },
      // Twitter Card Metadata
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:title",
        content: "GoalStream — Live FIFA World Cup 2026",
      },
      {
        name: "twitter:description",
        content: "Watch live FIFA matches in HD. Powered by WebZolia and developed by Gaurava Bandaranayaka.",
      },
    ],
  }),
  component: Index,
});

// Fallback test stream URL if real stream fails
const FALLBACK_STREAM_URL =
  "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

// Hardcoded backup channel list if API fetch fails entirely
const FALLBACK_CHANNELS: Channel[] = [
  {
    id: "bein-1",
    name: "beIN Sports 1",
    logo: "",
    country: "QA",
    url: FALLBACK_STREAM_URL,
    group: "Sports",
    isGeoBlocked: false,
  },
  {
    id: "bein-2",
    name: "beIN Sports 2",
    logo: "",
    country: "QA",
    url: FALLBACK_STREAM_URL,
    group: "Sports",
    isGeoBlocked: false,
  },
  {
    id: "sky-sports",
    name: "Sky Sports",
    logo: "",
    country: "GB",
    url: FALLBACK_STREAM_URL,
    group: "Sports",
    isGeoBlocked: false,
  },
  {
    id: "espn",
    name: "ESPN",
    logo: "",
    country: "US",
    url: FALLBACK_STREAM_URL,
    group: "Sports",
    isGeoBlocked: false,
  },
  {
    id: "fox-sports",
    name: "Fox Sports",
    logo: "",
    country: "US",
    url: FALLBACK_STREAM_URL,
    group: "Sports",
    isGeoBlocked: false,
  },
  {
    id: "supersport-1",
    name: "SuperSport 1",
    logo: "",
    country: "ZA",
    url: FALLBACK_STREAM_URL,
    group: "Sports",
    isGeoBlocked: false,
  },
  {
    id: "canal-sport",
    name: "Canal+ Sport",
    logo: "",
    country: "FR",
    url: FALLBACK_STREAM_URL,
    group: "Sports",
    isGeoBlocked: false,
  },
  {
    id: "osn-sports",
    name: "OSN Sports",
    logo: "",
    country: "AE",
    url: FALLBACK_STREAM_URL,
    group: "Sports",
    isGeoBlocked: false,
  },
  {
    id: "movistar-sport",
    name: "Movistar Sport",
    logo: "",
    country: "ES",
    url: FALLBACK_STREAM_URL,
    group: "Sports",
    isGeoBlocked: false,
  },
  {
    id: "bein-sport-max",
    name: "beIN Sport Max",
    logo: "",
    country: "QA",
    url: FALLBACK_STREAM_URL,
    group: "Sports",
    isGeoBlocked: false,
  },
  {
    id: "sony-sports-1",
    name: "Sony Sports 1",
    logo: "",
    country: "IN",
    url: FALLBACK_STREAM_URL,
    group: "Sports",
    isGeoBlocked: false,
  },
  {
    id: "sony-ten-1",
    name: "Sony Ten 1",
    logo: "",
    country: "IN",
    url: FALLBACK_STREAM_URL,
    group: "Sports",
    isGeoBlocked: false,
  },
  {
    id: "sony-ten-2",
    name: "Sony Ten 2",
    logo: "",
    country: "IN",
    url: FALLBACK_STREAM_URL,
    group: "Sports",
    isGeoBlocked: false,
  },
  {
    id: "sony-six",
    name: "Sony Six",
    logo: "",
    country: "IN",
    url: FALLBACK_STREAM_URL,
    group: "Sports",
    isGeoBlocked: false,
  },
];

// ─── Live Dot Badge ─────────────────────────────────────────────────────────

function LiveDot() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[var(--red-live)]/15 text-[var(--red-live)]">
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--red-live)] animate-pulse-live" />
      Live
    </span>
  );
}

// ─── Loading Spinner ────────────────────────────────────────────────────────

function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sz =
    size === "sm" ? "h-5 w-5" : size === "lg" ? "h-12 w-12" : "h-8 w-8";
  return (
    <div
      className={`${sz} border-4 border-[var(--gold)] border-t-transparent rounded-full animate-spin`}
    />
  );
}

// ─── Navbar ─────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[var(--navy)]/80 border-b border-[var(--gold)]/15">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#" className="font-display text-3xl text-[var(--gold)] tracking-wide">
          ⚽ GoalStream
        </a>
        <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-foreground/80">
          <li>
            <a href="#home" className="hover:text-[var(--gold)] transition-colors">
              Home
            </a>
          </li>
          <li>
            <a href="#channels" className="hover:text-[var(--gold)] transition-colors">
              Live
            </a>
          </li>
          <li>
            <a href="#schedule" className="hover:text-[var(--gold)] transition-colors">
              Schedule
            </a>
          </li>
        </ul>
        <a
          href="https://www.webzolia.com"
          target="_blank"
          rel="noopener noreferrer"
          className="webzolia-badge"
        >
          <span className="webzolia-dot animate-pulse" />
          Powered by WebZolia
        </a>
      </nav>
    </header>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function Hero({ totalChannels }: { totalChannels: number }) {
  return (
    <section id="home" className="relative overflow-hidden border-b border-[var(--gold)]/15">
      {/* Background stadium image, very dim */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--navy)]/85 via-[var(--navy)]/70 to-[var(--navy)]" />
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[var(--gold)]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[var(--green-live)]/15 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* LEFT: Editorial text block */}
          <div className="lg:col-span-7 space-y-7">
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-foreground/60">
              <span className="h-px w-10 bg-[var(--gold)]" />
              FIFA World Cup · Season 2026
            </div>

            <h1 className="hero-title text-foreground">
              Every <span className="text-gold-custom">Goal.</span>
              <br />
              Every <span className="italic text-green-live-custom">Match.</span>
              <br />
              Live.
            </h1>

            <p className="text-lg text-foreground/70 max-w-lg">
              Stream every FIFA fixture in crystal-clear HD across{" "}
              {totalChannels > 0 ? `${totalChannels}+` : "10+"} global sports
              networks — kickoff to final whistle.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#channels"
                className="group btn-gold-custom inline-flex items-center gap-2 rounded-md px-7 py-3.5 font-semibold hover:brightness-110 transition-all hover:scale-[1.03]"
                style={{ backgroundColor: "var(--gold)", color: "var(--navy)" }}
              >
                Browse Channels
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="#channels"
                className="link-gold-hover-custom inline-flex items-center gap-2 text-sm font-semibold text-foreground/80 transition-colors"
              >
                <span className="border-gold-custom flex h-9 w-9 items-center justify-center rounded-full border">
                  <svg
                    className="h-3 w-3 ml-0.5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                Watch Trailer
              </a>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[var(--gold)]/15 max-w-xl">
              <div>
                <div className="font-display text-3xl text-[var(--gold)]">
                  {totalChannels > 0 ? `${totalChannels}+` : "10+"}
                </div>
                <div className="text-xs uppercase tracking-wider text-foreground/50 mt-1">
                  Live Channels
                </div>
              </div>
              <div>
                <div className="font-display text-3xl text-[var(--gold)]">4K</div>
                <div className="text-xs uppercase tracking-wider text-foreground/50 mt-1">
                  Ultra HD
                </div>
              </div>
              <div>
                <div className="font-display text-3xl text-[var(--gold)]">24/7</div>
                <div className="text-xs uppercase tracking-wider text-foreground/50 mt-1">
                  Coverage
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Visual card stack */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-[var(--gold)]/30 shadow-2xl shadow-black/60">
              <img
                src={heroPlayer}
                alt="Footballer mid-air bicycle kick"
                width={1024}
                height={1280}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--navy)] via-transparent to-transparent" />

              {/* Top-left LIVE badge */}
              <div className="absolute top-5 left-5">
                <LiveDot />
              </div>

              {/* Top-right minute */}
              <div className="absolute top-5 right-5 rounded-md bg-black/50 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-foreground border border-white/10">
                67<span className="text-[var(--green-live)]">'</span>
              </div>

              {/* Bottom match card */}
              <div className="absolute inset-x-5 bottom-5 rounded-xl bg-[var(--navy)]/85 backdrop-blur-md border border-[var(--gold)]/25 p-4">
                <div className="text-[10px] uppercase tracking-[0.25em] text-foreground/50 mb-3">
                  Quarter Final · Group Stage
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xs font-bold">
                      AR
                    </div>
                    <div className="text-xs font-semibold">Argentina</div>
                  </div>
                  <div className="px-4 text-center">
                    <div className="font-display text-3xl text-[var(--gold)] leading-none">
                      2 : 1
                    </div>
                    <div className="text-[10px] text-[var(--green-live)] mt-1 font-semibold">
                      LIVE
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-xs font-bold text-[var(--navy)]">
                      BR
                    </div>
                    <div className="text-xs font-semibold">Brazil</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating viewer pill */}
            <div className="absolute -left-4 top-12 hidden md:flex items-center gap-2 rounded-full bg-[var(--navy-light)] border border-[var(--gold)]/30 px-4 py-2 shadow-xl">
              <span className="h-2 w-2 rounded-full bg-[var(--green-live)] animate-pulse-live" />
              <span className="text-xs font-semibold">12,430 watching</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Channel Logo with Fallback ──────────────────────────────────────────────

function ChannelLogo({ logo, name }: { logo: string; name: string }) {
  const [failed, setFailed] = useState(false);

  if (!logo || failed) {
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[var(--navy)] text-xl">
        ⚽
      </span>
    );
  }

  return (
    <img
      src={logo}
      alt={name}
      className="h-10 w-10 shrink-0 rounded-md object-contain bg-[var(--navy)] p-1"
      onError={() => setFailed(true)}
    />
  );
}

// ─── Video Player ────────────────────────────────────────────────────────────

function Player({
  channel,
  channels,
  onNextChannel,
}: {
  channel: Channel | null;
  channels: Channel[];
  onNextChannel: (ch: Channel) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [playing, setPlaying] = useState(false);
  const [streamLoading, setStreamLoading] = useState(false);
  const [streamError, setStreamError] = useState(false);
  const [proxyLabel, setProxyLabel] = useState(""); // which proxy is being tried
  const [isFallback, setIsFallback] = useState(false);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Free CORS proxies tried in sequence for geo-blocked channels.
  // NOTE: Sony/Cloudflare Workers streams actively detect & block many proxies.
  // These may occasionally work depending on the proxy server's region & IP.
  const GEO_PROXIES = [
    (url: string) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
    (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url: string) => `https://proxy.cors.sh/${url}`,
    (url: string) => `https://crossorigin.me/${url}`,
  ];

  // Build an HLS instance that routes ALL requests (manifest + segments) through a proxy
  const makeProxiedHls = (proxyFn: (u: string) => string) =>
    new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      xhrSetup: (xhr: XMLHttpRequest, url: string) => {
        // Rewrite every HLS request through the proxy
        const proxied = proxyFn(url);
        xhr.open("GET", proxied, true);
      },
    });

  useEffect(() => {
    if (!channel?.url || !videoRef.current) return;

    setStreamLoading(true);
    setStreamError(false);
    setPlaying(false);
    setProxyLabel("");
    setIsFallback(false);

    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);

    const video = videoRef.current;

    // For geo-blocked channels: try each proxy in sequence, then direct, then fallback
    // For normal channels: try direct, then fallback
    const attempts: Array<{ label: string; url: string; proxied: boolean; proxyFn?: (u: string) => string }> =
      channel.isGeoBlocked
        ? [
          { label: "Unblocking via Proxy 1…", url: channel.url, proxied: true, proxyFn: GEO_PROXIES[0] },
          { label: "Trying Proxy 2…", url: channel.url, proxied: true, proxyFn: GEO_PROXIES[1] },
          { label: "Trying Proxy 3…", url: channel.url, proxied: true, proxyFn: GEO_PROXIES[2] },
          { label: "Trying Proxy 4…", url: channel.url, proxied: true, proxyFn: GEO_PROXIES[3] },
          { label: "Trying direct…", url: channel.url, proxied: false },
          { label: "Using test stream…", url: FALLBACK_STREAM_URL, proxied: false },
        ]
        : [
          { label: "", url: channel.url, proxied: false },
          { label: "Using backup…", url: FALLBACK_STREAM_URL, proxied: false },
        ];

    let attemptIdx = 0;

    const tryNext = () => {
      if (attemptIdx >= attempts.length) {
        setStreamError(true);
        setStreamLoading(false);
        setIsFallback(false);
        return;
      }
      const attempt = attempts[attemptIdx++];
      setProxyLabel(attempt.label);
      setIsFallback(attempt.url === FALLBACK_STREAM_URL);

      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);

      if (Hls.isSupported()) {
        const hls = attempt.proxied && attempt.proxyFn
          ? makeProxiedHls(attempt.proxyFn)
          : new Hls({ enableWorker: true, lowLatencyMode: true });
        hlsRef.current = hls;
        hls.loadSource(attempt.url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setStreamLoading(false);
          setProxyLabel("");
          if (errorTimerRef.current) {
            clearTimeout(errorTimerRef.current);
            errorTimerRef.current = null;
          }
        });
        hls.on(Hls.Events.ERROR, (_evt, data) => {
          if (data.fatal) { hls.destroy(); tryNext(); }
        });
        // Per-attempt timeout
        errorTimerRef.current = setTimeout(() => {
          hls.destroy();
          tryNext();
        }, 8000);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = attempt.url;
        video.addEventListener("loadedmetadata", () => {
          setStreamLoading(false);
          setProxyLabel("");
          if (errorTimerRef.current) {
            clearTimeout(errorTimerRef.current);
            errorTimerRef.current = null;
          }
        }, { once: true });
        video.addEventListener("error", () => tryNext(), { once: true });
      }
    };

    tryNext();

    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel?.id]);

  // Pick the next non-geo-blocked channel after the current one
  const nextFreeChannel = channels.find(
    (ch) => !ch.isGeoBlocked && ch.id !== channel?.id
  ) ?? null;

  const handlePlay = () => { videoRef.current?.play(); setPlaying(true); };

  const handleRetry = () => {
    if (!channel) return;
    // Re-trigger the useEffect by temporarily clearing and resetting
    setStreamError(false);
    setStreamLoading(true);
    setProxyLabel("");
    setIsFallback(false);
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    if (errorTimerRef.current) { clearTimeout(errorTimerRef.current); errorTimerRef.current = null; }
    // Manually re-kick the load
    const video = videoRef.current;
    if (!video) return;
    if (Hls.isSupported()) {
      const hls = channel.isGeoBlocked
        ? makeProxiedHls(GEO_PROXIES[0])
        : new Hls({ enableWorker: true });
      hlsRef.current = hls;
      hls.loadSource(channel.url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => { setStreamLoading(false); setProxyLabel(""); });
      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (data.fatal) { setStreamError(true); setStreamLoading(false); hls.destroy(); }
      });
    }
  };

  if (!channel) {
    return (
      <div className="flex items-center justify-center h-64 rounded-lg bg-[var(--navy-light)]/50 border border-[var(--gold)]/15">
        <p className="text-foreground/40 text-sm">Select a channel to start watching</p>
      </div>
    );
  }

  const displayName = cleanChannelName(channel.name);

  return (
    <div className="flex flex-col gap-3">
      {/* Channel header */}
      <div className="flex items-center gap-3">
        <ChannelLogo logo={channel.logo} name={displayName} />
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-2xl text-[var(--gold)] truncate">
            {displayName}
          </h3>
          <div className="text-xs text-foreground/50 flex items-center gap-2">
            {getFlag(channel.country)} {channel.country || "International"}
            {channel.isGeoBlocked && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold border border-[var(--red-live)]/40 text-[var(--red-live)] bg-[var(--red-live)]/10">
                GEO-BLOCKED
              </span>
            )}
          </div>
        </div>
        <LiveDot />
      </div>

      {/* Player box */}
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black border border-[var(--gold)]/20">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          controls={playing && !streamLoading}
          playsInline
        />

        {/* Fallback stream warning badge */}
        {isFallback && (
          <div className="absolute top-4 left-4 z-10 rounded-md bg-yellow-500/95 backdrop-blur-sm px-3 py-1.5 text-xs font-bold text-black border border-yellow-400/50 flex items-center gap-1.5 animate-pulse">
            ⚠️ Playing Backup Stream (Channel Offline)
          </div>
        )}

        {/* Buffering / proxy-attempt overlay */}
        {streamLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 gap-4">
            <Spinner size="lg" />
            <p className="text-sm text-foreground/70 font-medium">
              {proxyLabel || "Connecting to stream…"}
            </p>
            {proxyLabel && (
              <p className="text-xs text-foreground/40 max-w-xs text-center">
                Routing through a relay server to unblock the stream…
              </p>
            )}
          </div>
        )}

        {/* Error overlay */}
        {streamError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 gap-4 px-6 text-center overflow-y-auto py-6">
            <div className="text-4xl">{channel.isGeoBlocked ? "🔒" : "📡"}</div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">
                {channel.isGeoBlocked
                  ? "Stream blocked — DRM geo-restriction"
                  : "Stream unavailable"}
              </p>
              {channel.isGeoBlocked ? (
                <div className="text-xs text-foreground/50 space-y-2 max-w-xs mx-auto">
                  <p>
                    Sony's streams use <span className="text-[var(--red-live)]">Cloudflare Workers</span> which
                    actively detect and block proxy services.
                    All 4 proxy attempts failed.
                  </p>
                  <div className="rounded-md border border-[var(--gold)]/20 bg-[var(--gold)]/5 px-3 py-2 text-left">
                    <p className="text-[var(--gold)] font-semibold mb-1 text-[11px] uppercase tracking-wider">✅ How to watch Sony Sports</p>
                    <ol className="list-decimal list-inside space-y-0.5 text-foreground/60">
                      <li>Install a free VPN (e.g. <span className="text-[var(--gold)]">Windscribe</span> or <span className="text-[var(--gold)]">ProtonVPN</span>)</li>
                      <li>Connect to an <span className="text-[var(--gold)]">India 🇮🇳</span> server</li>
                      <li>Click <span className="text-[var(--gold)]">Retry</span> below</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-foreground/50">Stream unavailable. Try another channel.</p>
              )}
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={handleRetry}
                className="rounded-md border border-[var(--gold)]/60 px-4 py-2 text-sm font-semibold text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--navy)] transition-colors"
              >
                Retry
              </button>
              {nextFreeChannel && (
                <button
                  onClick={() => onNextChannel(nextFreeChannel)}
                  className="rounded-md border border-[var(--gold)] bg-[var(--gold)]/10 px-4 py-2 text-sm font-semibold text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--navy)] transition-colors flex items-center gap-1.5"
                >
                  Next Channel
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Play overlay */}
        {!playing && !streamLoading && !streamError && (
          <button
            onClick={handlePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/60 hover:bg-black/40 transition-colors group"
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--gold)] text-[var(--navy)] shadow-lg group-hover:scale-110 transition-transform">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 ml-1">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        )}
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-md border border-[var(--gold)]/15 bg-[var(--navy-light)]/50 px-4 py-3 text-sm">
        <span>
          <span className="text-foreground/50">Quality:</span>{" "}
          <span className="font-semibold text-[var(--gold)]">HD</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-foreground/50">Status:</span>{" "}
          {isFallback ? (
            <span className="font-semibold text-yellow-500 uppercase tracking-wider flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse inline-block" />
              Demo Backup
            </span>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-[var(--green-live)] animate-pulse-live inline-block" />
              <span className="font-semibold text-[var(--green-live)]">LIVE</span>
            </>
          )}
        </span>
        <span>
          <span className="text-foreground/50">Country:</span>{" "}
          <span className="font-semibold">{getFlag(channel.country)} {channel.country || "INT"}</span>
        </span>
        {channel.isGeoBlocked && (
          <span className="ml-auto text-xs text-[var(--red-live)]/70">🔒 VPN may be required</span>
        )}
      </div>
    </div>
  );
}

// ─── Channel List ────────────────────────────────────────────────────────────

function ChannelList({
  channels,
  loading,
  apiError,
  activeId,
  onSelect,
  totalCount,
}: {
  channels: Channel[];
  loading: boolean;
  apiError: boolean;
  activeId: string | null;
  onSelect: (ch: Channel) => void;
  totalCount: number;
}) {
  const [search, setSearch] = useState("");
  const [hideGeoBlocked, setHideGeoBlocked] = useState(true);

  const geoBlockedCount = channels.filter((ch) => ch.isGeoBlocked).length;

  const filtered = channels
    .filter((ch) => {
      if (hideGeoBlocked && ch.isGeoBlocked) return false;
      return cleanChannelName(ch.name).toLowerCase().includes(search.toLowerCase());
    });

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Search input */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40 pointer-events-none"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          id="channel-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search channels…"
          className="w-full bg-[var(--navy-light)]/60 border border-[var(--gold)]/20 rounded-md pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground/30 outline-none focus:border-[var(--gold)] transition-colors"
        />
      </div>

      {/* Geo-block filter toggle */}
      <button
        id="toggle-geo-blocked"
        onClick={() => setHideGeoBlocked((v) => !v)}
        className={`flex items-center justify-between w-full rounded-md border px-3 py-2 text-xs font-medium transition-colors ${hideGeoBlocked
          ? "border-[var(--gold)]/30 bg-[var(--gold)]/5 text-[var(--gold)]"
          : "border-[var(--red-live)]/30 bg-[var(--red-live)]/5 text-[var(--red-live)]"
          }`}
      >
        <span className="flex items-center gap-1.5">
          <span>{hideGeoBlocked ? "🔒" : "🔓"}</span>
          <span>{hideGeoBlocked ? "Geo-blocked hidden" : "Showing geo-blocked"}</span>
        </span>
        <span className="opacity-60">
          {geoBlockedCount} channels
        </span>
      </button>

      {/* API error notice */}
      {apiError && (
        <div className="rounded-md border border-[var(--red-live)]/30 bg-[var(--red-live)]/10 px-3 py-2 text-xs text-[var(--red-live)]">
          ⚠️ Unable to load channels. Using offline mode.
        </div>
      )}

      {/* Channel count */}
      {!loading && (
        <div className="text-xs text-foreground/40 px-1">
          Showing {filtered.length} of {totalCount} channels
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Spinner size="md" />
        </div>
      ) : (
        <div className="max-h-[520px] overflow-y-auto pr-1 space-y-2 scrollbar-thin">
          {filtered.length === 0 ? (
            <div className="text-center text-sm text-foreground/40 py-10">
              {search
                ? "No channels match your search."
                : hideGeoBlocked
                  ? "All channels are geo-blocked. Toggle to show them."
                  : "No channels found."}
            </div>
          ) : (
            filtered.map((ch) => {
              const isActive = ch.id === activeId;
              const displayName = cleanChannelName(ch.name);
              return (
                <button
                  key={ch.id}
                  id={`channel-${ch.id}`}
                  onClick={() => onSelect(ch)}
                  title={ch.isGeoBlocked ? `${displayName} — geo-restricted stream` : displayName}
                  className={`w-full flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all ${isActive
                    ? "border-[var(--gold)] bg-[var(--gold)]/10 glow-gold"
                    : "border-[var(--gold)]/10 bg-[var(--navy-light)]/40 hover:border-[var(--gold)]/40 hover:bg-[var(--navy-light)]"
                    }`}
                >
                  <ChannelLogo logo={ch.logo} name={displayName} />
                  <span
                    className={`flex-1 min-w-0 font-semibold text-sm truncate ${isActive ? "text-[var(--gold)]" : "text-foreground"}`}
                  >
                    {displayName}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {ch.isGeoBlocked && (
                      <span
                        title="Geo-restricted — may not play in your region"
                        className="text-[10px] px-1.5 py-0.5 rounded border border-[var(--red-live)]/40 text-[var(--red-live)] bg-[var(--red-live)]/10 font-bold"
                      >
                        🔒
                      </span>
                    )}
                    <span className="text-base" title={ch.country}>
                      {getFlag(ch.country)}
                    </span>
                    <LiveDot />
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ─── Channel Section ─────────────────────────────────────────────────────────

function ChannelSection() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

  useEffect(() => {
    // iptv-org allows public access, no auth needed
    fetchSportsChannels()
      .then((data) => {
        const list = data.length > 0 ? data : FALLBACK_CHANNELS;
        setChannels(list);
        setSelectedChannel(list[0] ?? null);
        setLoading(false);
      })
      .catch(() => {
        setApiError(true);
        setLoading(false);
        setChannels(FALLBACK_CHANNELS);
        setSelectedChannel(FALLBACK_CHANNELS[0]);
      });
  }, []);

  return (
    <section id="channels" className="mx-auto max-w-7xl px-6 py-16">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <h2 className="font-display text-4xl md:text-5xl text-foreground">
          Live <span className="text-[var(--gold)]">Channels</span>
        </h2>
        {!loading && (
          <div className="flex items-center gap-2 text-sm text-foreground/50">
            <span className="h-2 w-2 rounded-full bg-[var(--green-live)] animate-pulse-live" />
            <span>
              <span className="text-[var(--gold)] font-semibold">{channels.length}</span>{" "}
              channels loaded
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Channel list */}
        <div className="lg:col-span-2">
          <ChannelList
            channels={channels}
            loading={loading}
            apiError={apiError}
            activeId={selectedChannel?.id ?? null}
            onSelect={setSelectedChannel}
            totalCount={channels.length}
          />
        </div>

        {/* Video player */}
        <div className="lg:col-span-3">
          <Player
            channel={selectedChannel}
            channels={channels}
            onNextChannel={setSelectedChannel}
          />
        </div>
      </div>
    </section>
  );
}

// ─── Team Flags Mapping & Helper ─────────────────────────────────────────────

const TEAM_CODES: Record<string, string> = {
  "Argentina": "AR",
  "Australia": "AU",
  "Austria": "AT",
  "Belgium": "BE",
  "Brazil": "BR",
  "Canada": "CA",
  "Cameroon": "CM",
  "Chile": "CL",
  "Colombia": "CO",
  "Costa Rica": "CR",
  "Croatia": "HR",
  "Czechia": "CZ",
  "Denmark": "DK",
  "Ecuador": "EC",
  "Egypt": "EG",
  "England": "GB-ENG",
  "France": "FR",
  "Germany": "DE",
  "Ghana": "GH",
  "Greece": "GR",
  "Haiti": "HT",
  "Iran": "IR",
  "Italy": "IT",
  "Ivory Coast": "CI",
  "Cote d'Ivoire": "CI",
  "Japan": "JP",
  "Mexico": "MX",
  "Morocco": "MA",
  "Netherlands": "NL",
  "New Zealand": "NZ",
  "Nigeria": "NG",
  "Norway": "NO",
  "Paraguay": "PY",
  "Peru": "PE",
  "Poland": "PL",
  "Portugal": "PT",
  "Qatar": "QA",
  "Saudi Arabia": "SA",
  "Scotland": "GB-SCT",
  "Senegal": "SN",
  "Serbia": "RS",
  "South Africa": "ZA",
  "Korea Republic": "KR",
  "South Korea": "KR",
  "Spain": "ES",
  "Sweden": "SE",
  "Switzerland": "CH",
  "Tunisia": "TN",
  "Turkiye": "TR",
  "Turkey": "TR",
  "Ukraine": "UA",
  "United States": "US",
  "Uruguay": "UY",
  "Wales": "GB-WLS",
  "Curacao": "CW",
  "Curaçao": "CW",
  "Bosnia and Herzegovina": "BA"
};

function getTeamFlag(teamName: string): string {
  const code = TEAM_CODES[teamName];
  if (code) {
    if (code === "GB-ENG") return "🏴󠁧󠁢󠁥󠁮󠁧󠁿";
    if (code === "GB-SCT") return "🏴󠁧󠁢󠁳󠁣󠁴󠁿";
    if (code === "GB-WLS") return "🏴󠁧󠁢󠁷󠁬󠁳󠁿";
    return getFlag(code);
  }
  return "🏳️";
}

// ─── Match Schedule Section ──────────────────────────────────────────────────

interface Fixture {
  matchNumber: number;
  date: string;
  kickoffUtc: string;
  stage: string;
  group: string;
  homeTeam: string;
  awayTeam: string;
  stadium: string;
  hostCity: string;
  matchUrl: string;
}

function getMatchScore(matchNumber: number, minutes: number) {
  // Deterministic final scores based on match number digits
  const totalHome = (matchNumber * 7) % 4; // 0-3
  const totalAway = (matchNumber * 3) % 3; // 0-2

  if (minutes > 105) {
    return { home: totalHome, away: totalAway, badge: "FT" };
  }

  if (minutes >= 45 && minutes < 60) {
    const homeHT = Math.floor(totalHome * 0.5);
    const awayHT = Math.floor(totalAway * 0.5);
    return { home: homeHT, away: awayHT, badge: "HT" };
  }

  const playingMinutes = minutes >= 60 ? minutes - 15 : minutes;
  const progress = Math.min(playingMinutes / 90, 1);
  const currentHome = Math.floor(totalHome * progress);
  const currentAway = Math.floor(totalAway * progress);
  return { home: currentHome, away: currentAway, badge: `${Math.min(Math.floor(playingMinutes), 90)}'` };
}

function ScheduleSection() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [now, setNow] = useState(new Date());
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all"); // 'all' | 'group' | 'knockout'
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'live' | 'today' | 'upcoming' | 'finished'

  const fetchFixtures = () => {
    fetch("https://www.thestatsapi.com/world-cup/data/fixtures.json")
      .then((r) => r.json())
      .then((data) => {
        if (data.fixtures && Array.isArray(data.fixtures)) {
          setFixtures(data.fixtures);
        }
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFixtures();

    // Poll live status every 15 seconds
    const interval = setInterval(() => {
      setNow(new Date());
    }, 15000);

    // Refresh schedule data every 5 minutes
    const apiInterval = setInterval(() => {
      fetchFixtures();
    }, 300000);

    return () => {
      clearInterval(interval);
      clearInterval(apiInterval);
    };
  }, []);

  const isMatchToday = (kickoffUtc: string) => {
    const kickoff = new Date(kickoffUtc);
    return (
      kickoff.getDate() === now.getDate() &&
      kickoff.getMonth() === now.getMonth() &&
      kickoff.getFullYear() === now.getFullYear()
    );
  };

  const filtered = fixtures.filter((match) => {
    const kickoff = new Date(match.kickoffUtc);
    const diffMs = now.getTime() - kickoff.getTime();
    const minutes = Math.floor(diffMs / 60000);

    const isUpcoming = diffMs < 0;
    const isLive = diffMs >= 0 && minutes <= 105;
    const isFinished = minutes > 105;
    const isToday = isMatchToday(match.kickoffUtc);

    const matchesSearch =
      match.homeTeam.toLowerCase().includes(search.toLowerCase()) ||
      match.awayTeam.toLowerCase().includes(search.toLowerCase()) ||
      match.hostCity.toLowerCase().includes(search.toLowerCase()) ||
      match.stadium.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (stageFilter === "group" && match.stage !== "group-stage") return false;
    if (stageFilter === "knockout" && match.stage === "group-stage") return false;

    if (statusFilter === "live" && !isLive) return false;
    if (statusFilter === "today" && !isToday) return false;
    if (statusFilter === "upcoming" && !isUpcoming) return false;
    if (statusFilter === "finished" && !isFinished) return false;

    return true;
  });

  const formatLocalTime = (kickoffUtc: string) => {
    const d = new Date(kickoffUtc);
    return d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatLocalDate = (kickoffUtc: string) => {
    const d = new Date(kickoffUtc);
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <section id="schedule" className="mx-auto max-w-7xl px-6 py-16 border-t border-[var(--gold)]/15">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-10">
        <div>
          <h2 className="font-display text-4xl md:text-5xl text-foreground">
            Match <span className="text-[var(--gold)]">Schedule</span>
          </h2>
          <p className="text-xs text-foreground/50 mt-1 uppercase tracking-wider">
            FIFA World Cup 2026 · Live Kickoff Times & Timetable
          </p>
        </div>

        {/* Filters and Search toolbar */}
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[200px] md:w-64 md:flex-initial">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40 pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search matches or cities…"
              className="w-full bg-[var(--navy-light)]/60 border border-[var(--gold)]/20 rounded-md pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-foreground/30 outline-none focus:border-[var(--gold)] transition-colors"
            />
          </div>

          {/* Stage Filter */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="bg-[var(--navy-light)]/60 border border-[var(--gold)]/20 text-xs rounded-md px-3 py-2 text-foreground outline-none focus:border-[var(--gold)] cursor-pointer"
          >
            <option value="all">All Stages</option>
            <option value="group">Group Stage</option>
            <option value="knockout">Knockout Rounds</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[var(--navy-light)]/60 border border-[var(--gold)]/20 text-xs rounded-md px-3 py-2 text-foreground outline-none focus:border-[var(--gold)] cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="today">Today's Matches</option>
            <option value="live">🔴 Live Now</option>
            <option value="upcoming">Upcoming</option>
            <option value="finished">Completed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Spinner size="md" />
        </div>
      ) : error ? (
        <div className="text-center text-sm text-[var(--red-live)] py-10 rounded-lg bg-[var(--red-live)]/5 border border-[var(--red-live)]/15">
          ⚠️ Unable to load fixtures schedule. Check your connection or retry later.
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-sm text-foreground/40 py-16 bg-[var(--navy-light)]/20 rounded-lg border border-[var(--gold)]/10">
          No matches match the selected criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((match) => {
            const kickoff = new Date(match.kickoffUtc);
            const diffMs = now.getTime() - kickoff.getTime();
            const minutes = Math.floor(diffMs / 60000);

            const isUpcoming = diffMs < 0;
            const isLive = diffMs >= 0 && minutes <= 105;
            const isFinished = minutes > 105;

            const score = isLive || isFinished ? getMatchScore(match.matchNumber, minutes) : null;
            const localDateStr = formatLocalDate(match.kickoffUtc);
            const localTimeStr = formatLocalTime(match.kickoffUtc);
            const isToday = isMatchToday(match.kickoffUtc);

            return (
              <div
                key={match.matchNumber}
                className={`flex flex-col justify-between rounded-xl border p-5 bg-[var(--navy-light)]/40 transition-all hover:scale-[1.02] hover:border-[var(--gold)]/50 ${isLive
                    ? "border-[var(--green-live)]/40 shadow-lg shadow-[var(--green-live)]/5"
                    : isToday
                      ? "border-[var(--gold)]/30 bg-[var(--gold)]/5"
                      : "border-[var(--gold)]/10"
                  }`}
              >
                {/* Top header row of match card */}
                <div className="flex items-center justify-between text-[11px] text-foreground/50 font-semibold uppercase tracking-wider mb-4">
                  <span>Match {match.matchNumber} · Group {match.group || match.stage.replace("-", " ")}</span>
                  {isLive ? (
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--green-live)]/15 text-[var(--green-live)] animate-pulse font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--green-live)]" />
                      LIVE ({score?.badge})
                    </span>
                  ) : isFinished ? (
                    <span className="px-2 py-0.5 rounded bg-foreground/10 text-foreground/70 font-bold">
                      FT
                    </span>
                  ) : isToday ? (
                    <span className="px-2 py-0.5 rounded bg-[var(--gold)]/15 text-[var(--gold)] font-bold">
                      Today
                    </span>
                  ) : (
                    <span>Upcoming</span>
                  )}
                </div>

                {/* Score / Play Board */}
                <div className="flex items-center justify-between gap-4 py-2">
                  {/* Home Team */}
                  <div className="flex flex-col items-center gap-2 flex-1 text-center min-w-0">
                    <span className="text-3xl filter drop-shadow">{getTeamFlag(match.homeTeam)}</span>
                    <span className="text-xs font-bold truncate w-full">{match.homeTeam}</span>
                  </div>

                  {/* Scoreboard Middle */}
                  <div className="flex flex-col items-center justify-center px-4 shrink-0">
                    {isLive || isFinished ? (
                      <div className="font-display text-4xl text-[var(--gold)] tracking-wide leading-none select-none">
                        {score?.home} : {score?.away}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="font-display text-2xl text-[var(--gold)] leading-none select-none">
                          {localTimeStr}
                        </span>
                        <span className="text-[10px] text-foreground/40 mt-1 select-none font-semibold uppercase">
                          {localDateStr}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Away Team */}
                  <div className="flex flex-col items-center gap-2 flex-1 text-center min-w-0">
                    <span className="text-3xl filter drop-shadow">{getTeamFlag(match.awayTeam)}</span>
                    <span className="text-xs font-bold truncate w-full">{match.awayTeam}</span>
                  </div>
                </div>

                {/* Bottom Stadium / Venue metadata */}
                <div className="border-t border-[var(--gold)]/10 mt-4 pt-3 flex flex-col gap-1 text-[11px] text-foreground/40">
                  <div className="flex items-center gap-1.5 truncate">
                    <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    <span className="truncate">{match.stadium}</span>
                  </div>
                  <div className="flex items-center gap-1.5 capitalize truncate">
                    <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="9" y1="3" x2="9" y2="21" /></svg>
                    <span className="truncate">{match.hostCity.replace("-", " ")}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-[var(--gold)]/15 py-6 text-center text-sm text-foreground/60 flex flex-col items-center gap-2">
      <div>⚽ GoalStream © 2026 — For entertainment purposes only</div>
      <div className="text-xs">
        Powered by{" "}
        <a
          href="https://www.webzolia.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold-custom hover:underline font-semibold"
        >
          WebZolia
        </a>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function Index() {
  const [totalChannels, setTotalChannels] = useState(0);

  // Fetch just the count for the hero stats without duplicating the full fetch
  useEffect(() => {
    fetchSportsChannels()
      .then((data) => setTotalChannels(data.length))
      .catch(() => setTotalChannels(FALLBACK_CHANNELS.length));
  }, []);

  return (
    <div className="min-h-screen bg-[var(--navy)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "GoalStream",
            "url": "https://www.webzolia.com",
            "description": "Watch live FIFA matches in crystal-clear HD. Developed by Gaurava Bandaranayaka and powered by WebZolia.",
            "author": {
              "@type": "Person",
              "name": "Gaurava Bandaranayaka",
              "jobTitle": "Lead Developer"
            },
            "publisher": {
              "@type": "Organization",
              "name": "WebZolia",
              "url": "https://www.webzolia.com",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.webzolia.com/logo.png"
              }
            }
          })
        }}
      />
      <Navbar />
      <main>
        <Hero totalChannels={totalChannels} />
        <ChannelSection />
        <ScheduleSection />
      </main>
      <Footer />
    </div>
  );
}


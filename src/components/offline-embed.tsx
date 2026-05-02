import { useEffect, useState } from "react";

/**
 * Renders an iframe embed when online; when offline, shows a lightweight
 * cached placeholder card with the brand-coloured glyph for the source
 * (Spotify / YouTube / SlideShare / Figshare / Apple Podcasts) and a
 * deep-link the user can open once back online.
 */
export function OfflineEmbed({
  type,
  src,
  url,
  title,
  height = 240,
}: {
  type: string;
  src: string;
  url: string;
  title: string;
  height?: number;
}) {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  if (online) {
    return (
      <iframe
        src={src}
        title={title}
        className="w-full block"
        style={{ height, border: 0 }}
        loading="lazy"
        allowFullScreen
      />
    );
  }

  const t = type.toLowerCase();
  const palette = t.includes("spotify")
    ? { bg: "#1DB954", glyph: "♪", label: "SPOTIFY" }
    : t.includes("youtube")
    ? { bg: "#FF0000", glyph: "▶", label: "YOUTUBE" }
    : t.includes("apple")
    ? { bg: "#A855F7", glyph: "◉", label: "APPLE PODCASTS" }
    : t.includes("slide")
    ? { bg: "#E97316", glyph: "▤", label: "SLIDESHARE" }
    : t.includes("figshare")
    ? { bg: "#556B2F", glyph: "◆", label: "FIGSHARE" }
    : { bg: "var(--ink)", glyph: "●", label: type.toUpperCase() };

  return (
    <div
      className="w-full flex flex-col items-center justify-center text-center px-4 relative overflow-hidden"
      style={{ height, background: palette.bg, color: "#fff" }}
      role="img"
      aria-label={`${type} embed unavailable offline`}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg,transparent 0 6px,rgba(0,0,0,0.25) 6px 7px)",
        }}
      />
      <div className="relative text-5xl font-black leading-none mb-2">{palette.glyph}</div>
      <div className="relative mono text-[10px] tracking-widest mb-1 opacity-90">
        {palette.label} · OFFLINE
      </div>
      <div className="relative font-bold text-sm mb-3 max-w-[260px]">{title}</div>
      <div className="relative mono text-[10px] tracking-widest opacity-80 mb-3">
        // EMBED CACHED · CONNECT TO PLAY
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener"
        className="relative mono text-[10px] tracking-widest border border-[#fff] px-3 py-1 hover:bg-[#fff] hover:text-[var(--ink)] transition-colors"
      >
        OPEN WHEN ONLINE ↗
      </a>
    </div>
  );
}

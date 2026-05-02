import { useEffect, useState } from "react";
import { toast } from "sonner";

const KEY = "tnid:offline-cached-at";

// Pre-cache key assets, embeds, and translation data into the runtime SW caches.
// Falls back to a plain Cache Storage entry when no SW is active (still useful
// for browsers that allow Cache API without a controller).
async function precacheAll(onProgress: (pct: number) => void) {
  const translations = ["en","de","fr","it","es","pt","zh","ja","ko","ru","uk"]
    .map((l) => `/src/content/translations/${l}.json`);

  // Static assets that ship in /public
  const staticAssets = [
    "/", // shell
    "/manifest.json",
    "/book.png",
    "/logo.png",
  ];

  // Third-party embeds we want available offline (best-effort: opaque responses
  // are still cacheable but won't be inspectable).
  const embeds = [
    "https://open.spotify.com/embed/episode/624jFRaxTMb5D5Qe67rO3H",
    "https://www.youtube.com/embed/6w0B6gKvybI",
    "https://embed.podcasts.apple.com/us/podcast/the-nvidia-innovators-dilemma/id1896016219?i=1000765316324",
  ];

  const urls = [...staticAssets, ...translations, ...embeds];
  const cache = await caches.open("tnid-offline-v1");

  let done = 0;
  await Promise.all(
    urls.map(async (u) => {
      try {
        const req = new Request(u, { mode: u.startsWith("http") ? "no-cors" : "same-origin" });
        const res = await fetch(req);
        await cache.put(req, res.clone());
      } catch {
        /* best-effort */
      } finally {
        done += 1;
        onProgress(Math.round((done / urls.length) * 100));
      }
    })
  );
  localStorage.setItem(KEY, new Date().toISOString());
}

export function OfflineDownload() {
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const [cachedAt, setCachedAt] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setCachedAt(localStorage.getItem(KEY));
  }, []);

  async function run() {
    if (typeof caches === "undefined") {
      toast.error("Offline storage not supported in this browser.");
      return;
    }
    setBusy(true); setPct(0);
    const id = toast.loading("Downloading for offline…", { description: "0%" });
    try {
      await precacheAll((p) => {
        setPct(p);
        toast.loading("Downloading for offline…", { id, description: `${p}%` });
      });
      setCachedAt(new Date().toISOString());
      toast.success("Saved for offline", { id, description: "Book, Q&A and translations cached on this device." });
    } catch (e) {
      toast.error("Offline download failed", { id, description: String((e as Error)?.message || e) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={run}
      disabled={busy}
      className="btn-mono lime disabled:opacity-60"
      aria-label="Download for offline"
    >
      {busy ? `↓ DOWNLOADING ${pct}%` : cachedAt ? "↓ UPDATE OFFLINE CACHE" : "↓ DOWNLOAD FOR OFFLINE"}
    </button>
  );
}

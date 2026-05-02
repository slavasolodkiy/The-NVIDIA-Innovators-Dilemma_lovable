import { useEffect, useState } from "react";

// Iframe-safe + preview-safe service worker registration with update prompt.
export function PWARegister() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [updateSW, setUpdateSW] = useState<((reload?: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const inIframe = (() => {
      try { return window.self !== window.top; } catch { return true; }
    })();
    const host = window.location.hostname;
    const isPreview = host.includes("id-preview--") || host.includes("lovableproject.com");

    if (inIframe || isPreview) {
      // Aggressively unregister any prior SW so previews never serve stale shell
      navigator.serviceWorker?.getRegistrations().then(rs => rs.forEach(r => r.unregister()));
      return;
    }

    if (!("serviceWorker" in navigator)) return;

    let cancelled = false;
    (async () => {
      try {
        const { registerSW } = await import("virtual:pwa-register");
        const update = registerSW({
          onNeedRefresh() { if (!cancelled) setNeedRefresh(true); },
          onRegistered(r) {
            // Check for new SW every 60 minutes
            r && setInterval(() => r.update().catch(() => {}), 60 * 60 * 1000);
          },
        });
        setUpdateSW(() => update);
      } catch {
        /* no-op: PWA disabled in dev or virtual module unavailable */
      }
    })();

    return () => { cancelled = true; };
  }, []);

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-20 inset-x-3 z-[60] border-2 border-[var(--orange)] bg-[var(--ink)] text-[var(--cream)] p-3 mono text-[11px] tracking-widest shake-rgb">
      <div className="text-[var(--orange)] font-bold mb-1">// NEW VERSION AVAILABLE</div>
      <div className="opacity-80 mb-2">A fresher build of the dilemma is ready.</div>
      <div className="flex gap-2">
        <button
          className="btn-mono accent"
          onClick={() => updateSW?.(true)}
        >RELOAD</button>
        <button
          className="btn-mono alt"
          onClick={() => setNeedRefresh(false)}
        >LATER</button>
      </div>
    </div>
  );
}

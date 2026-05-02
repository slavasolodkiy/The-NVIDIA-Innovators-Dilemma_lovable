import { useEffect, useRef } from "react";
import { toast } from "sonner";

// Iframe-safe + preview-safe service worker registration.
// On update available: shows a friendly sonner toast with "Refresh to update".
export function PWARegister() {
  const updateRef = useRef<((reload?: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const inIframe = (() => {
      try { return window.self !== window.top; } catch { return true; }
    })();
    const host = window.location.hostname;
    const isPreview = host.includes("id-preview--") || host.includes("lovableproject.com");

    if (inIframe || isPreview) {
      navigator.serviceWorker?.getRegistrations().then(rs => rs.forEach(r => r.unregister()));
      return;
    }

    if (!("serviceWorker" in navigator)) return;

    let cancelled = false;
    (async () => {
      try {
        const { registerSW } = await import("virtual:pwa-register");
        const update = registerSW({
          onNeedRefresh() {
            if (cancelled) return;
            toast("// NEW VERSION AVAILABLE", {
              description: "A fresher build of the dilemma is ready.",
              duration: Infinity,
              action: {
                label: "Refresh to update",
                onClick: () => updateRef.current?.(true),
              },
              cancel: { label: "Later", onClick: () => {} },
            });
          },
          onOfflineReady() {
            toast.success("Ready offline", { description: "App shell cached on this device." });
          },
          onRegistered(r: ServiceWorkerRegistration | undefined) {
            if (r) setInterval(() => r.update().catch(() => {}), 60 * 60 * 1000);
          },
        });
        updateRef.current = update;
      } catch {
        /* PWA disabled in dev / virtual module unavailable */
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return null;
}

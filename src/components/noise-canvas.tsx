import { useEffect, useRef } from "react";

// Lightweight animated film-grain noise behind the hero. Cheap on mobile:
// renders a 96x96 noise tile and shifts it via offset, ~12fps.
export function NoiseCanvas({ opacity = 0.18 }: { opacity?: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const SIZE = 96;
    canvas.width = SIZE;
    canvas.height = SIZE;
    let raf = 0;
    let last = 0;

    function draw(now: number) {
      if (now - last > 80) {
        last = now;
        const img = ctx!.createImageData(SIZE, SIZE);
        const d = img.data;
        for (let i = 0; i < d.length; i += 4) {
          const v = (Math.random() * 255) | 0;
          d[i] = v; d[i + 1] = v; d[i + 2] = v;
          d[i + 3] = Math.random() < 0.6 ? 255 : 0;
        }
        ctx!.putImageData(img, 0, 0);
      }
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="absolute inset-0 w-full h-full pointer-events-none mix-blend-multiply"
      style={{
        opacity,
        imageRendering: "pixelated",
        backgroundSize: "96px 96px",
        backgroundRepeat: "repeat",
      }}
    />
  );
}

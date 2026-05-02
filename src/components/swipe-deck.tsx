import { useRef, useState, type PointerEvent as RPE, type ReactNode } from "react";

type Props = {
  count: number;
  renderCard: (index: number) => ReactNode;
};

// Simple gesture-based card deck. No framer-motion dependency.
// Drag horizontally; release past 25% width snaps to next/prev.
export function SwipeDeck({ count, renderCard }: Props) {
  const [index, setIndex] = useState(0);
  const [dx, setDx] = useState(0);
  const dragging = useRef(false);
  const startX = useRef(0);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  function onDown(e: RPE<HTMLDivElement>) {
    dragging.current = true;
    startX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }
  function onMove(e: RPE<HTMLDivElement>) {
    if (!dragging.current) return;
    setDx(e.clientX - startX.current);
  }
  function onUp() {
    if (!dragging.current) return;
    dragging.current = false;
    const w = wrapRef.current?.clientWidth ?? 320;
    const threshold = w * 0.22;
    if (dx < -threshold && index < count - 1) setIndex(i => i + 1);
    else if (dx > threshold && index > 0) setIndex(i => i - 1);
    setDx(0);
  }

  return (
    <div className="relative">
      <div
        ref={wrapRef}
        className="relative h-[320px] touch-pan-y select-none"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        {Array.from({ length: count }).map((_, i) => {
          const offset = i - index;
          const isActive = i === index;
          const isDragging = dragging.current && isActive;
          const tx = offset * 100 + (isActive ? (dx / (wrapRef.current?.clientWidth ?? 320)) * 100 : 0);
          const rot = isActive ? dx * 0.04 : offset * 1.5;
          const scale = isActive ? 1 : 0.94;
          const z = count - Math.abs(offset);
          const visible = Math.abs(offset) <= 2;
          if (!visible) return null;
          return (
            <div
              key={i}
              className="absolute inset-0"
              style={{
                transform: `translateX(${tx}%) rotate(${rot}deg) scale(${scale})`,
                transition: isDragging ? "none" : "transform 320ms cubic-bezier(0.2,0.9,0.25,1)",
                zIndex: z,
                opacity: Math.abs(offset) > 1 ? 0.4 : 1,
              }}
            >
              {renderCard(i)}
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-2 mt-4">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            aria-label={`Card ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`w-2 h-2 border border-[var(--ink)] ${i === index ? "bg-[var(--orange)]" : "bg-transparent"}`}
          />
        ))}
      </div>
    </div>
  );
}

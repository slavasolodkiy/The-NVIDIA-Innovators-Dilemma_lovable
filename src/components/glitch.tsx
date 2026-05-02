import { useEffect, useRef, useState } from "react";

export function GlitchText({ children, as: Tag = "span", className = "" }: { children: string; as?: any; className?: string }) {
  return (
    <Tag className={`glitch-text ${className}`} data-text={children}>
      {children}
    </Tag>
  );
}

const CHARS = "!<>-_\\/[]{}—=+*^?#________01CRACKPILLAR$5T75%CUDA";

export function Scramble({ text, trigger }: { text: string; trigger?: any }) {
  const [out, setOut] = useState(text);
  const ref = useRef<number | null>(null);
  useEffect(() => {
    let frame = 0;
    const total = 18;
    const start = performance.now();
    const tick = () => {
      const elapsed = performance.now() - start;
      const progress = Math.min(elapsed / 600, 1);
      const reveal = Math.floor(progress * text.length);
      let s = "";
      for (let i = 0; i < text.length; i++) {
        if (i < reveal) s += text[i];
        else if (text[i] === " ") s += " ";
        else s += CHARS[Math.floor(Math.random() * CHARS.length)];
      }
      setOut(s);
      frame++;
      if (progress < 1) ref.current = requestAnimationFrame(tick);
      else setOut(text);
    };
    ref.current = requestAnimationFrame(tick);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [text, trigger]);
  return <span className="mono">{out}</span>;
}

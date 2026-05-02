import { useEffect, useState } from "react";
import { useI18n } from "@/content/i18n";
import type { LanguageCode } from "@/content/languages";

const STORAGE = "tnid:quiz";

type Progress = Record<string, { best: number; done: boolean }>;

function load(): Progress {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(STORAGE) || "{}"); } catch { return {}; }
}
function save(p: Progress) { localStorage.setItem(STORAGE, JSON.stringify(p)); }

export function Quiz() {
  const { t } = useI18n();
  const [progress, setProgress] = useState<Progress>({});
  const [activeLevel, setActiveLevel] = useState<number | null>(null);
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [shake, setShake] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => { setProgress(load()); }, []);

  const levels = t.quiz.levels;

  function startLevel(i: number) {
    setActiveLevel(i); setQIdx(0); setScore(0); setPicked(null); setDone(false);
  }
  function pick(i: number) {
    if (picked !== null) return;
    setPicked(i);
    const lvl = levels[activeLevel!];
    const correct = lvl.questions[qIdx].correct === i;
    if (correct) setScore(s => s + 1);
    else { setShake(true); setTimeout(() => setShake(false), 500); }
  }
  function next() {
    const lvl = levels[activeLevel!];
    if (qIdx + 1 >= lvl.questions.length) {
      const finalScore = score;
      const next: Progress = { ...progress, [lvl.id]: {
        best: Math.max(progress[lvl.id]?.best ?? 0, finalScore),
        done: finalScore === lvl.questions.length || (progress[lvl.id]?.done ?? false),
      }};
      setProgress(next); save(next);
      setDone(true);
    } else {
      setQIdx(qIdx + 1); setPicked(null);
    }
  }

  if (activeLevel === null) {
    return (
      <div className="grid gap-3">
        {levels.map((lvl, i) => {
          const p = progress[lvl.id];
          return (
            <button key={lvl.id} onClick={() => startLevel(i)}
              className="text-left border-2 border-[var(--ink)] p-4 bg-[var(--cream)] active:translate-x-[2px] active:translate-y-[2px] transition-transform">
              <div className="mono text-[10px] tracking-widest text-[var(--orange)] mb-1">LEVEL {String(i+1).padStart(2,"0")} · {lvl.id}</div>
              <div className="font-black text-lg leading-tight mb-2">{lvl.title}</div>
              <div className="flex items-center gap-2 text-[11px] mono">
                <span className="px-2 py-1 border border-[var(--ink)]">★ {lvl.badge}</span>
                {p?.done && <span className="px-2 py-1 bg-[var(--lime)] border border-[var(--ink)]">{t.quiz.completed}</span>}
                {p && !p.done && <span className="text-[var(--graphite)]">{t.quiz.score}: {p.best}/{lvl.questions.length}</span>}
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  const lvl = levels[activeLevel];
  if (done) {
    const perfect = score === lvl.questions.length;
    return (
      <div className="border-2 border-[var(--ink)] p-6 bg-[var(--cream)] text-center">
        <div className="mono text-[10px] tracking-widest text-[var(--orange)] mb-2">{lvl.id}</div>
        <div className="text-3xl font-black mb-3">{t.quiz.youScored} {score} {t.quiz.of} {lvl.questions.length}</div>
        {perfect && (
          <div className="my-4 inline-block px-4 py-3 bg-[var(--lime)] border-2 border-[var(--ink)] mono text-xs tracking-widest">
            ★ {t.quiz.badgeUnlocked}: {lvl.badge}
          </div>
        )}
        <div className="flex gap-2 justify-center mt-4">
          <button className="btn-mono alt" onClick={() => startLevel(activeLevel)}>{t.nav.retry}</button>
          <button className="btn-mono accent" onClick={() => setActiveLevel(null)}>{t.nav.continue}</button>
        </div>
      </div>
    );
  }

  const q = lvl.questions[qIdx];
  return (
    <div className={`border-2 border-[var(--ink)] p-5 bg-[var(--cream)] ${shake ? "shake-rgb" : ""}`}>
      <div className="flex justify-between items-center mono text-[10px] tracking-widest mb-3">
        <span className="text-[var(--orange)]">{lvl.id} · {qIdx+1}/{lvl.questions.length}</span>
        <span>{t.quiz.score}: {score}</span>
      </div>
      <div className="text-lg font-black leading-tight mb-4">{q.q}</div>
      <div className="grid gap-2">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.correct;
          const showState = picked !== null;
          const cls = showState
            ? isCorrect ? "bg-[var(--lime)] border-[var(--ink)]" : i === picked ? "bg-[var(--orange)] text-[var(--cream)] border-[var(--orange)]" : "border-[var(--ink)] opacity-50"
            : "border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--cream)]";
          return (
            <button key={i} onClick={() => pick(i)}
              className={`text-left border-2 p-3 mono text-sm transition-colors ${cls}`}>
              {String.fromCharCode(65+i)}. {opt}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="mt-4 flex justify-end">
          <button className="btn-mono accent" onClick={next}>{qIdx+1 >= lvl.questions.length ? t.nav.finish : t.nav.next} →</button>
        </div>
      )}
      <button className="mt-3 mono text-[10px] tracking-widest text-[var(--graphite)] underline" onClick={() => setActiveLevel(null)}>← {t.nav.back}</button>
    </div>
  );
}

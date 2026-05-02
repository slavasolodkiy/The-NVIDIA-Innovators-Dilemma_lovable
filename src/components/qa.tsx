import { useState } from "react";
import { useI18n } from "@/content/i18n";

export function QASection() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [chapter, setChapter] = useState<string | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  const chapters = Array.from(new Set(t.qa.items.map(i => i.chapter)));
  const filtered = t.qa.items.filter(i => {
    if (chapter && i.chapter !== chapter) return false;
    if (query && !(i.q.toLowerCase().includes(query.toLowerCase()) || i.a.toLowerCase().includes(query.toLowerCase()))) return false;
    return true;
  });

  return (
    <div>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={t.qa.searchPlaceholder}
        className="w-full border-2 border-[var(--ink)] bg-[var(--cream)] p-3 mono text-sm mb-3"
      />
      <div className="flex flex-wrap gap-2 mb-4 snap-row overflow-x-auto">
        <button onClick={() => setChapter(null)}
          className={`mono text-[10px] tracking-widest px-3 py-2 border-2 border-[var(--ink)] whitespace-nowrap ${chapter===null?"bg-[var(--ink)] text-[var(--cream)]":""}`}>ALL</button>
        {chapters.map(c => (
          <button key={c} onClick={() => setChapter(c===chapter?null:c)}
            className={`mono text-[10px] tracking-widest px-3 py-2 border-2 border-[var(--ink)] whitespace-nowrap ${chapter===c?"bg-[var(--orange)] text-[var(--cream)] border-[var(--orange)]":""}`}>{c}</button>
        ))}
      </div>
      <div className="border-t-2 border-[var(--ink)]">
        {filtered.map((item, i) => (
          <div key={i} className="border-b border-[var(--ink)]">
            <button onClick={() => setOpen(open===i?null:i)} className="w-full text-left py-4 flex gap-3 items-start">
              <span className="mono text-[10px] tracking-widest text-[var(--orange)] mt-1 shrink-0">{item.chapter}</span>
              <span className="font-bold flex-1">{item.q}</span>
              <span className="mono text-2xl text-[var(--orange)] leading-none">{open===i?"−":"+"}</span>
            </button>
            {open===i && (
              <div className="pb-5 text-[var(--graphite)] text-sm leading-relaxed">{item.a}</div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <div className="py-8 text-center mono text-xs text-[var(--graphite)]">// NO RESULTS</div>}
      </div>
    </div>
  );
}

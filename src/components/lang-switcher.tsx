import { useI18n } from "@/content/i18n";

export function LangSwitcher() {
  const { lang, setLang, languages } = useI18n();
  return (
    <select
      value={lang}
      onChange={e => setLang(e.target.value as any)}
      className="mono text-[11px] tracking-widest bg-[var(--cream)] border border-[var(--ink)] px-2 py-1 cursor-pointer"
      aria-label="Language"
    >
      {languages.map(l => <option key={l.code} value={l.code}>{l.label} · {l.name}</option>)}
    </select>
  );
}

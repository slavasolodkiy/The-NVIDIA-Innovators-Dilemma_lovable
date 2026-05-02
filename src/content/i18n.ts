import { useEffect, useState, useCallback } from "react";
import { LANGUAGES, type LanguageCode } from "./languages";
import { SOURCE, type SourceContent } from "./source";

import en from "./translations/en.json";
import de from "./translations/de.json";
import fr from "./translations/fr.json";
import it from "./translations/it.json";
import es from "./translations/es.json";
import pt from "./translations/pt.json";
import zh from "./translations/zh.json";
import ja from "./translations/ja.json";
import ko from "./translations/ko.json";
import ru from "./translations/ru.json";
import uk from "./translations/uk.json";

const DICTS: Record<LanguageCode, SourceContent> = {
  en: en as unknown as SourceContent,
  de: de as unknown as SourceContent,
  fr: fr as unknown as SourceContent,
  it: it as unknown as SourceContent,
  es: es as unknown as SourceContent,
  pt: pt as unknown as SourceContent,
  zh: zh as unknown as SourceContent,
  ja: ja as unknown as SourceContent,
  ko: ko as unknown as SourceContent,
  ru: ru as unknown as SourceContent,
  uk: uk as unknown as SourceContent,
};

const STORAGE_KEY = "tnid:lang";

function detect(): LanguageCode {
  if (typeof window === "undefined") return "en";
  const saved = localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
  if (saved && DICTS[saved]) return saved;
  const browser = navigator.language.slice(0, 2).toLowerCase();
  const found = LANGUAGES.find(l => l.code === browser);
  return (found?.code as LanguageCode) ?? "en";
}

export function useI18n() {
  const [lang, setLang] = useState<LanguageCode>("en");

  useEffect(() => { setLang(detect()); }, []);

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);

  const change = useCallback((next: LanguageCode) => {
    setLang(next);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, next);
  }, []);

  // Always fall back to English source if a key is missing in a translation.
  const t = DICTS[lang] ?? SOURCE;
  return { lang, setLang: change, t, languages: LANGUAGES };
}

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
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

type I18nContextValue = {
  lang: LanguageCode;
  setLang: (next: LanguageCode) => void;
  t: SourceContent;
  languages: typeof LANGUAGES;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<LanguageCode>("en");

  useEffect(() => { setLang(detect()); }, []);

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);

  const change = useCallback((next: LanguageCode) => {
    setLang(next);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const t = DICTS[lang] ?? SOURCE;
  return (
    <I18nContext.Provider value={{ lang, setLang: change, t, languages: LANGUAGES }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

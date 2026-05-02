import { useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/content/i18n";
import { GlitchText } from "@/components/glitch";
import { LangSwitcher } from "@/components/lang-switcher";
import { QASection } from "@/components/qa";
import { Quiz } from "@/components/quiz";
import { SwipeDeck } from "@/components/swipe-deck";
import { NoiseCanvas } from "@/components/noise-canvas";
import { PWARegister } from "@/components/pwa-register";
import bookCover from "@/assets/book.png";
import logoMark from "@/assets/logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The NVIDIA Innovator's Dilemma — Mobile App" },
      { name: "description", content: "AI Factories, the Compute Empire, and the Disruption from Below. By Slava Solodkiy. Mobile app with Q&A, quiz and 11 languages." },
      { name: "theme-color", content: "#181818" },
      { property: "og:title", content: "The NVIDIA Innovator's Dilemma" },
      { property: "og:description", content: "An operational autopsy of the $5T AI compute empire." },
      { property: "og:image", content: "/book.png" },
    ],
    links: [
      { rel: "manifest", href: "/manifest.json" },
      { rel: "apple-touch-icon", href: "/logo.png" },
    ],
  }),
  component: App,
});

function Section({ id, label, headline, lede, children }: { id?: string; label: string; headline: string; lede?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="px-5 py-12 border-b border-[var(--ink)]">
      <div className="mono text-[10px] tracking-widest text-[var(--graphite)] mb-3 flex items-center gap-3">
        <span className="w-6 h-px bg-[var(--ink)]" />
        <span className="text-[var(--orange)]">●</span> {label}
      </div>
      <h2 className="text-3xl font-black leading-[0.95] tracking-tight mb-2">
        <GlitchText>{headline}</GlitchText>
      </h2>
      {lede && <p className="mono text-xs text-[var(--graphite)] uppercase tracking-wider mb-6">{lede}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Ticker() {
  const items = ["$5T VALUATION", "75% MARGIN", "CRACK_01 // HYPERSCALER DEFECTION", "CRACK_03 // CUDA LEAK", "PILLAR_I // DePIN", "$101B / YR · MARGIN TAX", "DEEPSEEK MOMENT · APR 2026", "TIME-TO-POWER", "META-STATES", "ZERO-BILLION-DOLLAR MARKETS"];
  const row = (
    <div className="ticker-track">
      {[...items, ...items].map((it, i) => (
        <span key={i} className={i%3===0?"accent":i%3===1?"":"lime"}>◆ {it}</span>
      ))}
    </div>
  );
  return <div className="ticker">{row}</div>;
}

function App() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen pb-24">
      {/* TOP BAR */}
      <div className="sticky top-0 z-50 bg-[var(--cream)] border-b border-[var(--ink)]">
        <div className="px-4 py-2 flex justify-between items-center mono text-[10px] tracking-widest">
          <span className="text-[var(--orange)] font-bold flicker">{t.meta.rev}</span>
          <LangSwitcher />
        </div>
        <div className="px-4 pb-2 mono text-[9px] tracking-widest text-[var(--graphite)]">
          {t.meta.classification} · DRAM.GOLD
        </div>
      </div>

      {/* HERO */}
      <section className="px-5 pt-8 pb-10 scanlines">
        <div className="relative mb-6">
          <img src={bookCover} alt={t.meta.title} className="w-full max-w-[320px] mx-auto block shadow-[0_4px_0_var(--ink),0_20px_40px_-10px_rgba(0,0,0,0.3)]" />
          <img src={logoMark} alt="" aria-hidden className="absolute -top-3 -right-1 w-20 opacity-90 mix-blend-multiply" />
        </div>
        <div className="mb-5">
          <div className="text-[var(--orange)] font-black text-2xl leading-none uppercase">THE NVIDIA</div>
          <div className="text-[var(--ink)] font-black text-5xl leading-none tracking-tight uppercase mt-1">INNOVATOR'S</div>
          <div className="text-[var(--lime)] text-4xl leading-none tracking-wider uppercase mt-2" style={{ fontFamily: "'DotGothic16', monospace", WebkitTextStroke: "1px var(--ink)" }}>
            <GlitchText>DILEMMA</GlitchText>
          </div>
        </div>
        <p className="mono text-xs uppercase tracking-wider text-[var(--graphite)] mb-4 leading-snug">{t.meta.subtitle}</p>
        <div className="mono text-[10px] tracking-widest text-[var(--graphite)] mb-1">{t.meta.by}</div>
        <div className="mono text-lg font-bold mb-5">{t.meta.author}</div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 mono text-[11px] uppercase tracking-wider mb-6">
          <span className="text-[var(--graphite)]">{t.meta.published}</span><span className="font-bold">{t.meta.publishedValue}</span>
          <span className="text-[var(--graphite)]">{t.meta.pages}</span><span className="font-bold">{t.meta.pagesValue}</span>
          <span className="text-[var(--graphite)]">{t.meta.format}</span><span className="font-bold">{t.meta.formatValue}</span>
          <span className="text-[var(--graphite)]">{t.meta.topic}</span><span className="font-bold text-[var(--orange)]">{t.meta.topicValue}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <a className="btn-mono accent" href={t.buy.stores[0].url} target="_blank" rel="noopener">{t.hero.cta1} ↗</a>
          <a className="btn-mono alt" href={t.buy.stores[10].url} target="_blank" rel="noopener">{t.hero.cta2} ↗</a>
          <a className="btn-mono" href="#listen">{t.hero.cta3} ↗</a>
          <a className="btn-mono lime" href="#qa">{t.hero.cta4}</a>
        </div>
      </section>

      <Ticker />

      {/* THESIS */}
      <Section label={t.thesis.label} headline={t.thesis.headline} lede={t.thesis.lede}>
        <div className="grid gap-4">
          <div className="border-2 border-[var(--ink)] p-5">
            <div className="mono text-xs tracking-widest text-[var(--orange)] font-bold mb-2">{t.thesis.officialLabel}</div>
            <h3 className="text-2xl font-black leading-tight mb-3">{t.thesis.officialTitle}</h3>
            {t.thesis.officialBody.map((p, i) => <p key={i} className="text-sm mb-2">{p}</p>)}
          </div>
          <div className="border-2 border-[var(--ink)] p-5 bg-[var(--cream-dim)]">
            <div className="mono text-xs tracking-widest text-[var(--lime)] font-bold mb-2" style={{ WebkitTextStroke: "0.5px var(--ink)" }}>{t.thesis.ironicLabel}</div>
            <h3 className="text-2xl font-black leading-tight mb-3">{t.thesis.ironicTitle}</h3>
            {t.thesis.ironicBody.map((p, i) => <p key={i} className="text-sm mb-2">{p}</p>)}
          </div>
        </div>
      </Section>

      {/* CRACKS */}
      <Section label={t.cracks.label} headline={t.cracks.headline} lede={t.cracks.lede}>
        <div className="snap-row flex overflow-x-auto gap-3 -mx-5 px-5 snap-x snap-mandatory pb-2">
          {t.cracks.items.map(c => (
            <div key={c.id} className="snap-start shrink-0 w-[78%] border-2 border-[var(--ink)] p-5 bg-[var(--cream)]">
              <div className="mono text-[10px] tracking-widest text-[var(--orange)] font-bold mb-2">[{c.id}]</div>
              <h4 className="text-lg font-black leading-tight mb-3">{c.title}</h4>
              <p className="text-sm leading-relaxed mb-4">{c.body}</p>
              <div className="mono text-[10px] tracking-widest text-[var(--graphite)] uppercase border-t border-[var(--ink)] pt-2">{c.stat}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* PILLARS */}
      <Section label={t.pillars.label} headline={t.pillars.headline} lede={t.pillars.lede}>
        <div className="grid gap-3">
          {t.pillars.items.map((p, i) => (
            <div key={i} className="bg-[var(--ink)] text-[var(--cream)] p-5 relative">
              <div className="mono text-[10px] tracking-widest text-[var(--lime)] border border-[var(--lime)] inline-block px-2 py-1 mb-3">{p.badge}</div>
              <h4 className="text-lg font-black leading-tight mb-2">{p.title}</h4>
              <p className="text-sm opacity-80 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* LISTEN */}
      <Section id="listen" label={t.listen.label} headline={t.listen.headline} lede={t.listen.lede}>
        <div className="grid gap-4">
          {t.listen.items.map((it, i) => (
            <div key={i} className="border-2 border-[var(--ink)]">
              <div className="px-3 py-2 border-b border-[var(--ink)] flex justify-between mono text-[10px] tracking-widest">
                <span>{it.type}</span>
                <a href={it.url} target="_blank" rel="noopener" className="text-[var(--orange)] font-bold">OPEN ↗</a>
              </div>
              {"embed" in it && (it as any).embed ? (
                <iframe src={(it as any).embed} className="w-full block" style={{ height: 240, border: 0 }} loading="lazy" allowFullScreen />
              ) : null}
              <div className="p-4">
                <h4 className="font-black mb-1">{it.title}</h4>
                <p className="text-sm text-[var(--graphite)]">{it.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Q&A */}
      <Section id="qa" label={t.qa.label} headline={t.qa.headline} lede={t.qa.lede}>
        <QASection />
      </Section>

      {/* QUIZ */}
      <Section id="quiz" label={t.quiz.label} headline={t.quiz.headline} lede={t.quiz.lede}>
        <Quiz />
      </Section>

      {/* BUY */}
      <Section id="buy" label={t.buy.label} headline={t.buy.headline} lede={t.buy.lede}>
        <div className="grid grid-cols-2 gap-3">
          {t.buy.stores.map((s, i) => (
            <a key={i} href={s.url} target="_blank" rel="noopener"
              className="border-2 border-[var(--ink)] p-4 bg-[var(--cream)] active:translate-x-[2px] active:translate-y-[2px] transition-transform block">
              <div className="font-black text-lg leading-tight mb-1">{s.name}</div>
              <div className="mono text-[10px] tracking-widest text-[var(--graphite)] uppercase mb-2">{s.region}</div>
              <div className="mono text-[10px] tracking-widest text-[var(--orange)]">→ OPEN</div>
            </a>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section label={t.faq.label} headline={t.faq.headline}>
        <div className="border-t border-[var(--ink)]">
          {t.faq.items.map((f, i) => (
            <details key={i} className="border-b border-[var(--ink)] py-4">
              <summary className="font-bold cursor-pointer flex justify-between gap-3">
                <span>{f.q}</span><span className="mono text-xl text-[var(--orange)] leading-none">+</span>
              </summary>
              <p className="mt-3 text-sm text-[var(--graphite)] leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>

      {/* FOOTER */}
      <footer className="bg-[var(--ink)] text-[var(--cream)] p-6 mono text-[10px] tracking-widest">
        <div className="text-[var(--orange)] font-bold mb-2">{t.meta.title.toUpperCase()}</div>
        <div className="opacity-70 mb-1">© 2026 SLAVA SOLODKIY · {t.footer.rights}</div>
        <div className="opacity-50">{t.footer.colophon}</div>
      </footer>

      {/* BOTTOM TAB BAR */}
      <nav className="fixed bottom-0 inset-x-0 z-50 bg-[var(--ink)] text-[var(--cream)] border-t-2 border-[var(--orange)] grid grid-cols-5 mono text-[10px] tracking-widest">
        {[
          { href: "#", label: t.nav.book },
          { href: "#qa", label: t.nav.qa },
          { href: "#quiz", label: t.nav.quiz },
          { href: "#listen", label: t.nav.listen },
          { href: "#buy", label: t.nav.buy },
        ].map((item, i) => (
          <a key={i} href={item.href} className="py-3 text-center border-r border-[var(--cream)]/20 last:border-r-0 active:bg-[var(--orange)]">
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  );
}

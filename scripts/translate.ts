#!/usr/bin/env bun
// Translates src/content/source.ts -> src/content/translations/{lang}.json for 10 languages.
// Uses LOVABLE AI gateway. Run once with: bun scripts/translate.ts
import { SOURCE } from "../src/content/source";
import { LANGUAGES } from "../src/content/languages";
import { writeFileSync, mkdirSync, existsSync } from "fs";

const API_KEY = process.env.LOVABLE_API_KEY;
if (!API_KEY) { console.error("LOVABLE_API_KEY missing"); process.exit(1); }

const MODEL = "google/gemini-2.5-flash";
const URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const TARGETS = LANGUAGES.filter(l => l.code !== "en");

const OUT_DIR = "src/content/translations";
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const SYSTEM = `You are a precise translator. Translate every string value in the JSON to {LANG_NAME}.
Rules:
- Preserve JSON structure, keys, and arrays exactly.
- Do NOT translate brand names: NVIDIA, Jensen Huang, CUDA, Triton, vLLM, MLIR, Groq, Etched, Cerebras, DePIN, Akash, Bittensor, Render, io.net, Próspera, NEOM, Amazon, Apple Books, Kobo, Barnes & Noble, Bookshop.org, Thalia, Smashwords, Books2Read, eBay, Spotify, Apple Podcasts, YouTube, SlideShare, Figshare, RTX, GPU, ASIC, TPU, Trainium, Maia, MTIA, HBM4, Blackwell, Rubin, Feynman, Ascend, DeepSeek, FLOPS, RLHF, P&L, ASP, KPI, Slava Solodkiy.
- Keep numbers, percentages, currencies, and code-like tokens (CRACK_01, PILLAR_II, $5T, $40,000, FP4, FP8, INT8) unchanged.
- Keep URLs unchanged.
- Keep the all-caps style for short labels (e.g. "BUY THE BOOK", "CORRECT", "WRONG") in the target language where natural.
- Output ONLY the translated JSON object. No markdown fences, no commentary.`;

async function translate(langName: string, payload: unknown): Promise<unknown> {
  const body = {
    model: MODEL,
    messages: [
      { role: "system", content: SYSTEM.replace("{LANG_NAME}", langName) },
      { role: "user", content: JSON.stringify(payload) },
    ],
  };
  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  const data = await res.json() as any;
  let txt = data.choices[0].message.content as string;
  txt = txt.trim();
  if (txt.startsWith("```")) txt = txt.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  return JSON.parse(txt);
}

for (const lang of TARGETS) {
  const outPath = `${OUT_DIR}/${lang.code}.json`;
  if (existsSync(outPath)) { console.log(`skip ${lang.code} (exists)`); continue; }
  console.log(`translating -> ${lang.name} (${lang.code})…`);
  try {
    const translated = await translate(lang.name, SOURCE);
    writeFileSync(outPath, JSON.stringify(translated, null, 2));
    console.log(`  ✓ ${outPath}`);
  } catch (e) {
    console.error(`  ✗ ${lang.code}:`, e);
  }
  await new Promise(r => setTimeout(r, 800));
}

// Also write English as canonical
writeFileSync(`${OUT_DIR}/en.json`, JSON.stringify(SOURCE, null, 2));
console.log("done.");

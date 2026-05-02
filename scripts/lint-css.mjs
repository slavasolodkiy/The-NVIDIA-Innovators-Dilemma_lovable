// CSS validator: detects unmatched braces, orphaned keyframe steps, and
// missing animation/keyframe definitions referenced by component class names.
// Used both as a CLI (`node scripts/lint-css.mjs`) and from a Vite plugin.
import fs from "node:fs";
import path from "node:path";

export function validateCss(cssPath) {
  const css = fs.readFileSync(cssPath, "utf8");
  const errors = [];

  // Strip block comments for accurate brace counting (preserve line numbers).
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));

  // 1) Brace balance with location of first offender
  let depth = 0, line = 1, col = 0;
  let firstUnmatchedClose = null;
  for (let i = 0; i < stripped.length; i++) {
    const ch = stripped[i];
    if (ch === "\n") { line++; col = 0; continue; }
    col++;
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth < 0 && !firstUnmatchedClose) {
        firstUnmatchedClose = { line, col };
        depth = 0;
      }
    }
  }
  if (firstUnmatchedClose) {
    const ln = lineText(css, firstUnmatchedClose.line);
    errors.push({
      kind: "unmatched-close-brace",
      line: firstUnmatchedClose.line,
      message: `Unmatched '}' (no opening '{').`,
      snippet: ln,
    });
  }
  if (depth > 0) {
    errors.push({
      kind: "missing-close-brace",
      line: countLines(stripped),
      message: `Missing ${depth} closing '}' brace(s) at end of file.`,
      snippet: "",
    });
  }

  // 2) Orphaned keyframe steps — a line that looks like `0%,100% { ... }` or
  // `50% {` outside of any @keyframes block.
  const lines = css.split("\n");
  let inKeyframes = 0;
  let blockDepth = 0;
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();
    if (/^@keyframes\b/.test(trimmed)) inKeyframes++;
    // count braces on this line
    const opens = (raw.match(/{/g) || []).length;
    const closes = (raw.match(/}/g) || []).length;

    // detect orphan BEFORE updating depths
    if (
      blockDepth === 0 &&
      /^\s*(?:from|to|\d+(?:\.\d+)?%(?:\s*,\s*\d+(?:\.\d+)?%)*)\s*\{/.test(raw)
    ) {
      errors.push({
        kind: "orphan-keyframe-step",
        line: i + 1,
        message: `Keyframe step outside of any @keyframes rule.`,
        snippet: raw,
      });
    }

    blockDepth += opens - closes;
    if (blockDepth < 0) blockDepth = 0;
    if (inKeyframes && blockDepth === 0) inKeyframes = Math.max(0, inKeyframes - 1);
  }

  // 3) Animation reference check — every `animation: <name> ...` should
  // resolve to an `@keyframes <name>` defined in the file (CSS keywords ignored).
  const keyframeNames = new Set(
    Array.from(css.matchAll(/@keyframes\s+([a-zA-Z_][\w-]*)/g)).map((m) => m[1])
  );
  const KEYWORDS = new Set([
    "none","initial","inherit","unset","revert","linear","ease","ease-in","ease-out","ease-in-out",
    "infinite","alternate","alternate-reverse","reverse","normal","forwards","backwards","both",
    "running","paused","step-start","step-end","cubic-bezier","steps",
  ]);
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/animation\s*:\s*([^;]+);/);
    if (!m) continue;
    const value = m[1];
    // Each shorthand item may reference a name; pick first identifier-looking token per item
    for (const part of value.split(",")) {
      const tokens = part.trim().split(/\s+/);
      for (const tk of tokens) {
        if (/^[a-zA-Z_][\w-]*$/.test(tk) && !KEYWORDS.has(tk)) {
          if (!keyframeNames.has(tk)) {
            errors.push({
              kind: "missing-keyframes",
              line: i + 1,
              message: `animation references unknown @keyframes "${tk}".`,
              snippet: lines[i],
            });
          }
          break; // only first identifier in a shorthand item is the name
        }
      }
    }
  }

  return { errors, keyframeNames: [...keyframeNames] };
}

function lineText(src, n) {
  return src.split("\n")[n - 1] || "";
}
function countLines(s) {
  return s.split("\n").length;
}

export function formatErrors(cssPath, errors) {
  const rel = path.relative(process.cwd(), cssPath);
  return errors
    .map(
      (e) =>
        `  ✗ ${rel}:${e.line}  [${e.kind}] ${e.message}` +
        (e.snippet ? `\n      → ${e.snippet.trim().slice(0, 160)}` : "")
    )
    .join("\n");
}

// Component-side check: ensure animation classes used in components exist.
// Scans src/ for class names that match keyframe-named utilities.
export function checkComponentAnimationClasses(srcDir, keyframeNames) {
  const errors = [];
  const wanted = new Set(["shake-rgb", "tap-glitch", "flicker", "glitch-text", "scanlines"]);
  const found = new Set();
  walk(srcDir, (file) => {
    if (!/\.(tsx?|jsx?)$/.test(file)) return;
    const src = fs.readFileSync(file, "utf8");
    for (const name of wanted) {
      if (src.includes(name)) found.add(name);
    }
  });
  // Map class → required keyframe(s)
  const required = {
    "shake-rgb": ["shake-rgb"],
    "tap-glitch": ["tap-rgb"],
    "flicker": ["flicker"],
    "glitch-text": ["glitch-x"],
    "scanlines": ["scanline"],
  };
  for (const cls of found) {
    for (const kf of required[cls] || []) {
      if (!keyframeNames.includes(kf)) {
        errors.push({
          kind: "component-missing-keyframes",
          line: 0,
          message: `Component uses .${cls} but @keyframes ${kf} is not defined.`,
          snippet: "",
        });
      }
    }
  }
  return errors;
}

function walk(dir, fn) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, fn);
    else fn(p);
  }
}

// CLI entrypoint
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const cssPath = process.argv[2] || "src/styles.css";
  const srcDir = process.argv[3] || "src";
  const { errors, keyframeNames } = validateCss(cssPath);
  const compErrors = checkComponentAnimationClasses(srcDir, keyframeNames);
  const all = [...errors, ...compErrors];
  if (all.length) {
    console.error(`\nCSS lint failed (${all.length} issue${all.length === 1 ? "" : "s"}):\n`);
    console.error(formatErrors(cssPath, all));
    console.error("");
    process.exit(1);
  } else {
    console.log(`✓ CSS lint passed: ${cssPath} (${keyframeNames.length} keyframes, all animation refs resolve).`);
  }
}

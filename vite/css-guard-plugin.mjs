// Vite plugin wrapper around scripts/lint-css.mjs.
// - Fails the build (buildStart) on unmatched braces, orphaned keyframes, or
//   animations referencing missing @keyframes.
// - Sends a friendly Vite error overlay (with file:line:col) in dev when
//   styles.css is edited and fails to parse.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateCss, checkComponentAnimationClasses, formatErrors } from "../scripts/lint-css.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSS_PATH = path.resolve(__dirname, "../src/styles.css");
const SRC_DIR = path.resolve(__dirname, "../src");

function buildMessage(errors) {
  return (
    `styles.css validation failed (${errors.length} issue${errors.length === 1 ? "" : "s"}):\n\n` +
    formatErrors(CSS_PATH, errors) +
    `\n\nFix the rules above and save again. Run \`node scripts/lint-css.mjs\` locally to re-check.`
  );
}

export function cssGuardPlugin() {
  return {
    name: "lovable:css-guard",
    enforce: "pre",
    buildStart() {
      const { errors, keyframeNames } = validateCss(CSS_PATH);
      const compErrors = checkComponentAnimationClasses(SRC_DIR, keyframeNames);
      const all = [...errors, ...compErrors];
      if (all.length) {
        this.error(buildMessage(all));
      }
    },
    handleHotUpdate(ctx) {
      if (path.resolve(ctx.file) !== CSS_PATH) return;
      const { errors, keyframeNames } = validateCss(CSS_PATH);
      const compErrors = checkComponentAnimationClasses(SRC_DIR, keyframeNames);
      const all = [...errors, ...compErrors];
      if (!all.length) return;
      const first = all[0];
      const err = new Error(buildMessage(all));
      // Attach Vite-overlay-friendly location info
      err.id = CSS_PATH;
      err.loc = { file: CSS_PATH, line: first.line || 1, column: 1 };
      err.frame =
        `${path.relative(process.cwd(), CSS_PATH)}:${first.line}\n` +
        (first.snippet ? `> ${first.snippet}\n  ^ ${first.message}` : `  ^ ${first.message}`);
      ctx.server.ws.send({
        type: "error",
        err: { message: err.message, stack: "", id: err.id, loc: err.loc, frame: err.frame, plugin: "lovable:css-guard" },
      });
      return [];
    },
  };
}

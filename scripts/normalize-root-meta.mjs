import fs from "node:fs";
import path from "node:path";

const ROOT_FILE = path.resolve("src/routes/__root.tsx");

const SITE_DESCRIPTION_DECL = `const SITE_DESCRIPTION = [
  "ISBN: 9798235142671 (e-Book)",
  "ISBN: 9798195009434 (Paperback)",
  "DOI 10.6084/m9.figshare.32133316",
  "ASIN: B0GZ42SBNY (e-Book)",
  "https://www.dram.gold (Official Page)",
].join("\\n");

`;

function ensureDescriptionConst(source) {
  if (source.includes("const SITE_DESCRIPTION = [")) {
    return source;
  }

  const anchor = 'import appCss from "../styles.css?url";\n\n';
  if (!source.includes(anchor)) {
    return source;
  }

  return source.replace(anchor, `${anchor}${SITE_DESCRIPTION_DECL}`);
}

function normalizeDescriptionMeta(source) {
  let out = source;

  out = out.replace(
    /\{ name: "description", content: [\s\S]*?\},\n\s*\{ name: "author", content: "Lovable" \},/m,
    '{ name: "description", content: SITE_DESCRIPTION },\n      { name: "author", content: "Lovable" },',
  );

  out = out.replace(
    /\{ property: "og:description", content: [\s\S]*?\},\n\s*\{ property: "og:type", content: "website" \},/m,
    '{ property: "og:description", content: SITE_DESCRIPTION },\n      { property: "og:type", content: "website" },',
  );

  out = out.replace(
    /\{ name: "twitter:description", content: [\s\S]*?\},\n\s*\{ property: "og:image", content: /m,
    '{ name: "twitter:description", content: SITE_DESCRIPTION },\n      { property: "og:image", content: ',
  );

  return out;
}

function main() {
  if (!fs.existsSync(ROOT_FILE)) {
    console.log("[normalize-root-meta] Skipped: src/routes/__root.tsx not found.");
    return;
  }

  const before = fs.readFileSync(ROOT_FILE, "utf8");
  let after = before;

  after = ensureDescriptionConst(after);
  after = normalizeDescriptionMeta(after);

  if (after !== before) {
    fs.writeFileSync(ROOT_FILE, after, "utf8");
    console.log("[normalize-root-meta] Rewrote src/routes/__root.tsx metadata for safe build.");
  } else {
    console.log("[normalize-root-meta] No metadata rewrite needed.");
  }
}

main();

I found the exact problem: `src/routes/__root.tsx` still contains raw line breaks inside normal double-quoted strings at lines 33, 40, and 49. TypeScript/ Rollup treats this as an unterminated string, so publishing fails before the app can build.

Plan:

1. Replace the multiline metadata strings in `src/routes/__root.tsx`
   - Convert the description, Open Graph description, and Twitter description from raw multiline string literals into a safe single-line constant.
   - Reuse that constant for all three metadata entries.
   - Also move the title and social image URL into constants to reduce future edit risk.

2. Add a small guard against this exact regression
   - Add/update a script check that scans `src/routes/__root.tsx` for raw newlines inside quoted strings.
   - This will catch the same issue before publish/build.

3. Verify the fix without relying on stale UI state
   - Parse `src/routes/__root.tsx` with a TypeScript/TSX parser check.
   - Confirm there are no raw newlines inside normal quoted strings.
   - Search the codebase for any remaining metadata strings starting with `content: "ISBN` that could still be multiline.

Technical details:

- The current broken code is this pattern:

```tsx
{ name: "description", content: "ISBN: 9798235142671 (e-Book)
ISBN: 9798195009434 (Paperback)
..." }
```

- The fixed code will use this pattern:

```tsx
const siteDescription = [
  "ISBN: 9798235142671 (e-Book)",
  "ISBN: 9798195009434 (Paperback)",
  "DOI 10.6084/m9.figshare.32133316",
  "ASIN: B0GZ42SBNY (e-Book)",
  "https://www.dram.gold (Official Page)",
].join(" · ");
```

Then the meta tags will use `content: siteDescription`, which cannot create an unterminated string in the route config.
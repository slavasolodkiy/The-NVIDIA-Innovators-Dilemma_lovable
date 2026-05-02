I found the actual issue: `src/routes/__root.tsx` still has raw line breaks inside normal double-quoted strings at lines 33, 40, and 49. That is invalid JavaScript/TypeScript, so the production build stops with `Unterminated string constant. (33:38)` every time.

Do I know what the issue is? Yes. The file currently still contains this broken pattern:

```tsx
content: "ISBN: 9798235142671 (e-Book)
ISBN: 9798195009434 (Paperback)
..."
```

A normal `"..."` string cannot span multiple lines. The previous intended fix did not persist in the current file, so publishing is still seeing the same bad code.

Plan:

1. Fix `src/routes/__root.tsx` directly
   - Add safe top-level constants before `createRootRoute`:
     - `SITE_TITLE`
     - `SITE_DESCRIPTION`
     - `SOCIAL_IMAGE_URL`
   - Build `SITE_DESCRIPTION` from single-line entries, for example:

```tsx
const SITE_DESCRIPTION = [
  "ISBN: 9798235142671 (e-Book)",
  "ISBN: 9798195009434 (Paperback)",
  "DOI 10.6084/m9.figshare.32133316",
  "ASIN: B0GZ42SBNY (e-Book)",
  "https://www.dram.gold (Official Page)",
].join(" · ");
```

2. Replace all broken metadata descriptions
   - Replace the multiline `description`, `og:description`, and `twitter:description` values with `SITE_DESCRIPTION`.
   - Replace repeated title/image literals with the constants so the risky multiline content cannot remain in the metadata block.

3. Preserve the TanStack Start root structure
   - Keep `createRootRoute`, `HeadContent`, `Scripts`, `Outlet`, `shellComponent`, and `notFoundComponent` as-is.
   - This is a syntax fix, not a routing or hosting workaround.

4. Clean up the stale Lovable plan note
   - `.lovable/plan.md` references the broken multiline-string issue. I’ll update/remove any risky wording so it cannot be copied back into the source again.

5. Validate before handing back
   - Re-read `src/routes/__root.tsx` to confirm line 33 is no longer a multiline string.
   - Search the project for the same ISBN metadata and confirm no source file still contains raw line breaks inside quoted metadata strings.
   - Use a parser check if available to confirm the TSX syntax is valid.

Expected result:
- Publishing should stop failing with `Unterminated string constant. (33:38)` because that line will no longer contain an invalid multiline quoted string.

Because this has looped several times, if the same error appears after this exact file is fixed, the next fallback is to use History to restore to the last working version and then reapply only this minimal metadata change.

<lov-actions>
  <lov-open-history>View History</lov-open-history>
</lov-actions>

<lov-actions>
<lov-link url="https://docs.lovable.dev/tips-tricks/troubleshooting">Troubleshooting docs</lov-link>
</lov-actions>
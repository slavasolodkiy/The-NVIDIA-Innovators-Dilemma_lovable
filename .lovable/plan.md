I found the recurring issue: `src/routes/__root.tsx` still contains literal line breaks inside double-quoted metadata strings at lines 33, 40, and 49. JavaScript/TypeScript does not allow raw newlines inside normal `"..."` strings, so the production parser stops at line 33 with `Unterminated string constant`.

Do I know what the issue is? Yes. The failing file is still syntactically invalid, and the previous intended refactor did not persist in the current code.

Plan:

1. Rewrite the root metadata safely
   - Add top-level constants for the repeated title, description, and image URL.
   - Build the description from an array with `.join(" · ")` so it stays one valid single-line string.
   - Replace the three broken multiline `content: "..."` values with `content: SITE_DESCRIPTION`.

2. Keep the TanStack Start root shell intact
   - Preserve `createRootRoute`, `HeadContent`, `Scripts`, `Outlet`, `shellComponent`, and `notFoundComponent`.
   - Do not add routing workarounds or hosting redirect files; this is a syntax issue, not a Lovable hosting/routing issue.

3. Remove the risky stale plan snippet if needed
   - `.lovable/plan.md` also contains an example of the same broken multiline string. It should not normally be part of the production bundle, but since this problem keeps reappearing, I will update/remove that stale example too so it can’t be accidentally copied back into the route file.

4. Validate before handing back
   - Parse `src/routes/__root.tsx` with a TSX parser check.
   - Search for the same multiline metadata pattern in project source files.
   - Confirm there are no remaining raw newlines inside quoted metadata strings.

Expected result:
- Publishing should stop failing with `Unterminated string constant. (33:38)` because line 33 will no longer start a multiline quoted string.

<lov-actions>
  <lov-open-history>View History</lov-open-history>
</lov-actions>

<lov-actions>
<lov-link url="https://docs.lovable.dev/tips-tricks/troubleshooting">Troubleshooting docs</lov-link>
</lov-actions>
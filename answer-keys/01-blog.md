# Answer key — Scenario 01: Blog Platform v2 ("Managing Posts")

**SPOILERS. Do not open until after the debrief.**

- Buggy version: **3 passing / 9 failing** (guard tests that pass: creation structure, delete-by-non-author 403, login without password).
- Restore the working version: from the scenario root, `patch -p1 < ../../answer-keys/01-blog.patch` (verified: 12/12, three runs in a row). Reverse with `patch -R -p1 < …`.
- Reset to the buggy start state at any time: `git checkout . && git clean -fd` in the scenario folder.
- Test DB name: `BlogPlatformDB_Test_4471932`; dev DB: `BlogPlatformDB`. In-memory MongoDB on port 27017 via `backend/devtools/` (read-only, no bugs there).

## The 10 bugs

| # | File · function | What's wrong | Tests it breaks | Ticket? | Pattern |
|---|---|---|---|---|---|
| 1 | `backend/routes/postRoutes.js` | `router.get('/:id', …)` is registered **before** `router.get('/my-posts', …)`, so `GET /api/posts/my-posts` is captured by `/:id` and fails ObjectId validation → 400 `Invalid post ID` | 3 | Ticket | P25 route order |
| 2 | `backend/models/Post.js` · `findByAuthor` | `this.find({})` — the `author: authorId` filter was dropped, so My Posts returns everyone's posts (drafts included). **Masked by bug 1**: only visible after the route order is fixed | 3 | Ticket | P7 missing filter |
| 3 | `backend/controllers/postController.js` · `updatePost` | Fields are assigned on the document but `await post.save()` was removed — the response shows the changes, the database never gets them. **Masked by bug 4** for the author-update test | 8 | Ticket | P1 never saved |
| 4 | `backend/controllers/postController.js` · `updatePost` | Ownership check inverted: `post.author.toString() === userId` returns 403 — so the **author** is blocked (test 8 sees 403) and **everyone else** is allowed through (test 9 sees 200) | 8, 9 | Ticket | P16 inverted condition |
| 5 | `backend/controllers/postController.js` · `deletePost` | `Post.findOneAndDelete({ author: userId })` instead of `Post.findByIdAndDelete(id)` — deletes the user's first post in natural order, not the requested one. Count still drops by 1, so only the identity checks catch it | 10 | Ticket | P8 wrong filter |
| 6 | `backend/controllers/postController.js` · `getPostById` | `populate('author', 'name email bio password')` — the author's plain-text password is returned in the single-post response | 7 | Hidden | P11 populate mistakes / P23 leaked fields |
| 7 | `backend/controllers/postController.js` · `createPost` | The excerpt default was dropped: `excerpt,` instead of `excerpt: excerpt \|\| content.substring(0, 150)`. README rule ("first 150 characters of the content") not enforced | 2 | Hidden | README business rule omitted (closest: P18) |
| 8 | `backend/models/Post.js` · `findAll` | `this.find(filter)` — the `published: true` condition was dropped, so Emma's draft leaks into the public list | 4 | Hidden | P8 wrong/missing filter value |
| 9 | `backend/controllers/postController.js` · `getAllPosts` | `const category = req.params.category` — reads route params instead of `req.query`, so `?category=` is silently ignored and the full list comes back | 5 | Hidden | P13 wrong source |
| 10 | `backend/controllers/postController.js` · `getAllPosts` | `new RegExp(search)` without the `'i'` flag — search is case-sensitive, `?search=react` misses "Getting Started with React Hooks" | 6 | Hidden | P9 case sensitivity |

## Fixes (working code)

1. **Route order** — register the literal route first:
   ```js
   router.get('/', getAllPosts);
   router.get('/my-posts', getMyPosts);
   router.get('/:id', getPostById);
   ```
2. **findByAuthor** — `return this.find({ author: authorId })…`
3. **updatePost save** — add `await post.save();` before the populate/response.
4. **Ownership check** — `if (post.author.toString() !== userId) return res.status(403)…`
5. **deletePost** — `await Post.findByIdAndDelete(id);`
6. **getPostById populate** — `populate('author', 'name email bio')`.
7. **createPost excerpt** — `excerpt: excerpt || content.substring(0, 150),`
8. **findAll** — `return this.find({ ...filter, published: true })…`
9. **getAllPosts category** — `const { category, search } = req.query;`
10. **Search regex** — `new RegExp(search, 'i')`.

## Masking pairs (by design)

- **Bugs 1 → 2 (test 3):** first failure is `expected 200 but got 400` (route order). Fixing the route order reveals `expected a length of 4 but got 10` (dropped author filter).
- **Bugs 4 → 3 (test 8):** first failure is `expected 200 but got 403` (inverted ownership). Fixing the inversion reveals the assertion on `Post.findById(…)` — the update was never saved.

## Test-by-test on the buggy version

| Test | Result | First failure |
|---|---|---|
| 1 creation structure | PASS (guard) | — |
| 2 excerpt default | FAIL | `expected undefined to equal 'Excerpts summarise…'` (bug 7) |
| 3 my-posts | FAIL | `expected 200 but got 400` (bug 1, then bug 2) |
| 4 drafts excluded | FAIL | `length of 8 but got 9` (bug 8) |
| 5 category filter | FAIL | `length of 2 but got 9` (bug 9; count is 9 while bug 8 is also present, 8 after it's fixed) |
| 6 search case-insensitive | FAIL | `expected [] to have a length of 1` (bug 10) |
| 7 no password on detail | FAIL | `expected {…} to not have property 'password'` (bug 6) |
| 8 author update saved | FAIL | `expected 200 but got 403` (bug 4, then bug 3) |
| 9 non-author update 403 | FAIL | `expected 403 but got 200` (bug 4) |
| 10 delete exact post | FAIL | `expected {…} to be null` (bug 5) |
| 11 non-author delete 403 | PASS (guard) | — |
| 12 login no password | PASS (guard) | — |

Bugs are independently fixable in any order; only the two designed masking pairs hide each other. Fixing all ten gives 12/12.

## Deviations from the build spec, for the record

- Section 3.8 asks for "some 500s" per scenario, but Section 4.1's authoritative bug table for this scenario contains none — all ten bugs here surface as assertion failures or wrong statuses, which matches the table. Scenarios 02+ include 500s.
- `backend/devtools/with-db.js` prepends `backend/node_modules/.bin` to the child PATH (so the root-level `npm run test:one` finds `cross-env`/`mocha` on any platform), and when it finds something already listening on 27017 it pings it as MongoDB first, printing a clear error and exiting if the port is held by something else (spec 3.6 requirement; all three paths — self-start, reuse, non-MongoDB listener — verified). Lab infrastructure only; read-only; no bugs in `devtools/`.
- Section 4.1's authoritative bug table places 7 bugs in `postController.js` (bugs 3–7, 9, 10), exceeding 3.8's "no more than 5 bugs in any one file" cap; 4.1 was treated as authoritative, matching the sample app's controller-heavy layout. Consider rebalancing (or explicitly waiving the cap) for scenarios 02–05, whose 4.1-style tables already spread bugs more widely.
- Deterministic ordering: seed posts carry fixed `createdAt`/`updatedAt` values in `backend/data/posts.js` (Mongoose preserves provided timestamps on `insertMany`), so "newest first" is stable across reseeds.

## Additions on Praise's request (2026-09-25, after the initial build)

- **Score banner:** `backend/devtools/score-reporter.cjs` (read-only lab infrastructure, referenced from `.mocharc.json`) extends the `spec` reporter and prints "Test Cases: N ran, X passed, Y failed / Score: X/N (P%)" with a progress bar and a motivational line after every run; runs of fewer than 12 tests get a "subset run" note instead. The graded `test/app.spec.js` is untouched.
- **Makefile harness** (read-only): `make help/setup/start/backend/frontend/test/test-one t="…"/seed/save/reset`. `save` commits practice progress; `reset` does `git reset --hard start && git clean -fdq`.
- **`start` git tag** on the single "Initial commit", so reset works even after practice commits (which become unreachable and invisible in `git log`).
- Re-verification after these changes: buggy `make test` → 3/12 (25% banner); apply answer patch → 12/12 (100% banner, twice); reverse → 3/12; `make test-one` works; mess-up drill (edit + delete a file + stray files, `make save`, more damage, `make reset`) restores the exact baseline with read-only permissions and `node_modules` intact; `make backend` serves on 8080 with visible seeded logs.

## Build verification log

- Working reference: 12/12 × 3 consecutive runs; 21-point API smoke test against the running dev server (login, browse, category, search, my-posts incl. Emma's draft, detail, create with/without excerpt, update own/other, delete own/other, auth/me, error statuses and exact messages) — all passed; frontend compiles clean (`react-scripts build`, no warnings).
- Bugs planted one at a time in the order 2, 1, 3, 4, 5, 6, 7, 8, 9, 10 (masked member of each pair first), with a full suite run after each: failing count moved 1 → 1 (failure changed) → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9, each step changing exactly the intended test(s).
- Patch round-trip verified: apply → 12/12 ×3 → reverse-apply → 3 passing / 9 failing.
- Reference backend copy kept outside the lab at `/tmp/oa-q2-ref/01-blog-backend` (may not survive a reboot; the `.patch` is the durable answer).

**Post-launch change (2026-09-25, Praise's request after first practice run):** the backend `start` script now runs `node --watch app.js` inside the DB wrapper, so backend edits auto-restart the server (database and data stay up; frontend hot reload unaffected). Applied to all scenarios and to BUILD_SPEC 3.4 for future ones; each repo's single `Initial commit` was amended and re-tagged `start`.

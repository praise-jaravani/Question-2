# Amazon OA Question 2 practice lab: build spec for Claude Code

This document is the full brief for **Claude Code** to build a practice lab that recreates the Amazon online assessment's "code repository" question (Question 2), and then to act as a **tutor** while Praise practises in it.

There are two phases, and Claude Code behaves differently in each:

| Phase | Who drives | Claude Code's role |
|---|---|---|
| **1. Build** | Claude Code | Engineer: build five working apps, write tests, plant bugs, verify, hide the answers |
| **2. Practice** | Praise | Tutor: mirrors the assessment's AI assistant. Helps *around* the answer, never gives it |

How this document is organised:

- Sections 1–2: context (what the real question is like, and the workflow being trained).
- Section 3: the build brief. Read all of it before writing any code.
- Section 4: the five scenarios and their planted bugs (**spoilers, builder only**).
- Section 5: the bug-pattern library, for adapting bugs or building extra scenarios later.
- Section 6: tutor mode (`CLAUDE.md`).
- Section 7: how Praise runs a practice session.
- Appendix A: the detailed reference captured from the real sample test. Every scenario must match its structure and style.

---

## 1. What the real Question 2 looks like

**Format (from the official sample and invite):**
- 60 minutes, separate from Question 1. Unused time does not carry over.
- A VS Code-style IDE in the browser with a complete full-stack app: `frontend/`, `backend/`, tests, README. The app can be launched and previewed. **Code changes apply to the running app instantly** — no manual server restart (Praise's firsthand observation from the sample environment). The lab must match this: backend served under `node --watch`.
- The stack is chosen before starting (Django, Spring Boot, C++ or Node.js) and can't be changed. **Praise uses Node.js.**
- The task is presented as a bug ticket ("Issue: …") with steps to reproduce, and a README describing the expected API behaviour.
- Acceptance: "your solution must pass all predefined unit tests". A **Test Cases** panel shows "N tests ran, X passed, Y failed" with the first failing assertion for each test.
- An **AI Assistant** is built in. It "can help with syntax, concepts and question clarification. It is designed not to provide full solutions." Files are referenced with `@filename`. Praise's observation from the official HackerRank sample: the assistant has access to the whole repo and can locate pasted code on its own; `@` just focuses it faster. (Some candidate reports claim other harnesses only see the open file.)
- Some files are read-only (tests, seed data, DB config, README, setup script). Editing them, even from the terminal, gives a **zero score**.
- Proctored: single screen, webcam on.

**What real candidates report (friends + 2026 candidate reports on 1Point3Acres):**
- **About six failing tests in 60 minutes is the normal load**, and time is tight. Passing 4 of 6 has still led to recruiter contact, so partial credit matters.
- The ticket usually names **2–4 broken behaviours**, but some bugs are deliberately **not mentioned**. They only show up as failing tests or in the README contract. Noticing them earns extra credit.
- Tests check the **API contract** (status codes, messages, response shape), not the UI. Fixing only the frontend fails.
- Typical defects are shallow but spread out: inverted comparisons (`==` vs `!=`, `<` vs `<=`), a missing state update, an object built but never saved or never linked to its parent, an off-by-one, a missing existence check, a wrong status code. In the Node.js + Mongoose variant, **bugs tend to sit in Mongoose model usage** rather than routing.
- Bugs aren't always in the obvious file: helpers, parsers and model statics are seeded too.
- Reported app themes: blog posts, car hire, actor-follow with movie notifications, movie watch-lists, loans (create / view / fund with insufficient balance / repay), password reset with a 30-second code expiry, Jira-like comments, review moderation with strike counts, return-fraud scoring thresholds, and one "add a feature" variant (rate limiting and a keyword/user blocklist).
- **Friends' reports:** car hire (new car shows "success" but never appears; edits don't stick; "my cars" shows everyone's cars) and actor-follow (Follow shows "Followed", but unfollow says you're not following, because the follow was never saved).

**Praise's sample result:** Blog platform (MERN). Fixed all three planted bugs in `createPost` with 30 minutes left.

## 2. The workflow the lab must train

1. Read the issue and README. Treat the README's "Additional Information" rules as a checklist.
2. Run the tests. Note the failing test names, including ones the ticket doesn't mention.
3. **Open the test file.** It's read-only but readable, and it's the exact acceptance criteria: endpoint, request, status code, message, response fields.
4. Launch the app and **read the server terminal**. Every controller's `catch` logs the real error.
5. Trace the failing request down the layers: route → middleware → controller → helper → model/static → database → response.
6. Make the smallest fix, rerun, move on. Easiest-looking tests first. Leave 5 minutes for a final full run.
7. Use the AI assistant to explain flow, localise the problem to a file or function, and help with syntax, not to hand over fixes.

---

## 3. Phase 1: build brief (for Claude Code)

### 3.1 Deliverables

```
oa-q2-lab/
├── HOW_TO_PRACTICE.md           ← spoiler-free guide for Praise (written after scenario 01)
├── scenarios/
│   ├── 01-blog/                 ← each scenario is a complete, standalone repo
│   ├── 02-car-hire/
│   ├── 03-actor-follow/
│   ├── 04-loans/
│   └── 05-issue-tracker/
└── answer-keys/                 ← never inside a scenario folder
    ├── BUILD_SPEC.md            ← this document, moved here at step 0 (it contains spoilers)
    ├── 01-blog.md   01-blog.patch
    ├── 02-car-hire.md   02-car-hire.patch
    └── …
```

**Step 0, before anything else:** create `answer-keys/`, move this document to `answer-keys/BUILD_SPEC.md`, and work from that copy. This keeps the spoilers out of the lab root from the start. In any later build session, begin by reading `answer-keys/BUILD_SPEC.md` and the existing answer keys, so the scenarios stay consistent.

**Build one scenario at a time.** Build 01, verify it against the checklist in 3.9, report to Praise, and wait for his go-ahead before starting the next. Each scenario is a full repo with its own `node_modules`, so it can be run independently.

### 3.2 Structure every scenario must match

Mirror Appendix A unless the scenario's domain requires otherwise:

- **Backend:** Express 4 + Mongoose 7, ES modules (`"type": "module"`, relative imports with `.js` extensions), `express-async-errors`, `cors`, `dotenv`. Folder layout `backend/{config,controllers,data,devtools,models,routes,test,utils}` (plus `middleware/` where a scenario needs it; `devtools/` is the lab's database launcher, see 3.6) plus `app.js`, `package.json`, `.mocharc.json`. The `app.js` shape, global error handler, "listen only when `NODE_ENV !== 'test'`" and `export default app` exactly as in Appendix A.5.
- **Auth:** `x-user-id` header, no tokens. `POST /api/auth/login` and `GET /api/auth/me` exactly as in Appendix A.5 (plain-text password compare, `toPublicProfile()` removes the password). Scenarios that need roles add `role: { type: String, enum: ['user','admin'], default: 'user' }` to `User`.
- **Controllers:** follow the template in Appendix A.5: 401 → 400 (validation / invalid ObjectId) → 404 → 403 → work → response; `catch` with `console.error('<Action> error:', error)` and a 500 with a `Server error …` message. Responses wrapped: `{ items }`, `{ item }`, `{ message, item }`.
- **Models:** Mongoose schemas with `timestamps: true` and explicit `collection`. Queries used by controllers live in **statics** (like `findAll`, `findByAuthor`), so bugs can hide in the model layer.
- **Seed:** `data/users.js` (the same four users: John Doe, Sarah Johnson, Mike Chen, Emma Wilson, all `password123`, with the same bios) plus domain data files. `utils/seed.js` in the Appendix A.5 style: connect, `deleteMany` everything, `insertMany`, assign owners by index, log counts, `process.exit(0)`. Seed data must be **deterministic** (fixed dates, fixed values) because tests depend on exact counts.
- **Database:** `config/database.js` exactly as in Appendix A.5, but each scenario uses its own names (e.g. `CarHireDB` and `CarHireDB_Test_<6 random digits>`) so scenarios don't overwrite each other. `utils/seed.js` must use the identical `dbName` / connection logic, or the tests will seed one database and query another.
- **Frontend:** React 18 with `react-scripts` 5 (CRA layout), Tailwind 3, `react-router-dom` 6, `react-hot-toast` 2, `lucide-react`. `src/{components,context,pages,utils}`; `utils/baseURL.js` exports `http://localhost:8080`; `utils/api.js` in the Appendix A.5 style (reads `user` from `localStorage`, sends `x-user-id`, throws `error.message` on `!response.ok`). `context/AuthContext.js` stores the logged-in user in `localStorage` under `user`. Dark theme (`bg-black`), purple accent, cards, a navbar with list / "My X" / primary action button / avatar / logout, toasts at top-center with the Appendix A.5 colours. Every page a scenario's endpoints need must exist and work.
- **Root:** `package.json` with `backend`, `frontend`, `start` (concurrently), `seed`, `test` scripts as in Appendix A.5, plus `setup` and `test:one` (see 3.5). `README.md`, `QUESTION.md`, `PROJECT_FILES_INSTRUCTIONS.md`, `setup.sh`, `setup.ps1`, `.gitignore` (`node_modules`, `.env`, `build`), `CLAUDE.md` (added last, see 3.8), and a `Makefile` practice harness (read-only; thin wrappers over the npm scripts, identical in every scenario): `help` (default), `setup`, `start`, `backend` (backend only, for readable logs), `frontend`, `test`, `test-one t="…"`, `seed`, `save` (`git add -A && git commit -m "practice progress"`, tolerating an empty commit), `reset` (`git reset --hard start && git clean -fdq` — restores the buggy baseline, keeps `node_modules`).

### 3.3 QUESTION.md and README.md per scenario

- **`QUESTION.md`** in the real ticket format (Appendix A.3): `# Issue: <Feature>`, a short description of the app, then **3–4 broken behaviours** in user terms, steps to reproduce with the seeded login (`john@example.com` / `password123`), expected behaviour, then: "Your task is to fix these backend issues. Refer to the README.md file for more details." and "**Note:** The acceptance criteria for this task require that your solution pass all predefined unit tests." The ticket must **not** mention every bug: 2–3 per scenario are discoverable only from failing tests or README rules.
- **`README.md`** in the real format (Appendix A.4): `<App>(MERN): <Feature>` title, Overview, **Expected API Behavior** for every endpoint the tests touch (purpose, headers, body, success response with status and field-by-field comments, and the error cases with their exact status codes and messages), then **Additional Information** with every business rule the tests check, plus the two reset bullets from the original.

### 3.4 Tests

- Mocha 10 + Chai 4.x + chai-http 4.x, written like Appendix A.5's `app.spec.js`: `describe('<Area> Testing')`, `it('should …')`, `.timeout(10000)`, reseed via `exec('node utils/seed.js')` at the start of every test, look users up by email, send `x-user-id`, then assert status → `message` → wrapper property → field values. A root-level `after()` reseeds.
- **12 tests per scenario**, grouped into 3–4 `describe` blocks. On the buggy version about **9–10 should fail and 2–3 should pass** (scenario 02 is the exception: a wiring bug makes all 12 fail at first, which is the point of that scenario). The passing ones are guard-rail tests (behaviour that already works), which is realistic and tells Praise when a fix broke something.
- At least **two tests cross endpoints** (e.g. create via POST, then check via a GET list *and* directly via the model).
- At least **one masking pair**: fixing one bug reveals a second failure in the same test (like the sample's 500 hiding the missing `post` field).
- Every error message a test checks must appear word-for-word in the README.
- `.mocharc.json`: `{ "spec": "test/**/*.spec.js", "reporter": "./devtools/score-reporter.cjs", "timeout": 10000, "exit": true }`. The reporter (`backend/devtools/score-reporter.cjs`, lab infrastructure, read-only, CommonJS so mocha can `require` it) extends the built-in `spec` reporter and, after the run, prints a score banner styled after the assessment's Test Cases panel: "Test Cases: N ran, X passed, Y failed", "Score: X/N (P%)" with a progress bar, and a short motivational line (with a "subset run" note instead when fewer than 12 tests ran, e.g. under `-g`). Copy it unchanged into every scenario. Backend `package.json` scripts (the `devtools/with-db.js` wrapper is explained in 3.6):
  - `"db": "node devtools/memory-db.js"`
  - `"start": "node devtools/with-db.js \"node utils/seed.js && node --watch app.js\""` (the in-memory database starts empty, so the dev database is seeded on every start; `node --watch` auto-restarts `app.js` whenever a backend file it imports changes, while the wrapper keeps the database up, so edits apply immediately, data survives watch-restarts, and the frontend's hot reload is unaffected. This is exam fidelity, not a convenience: in the real assessment environment code changes apply instantly, so every scenario must behave the same)
  - `"test": "node devtools/with-db.js cross-env NODE_ENV=test mocha"`
  - `"seed": "node devtools/with-db.js node utils/seed.js"`
- Tests must be stable: run the full suite **three times in a row** on the working version and get 12/12 every time.

### 3.5 Terminal feedback (mostly automatic; make sure it works)

In the real test, two things tell you what's broken, and both must work in the lab:

1. **Test output.** `npm test` from the scenario root runs `cd backend && npm test` and prints the Mocha `spec` report: each test's pass/fail, then the first failing assertion per test (e.g. `expected Response{…} to have status code 201 but got 500`, or an `AssertionError` with expected vs actual), and a final "X passing, Y failing" summary.
2. **Server logs.** Every controller's `catch` does `console.error('<Action> error:', error)`, so a 500 prints the real exception (e.g. `ReferenceError: title is not defined`). This appears automatically in the test output (the tests import `app` and run it in-process) and in the backend terminal when running `npm start`. **Keep this logging in every controller, including the buggy ones.**

Bugs that don't throw (wrong filter, missing field, wrong status) show only as assertion failures, which is realistic. **Don't add anything beyond the original**: no request logging middleware, no debug output, no hints in error messages.

Convenience scripts at the scenario root: `"test:one": "cd backend && node devtools/with-db.js cross-env NODE_ENV=test mocha -g"` (usage: `npm run test:one -- "should create"`), and `"setup"` (runs `setup.ps1` on Windows via `powershell -ExecutionPolicy Bypass -File setup.ps1`).

### 3.6 Environment (Praise is on Windows)

- **Node 20 LTS.** Pin versions that work together: express 4.19, mongoose 7.6, mongodb-memory-server 9.x (backend dependency), cors 2.8, dotenv 16, express-async-errors 3.1, mocha 10, chai 4.4, chai-http 4.4, cross-env 7, concurrently 7.6; react/react-dom 18.2, react-scripts 5.0.1, react-router-dom 6.x, react-hot-toast 2.x, lucide-react (a version compatible with React 18), tailwindcss 3.4, postcss 8, autoprefixer 10.
- **Database: in-memory MongoDB, nothing to install.** The lab uses [`mongodb-memory-server`](https://github.com/typegoose/mongodb-memory-server), which downloads a real MongoDB binary on first use (about 100 MB, cached afterwards in the user's home folder) and runs it as a normal process. The app, Mongoose and all queries behave exactly as with an installed MongoDB. Data is lost when the database process stops, which is fine: tests reseed before every test, and `npm start` seeds on launch.
- **Keep `config/database.js` and `utils/seed.js` exactly as in Appendix A.5** (they connect to `mongodb://127.0.0.1:27017/<dbName>`). The in-memory server is started **on port 27017**, so these files need no changes and the code matches the real assessment. Don't switch them to `MongoMemoryServer.create()` URIs.
- **`backend/devtools/memory-db.js`**: starts `MongoMemoryServer` with `instance: { ip: '127.0.0.1', port: 27017 }`, logs `In-memory MongoDB running at mongodb://127.0.0.1:27017`, and stays running until Ctrl+C (stop the server cleanly on `SIGINT`/`SIGTERM`). With `--check`, it starts, confirms it works, stops and exits (used by setup to pre-download the binary).
- **`backend/devtools/with-db.js <command…>`**: tries a TCP connection to `127.0.0.1:27017`. If something is already listening (another `with-db` run, `npm run db`, or a real MongoDB), it just runs the command. If not, it starts `MongoMemoryServer` on 27017 first, runs the command, and stops the server when the command exits, **only if it started it**. It runs the command with `spawn(..., { stdio: 'inherit', shell: true, env: process.env })`, quotes any argument containing spaces (so `-g "should create"` survives on Windows), and exits with the command's exit code. Child processes (the tests' `exec('node utils/seed.js')`) inherit the environment and reach the same server, because it's on a fixed port.
- **Practical consequence:** if Praise runs `npm start` first (a long-running process), it owns the database and `npm test` reuses it. If he only runs tests, each run starts and stops its own. Test and dev use different database names on the same server, exactly like the original. If port 27017 is taken by something that isn't MongoDB, `with-db` should print a clear error.
- **`devtools/` is lab infrastructure, not part of the exercise:** no bugs there, and mark both files read-only.
- **`setup.ps1`** does what `setup.sh` does, in PowerShell: `npm install` in root, `backend` and `frontend`, then `node devtools/memory-db.js --check` (pre-downloads the MongoDB binary; needs internet the first time). Keep `setup.sh` for fidelity, but replace its `mongod` start block with the same `--check` step, since the lab doesn't use an installed MongoDB.
- **Root `start`:** don't use a `prestart` hook that calls bash (it breaks on Windows). `start` just runs `concurrently "npm run backend" "npm run frontend"`; setup is run separately with `npm run setup`.
- **Read-only files:** list them in `PROJECT_FILES_INSTRUCTIONS.md` with the original wording (Appendix A.2), and mark them read-only on disk. On Windows use `attrib +r <file>`; in bash, `chmod 444`. Read-only list per scenario: `README.md`, `QUESTION.md`, `PROJECT_FILES_INSTRUCTIONS.md`, `setup.sh`, `setup.ps1`, `CLAUDE.md`, `Makefile`, `backend/config/database.js`, `backend/data/*`, `backend/test/*`, `backend/utils/seed.js`, `backend/devtools/*`, `backend/.mocharc.json`.
- Ports: backend 8080, frontend 3000. Only run one scenario at a time.

### 3.7 Build order for each scenario (non-negotiable)

1. Build the **fully working** app: backend and frontend.
2. Write the 12 tests. All must pass on the working version, three runs in a row. Start the app and smoke-test every page against the backend (log in as John, exercise each flow). Fix anything broken.
3. Copy the working backend to a temporary location outside the lab. That's the reference.
4. Plant the bugs from Section 4, **one at a time**. After each one, run the suite and confirm exactly the intended test(s) change. Record which tests each bug breaks.
5. After all bugs are in, confirm the final picture: the expected number of failing tests, the masking pairs behave as designed, and applying the reference restores 12/12.
6. Write `answer-keys/<scenario>.patch` (diff from buggy to working, backend only) and `answer-keys/<scenario>.md`: for each bug, the file, the function, what's wrong, which tests catch it, whether the ticket mentions it, the fix, and the general pattern (link it to a Section 5 pattern ID).
7. **Hide the history and evidence.** No comments like `// BUG`, `// TODO fix` or `// intentionally`; no suspicious names; no leftover reference copies, `.orig` files or patches inside the scenario. Delete any `.git` used while building, then `git init` and make a single commit, "Initial commit", of the buggy version, and tag it `start` (`git tag -f start`), so `git log` and `git diff` reveal nothing and `make reset` (`git reset --hard start && git clean -fd`) restores the starting state even after practice commits. After marking files read-only, run `git update-index --refresh` so a later reset doesn't rewrite unmodified files and strip their read-only permissions.
8. Write `CLAUDE.md` (Section 6), mark the read-only files, and commit again only if needed (amend the single commit so there's still one).
9. Report to Praise: how to start the scenario and how many tests fail on a fresh run (just the numbers). **Never describe the bugs in chat.**

After scenario 01, write `HOW_TO_PRACTICE.md` at the lab root (spoiler-free, Section 7) so Praise can start practising while later scenarios are built; update it as scenarios are added. Nothing at the lab root or inside `scenarios/` may contain spoilers.

### 3.8 Bug-planting rules

- **10 bugs per scenario**, all in **editable backend files**: controllers, models and statics, routes, middleware, helpers in `utils/` (except `seed.js`), and `app.js`. Never in read-only files or the frontend.
- Each bug must look like a **plausible developer mistake**, not sabotage: a missing `await` or `save()`, a forgotten filter, a swapped comparison, a wrong field name, a missing destructure, a wrong status code or message, route order, a missing wrapper field, a typo like `post.this.save()`, an ObjectId compared with `===`, a string that should have been a number.
- **Spread across layers:** no more than 5 bugs in any one file; at least 2 in model statics or helpers; at least 1 in routing or `app.js`.
- **Mix of difficulty:** about 3 one-line fixes visible from the error or assertion; about 4 that need tracing across files; about 3 subtle ones (a README business rule, a boundary condition, a cross-endpoint failure caused by a different route).
- **Mix of symptoms:** some 500s (visible in logs), some wrong data (assertion diffs), some wrong status codes or messages, at least one masking pair, at least one bug that breaks two tests.
- Bugs must be fixable in any order. Only designed masking pairs may hide each other.
- Don't reuse the sample's three bugs (missing `req.body` destructure, `post.this.save()`, missing `post` in the response) in scenario 01. Other scenarios may use similar *kinds* of bugs in different code.
- Section 4 gives each scenario's planned bugs. Adapt the details to fit the code, but keep the pattern, layer and difficulty. If a planned bug turns out to be impossible or trivially visible, swap in a pattern from Section 5 and record the change in the answer key.

### 3.9 Acceptance checklist (verify before reporting each scenario)

- [ ] `npm run setup` then `npm start` works on Windows from a clean clone **with no MongoDB installed**; the frontend loads at `localhost:3000` and logs in as John.
- [ ] `npm test` works on its own (no app running), and also while `npm start` is running in another terminal (it reuses the same database server). `npm run test:one -- "should create"` runs a single test.
- [ ] Every page works against the backend on the **reference** version.
- [ ] Reference version: 12/12 tests pass, three runs in a row.
- [ ] Buggy version: the expected tests fail; the failure messages are informative (the assertion or the logged exception points to the symptom, not the fix).
- [ ] `QUESTION.md` names 3–4 behaviours; README documents every endpoint, error message and rule the tests check.
- [ ] Read-only files are marked read-only and listed in `PROJECT_FILES_INSTRUCTIONS.md`.
- [ ] The scenario folder contains no spoilers; `git log` shows one commit; no `.patch`/reference files inside.
- [ ] `CLAUDE.md` is present, and a quick check shows the tutor refuses "just tell me the fix".
- [ ] Answer key and patch written; applying the patch gives 12/12.

---

## 4. The five scenarios

**Praise: stop here.** Everything in this section is for the builder. Reading it spoils the practice.

<details>
<summary>Spoilers: scenario specs and planned bugs (builder only)</summary>

Each scenario lists its domain, seed data, API contract, frontend pages, tests and bugs. Status codes and messages listed here go word-for-word into the README and the tests. "Ticket" = mentioned in `QUESTION.md`; "Hidden" = only discoverable from tests or the README.

### 4.1 Scenario 01: Blog Platform v2 ("Managing Posts")

**Domain:** the sample app (Appendix A) plus search, category filter and drafts.

**Seed:** the sample's users and posts. Authors by index: 0–2 John (Technology), 3–4 Sarah (Travel), 5–6 Mike (Food), 7–8 Emma (Lifestyle). Post 8 (Emma's) has `published: false` (a draft). Use the sample's post content where captured; write similar Markdown content for the rest.

**API (under `/api/posts`):**

| Method | Path | Success | Errors |
|---|---|---|---|
| GET | `/` (query: `category`, `search`) | 200 `{ posts }`: published only, newest first; `category` exact match; `search` case-insensitive match on title | — |
| GET | `/my-posts` | 200 `{ posts }`: all of the user's posts, drafts included | 401 `Not authenticated` |
| GET | `/:id` | 200 `{ post }` with `author` populated as `name email bio` (never `password`) | 400 `Invalid post ID`, 404 `Post not found` |
| POST | `/` | 201 `{ message: 'Post created successfully', post }` | 401, 400 `Title, content, and category are required` |
| PUT | `/:id` | 200 `{ message: 'Post updated successfully', post }` | 401, 400, 404, 403 `Not authorized to update this post` |
| DELETE | `/:id` | 200 `{ message: 'Post deleted successfully' }` | 401, 400, 404, 403 `Not authorized to delete this post` |

Rules: excerpt defaults to the first 150 characters of content; `published` defaults to true; the public list never shows drafts; only the author can update or delete.

**Frontend:** the sample's six pages, plus a working search box and category chips on the home page, a "Draft" badge on My Posts, and working edit and delete.

**Tests (12):**
1. Creation: creates a post with the expected structure (guard, passes)
2. Creation: excerpt defaults to the first 150 characters when omitted
3. My Posts: returns only the logged-in user's posts (John: 3, all authored by John)
4. Public list: excludes unpublished drafts
5. Public list: filters by category (`?category=Travel` → only Sarah's 2)
6. Public list: search is case-insensitive (`?search=react` finds "Getting Started with React Hooks")
7. Single post: author details never include the password
8. Update: the author can update, and the change is saved (checks the response and `Post.findById`)
9. Update: another user gets 403 with the exact message
10. Delete: removes exactly the requested post (count drops by 1, other posts intact)
11. Delete: another user gets 403 (guard, passes)
12. Auth: login response doesn't include the password (guard, passes)

**Bugs:**

| # | Where | Bug | Breaks | Ticket? |
|---|---|---|---|---|
| 1 | `routes/postRoutes.js` | `/:id` registered before `/my-posts` | 3 (400 Invalid post ID) | Ticket |
| 2 | `models/Post.js` `findByAuthor` | `this.find({})`, author filter dropped. Masked by bug 1 | 3 | Ticket |
| 3 | `postController.updatePost` | fields assigned but `await post.save()` missing | 8 | Ticket |
| 4 | `postController.updatePost` | ownership check inverted (`===` instead of `!==`) | 8, 9 | Ticket |
| 5 | `postController.deletePost` | `Post.findOneAndDelete({ author: userId })` instead of by id | 10 | Ticket |
| 6 | `postController.getPostById` | populates `'name email bio password'` | 7 | Hidden |
| 7 | `postController.createPost` | no excerpt default | 2 | Hidden |
| 8 | `models/Post.js` `findAll` | `published: true` filter dropped | 4 | Hidden |
| 9 | `postController.getAllPosts` | reads `req.params.category` instead of `req.query.category` | 5 | Hidden |
| 10 | `postController.getAllPosts` | builds `new RegExp(search)` without the `'i'` flag | 6 | Hidden |

Ticket wording: "Users can't manage their posts. My Posts fails to load (and when it does, shows other people's posts), edits don't save, and deleting a post removes the wrong one."

### 4.2 Scenario 02: Car Hire ("Listings and Bookings")

**Models:**
- `Car`: `make`, `model` (String, required), `year` (Number, required), `pricePerDay` (Number, required, min 1), `location` (String, required), `description` (String), `available` (Boolean, default true), `owner` (ref User, required). Statics `findAvailable(location?)` (available only, optional case-insensitive location), `findByOwner(ownerId)`.
- `Booking`: `car` (ref Car), `renter` (ref User), `startDate`, `endDate` (Date, required), `totalPrice` (Number), `status` (enum `confirmed | cancelled`, default `confirmed`). Static `findOverlapping(carId, start, end)`.

**Seed:** cars by index: 0–2 John (Cape Town), 3–4 Sarah (Johannesburg), 5–6 Mike (Durban; car 6 `available: false`), 7 Emma (Cape Town). Prices are round numbers (e.g. 450, 600, 800). One booking: Sarah has booked John's car 0 from `2030-01-10` to `2030-01-15`, confirmed.

**API:**

| Method | Path | Success | Errors |
|---|---|---|---|
| GET | `/api/cars` (query: `location`) | 200 `{ cars }`: available only, newest first | — |
| GET | `/api/cars/my-cars` | 200 `{ cars }`: all the user's cars | 401 |
| GET | `/api/cars/:id` | 200 `{ car }` with owner `name email` | 400 `Invalid car ID`, 404 `Car not found` |
| POST | `/api/cars` | 201 `{ message: 'Car listed successfully', car }` | 401, 400 `Make, model, year, price per day and location are required` |
| PUT | `/api/cars/:id` | 200 `{ message: 'Car updated successfully', car }` | 401, 400, 404, 403 `Not authorized to update this car` |
| DELETE | `/api/cars/:id` | 200 `{ message: 'Car deleted successfully' }` | 401, 400, 404, 403 |
| PATCH | `/api/cars/:id/availability` | 200 `{ message: 'Availability updated', car }` (toggles) | 401, 404, 403 |
| POST | `/api/cars/:id/bookings` | 201 `{ message: 'Booking confirmed', booking }` | 401, 404; 400 `You cannot book your own car`; 400 `End date must be after start date`; 400 `Car is not available`; 409 `Car is already booked for these dates` |
| GET | `/api/bookings/my-bookings` | 200 `{ bookings }` with car populated | 401 |

Rules: `totalPrice = days × pricePerDay`, where `days` is the number of nights between start and end (10th → 15th = 5 days). A booking overlaps if it starts before an existing confirmed booking ends **and** ends after it starts.

**Frontend:** Browse Cars (location filter), Car Detail (with a booking form), My Cars (edit, delete, availability toggle), List a Car, Edit Car, My Bookings, Login.

**Tests (12):**
1. Listing: creating a car returns 201 with the expected structure (`pricePerDay` is a number)
2. Listing: a created car is saved and appears in My Cars
3. My Cars: returns only the user's cars (John: 3)
4. Browse: returns only available cars (7 after seed)
5. Browse: location filter is case-insensitive (`?location=cape town` → 4: John's three plus Emma's)
6. Update: owner's changes are saved
7. Update: another user gets 403 (guard, passes)
8. Availability: toggling returns 200 with the car, and the change is saved
9. Booking: total price is nights × price per day
10. Booking: you can't book your own car (400)
11. Booking: overlapping dates return 409
12. Booking: end date before start date returns 400 (guard, passes)

**Bugs:**

| # | Where | Bug | Breaks | Ticket? |
|---|---|---|---|---|
| 1 | `app.js` | car router mounted at `/api/car` instead of `/api/cars` | nearly everything (404s) | Ticket (as "nothing loads") |
| 2 | `carController.createCar` | builds `new Car(...)`, returns 201, never saves | 2 | Ticket |
| 3 | `carController.createCar` | reads `req.body.price` instead of `pricePerDay`. Masked by bug 2 in test 2; shows as a 500 ValidationError in test 1 | 1, 2 | Ticket |
| 4 | `carController.updateCar` | loads with `.lean()`, assigns fields, "saves" nothing, returns 200 | 6 | Ticket |
| 5 | `models/Car.js` `findByOwner` | owner filter dropped | 3 | Ticket |
| 6 | `models/Car.js` `findAvailable` | filters `available: false` | 4, 5 | Hidden |
| 7 | `models/Car.js` `findAvailable` | location matched with a case-sensitive exact string | 5 | Hidden |
| 8 | `carController.toggleAvailability` | returns 201 and `{ message }` with no `car` | 8 | Hidden |
| 9 | `bookingController.createBooking` | nights computed `+ 1` (off-by-one) | 9 | Hidden |
| 10 | `bookingController.createBooking` | own-car check `car.owner === userId` (ObjectId vs string, always false) | 10 | Hidden |

(Test 11 is a guard for the overlap logic on the reference. If a 10-bug set feels too easy during building, swap bug 7 for "overlap check only tests whether the new start falls inside an existing booking", which breaks test 11.)

Ticket wording: "Car owners report that listing a new car shows a success message but the car never appears, edits don't stick, and My Cars shows every car on the platform."

### 4.3 Scenario 03: Actor Follow ("Follows and Notifications")

**Models:**
- `User` gains `role` (`user | admin`, default `user`). Emma is `admin`.
- `Actor`: `name`, `bio`, `followerCount` (Number, default 0).
- `Movie`: `title`, `genre`, `releaseDate` (Date), `actors` [ref Actor].
- `Follow`: `user` (ref User), `actor` (ref Actor); unique compound index on `{ user, actor }`.
- `Notification`: `user`, `movie`, `actor` (refs), `message` (String), `read` (Boolean, default false).

**Seed:** 6 actors, 8 movies with fixed release dates across 2021–2026, each with 1–3 actors. John follows actor 1 (so `followerCount` of actor 1 is 1). No notifications.

**API:**

| Method | Path | Success | Errors |
|---|---|---|---|
| GET | `/api/actors` | 200 `{ actors }` | — |
| GET | `/api/actors/:id` | 200 `{ actor, isFollowing }` | 400, 404 `Actor not found` |
| POST | `/api/actors/:id/follow` | 201 `{ message: 'Now following <name>', follow }` | 401, 404; 409 `You are already following this actor` |
| DELETE | `/api/actors/:id/follow` | 200 `{ message: 'Unfollowed <name>' }` | 401, 404 `You are not following this actor` |
| GET | `/api/users/me/following` | 200 `{ following: [{ _id, actor: { _id, name } }] }` | 401 |
| GET | `/api/feed` | 200 `{ movies }`: movies featuring any followed actor, newest release first | 401 |
| POST | `/api/movies` | 201 `{ message: 'Movie added', movie }`, then notifies followers | 401; 403 `Admin access required`; 400 `Title, release date and at least one actor are required` |
| GET | `/api/notifications` | 200 `{ notifications, unreadCount }`, newest first | 401 |
| PATCH | `/api/notifications/:id/read` | 200 `{ notification }` | 401, 404, 403 |

Rules: following increments `followerCount`, unfollowing decrements it; adding a movie creates **one** notification per follower, even if they follow several of its actors (message: `"<actor name> is in a new movie: <title>"`, using the first followed actor); `unreadCount` counts unread only.

**Frontend:** Actors list, Actor detail (follow/unfollow button, follower count), Following, Feed, Notifications (with a bell and unread badge in the navbar), Admin: Add Movie (visible to admins only), Login.

**Tests (12):**
1. Follow: following an actor returns 201 and saves the follow (checks `Follow` in the DB and the following list)
2. Follow: following twice returns 409
3. Follow: follower count goes up by one
4. Unfollow: unfollowing a followed actor returns 200 and removes the follow
5. Unfollow: unfollowing an actor you don't follow returns 404 (guard, passes)
6. Following list: includes actor names
7. Feed: only movies with followed actors
8. Feed: newest release first
9. Movies: non-admins get 403
10. Movies: an admin adding a movie notifies each follower exactly once
11. Notifications: `unreadCount` counts unread only
12. Auth: `GET /api/auth/me` returns the user without the password (guard, passes)

**Bugs:**

| # | Where | Bug | Breaks | Ticket? |
|---|---|---|---|---|
| 1 | `followController.followActor` | `new Follow(...)` never saved; returns 201 | 1, 4 | Ticket |
| 2 | `followController.followActor` | no existing-follow check before creating | 2 | Hidden |
| 3 | `followController.followActor` | `$inc: { followerCount: -1 }` | 3 | Ticket |
| 4 | `followController.unfollowActor` | existence check inverted (404 when the follow exists) | 4 | Ticket |
| 5 | `userController.getFollowing` | `populate` missing, so `actor` is just an ID | 6 | Hidden |
| 6 | `models/Movie.js` `findForActors` | query drops the `$in` filter and returns all movies | 7 | Ticket |
| 7 | `models/Movie.js` `findForActors` | sorts `releaseDate: 1` | 8 | Hidden |
| 8 | `middleware/requireAdmin.js` | `if (user.role = 'admin')`, an assignment, so everyone passes | 9 | Hidden |
| 9 | `utils/notify.js` | one notification per (follower, actor) pair instead of deduping by follower | 10 | Hidden |
| 10 | `notificationController.getNotifications` | `unreadCount` from `countDocuments({ user })` without `read: false` | 11 | Hidden |

Ticket wording: "Following actors doesn't work properly. The button says Followed, but unfollowing says you aren't following, follower counts go the wrong way, and the feed shows movies from actors I don't follow."

### 4.4 Scenario 04: Loans ("Peer-to-Peer Lending")

**Models:**
- `User` gains `balance` (Number, default 0). Seed balances: John 5000, Sarah 20000, Mike 300, Emma 10000.
- `Loan`: `borrower` (ref User), `lender` (ref User, optional), `amount` (Number, required, min 100, max 10000), `interestRate` (Number, percent, e.g. 5 = 5%), `purpose` (String), `status` (`open | funded | repaid`, default `open`), `amountRepaid` (Number, default 0), `fundedAt` (Date). Virtual or computed `totalDue = amount × (1 + interestRate / 100)`, rounded to 2 decimals.

**Seed:** 6 loans: John has one `open` (1000 at 5%) and one `funded` by Sarah (2000 at 10%, 500 repaid); Mike has two `open` (500 at 8%, 3000 at 6%); Emma has one `repaid`; Sarah has one `open` (1500 at 4%).

**API:**

| Method | Path | Success | Errors |
|---|---|---|---|
| POST | `/api/loans` | 201 `{ message: 'Loan request created', loan }` | 401; 400 `Amount must be between 100 and 10000`; 400 `Amount, interest rate and purpose are required` |
| GET | `/api/loans` | 200 `{ loans }`: **open** loans from other users, newest first | 401 |
| GET | `/api/loans/my-loans` | 200 `{ borrowed, lent }` | 401 |
| POST | `/api/loans/:id/fund` | 200 `{ message: 'Loan funded', loan }`; lender balance −amount, borrower +amount, status `funded`, `lender` and `fundedAt` set | 401, 404; 400 `You cannot fund your own loan`; 400 `Loan is not open for funding`; 400 `Insufficient balance` |
| POST | `/api/loans/:id/repay` (body `{ payment }`) | 200 `{ message: 'Repayment recorded', loan }`; borrower −payment, lender +payment; status `repaid` when `amountRepaid` reaches `totalDue` | 401, 404, 403 `Only the borrower can repay this loan`; 400 `Insufficient balance`; 400 `Payment exceeds amount due` |
| GET | `/api/users/me` | 200 `{ user }` including `balance` | 401 |

**Frontend:** Marketplace (open loans, Fund button), My Loans (borrowed and lent tabs, Repay form), Request a Loan, a balance shown in the navbar, Login.

**Tests (12):**
1. Create: a loan request is saved and returned with status `open`
2. Create: amount boundaries (100 accepted, 99 rejected with the exact message)
3. Marketplace: shows only open loans from other users
4. Fund: moves money correctly (lender and borrower balances in the DB) and sets status `funded`
5. Fund: insufficient balance returns 400 (Mike trying to fund 1500)
6. Fund: you can't fund your own loan
7. Fund: a non-open loan returns 400 (guard, passes)
8. Repay: records the payment (sent as a string, like the form does) and updates `amountRepaid` and both balances
9. Repay: paying exactly the remaining due marks the loan `repaid`
10. Repay: insufficient balance returns 400
11. Repay: `totalDue` uses the percentage correctly (2000 at 10% → 2200)
12. My Loans: returns borrowed and lent separately (guard, passes)

**Bugs:**

| # | Where | Bug | Breaks | Ticket? |
|---|---|---|---|---|
| 1 | `loanController.createLoan` | `borrower` never set, so validation fails and returns 500 | 1 | Ticket ("can't create a loan") |
| 2 | `loanController.createLoan` | boundary check `amount <= 100` rejects exactly 100 | 2 | Hidden |
| 3 | `models/Loan.js` `findOpenForUser` | filters `status: 'funded'` | 3 | Ticket ("can't see loans") |
| 4 | `loanController.repayLoan` | `payment` from `req.body` used without `Number()`, so `loan.amountRepaid + payment` concatenates (500 + "200" → "500200") | 8 | Hidden |
| 5 | `loanController.fundLoan` | borrower's balance updated in memory but never saved | 4 | Hidden |
| 6 | `loanController.fundLoan` | balance check `lender.balance > loan.amount` inverted (`<`) or missing | 5 | Ticket ("can fund without enough money") |
| 7 | `loanController.fundLoan` | own-loan check compares ObjectId with `===` | 6 | Hidden |
| 8 | `utils/loanMath.js` `totalDue` | uses `interestRate` as a fraction (`amount × (1 + rate)`) | 9, 11 | Hidden |
| 9 | `loanController.repayLoan` | status set to `repaid` only when `amountRepaid > totalDue` (should be `>=`) | 9 | Hidden |
| 10 | `loanController.repayLoan` | no balance check before repaying | 10 | Hidden (mirrors a real report where the last failing test wasn't in the ticket) |

Design note for bug 4: the repay body is `{ payment }`. The README says it's a number "which may arrive as a string from form inputs", and the Repay form sends the raw input value (a string), so test 8 sends `{ payment: '200' }` exactly as the frontend does.

Ticket wording: "Borrowers can't create loan requests, the marketplace shows nothing to fund, and lenders can fund loans they can't afford."

### 4.5 Scenario 05: Issue Tracker ("Comments and Moderation")

**Models:**
- `User` gains `violationCount` (Number, default 0), `isFlagged` (Boolean, default false), `flaggedWords` ([String]).
- `Issue`: `title` (required), `description`, `status` (`open | in_progress | closed`, default `open`), `reporter` (ref User), `assignee` (ref User), `comments` ([ref Comment]).
- `Comment`: `issue` (ref Issue), `author` (ref User), `body` (required), `edited` (Boolean, default false).
- `data/bannedWords.js` (read-only): a short list of mild placeholder words (e.g. `scam`, `idiot`, `stupid`, `garbage`).
- `utils/moderation.js` (editable): `findBannedWords(text)` returns the banned words found (case-insensitive, whole words).

**Seed:** 5 issues across the users with a mix of statuses; 6 comments; Mike already has `violationCount: 2`; Emma is `isFlagged: true`.

**API:**

| Method | Path | Success | Errors |
|---|---|---|---|
| POST | `/api/issues` | 201 `{ message: 'Issue created', issue }` | 401 `Authentication required`; 400 `Title is required` |
| GET | `/api/issues` (query: `status`) | 200 `{ issues }`, newest first | — |
| GET | `/api/issues/:id` | 200 `{ issue }` with comments populated **oldest first**, each with author `name` | 400, 404 `Issue not found` |
| POST | `/api/issues/:id/comments` | 201 `{ message: 'Comment added', comment }` | 401; 404; 403 `Your account has been flagged`; 403 `Comment contains inappropriate content` |
| PUT | `/api/comments/:id` | 200 `{ message: 'Comment updated', comment }` with `edited: true` | 401; 404; 403 `You can only edit your own comments`; the same moderation errors |

Moderation rules (README): every add **and edit** runs `findBannedWords`. On a violation: respond 403, increment `violationCount`, append the words to `flaggedWords`, save the user, and set `isFlagged: true` when `violationCount` reaches 3. Flagged users are always blocked from commenting, before any other check. Unauthenticated requests return **401**, not 403.

**Frontend:** Issues list (status filter), Issue detail (comment thread, add and edit comment), New Issue, Login. Show a toast with the server's message on 403.

**Tests (12):**
1. Issues: creating an issue without a title returns 400 (guard, passes)
2. Issues: status filter returns only matching issues
3. Comments: adding a comment returns 201 and it appears on the issue
4. Comments: the thread is oldest first
5. Comments: editing your own comment is saved with `edited: true`
6. Comments: editing someone else's comment returns 403 with the exact message
7. Comments: unauthenticated requests return 401
8. Moderation: a banned word returns 403 and increments `violationCount` (checked in the DB)
9. Moderation: detection is case-insensitive ("SCAM")
10. Moderation: the third strike flags the user (Mike: 2 → 3 → `isFlagged: true`)
11. Moderation: a flagged user is blocked even with a clean comment (Emma)
12. Moderation: edits are moderated too

**Bugs:**

| # | Where | Bug | Breaks | Ticket? |
|---|---|---|---|---|
| 1 | `commentController.addComment` | comment saved but never pushed onto `issue.comments` (issue not saved) | 3 | Ticket ("comments don't appear") |
| 2 | `commentController.updateComment` | `findByIdAndUpdate` without `{ new: true }`, and `edited` never set | 5 | Ticket ("edits don't show") |
| 3 | `commentController.updateComment` | author check compares ObjectId with `!==` directly, so even the author is blocked. Masks bug 2 | 5 | Ticket |
| 4 | `middleware/requireUser.js` | missing header returns 403 instead of 401 | 7 | Hidden |
| 5 | `models/Issue.js` `findByStatus` | filters on `state` instead of `status` | 2 | Hidden |
| 6 | `issueController.getIssue` | comments sorted newest first | 4 | Hidden |
| 7 | `utils/moderation.js` | compares words without lowercasing | 9 | Hidden |
| 8 | `commentController.addComment` | `violationCount` incremented but the user never saved | 8, 10 | Ticket ("strikes aren't counted") |
| 9 | `commentController.addComment` | flag threshold `violationCount > 3` instead of `>= 3` | 10 | Hidden |
| 10 | `commentController.updateComment` | moderation not called on edit | 12 | Hidden |

(Test 11 guards the flagged-user check on the reference. If an extra bug is wanted later: the flagged check runs after moderation, so a flagged user with a clean comment gets through.)

Ticket wording: "Comments are broken. New comments don't appear on issues, edits don't show up, and users who post abusive content aren't being given strikes."

</details>

---

## 5. Bug-pattern library

Use these to adapt Section 4, or to build more scenarios later (e.g. password reset with a 30-second code expiry, movie watch-lists, review moderation, a feature-add task like rate limiting). Each pattern is a mistake real developers make in Express + Mongoose code, and most match what candidates report from the real assessment.

**Persistence and state**
- **P1 Never saved:** a document is built or modified but `save()` (or `create`) is never called, or not awaited. Returns success anyway.
- **P2 Lean copy:** loaded with `.lean()` (a plain object), modified, and "saved" by nothing.
- **P3 Not linked:** a child document is saved but never attached to its parent (`issue.comments.push(...)` missing, or the parent not saved).
- **P4 Stale return:** `findByIdAndUpdate` without `{ new: true }` returns the old document.
- **P5 Half a transaction:** one side of a paired update is saved (lender debited) and the other isn't (borrower never credited).
- **P6 Counter drift:** `$inc` with the wrong sign, or a count updated on one path (follow) and not the reverse (unfollow).

**Queries and model statics**
- **P7 Missing filter:** the ownership/author filter dropped (everyone's data).
- **P8 Wrong filter value or field:** `status: 'funded'` instead of `'open'`; `state` instead of `status`; `published` missing.
- **P9 Case sensitivity:** exact string match or a regex without `'i'`; stored lowercase, queried as typed.
- **P10 Sort direction:** `1` vs `-1`.
- **P11 Populate mistakes:** missing `populate`, wrong path, or wrong field list (leaks `password`, or omits `name`).
- **P12 Missing `$in`:** filtering by a list of IDs done wrong, returning everything.

**Request handling**
- **P13 Wrong source:** `req.params` vs `req.query` vs `req.body`; wrong field name (`price` vs `pricePerDay`); missing destructure.
- **P14 Type confusion:** a number arriving as a string ("500" + 1000 = "1000500"); `parseInt` missing.
- **P15 ObjectId comparison:** `doc.owner === userId` is always false; needs `.toString()` or `.equals()`.
- **P16 Inverted condition:** `===` vs `!==`, `<` vs `<=`, `>` vs `>=` in ownership, balance, threshold or boundary checks.
- **P17 Assignment in a condition:** `if (user.role = 'admin')`.
- **P18 Missing guard:** no existence, duplicate, ownership or balance check before acting.
- **P19 Guard in the wrong order:** a check that should block first runs after the work (flagged users still get through).

**Responses and contracts**
- **P20 Wrong status code:** 200 vs 201, 401 vs 403, 400 vs 409.
- **P21 Wrong or missing message:** the README's exact text not matched.
- **P22 Missing wrapper:** `{ message }` without the `{ item }` the contract requires.
- **P23 Leaked fields:** `password` returned because `toPublicProfile()` was skipped.
- **P24 Double response:** `res.status(...).json(...)` without `return`, followed by another response ("headers already sent" in the logs).

**Wiring**
- **P25 Route order:** a parameter route (`/:id`) registered before a literal one (`/my-posts`).
- **P26 Wrong mount path:** `app.use('/api/car', ...)`.
- **P27 Middleware not applied or not calling `next()`:** requests hang (the test times out) or skip auth.
- **P28 Missing `express.json()`:** every `req.body` is undefined.

**Logic and maths**
- **P29 Off-by-one:** inclusive vs exclusive day counts, `limit + 1`, `slice(0, 10)` vs `slice(0, 9)`.
- **P30 Units:** percent used as a fraction; seconds vs milliseconds (a 30-second expiry written as `30` ms); dates compared as strings.
- **P31 Deduplication:** one notification per pair instead of per user; duplicates allowed in an array (`$push` vs `$addToSet`).
- **P32 Helper bug:** the business rule is right in the controller, but the helper it calls (`utils/…`) is wrong.

---

## 6. Phase 2: tutor mode (`CLAUDE.md` in each scenario)

Praise will start Claude Code **inside a scenario folder** (`cd scenarios/01-blog`, then `claude`). Claude Code automatically reads that folder's `CLAUDE.md`, so the tutor rules go there. Write this into every scenario, adjusting the scenario name:

```markdown
# You are the assessment's AI assistant, not a pair programmer

Praise is practising for the Amazon online assessment's code repository question under exam conditions. You play the role of the assessment's built-in AI assistant, which "can help with syntax, concepts and question clarification" and "is designed not to provide full solutions".

## You may
- Explain how the app is structured and how a request flows through it (route → middleware → controller → helper → model → database → response).
- Explain what a piece of code does, line by line, and what a test is checking.
- Explain error messages, stack traces and assertion failures, and what kind of problem they usually indicate.
- Answer JavaScript / Express / Mongoose / Mocha / Chai syntax and concept questions in general terms, with small generic examples that are NOT the fix (e.g. how `populate` works, how Express matches routes in order, why `===` fails on ObjectIds in general).
- Help localise a problem to a layer, file or function, or ask a leading question ("What does this function return if…?", "Which line actually writes to the database?").
- Say that an area looks worth a closer look, without saying what's wrong with it.
- Confirm or deny a diagnosis Praise states in his own words, and explain why.
- Help with the syntax of a fix he has already described in his own words.

## Scope
- You have full access to this scenario's codebase and may browse or search it on your own to answer his questions — if he pastes code, an error, or a test name, find where it lives and read the surrounding context without being asked. Referencing files with @ is encouraged because it pulls your focus faster, but it is never required.
- Browse in service of his questions only. Don't sweep the repo uninvited to work out or compile what's broken — finding the bugs is his job.

## You must not
- Edit, create or delete any file, or run commands that change files. (Running `npm test` or reading a referenced file when asked is fine.)
- Write the corrected code for a bug, or state the exact line and the exact change.
- List the bugs, count them, or summarise "what's broken" across the codebase.
- Read anything outside this scenario folder (never open `../../answer-keys/`), or use git history.
- Suggest editing read-only files (see PROJECT_FILES_INSTRUCTIONS.md), including tests.

## Escalation
If he's been stuck on the same test for about 10 minutes and asks for more help, go one step more specific each time he asks: layer → file → function → the relevant few lines → what that code should be doing, in words. Never the code itself.

## When he says "debrief" (or "stop" / "time's up")
Switch to coach mode: discuss every bug openly, compare his fixes to the intended ones, point out anything he missed (especially bugs the ticket didn't mention), and summarise the patterns worth remembering. You may read the answer key for this scenario at that point. Then append a short entry to `../../answer-keys/PROGRESS.md` (date, scenario, time taken, tests passed, bugs missed with their pattern IDs, what slowed him down). This is the only file you may write, and only during a debrief.

Keep answers short: this is a timed exam.
```

Note for Praise: these are strong instructions, but Claude Code can technically read anything on your machine. The hiding in Section 3.7 (single commit, answer keys and this spec outside the scenarios, no hint comments) is what really keeps it fair. Don't open `answer-keys/` until you've finished a scenario.

## 7. How Praise runs a practice session (contents for `HOW_TO_PRACTICE.md`)

Write this, spoiler-free, into `oa-q2-lab/HOW_TO_PRACTICE.md`:

1. **No database to install.** The lab runs MongoDB in memory automatically. The first setup downloads it once (needs internet).
2. **First time only in a scenario:** `cd scenarios/01-blog`, then `npm run setup`.
3. Open the scenario folder in VS Code. Read `QUESTION.md`, `README.md` and `PROJECT_FILES_INSTRUCTIONS.md`.
4. **Start a timer.** Real-exam simulation: 60 minutes (a strong result is 6–7 of 10 bugs; that's roughly the real load). Deep practice: 90 minutes, aiming for all 10.
5. **Terminal 1:** `npm start` **first**. It starts the in-memory database, seeds it and runs the app; watch the backend logs here while you use the app at `localhost:3000` (log in as `john@example.com` / `password123`). **Terminal 2:** `npm test` (rerun after each fix; `npm run test:one -- "part of a test name"` for one test). **Terminal 3:** `claude`, your AI assistant; reference files with `@backend/controllers/...`. Restarting `npm start` resets the app's data.
6. When time's up, write down your score (tests passing), then tell Claude Code "debrief". Only then open `answer-keys/<scenario>.md`.
7. **Retry later from scratch:** `git checkout . && git clean -fd` inside the scenario folder restores the buggy version (your `node_modules` are kept). Retrying a scenario a few days later, at 60 minutes, is a good speed drill.
8. Suggested order: 01 (closest to the sample) → 02 → 03 → 04 → 05.
9. **Want more?** In the lab root, start Claude Code and say "build me a new scenario" (optionally with a theme and a difficulty: standard, hard or exam). Then practise it in a fresh Claude Code session inside the new scenario's folder.

---

## 8. Generating new scenarios on demand

After the five core scenarios, Praise can ask for fresh ones at any time. When he asks for a new scenario (e.g. "build me a new scenario" or "new scenario: password reset, hard"), follow this procedure.

**Before building:**
1. Read `answer-keys/BUILD_SPEC.md` and every existing `answer-keys/*.md`, so the new scenario doesn't repeat an app theme or reuse the same bug in the same place.
2. Choose the domain: Praise's request if he gave one; otherwise pick one not yet used from this list: password reset with a 30-second code expiry; movie watch-lists (create/delete lists, add/remove movies, duplicates, bulk add then remove); product reviews with content moderation and strike counts; return requests with a fraud risk score (thresholds and weights); warehouse inventory (stock in/out, low-stock alerts, never below zero); restaurant table reservations (time-slot overlaps, party size limits); event ticketing (capacity, waitlist, refunds); course enrolment (prerequisites, seat limits, drop deadlines); expense splitting between friends (balances, settle-up); gym class bookings (credits, cancellation window).
3. Choose the difficulty: **standard** (default; matches Section 3.8), **hard** (more bugs in helpers and statics, two masking pairs, three hidden bugs), or **exam** (6–7 bugs, the realistic load, for timed 60-minute simulations).
4. Pick bugs from the Section 5 pattern library, covering at least 6 different patterns and following every rule in 3.8. Check `answer-keys/PROGRESS.md` first and prefer patterns Praise has missed before.

**Building:** follow Sections 3.2–3.9 exactly, as for the core scenarios (working version first, 12 tests passing three runs in a row, plant bugs one at a time, answer key and patch, single-commit history, `CLAUDE.md`, read-only files, checklist). Number new scenarios in sequence (`06-password-reset`, `07-watch-lists`, …) and add them to `HOW_TO_PRACTICE.md`.

**Spoiler rule:** Praise must not learn the bugs from the build conversation. Write the bug list only into `answer-keys/`, never into chat. When reporting, say only: the scenario name, the ticket's one-line summary, the difficulty, and how many tests fail. Recommend he practises the new scenario in a fresh Claude Code session started inside the scenario folder, so the tutor has no memory of building it.

**Feedback loop:** after each debrief, the tutor appends a short entry to `answer-keys/PROGRESS.md`: date, scenario, time taken, tests passed, bugs missed (with their pattern IDs), and what slowed him down. When generating new scenarios, favour the patterns listed under bugs missed, so practice targets his weak spots.

---

## Appendix A: reference captured from the real sample test

Everything below was transcribed from screenshots of the official HackerRank sample (Node.js stack). The builds in Section 3 must match this structure and style.

### A1. Stack (confirmed)

- **MERN**: MongoDB, Express, React, Node.js (README title: "Blog Platform(MERN): Post Creation").
- **Frontend**: React with `react-router-dom` (Routes, Route, Navigate), `react-hot-toast` (Toaster), Tailwind CSS (`tailwind.config.js`, `postcss.config.js`). Create React App style layout (`public/`, `src/index.js`).
- **Database**: a real local MongoDB at `127.0.0.1:27017` (started by `setup.sh`), not in-memory. The tests reset it by running `node utils/seed.js` before each test and after the suite. The lab keeps these files unchanged but runs MongoDB in memory on the same port (see Section 3.6).

### A2. Repository layout

```
challenge/
├── backend/
│   ├── config/
│   │   └── database.js         (read-only)
│   ├── controllers/
│   │   ├── authController.js
│   │   └── postController.js
│   ├── data/                   seed data (both files locked: read-only)
│   │   ├── posts.js
│   │   └── users.js
│   ├── models/
│   │   ├── Post.js
│   │   └── User.js
│   ├── node_modules/
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── postRoutes.js
│   ├── test/
│   │   ├── app.spec.js         the graded tests (locked: read-only)
│   │   └── mocha.opts          (read-only)
│   ├── utils/
│   │   └── seed.js             (locked in the editor)
│   ├── app.js
│   ├── config.json
│   ├── normalize-report.mjs    grading harness (don't need to replicate)
│   ├── render_report.mjs       grading harness
│   ├── run_graded.mjs          grading harness
│   ├── test-setup.js
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/  LoadingSpinner.js, Navbar.js, PostCard.js
│   │   ├── context/     AuthContext (TODO: contents)
│   │   ├── pages/       CreatePostPage, EditPostPage, HomePage, LoginPage, MyPostsPage, PostDetailPage
│   │   ├── utils/       api.js, baseURL.js
│   │   ├── App.css, App.js, index.css, index.js
│   ├── package.json
│   ├── postcss.config.js
│   └── tailwind.config.js
├── output/                     (likely where the grader writes reports)
├── .gitignore
├── .prettierrc
├── babel.config.json
├── package.json
├── PROJECT_FILES_INSTRUCTIONS.md
├── README.md
└── setup.sh
```

**Module style:** ES modules throughout (`import … from '../models/Post.js'`, `export const …`, `export default router`). Imports include the `.js` extension.

**Testing:** Mocha (`test/mocha.opts`, `app.spec.js`). The failure message `expected Response{…} to have status code 201 but got 500` is Chai + chai-http style (`expect(res).to.have.status(201)`).

### A3. Question format (as presented)

- Heading: **"Issue: <feature name>"**, e.g. "Issue: Post Creation".
- One-paragraph description of the app, then what's broken from a user's point of view.
- **Steps to Reproduce**: log in with seeded credentials, click through the UI, observe the failure, with annotated screenshots.
- Expected behaviour stated (e.g. the post should appear right away in "My Posts").
- "Your task is to fix this backend issue. Refer to the README.md file for more details."
- "**Note:** The acceptance criteria for this task require that your solution pass all predefined unit tests."

### A4. README format

- Title: `<App name>(MERN): <Feature>`.
- **Overview**: same issue description.
- **Expected API Behavior**: one section per endpoint with Purpose, Request Headers, Request Body, Success Response (with status code) and field-by-field comments.
- **Additional Information**: bullet-point business rules the fix must satisfy.

### A5. Domain: blog platform (sample app)

**Seeded user:** John Doe, `john@example.com` / `password123`.

**Auth:** header `x-user-id` containing the user's MongoDB ObjectId (no JWT seen so far).

**Categories:** Technology, Lifestyle, Travel, Food, Business, Health, Education, Entertainment.

**UI:** dark theme, purple accent. Navbar with All Posts, My Posts, Write, user avatar, logout. Home: "Discover Stories", search box, category filter chips, post cards (category badge, read time, title, excerpt, author, date, tags). My Posts: list with edit and delete icons, "Write New Post" button. Create Post form: Title*, Category* (select), Tags (comma-separated), Excerpt (optional, 0/150 counter), Content* (Markdown supported).

**Read-only files** (from `PROJECT_FILES_INSTRUCTIONS.md`): "The following files are marked read-only. You cannot edit these files in the editor; however, it is possible from the terminal. You must not modify or delete these files because doing so results in a zero score."

- README.md
- backend/config/database.js
- backend/data/posts.js
- backend/data/users.js
- backend/test/app.spec.js
- backend/test/mocha.opts
- setup.sh

(`backend/utils/seed.js` also shows a lock icon in the editor.) The fix always goes in the application code. The practice repo should ship the same `PROJECT_FILES_INSTRUCTIONS.md` and `chmod 444` these files.

#### Seed data

**Users** (`data/users.js`, `export const users = [...]`), all with password `password123`:

| Name | Email | Bio |
|---|---|---|
| John Doe | john@example.com | Tech enthusiast and software developer passionate about building great products. |
| Sarah Johnson | sarah@example.com | Travel blogger exploring the world one destination at a time. |
| Mike Chen | mike@example.com | Food critic and culinary explorer. Always looking for the next great meal. |
| Emma Wilson | emma@example.com | Lifestyle blogger sharing tips on wellness, mindfulness, and personal growth. |

**Posts** (`data/posts.js`, `export const posts = [...]`), grouped by comments (`// John's posts (primary user)`, `// Sarah's posts`, `// Mike's posts`, presumably Emma's). The objects have **no author field**, so `utils/seed.js` must assign authors when inserting (TODO: confirm how). Each post has `title`, a long Markdown `content` (template literal with `##` headings, lists, code fences), `excerpt`, `category`, `tags` (4 strings), `readTime`.

| Author | Title | Category | readTime | Tags |
|---|---|---|---|---|
| John | Getting Started with React Hooks | Technology | 8 | React, JavaScript, Web Development, Hooks |
| John | The Future of Web Development | Technology | 10 | Web Development, AI, Future Tech, WebAssembly |
| John | Building Scalable Microservices | Technology | 12 | Microservices, Architecture, Backend, Scalability |
| Sarah | Hidden Gems of Southeast Asia | Travel | 7 | Travel, Southeast Asia, Adventure, Backpacking |
| Sarah | Solo Travel: Self-Discovery | Travel | 6 | Travel, Adventure, Personal Growth, Tips |
| Mike | The Art of Perfect Pasta | Food | ? | ? |
| Emma | (not seen) | Lifestyle? | | |

John owning several posts while other users own others is what makes "My Posts" and ownership (403) bugs testable.

#### Frontend routes (`App.js`)

| Path | Page | Guard |
|---|---|---|
| /login | LoginPage | redirects to / if logged in |
| / | HomePage | requires user |
| /my-posts | MyPostsPage | requires user |
| /create | CreatePostPage | requires user |
| /edit/:id | EditPostPage | requires user |
| /post/:id | PostDetailPage | requires user |

`Toaster` at top-center, dark styling (`#0F0F11` background, `#F5F5F6` text, `#27272A` border; success icon `#12B76A`, error icon `#F04438`).

#### Models (`backend/models/`)

**Post.js**

```js
const postSchema = new mongoose.Schema({
  title:    { type: String, required: true, trim: true },
  content:  { type: String, required: true },
  excerpt:  { type: String, trim: true },                       // no default
  author:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true,
              enum: ['Technology','Lifestyle','Travel','Food','Business','Health','Education','Entertainment'] },
  tags:     [{ type: String /* lines 38–42 not captured, likely trim */ }],
  readTime: { type: Number, default: 5 },
  published:{ type: Boolean, default: true }
}, { timestamps: true, collection: 'posts' });

postSchema.statics.findAll = function () {
  return this.find({ published: true }).populate('author', 'name email bio').sort({ createdAt: -1 });
};
postSchema.statics.findByAuthor = function (authorId) {
  return this.find({ author: authorId }).populate('author', 'name email bio').sort({ createdAt: -1 });
};
postSchema.statics.findByCategory = function (category) {
  return this.find({ category, published: true }).populate('author', 'name email bio').sort({ createdAt: -1 });
};

export default mongoose.model('Post', postSchema);
```

Notes for bug design:
- The statics are a clean place to plant **query bugs**: drop the `author` filter in `findByAuthor` (everyone's posts in "My Posts", like the car-hire bug), drop `published: true` from `findAll` (drafts leak), flip the sort, or populate the wrong fields (leaking `password`).
- `findByCategory` exists but no route uses it. A realistic "missing feature" task is wiring up a `?category=` filter.
- Two different `readTime` defaults (schema says 5, controller computes words/200), which could be a source of expected-value mismatches.

**User.js**

```js
const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, trim: true, lowercase: true,
              match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'] },
  password: { type: String, required: true },                   // plain text, no hashing
  bio:      { type: String, default: '' }
}, { timestamps: true, collection: 'users' });

userSchema.statics.findByEmail = function (email) { return this.findOne({ email }); };
userSchema.methods.toPublicProfile = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

export default mongoose.model('User', userSchema);
```

Notes: passwords are compared as plain text (keep it that way, since hashing isn't what's being tested). `toPublicProfile` removing `password` is a prime spot for a "login response leaks password" bug.

#### Server (`backend/app.js`)

```js
import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import dotenv from 'dotenv';
import connectDatabase from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';

const PORT = process.env.PORT || 8080;
const app = express();
dotenv.config();

connectDatabase().catch((err) => { console.error('Database connection failed:', err); process.exit(1); });

app.use(express.json());
app.use(cors());
app.get('/', (req, res) => res.send('Blog Platform Backend is running successfully!'));
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({ message: `${field} already exists` });
  }
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid ID format' });
  res.status(err.status || 500).send(err.message || 'Internal Server Error');
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Backend server is running on port: ${PORT}`));
}

export default app;   // imported by the tests
```

Notes:
- Port **8080**. The app only listens outside tests, and tests import `app` directly (chai-http / supertest style).
- The global error handler exists, but controllers catch their own errors and return 500, so it mostly handles errors from code without try/catch. Realistic bugs: removing `express.json()` (every `req.body` is undefined), mounting a router on the wrong prefix, or a controller that throws a ValidationError into its own catch (500 instead of 400).
- `connectDatabase` lives in `config/database.js` (TODO: likely `mongodb-memory-server` plus seeding).

#### Database connection (`backend/config/database.js`, read-only)

```js
import mongoose from 'mongoose';
const dbName = process.env.NODE_ENV === 'test' ? 'BlogPlatformDB_Test_2229518' : 'BlogPlatformDB';
const fallback = `mongodb://127.0.0.1:27017/${dbName}?directConnection=true&serverSelectionTimeoutMS=2000`;
const connectionString = process.env.NODE_ENV === 'test' ? fallback : process.env.MONGODB_URI || fallback;

const connectDatabase = async () => {
  try {
    await mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log(`Connected to MongoDB with Mongoose (Database: ${dbName})`);
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};
export default connectDatabase;
```

#### Seeding (`backend/utils/seed.js`)

Same `dbName` / `connectionString` logic, then:

1. `mongoose.connect(...)`, log "Connected to MongoDB".
2. `User.deleteMany({})`, `Post.deleteMany({})`, log "Cleared existing data".
3. `User.insertMany(users)`, log "Created N users".
4. Assign authors **by array index**: index 0–2 → John, 3–4 → Sarah, 5–6 → Mike, 7+ → Emma (`author: createdUsers[authorIndex]._id`). So there are at least 8 seed posts.
5. `Post.insertMany(postsWithAuthors)`, log "Created N posts", "Database seeded successfully!", `process.exit(0)`. On error: log and `process.exit(1)`.
6. The file calls `seedDatabase()` at the bottom, so it runs as a script.

#### Auth (`backend/controllers/authController.js`)

```js
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.password !== password) return res.status(401).json({ message: 'Invalid credentials' });
    const userProfile = user.toPublicProfile();
    res.status(200).json({ message: 'Login successful', user: userProfile });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ user: user.toPublicProfile() });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
```

`authRoutes.js` wasn't captured. Assume `router.post('/login', login)` and `router.get('/me', getCurrentUser)`.

#### Tests (`backend/test/app.spec.js`, read-only, full)

```js
/* eslint-disable no-undef */
import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../app.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import { exec } from 'child_process';

chai.use(chaiHttp);
const { expect } = chai;

const seedDatabase = () => new Promise((resolve, reject) => {
  exec('node utils/seed.js', (error, stdout, stderr) => { if (error) reject(error); else resolve(stdout); });
});

const getUserId = async () => {
  const user = await User.findByEmail('john@example.com');
  return user._id.toString();
};

describe('Post Creation Testing', () => {
  let userId, response;

  it('should create a post with expected response structure and values', async () => {
    await seedDatabase();
    userId = await getUserId();
    const postData = {
      title: 'Test Blog Post',
      content: 'This is a test blog post content with some sample text for testing purposes.',
      excerpt: 'This is a test excerpt',
      category: 'Technology',
      tags: ['test', 'blog', 'sample'],
      readTime: 5
    };
    response = await chai.request(app).post('/api/posts').set('x-user-id', userId).send(postData);

    expect(response).to.have.status(201);
    expect(response.body).to.have.property('message', 'Post created successfully');
    expect(response.body).to.have.property('post');
    const post = response.body.post;
    expect(post).to.have.property('title', postData.title);
    expect(post).to.have.property('content', postData.content);
    expect(post).to.have.property('excerpt', postData.excerpt);
    expect(post).to.have.property('category', postData.category);
    expect(post.tags).to.deep.equal(postData.tags);
    expect(post).to.have.property('readTime', postData.readTime);
    expect(post).to.have.property('published', true);
    expect(post).to.have.property('author');
    expect(post.author).to.have.property('_id', userId);
    expect(post.author).to.have.property('name', 'John Doe');
    expect(post.author).to.have.property('email', 'john@example.com');
    expect(post.author).to.have.property('bio');
  }).timeout(10000);

  it('should save the created post to the database', async () => {
    await seedDatabase();
    userId = await getUserId();
    const postData = {
      title: 'Test Blog Post 2',
      content: 'This is a test blog post content with different sample text for testing purposes.',
      excerpt: 'This is another test excerpt',
      category: 'Travel',
      tags: ['testing', 'blogs', 'sample'],
      readTime: 3
    };
    const createResponse = await chai.request(app).post('/api/posts').set('x-user-id', userId).send(postData);
    expect(createResponse).to.have.status(201);
    const createdPostId = createResponse.body.post._id;
    const savedPost = await Post.findById(createdPostId);
    expect(savedPost).to.not.be.null;
    expect(savedPost.title).to.equal(postData.title);
    // … same field checks on savedPost, published === true, has author …

    const userPostsResponse = await chai.request(app).get('/api/posts/my-posts').set('x-user-id', userId);
    expect(userPostsResponse).to.have.status(200);
    expect(userPostsResponse.body.posts).to.be.an('array');
    const foundPost = userPostsResponse.body.posts.find((p) => p._id === createdPostId);
    expect(foundPost).to.not.be.undefined;
    expect(foundPost.title).to.equal(postData.title);
  }).timeout(10000);
});

after(async function () {
  this.timeout(10000);
  await seedDatabase();
});
```

Test-writing conventions to copy:
- `describe('<Feature> Testing')`, `it('should …')`, `.timeout(10000)` on each test.
- Every test reseeds first, then looks up John's ID by email and sends it as `x-user-id`.
- Checks status, then `message`, then the wrapper property, then field-by-field values, including populated `author` fields.
- The second test **crosses endpoints**: create via POST, verify directly in the DB via the model, then verify via another GET endpoint. That's how one planted bug in a different route (e.g. `findByAuthor`) can fail a "create" test.
- Tests always send an excerpt and readTime, which is why the unenforced excerpt default never surfaced.

`mocha.opts` (read-only): `--reporter mocha-multi-reporters` / `--reporter-options configFile=config.json` (the grader's reporter; the practice repo can use the default `spec` reporter).

#### Root `package.json`

```json
{
  "name": "blog-platform-mern",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "backend": "cd backend && npm start",
    "frontend": "cd frontend && npm start",
    "prestart": "bash setup.sh",
    "start": "concurrently \"npm run backend\" \"npm run frontend\"",
    "seed": "cd backend && node utils/seed.js",
    "test": "cd backend && npm run test"
  },
  "dependencies": { "concurrently": "7.6.0" }
}
```

#### `setup.sh` (read-only)

Starts `mongod --config /etc/mongod.conf --fork` if `pgrep mongod` finds nothing (warns if it can't), runs `npm install` in root, backend and frontend, runs `node utils/seed.js` from `backend`, then prints "Setup complete!" and "To start the application, run: npm start".

#### API (from `frontend/src/utils/api.js` and `backend/routes/postRoutes.js`)

Frontend: `API_BASE_URL = ${baseURL}/api`. `getAuthHeaders()` reads `user` from `localStorage`, sends `Content-Type: application/json` and `x-user-id: user._id`. Every call throws on `!response.ok`, using `error.message` from the JSON body where available.

| Method | Path | Controller | Auth header |
|---|---|---|---|
| POST | /api/auth/login | authController (TODO) | no |
| GET | /api/posts | getAllPosts | no |
| GET | /api/posts/my-posts | getMyPosts | yes |
| GET | /api/posts/:id | getPostById | yes (sent, not checked) |
| POST | /api/posts | createPost | yes |
| PUT | /api/posts/:id | updatePost | yes |
| DELETE | /api/posts/:id | deletePost | yes |

Route order matters: `/my-posts` is registered before `/:id`. Swapping them is a realistic bug.

#### Controller conventions (from `postController.js`)

Every handler follows the same shape, which makes deviations easy to spot and easy to plant:

```js
export const handler = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid post ID' });
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== userId) return res.status(403).json({ message: 'Not authorized to … this post' });
    // … work …
    res.status(200).json({ message: '…', post });
  } catch (error) {
    console.error('<Action> error:', error);
    res.status(500).json({ message: 'Server error …' });
  }
};
```

- Responses always wrap data: `{ posts }`, `{ post }`, `{ message, post }`.
- Status codes: 200 read/update/delete, 201 create, 400 validation or bad ID, 401 no header, 403 not the owner, 404 missing, 500 caught error.
- `populate('author', 'name email bio')` on returned posts.
- `readTime` default: `Math.ceil(content.split(' ').length / 200)`.
- `updatePost` only overwrites fields that were sent (`if (title)`, `if (excerpt !== undefined)` …), then `save()` and `populate()`.
- `deletePost` uses `Post.findByIdAndDelete(id)`.
- `getAllPosts` calls `Post.findAll()` and `getMyPosts` calls `Post.findByAuthor(userId)`. Both are **custom statics on the Post model** (confirmed, see below).

#### POST /api/posts request and response

Headers: `x-user-id`, `Content-Type: application/json`

Request body:

| Field | Type | Rule |
|---|---|---|
| title | string | required |
| content | string | required |
| excerpt | string | optional |
| category | string | required |
| tags | string[] | optional |
| readTime | number | optional |

Success **201**:

```json
{
  "message": "Post created successfully",
  "post": {
    "_id": "ObjectId",
    "title": "…", "content": "…",
    "excerpt": "provided or auto-generated",
    "category": "…",
    "tags": ["provided or empty array"],
    "readTime": 5,
    "published": true,
    "author": { "_id": "…", "name": "…", "email": "…", "bio": "…" },
    "createdAt": "ISO", "updatedAt": "ISO"
  }
}
```

Business rules (README "Additional Information"):
- The post must be saved to the database when created.
- `published` is always `true` on creation.
- If no excerpt is provided, use the first 150 characters of the content.
- `author` is populated with the user's `_id`, `name`, `email` and `bio`.
- Restarting the server or running the tests resets the database.

Note: the frontend falls back to `content.substring(0, 150)` for the excerpt, but **neither the backend controller nor the Post model does** (the schema has no excerpt default). This README rule isn't enforced by the backend at all, so the sample's tests evidently didn't check it. The practice repo should test this rule directly. `published: true` is satisfied by the schema default.

#### The sample's planted bugs (all in `createPost`)

1. **Missing destructure:** `title`, `content`, `excerpt`, `category`, `tags`, `readTime` were used but never taken from `req.body`, causing a ReferenceError and a 500. Found via the server terminal log (`Create post error: … title is not defined`).
2. **`await post.this.save()`** instead of `await post.save()`, a TypeError that also gives a 500.
3. **Response missing `post`:** `res.status(201).json({ message })` with no `post` field.

#### Tests (sample)

Panel tabs: **AI Assistant | Preview | Test Cases**. Header "2 tests ran", "0 passed", "2 failed".

- `Post Creation Testing should create a post with expected response structure and values`
- `Post Creation Testing should save the created post to the database`

Both failed first with `expected Response{…} to have status code 201 but got 500`. After the controller fix, the structure test failed on the missing `post` property.

#### How Praise solved it (the workflow to train)

1. Ran the tests and saw a 500 on both.
2. Launched the app and **read the server terminal**. Every catch block does `console.error('<Action> error:', error)`, so the real exception is printed there. That pointed straight at `createPost`.
3. Fixed the destructure and save, then reran. The new failure named the missing `post` field, so fixed the response.
4. Used the AI assistant to explain the data flow, flag suspicious lines, and help with JavaScript syntax. It wouldn't give the answer outright.

Result: all tests passing with 30 minutes left.


### A6. Details not captured (use sensible defaults)

- `backend/package.json`: exact mocha / chai / chai-http / mongoose versions and scripts. Use the versions in Section 3.5.
- `backend/test-setup.js` and `config.json` (grader reporter config): not needed for the lab.
- `backend/routes/authRoutes.js`: assume `router.post('/login', login)` and `router.get('/me', getCurrentUser)`.
- `babel.config.json`, frontend `package.json`, `context/AuthContext.js`: standard CRA setup; `AuthContext` stores the logged-in user in `localStorage` under `user` (that's what `api.js` reads).
- `normalize-report.mjs`, `render_report.mjs`, `run_graded.mjs`: HackerRank's grading harness. Don't replicate.

# Question-2

A practice lab for the **Amazon online assessment's "code repository" question** (Question 2): you're dropped into a working full-stack app with a bug ticket, a read-only test suite, and an AI assistant that helps *around* the answer but never hands it over. Fix the backend until all 12 tests pass.

Each scenario is a complete, standalone MERN app (MongoDB, Express, React, Node) modelled on the official HackerRank sample — same structure, same conventions, same `x-user-id` auth, same test style. Three of them are based on real assessments people actually sat.

## Scenarios

| Scenario | App | Ticket |
|---|---|---|
| `scenarios/01-blog` | Blog Platform | "Managing Posts" — My Posts won't load, edits don't save, deletes hit the wrong post |
| `scenarios/02-car-hire` | Car Hire | "Listings and Bookings" — nothing car-related loads, new listings vanish, edits don't stick |
| `scenarios/03-actor-follow` | Actor Follow | "Follows and Notifications" — follows don't stick, counts go the wrong way, wrong movies in the feed |

Suggested order: 01 → 02 → 03. Each is a fresh 60–90 minute sitting.

## Requirements

- **Node 20 LTS** (the lab uses Node's built-in `--watch`, so 18.11+ minimum; 20 recommended)
- **No database to install.** An in-memory MongoDB is downloaded once on first setup (~100 MB, cached in your home folder) and started automatically.
- Internet for the first setup only.
- Ports **8080** (backend), **3000** (frontend) and **27017** (database) free. Run one scenario at a time — they share these ports.

## Setup (per scenario, once)

```bash
cd scenarios/01-blog
bash ../../init-scenario.sh        # Windows PowerShell: ..\..\init-scenario.ps1
```

That installs dependencies, pre-downloads the database, creates the local git baseline used by `make reset`, and marks the read-only files. It takes a few minutes the first time.

> Git can't store read-only flags or each scenario's reset baseline, which is why this script exists instead of setup being just `npm install`.

## Running a scenario

1. Read `QUESTION.md` (the bug ticket), `README.md` (the app + the exact API contract the tests grade against) and `PROJECT_FILES_INSTRUCTIONS.md` (files you must not edit — editing them is a zero in the real thing).
2. **Start a timer.** 60 minutes to simulate the exam; 90 for a thorough run.
3. Three terminals:
   - `make start` — backend + frontend. App at http://localhost:3000, log in as `john@example.com` / `password123`. Watch this terminal: every controller logs its real errors here. **Backend edits apply automatically** (the server restarts itself; the database stays up), and frontend edits hot-reload — same as the real assessment environment.
   - `make test` — the graded suite, with your score at the end. Rerun after each fix. `make test-one t="part of a test name"` for a single test.
   - `claude` (optional) — the exam-style AI assistant. See below.
4. Fix bugs in the editable backend files only. `make save` commits your progress so you can experiment; `make reset` restores the original starting code.
5. When time's up, note your score, then tell the assistant **"debrief"** for a full review. Only then open `answer-keys/`.

`make` on its own lists every command.

## The AI assistant

Each scenario ships a `CLAUDE.md`, so a [Claude Code](https://claude.com/claude-code) session started **inside the scenario folder** automatically behaves like the assessment's built-in assistant: it *"can help with syntax, concepts and question clarification"* and *"is designed not to provide full solutions."*

It will explain code, request flow, error messages and what a test is checking; locate code you paste; confirm or deny a diagnosis you state in your own words; and get one step more specific each time you ask while genuinely stuck. It won't write your fixes, name exact lines, list what's broken, or touch the answer keys — until you say **"debrief"**, when it opens up completely and reviews your run.

It's optional. Use it as much or as little as you like.

## ⚠️ answer-keys/ contains spoilers

`answer-keys/` holds every bug, every fix, and a patch per scenario, plus `BUILD_SPEC.md` (the full build brief for the whole lab — spoilers for **all** scenarios). **Don't open any of it until you've finished and debriefed that scenario.** It's included so the debrief and "what did I miss" learning actually work.

To restore a fully working version of a scenario (e.g. to see the intended solution), from the scenario folder:

```bash
patch -p1 < ../../answer-keys/01-blog.patch    # reverse with patch -R -p1
```

## Notes

- Restarting `make start` reseeds the database, so anything you created by hand in the UI resets. Seed data is fixed and deterministic — the tests depend on exact counts.
- The tests are the real acceptance criteria. Open the test file: it's read-only but readable, and it tells you the exact endpoint, status code, message and response shape expected.
- Bugs live only in editable backend files (controllers, models, routes, middleware, helpers, `app.js`). The frontend and the read-only files are correct.

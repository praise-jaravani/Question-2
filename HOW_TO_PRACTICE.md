# How to practice

This lab recreates the Amazon online assessment's "code repository" question (Question 2): a full-stack MERN app with a bug ticket, a read-only test suite, and an AI assistant that helps around the answer but never gives it.

**Available scenarios**

| Scenario | App | Status |
|---|---|---|
| `scenarios/01-blog` | Blog Platform — "Managing Posts": writers publish, search and manage posts; My Posts, edits and deletes are misbehaving | ready |
| `scenarios/02-car-hire` | Car Hire — "Listings and Bookings": owners list cars, renters browse and book them; after a deployment, nothing car-related works | ready |
| `scenarios/03-actor-follow` | Actor Follow — "Follows and Notifications": follow actors, browse a feed of their movies, get notified on new releases; follows aren't sticking and the numbers look wrong | ready |
| `scenarios/04-loans` | Loans — peer-to-peer lending: request, fund and repay | not built yet |
| `scenarios/05-issue-tracker` | Issue Tracker — comments with content moderation and strikes | not built yet |

Each scenario folder tells you everything you need to play: `QUESTION.md` is the bug ticket (what users report, steps to reproduce, expected behaviour), `README.md` explains the app and documents the exact API contract the tests grade against, and `PROJECT_FILES_INSTRUCTIONS.md` lists the files you must not edit. None of them contain spoilers.

**Session steps**

1. **No database to install.** The lab runs MongoDB in memory automatically. The first setup downloads it once (needs internet).
2. **First time only in a scenario:** `cd scenarios/01-blog`, then `npm run setup`.
3. Open the scenario folder in VS Code. Read `QUESTION.md`, `README.md` and `PROJECT_FILES_INSTRUCTIONS.md`.
4. **Start a timer.** Real-exam simulation: 60 minutes (a strong result is 6–7 of 10 bugs; that's roughly the real load). Deep practice: 90 minutes, aiming for all 10.
5. **Terminal 1:** `npm start` (or `make start`) **first**. It starts the in-memory database, seeds it and runs the app; watch the backend logs here while you use the app at `localhost:3000` (log in as `john@example.com` / `password123`). Prefer `make backend` when you only need the backend and want its logs without the frontend noise. **Backend edits apply automatically** — the server restarts itself on save (the database and its data stay up); frontend edits hot-reload as usual. `make seed` reseeds the data without a restart. **Terminal 2:** `npm test` / `make test` (rerun after each fix — it prints your score at the end; `make test-one t="part of a test name"` for one test). **Terminal 3:** `claude`, your AI assistant. It can browse the codebase on its own — paste code, an error, or a test name and it will find where it lives; referencing files with `@backend/controllers/...` is optional but focuses it faster. Restarting `npm start` resets the app's data. `make` on its own lists every command.
6. When time's up, write down your score (tests passing), then tell Claude Code "debrief". Only then open `answer-keys/<scenario>.md`.
7. **Safety net while practising:** `make save` commits your progress so you can experiment freely. **Retry later from scratch:** `make reset` (or `git reset --hard start && git clean -fd`) inside the scenario folder restores the buggy starting code and discards progress commits (your `node_modules` are kept). Retrying a scenario a few days later, at 60 minutes, is a good speed drill.
8. Suggested order: 01 (closest to the sample) → 02 → 03 → 04 → 05.
9. **Want more?** In the lab root, start Claude Code and say "build me a new scenario" (optionally with a theme and a difficulty: standard, hard or exam). Then practise it in a fresh Claude Code session inside the new scenario's folder.

**The workflow worth training**

1. Read the issue and README. Treat the README's "Additional Information" rules as a checklist.
2. Run the tests. Note the failing test names, including ones the ticket doesn't mention.
3. Open the test file. It's read-only but readable, and it's the exact acceptance criteria: endpoint, request, status code, message, response fields.
4. Launch the app and read the server terminal. Controllers log their real errors there.
5. Trace the failing request down the layers: route → middleware → controller → helper → model/static → database → response.
6. Make the smallest fix, rerun, move on. Easiest-looking tests first. Leave 5 minutes for a final full run.
7. Use the AI assistant to explain flow, localise the problem, and help with syntax — not to hand over fixes.

**Rules for a fair run**

- Don't open `answer-keys/` until you've finished and debriefed a scenario.
- Don't edit read-only files (listed in each scenario's `PROJECT_FILES_INSTRUCTIONS.md`) — in the real exam that's a zero.
- Only run one scenario at a time (they share ports 8080/3000 and the database port).

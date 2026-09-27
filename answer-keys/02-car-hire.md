# Answer key — Scenario 02: Car Hire ("Listings and Bookings")

**SPOILERS. Do not open until after the debrief.**

- Buggy version: **0 passing / 12 failing** — by design. One wiring bug 404s every car endpoint, so the whole suite fails until it's found. After fixing that one bug alone: **3 passing / 9 failing** (guards: non-owner update 403, overlap 409, end-before-start 400).
- Restore the working version: from the scenario root, `patch -p1 < ../../answer-keys/02-car-hire.patch` (verified: 12/12, three runs in a row). Reverse with `patch -R -p1 < …`.
- Reset to the buggy start state: `make reset` (or `git reset --hard start && git clean -fd`) in the scenario folder.
- Test DB: `CarHireDB_Test_8825541`; dev DB: `CarHireDB`. In-memory MongoDB on port 27017 via `backend/devtools/` (read-only, no bugs there).

## The 10 bugs

| # | File · function | What's wrong | Tests it breaks | Ticket? | Pattern |
|---|---|---|---|---|---|
| 1 | `backend/app.js` | Car router mounted at `app.use('/api/car', …)` instead of `/api/cars` — every car endpoint 404s (Express's plain-text 404, so the frontend toasts "Something went wrong") | **all 12** | Ticket ("nothing loads") | P26 wrong mount path |
| 2 | `backend/controllers/carController.js` · `createCar` | `new Car(...)` is built and returned with 201, but `await car.save()` was removed — the listing never reaches the database. **Masks bug 3**: with no save, the validation error never fires | 1, 2 | Ticket | P1 never saved |
| 3 | `backend/controllers/carController.js` · `createCar` | Destructures `price` from the body instead of `pricePerDay` (and the required-fields check silently stopped covering the price). With bug 2 present, test 1 fails on a missing `pricePerDay` property; once bug 2 is fixed, the save throws `ValidationError: pricePerDay is required` → **500 on tests 1 and 2**, visible in the logs | 1, 2 | Ticket | P13 wrong source / field name |
| 4 | `backend/controllers/carController.js` · `updateCar` | Loads the car with `.lean()` (a plain object), assigns the new fields, returns 200 — nothing is ever saved. Response looks right; refresh loses the edit | 6 | Ticket | P2 lean copy |
| 5 | `backend/models/Car.js` · `findByOwner` | `this.find({})` — the `owner: ownerId` filter was dropped, so My Cars returns every car on the platform | 3 | Ticket | P7 missing filter |
| 6 | `backend/models/Car.js` · `findAvailable` | Filter is `{ available: false }` — the public list returns only the one unavailable car. **Masks bug 7** on the location test | 4, 5 | Hidden | P8 wrong filter value |
| 7 | `backend/models/Car.js` · `findAvailable` | Location matched with a case-sensitive exact string (`filter.location = location`) instead of a case-insensitive match — `?location=cape town` finds nothing | 5 | Hidden | P9 case sensitivity |
| 8 | `backend/controllers/carController.js` · `toggleAvailability` | Responds `201` with `{ message }` only — no `car` in the body (the toggle itself IS saved) | 8 | Hidden | P20 wrong status + P22 missing wrapper |
| 9 | `backend/controllers/bookingController.js` · `createBooking` | Nights computed with `+ 1` (inclusive-days thinking): 10th→15th prices as 6 days instead of 5 | 9 | Hidden | P29 off-by-one |
| 10 | `backend/controllers/bookingController.js` · `createBooking` | Own-car check compares `car.owner === userId` — ObjectId vs string is never equal, so owners can book their own cars | 10 | Hidden | P15 ObjectId comparison |

## Fixes (working code)

1. **Mount path** — `app.use('/api/cars', carRoutes);`
2. **createCar save** — `await car.save();` before the 201 response.
3. **createCar field** — destructure `pricePerDay` and include it in the required check:
   ```js
   const { make, model, year, pricePerDay, location, description } = req.body;
   if (!make || !model || !year || !pricePerDay || !location) { … }
   const car = new Car({ make, model, year, pricePerDay, location, … });
   ```
4. **updateCar** — drop `.lean()` and `await car.save();` before responding.
5. **findByOwner** — `return this.find({ owner: ownerId })…`
6. **findAvailable filter** — `const filter = { available: true };`
7. **findAvailable location** — `filter.location = { $regex: new RegExp(`^${location}$`, 'i') };`
8. **toggleAvailability** — `res.status(200).json({ message: 'Availability updated', car });`
9. **Nights** — `const nights = Math.round((end - start) / (1000 * 60 * 60 * 24));`
10. **Own-car check** — `if (car.owner.toString() === userId) …`

## Masking structure (by design)

- **Bug 1 masks everything:** the first thing a fresh run shows is 12 × 404/"Something went wrong". Until the mount path is fixed, no other bug is visible. Fixing it flips the board to 3 passing / 9 failing.
- **Bugs 2 → 3 (tests 1–2):** with bug 2, test 1 fails on a missing `pricePerDay` property and test 2 on `savedCar` being null. Fixing bug 2 (adding the save) turns both into **500 ValidationError** — the server log names the missing field — and fixing bug 3 clears them.
- **Bugs 6 → 7 (test 5):** with bug 6, the location test fails because nothing available matches. Fixing bug 6 reveals the case-sensitivity failure (0 results for `cape town`).

## Test-by-test after the mount fix (bug 1 fixed, others present)

| Test | Result | First failure |
|---|---|---|
| 1 create structure | FAIL | `expected {…} to have property 'pricePerDay'` (bugs 3+2) |
| 2 created car saved | FAIL | `expected null not to be null` (bug 2) |
| 3 my-cars only mine | FAIL | `expected … length of 3 but got 8` (bug 5) |
| 4 browse available only | FAIL | `length of 7 but got 1` (bug 6) |
| 5 location case-insensitive | FAIL | `length of 4 but got 0` (bugs 6, then 7) |
| 6 owner update saved | FAIL | DB value unchanged (bug 4) |
| 7 non-owner update 403 | PASS (guard) | — |
| 8 toggle returns car | FAIL | `expected 200 but got 201` (bug 8) |
| 9 booking price | FAIL | `totalPrice 2400 ≠ 2000` (bug 9) |
| 10 own-car booking 400 | FAIL | `expected 400 but got 201` (bug 10) |
| 11 overlap 409 | PASS (guard) | — |
| 12 end before start 400 | PASS (guard) | — |

Bugs are independently fixable in any order; only the designed masking above hides anything. Fixing all ten gives 12/12.

## Deviations from the build spec, for the record

- **Test 5 expects 4 Cape Town cars, not the spec table's 3.** The spec's own seed (cars 0–2 John and car 7 Emma all in Cape Town, all available) yields 4 available Cape Town cars; the seed was kept exactly as specified and the test's expected count corrected. Spec 4.2's "→ 3" is an internal inconsistency.
- Booking creation also validates the car id (400 `Invalid car ID`) and missing dates (400 `Start date and end date are required`); both documented in the README, neither tested — consistent with the controller template.
- Bug spread: carController 4 (bugs 2, 3, 4, 8), bookingController 2 (9, 10), Car.js statics 3 (5, 6, 7), app.js 1 — within 3.8's 5-per-file cap.
- Includes the lab additions from scenario 01: score reporter, Makefile harness, `start` git tag (see 01's answer key for details).

## Build verification log

- Working reference: 12/12 × 3 consecutive runs; 24-point API smoke test against the running dev server (login, browse incl. newest-first and both filter casings, my-cars, detail, create incl. exact 400 message, update own/other, toggle own/other, bookings: price 5×400=2000 with populated car, own-car 400, unavailable-car 400, bad dates 400, overlap 409, back-to-back start-on-end-date allowed 201, my-bookings populated, 401s) — all passed; frontend `react-scripts build` clean.
- Bugs planted one at a time in the order 3, 2, 4, 5, 7, 6, 8, 9, 10, 1 (masked member of each pair first; the mount bug last since it hides everything). Failing count progressed 2 → 2 (failures changed) → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 12, each step changing exactly the intended test(s).
- Patch round-trip verified: apply → 12/12 ×3 → reverse-apply → 0/12.
- Reference backend kept at `/tmp/oa-q2-ref/02-car-hire-backend` (may not survive a reboot; the `.patch` is the durable answer).
- Post-build adversarial review (4 agents: contract, spoilers, checklist, frontend): checklist clean; three minor findings fixed — BUILD_SPEC 4.2's test-5 count corrected to 4; build-time reflog/dangling-commit traces scrubbed in both scenarios (`git reflog expire --expire=now --all && git gc --prune=now`, verified empty); `required`/`min` attributes added to the List/Edit car forms and EditCarPage now omits cleared fields from the PUT payload so empty inputs can't persist `0`/`''` through the fixed backend. Frontend rebuilt clean after the change; single amended commit re-tagged `start`; buggy suite re-confirmed 0/12 and the patch still applies cleanly.

**Post-launch change (2026-09-25, Praise's request after first practice run):** the backend `start` script now runs `node --watch app.js` inside the DB wrapper, so backend edits auto-restart the server (database and data stay up; frontend hot reload unaffected). Applied to all scenarios and to BUILD_SPEC 3.4 for future ones; each repo's single `Initial commit` was amended and re-tagged `start`.

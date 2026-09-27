# Answer key — Scenario 03: Actor Follow ("Follows and Notifications")

**SPOILERS. Do not open until after the debrief.**

- Buggy version: **2 passing / 10 failing** (guards that pass: unfollow-not-followed 404, auth/me without password).
- Restore the working version: from the scenario root, `patch -p1 < ../../answer-keys/03-actor-follow.patch` (verified: 12/12, three runs in a row). Reverse with `patch -R -p1 < …`.
- Reset to the buggy start state: `make reset` (or `git reset --hard start && git clean -fd`).
- Test DB: `ActorFollowDB_Test_6203817`; dev DB: `ActorFollowDB`. In-memory MongoDB on 27017 via `backend/devtools/` (read-only, no bugs there).
- This scenario emulates **Karabo's real assessment**: bug 1 is his exact reported bug (Follow shows "Followed", nothing saved, Unfollow then says you're not following), and its fix is his described fix — take the controller's data, build the record, **save it through the model layer**, and (bug 2) **check whether a follow exists before acting**.

## The 10 bugs

| # | File · function | What's wrong | Tests it breaks | Ticket? | Pattern |
|---|---|---|---|---|---|
| 1 | `backend/controllers/followController.js` · `followActor` | `new Follow(...)` is built and returned with 201 but `await follow.save()` was removed — the follow never reaches the database. Downstream, unfollow finds nothing and says "You are not following this actor" (Karabo's exact experience). **Masks bug 4** on the unfollow test, and changes bug 2's symptom | 1, 4 | Ticket | P1 never saved |
| 2 | `backend/controllers/followController.js` · `followActor` | The existing-follow check (409) was removed. With bug 1 present, following twice returns 201 twice; once bug 1 is fixed, the duplicate save trips the unique `{user, actor}` index → **500 E11000 duplicate key** in the logs | 2 | Hidden | P18 missing guard |
| 3 | `backend/controllers/followController.js` · `followActor` | `$inc: { followerCount: -1 }` — following an actor **decrements** their follower count (counts go negative in the UI) | 3 | Ticket | P6 counter drift |
| 4 | `backend/controllers/followController.js` · `unfollowActor` | The delete filter's fields are swapped: `Follow.deleteOne({ user: actor._id, actor: userId })` matches nothing, so unfollow returns 200 "Unfollowed …" while the follow survives (and the count still decrements) | 4 | Ticket | P8 wrong filter |
| 5 | `backend/controllers/userController.js` · `getFollowing` | `.populate('actor', 'name')` dropped — each entry's `actor` is a bare ObjectId, so the Following page shows no names | 6 | Hidden | P11 populate mistakes |
| 6 | `backend/models/Movie.js` · `findForActors` | `this.find({})` — the `actors: { $in: actorIds }` filter was dropped, so the feed returns **every** movie | 7, 8 | Ticket | P12 missing $in |
| 7 | `backend/models/Movie.js` · `findForActors` | `.sort({ releaseDate: 1 })` — oldest release first instead of newest. Only fully visible once bug 6 is fixed | 8 | Hidden | P10 sort direction |
| 8 | `backend/middleware/requireAdmin.js` | `if (user.role = 'admin')` — assignment instead of comparison, always truthy, so **every** logged-in user passes the admin gate | 9 | Hidden | P17 assignment in a condition |
| 9 | `backend/utils/notify.js` · `notifyFollowers` | No per-user dedup — one notification per **follow record** instead of per follower, so a user following two of the movie's actors is notified twice | 10 | Hidden | P31 deduplication |
| 10 | `backend/controllers/notificationController.js` · `getNotifications` | `unreadCount` from `countDocuments({ user: userId })` — the `read: false` condition was dropped, so read notifications still count as unread | 11 | Hidden | P8 missing filter condition |

## Fixes (working code)

1. **followActor save** — after building the follow: `await follow.save();`
2. **Duplicate-follow guard** — before creating:
   ```js
   const existing = await Follow.findOne({ user: userId, actor: actor._id });
   if (existing) {
     return res.status(409).json({ message: 'You are already following this actor' });
   }
   ```
3. **Counter** — `$inc: { followerCount: 1 }` on follow (unfollow keeps `-1`).
4. **Unfollow delete** — `await Follow.deleteOne({ user: userId, actor: actor._id });`
5. **getFollowing** — `.populate('actor', 'name')` back on the query.
6. **findForActors filter** — `this.find({ actors: { $in: actorIds } })`.
7. **findForActors sort** — `.sort({ releaseDate: -1 })`.
8. **requireAdmin** — `if (user.role === 'admin')`.
9. **notifyFollowers dedup** — track notified user ids in a `Set` and skip repeats (one notification per follower, first followed actor's name in the message).
10. **unreadCount** — `Notification.countDocuments({ user: userId, read: false })`.

## Masking structure (by design)

- **Bug 1 masks bug 4 (test 4):** at first, unfollow fails with `expected 200 but got 404` (the API-created follow was never saved). Fixing the save reveals the silent no-op delete: 200 returned, `expected {…} to be null` on the DB check.
- **Bugs 1 ↔ 2 (test 2):** with both, following an already-followed actor returns 201 (`expected 409 but got 201`). Fixing bug 1 first turns it into a **500** whose log names `E11000 duplicate key` — the unique index doing the 409's job the hard way. Fixing bug 2 (the existence check) resolves it from either direction.
- **Bug 6 partially masks bug 7 (test 8):** while the feed returns all movies, the order failure blames the wrong data; with bug 6 fixed, test 8 isolates the ascending sort.

## Test-by-test on the buggy version

| Test | Result | First failure |
|---|---|---|
| 1 follow saved | FAIL | `expected null not to be null` (bug 1; 201 + message pass first) |
| 2 duplicate follow 409 | FAIL | `expected 409 but got 201` (bugs 1+2; after fixing 1: 500 E11000) |
| 3 follower count +1 | FAIL | `expected -1 to equal 1` (bug 3) |
| 4 unfollow removes follow | FAIL | `expected 200 but got 404` (bug 1, then bug 4) |
| 5 unfollow not-followed 404 | PASS (guard) | — |
| 6 following list names | FAIL | actor has no `name` property (bug 5) |
| 7 feed only followed | FAIL | `length of 3 but got 8` (bug 6) |
| 8 feed newest first | FAIL | `title` mismatch, oldest first (bugs 6, then 7) |
| 9 non-admin movie 403 | FAIL | `expected 403 but got 201` (bug 8) |
| 10 one notification per follower | FAIL | Sarah `length of 1 but got 2` (bug 9) |
| 11 unreadCount unread only | FAIL | `expected 3 to equal 2` (bug 10) |
| 12 auth/me no password | PASS (guard) | — |

Bugs are independently fixable in any order; only the designed masking above hides anything. Fixing all ten gives 12/12.

## Deviations from the build spec, for the record

- **Bug 4 adapted (spec 3.8 allows this):** spec 4.3's table plants "existence check inverted (404 when the follow exists)" — but a strict inversion also breaks guard test 5 (unfollowing a non-followed actor would then proceed instead of 404ing, or crash). Swapped as permitted for a P8 wrong-filter no-op delete, which breaks only test 4, keeps the guard, and stays in the same "unfollow doesn't work" symptom family.
- Spec 4.3 puts no bug in routes/`app.js`; the wiring-layer bug lives in `middleware/requireAdmin.js` (bug 8), matching the spec's own table.
- `POST /api/actors/:id/follow` and `DELETE` also validate the ObjectId (400 `Invalid actor ID`), documented in the README, untested.
- Bug spread: followController 4 (1–4), userController 1 (5), Movie.js statics 2 (6, 7), middleware 1 (8), utils 1 (9), notificationController 1 (10) — within 3.8's caps, 3 bugs in statics/helpers.
- Includes the lab additions: score reporter, Makefile harness, `start` git tag.

## Build verification log

- Working reference: 12/12 × 3 consecutive runs; 25-point API smoke test against the live dev server (login/roles, actors list + detail + isFollowing both ways, follow/409/count/401, following populated, feeds for two users incl. order, unfollow + count restore + 404, admin gate both ways, movie validation, notification create/dedup/read/unreadCount/403) — all passed; frontend `react-scripts build` clean.
- Bugs planted one at a time in the order 2, 4, 1, 3, 5, 7, 6, 8, 9, 10 (masked members first). Failing count progressed 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10, each step changing exactly the intended test(s); the three masking transitions were observed directly (409→500, 404→no-op delete, all-movies→wrong order).
- Patch round-trip verified: apply → 12/12 ×3 → reverse-apply → 2 passing / 10 failing.
- Reference backend kept at `/tmp/oa-q2-ref/03-actor-follow-backend` (may not survive a reboot; the `.patch` is the durable answer).
- Post-build adversarial review (4 agents: contract, spoilers, checklist, frontend): checklist clean; contract reviewer confirmed every asserted message/rule/seed count word-for-word. Three minor findings fixed — "newest release first" trimmed from QUESTION.md so the ordering rule stays discoverable only from README/tests (protecting bug 7's hidden status); `.git/COMMIT_EDITMSG` residue overwritten by the amend; navbar unread badge now refreshes via a `notifications-updated` event when a notification is marked read. Frontend rebuilt clean; single amended commit re-tagged `start`, reflog re-scrubbed; buggy suite re-confirmed 2/12 and the patch still applies cleanly.

**Post-launch change (2026-09-25, Praise's request after first practice run):** the backend `start` script now runs `node --watch app.js` inside the DB wrapper, so backend edits auto-restart the server (database and data stay up; frontend hot reload unaffected). Applied to all scenarios and to BUILD_SPEC 3.4 for future ones; each repo's single `Initial commit` was amended and re-tagged `start`.

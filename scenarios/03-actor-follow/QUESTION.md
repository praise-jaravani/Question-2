# Issue: Follows and Notifications

Actor Follow is a MERN application where users follow their favourite actors, browse a feed of movies featuring the actors they follow, and get notified when an admin adds a newly released movie. Since the last release, following actors doesn't work properly, and users are losing trust in the numbers the site shows.

## Reported Problems

1. **Follow doesn't stick.** Clicking **Follow** shows a "Now following …" message, but nothing was actually followed: the Following page stays empty, and clicking **Unfollow** right afterwards says "You are not following this actor".
2. **Follower counts go the wrong way.** Following an actor makes their follower count go **down** instead of up — some actors now show negative followers.
3. **The feed shows the wrong movies.** The feed is supposed to show only movies featuring actors you follow, but users report seeing every movie on the platform, including ones from actors they've never followed.

## Steps to Reproduce

1. Run `npm start` and open http://localhost:3000.
2. Log in as `john@example.com` / `password123`.
3. Open any actor you don't follow yet and click **Follow** → the success toast appears, but the follower count drops (e.g. to -1), the **Following** page doesn't list the actor, and clicking **Unfollow** says "You are not following this actor".
4. Open **Feed** → movies from actors John doesn't follow are listed too.

## Expected Behavior

- Following an actor saves the follow: it appears on the Following page, Unfollow works, and the follower count goes up by one (and back down on unfollow).
- The feed contains only movies featuring followed actors.

Your task is to fix these backend issues. Refer to the README.md file for more details.

**Note:** The acceptance criteria for this task require that your solution pass all predefined unit tests.

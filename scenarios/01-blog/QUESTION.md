# Issue: Managing Posts

The Blog Platform is a MERN application where writers publish posts, browse each other's work, and manage their own posts from a personal dashboard. Since the latest release, users can't manage their posts. My Posts fails to load (and when it does, shows other people's posts), edits don't save, and deleting a post removes the wrong one.

## Reported Problems

1. **My Posts fails to load.** Opening the My Posts page shows an "Invalid post ID" error instead of the user's posts. Users who saw the page working earlier report that it listed posts belonging to **other writers** as well as their own.
2. **Edits are rejected or silently lost.** Editing your own post shows "Not authorized to update this post", and when an update does appear to go through, the changes are gone after a refresh.
3. **Deleting removes the wrong post.** Deleting a post shows "Post deleted successfully", but a **different** post disappears from the account and the one that was deleted is still there.

## Steps to Reproduce

1. Run `npm start` and open http://localhost:3000.
2. Log in as `john@example.com` / `password123`.
3. Click **My Posts** in the navbar → an "Invalid post ID" error toast appears and no posts load.
4. Open any of John's posts from the home page, click **Edit**, change the title, and save → "Not authorized to update this post".
5. From the home page, open John's post "Building Scalable Microservices", click **Delete**, and confirm → the success toast appears, but on the home page that post is still listed while a different post of John's is gone.

## Expected Behavior

- My Posts loads the logged-in user's own posts — and only theirs, drafts included.
- The author of a post (and only the author) can edit it, and saved changes persist.
- Deleting a post removes exactly the post that was requested.

Your task is to fix these backend issues. Refer to the README.md file for more details.

**Note:** The acceptance criteria for this task require that your solution pass all predefined unit tests.

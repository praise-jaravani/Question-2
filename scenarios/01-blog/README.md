# Blog Platform(MERN): Managing Posts

## Overview

The Blog Platform is a MERN application where writers publish posts, browse each other's work, and manage their own posts from a personal dashboard. Since the latest release, users can't manage their posts. My Posts fails to load (and when it does, shows other people's posts), edits don't save, and deleting a post removes the wrong one. Your task is to fix the backend so it matches the expected API behavior below.

## Expected API Behavior

### GET /api/posts

**Purpose:** Return the public list of posts.

**Request Headers:** none required.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| category | string | optional; return only posts whose category matches exactly |
| search | string | optional; return only posts whose **title** contains the search text, **case-insensitively** |

**Success Response (200):**

```json
{
  "posts": [
    {
      "_id": "ObjectId",
      "title": "…",
      "content": "…",
      "excerpt": "…",
      "category": "…",
      "tags": ["…"],
      "readTime": 8,
      "published": true,            // the public list contains published posts only
      "author": {                   // populated with name, email and bio
        "_id": "ObjectId",
        "name": "…",
        "email": "…",
        "bio": "…"
      },
      "createdAt": "ISO date",      // posts are sorted newest first
      "updatedAt": "ISO date"
    }
  ]
}
```

### GET /api/posts/my-posts

**Purpose:** Return every post belonging to the logged-in user, **including unpublished drafts**, newest first.

**Request Headers:** `x-user-id: <the logged-in user's id>`

**Success Response (200):** `{ "posts": [ … ] }` — same post shape as above, `author` populated.

**Error Responses:**

| Status | Body |
|---|---|
| 401 | `{ "message": "Not authenticated" }` — when the `x-user-id` header is missing |

### GET /api/posts/:id

**Purpose:** Return a single post by its id.

**Success Response (200):** `{ "post": { … } }` — `author` populated with `name`, `email` and `bio`. The author's `password` must never be included.

**Error Responses:**

| Status | Body |
|---|---|
| 400 | `{ "message": "Invalid post ID" }` — when `:id` is not a valid ObjectId |
| 404 | `{ "message": "Post not found" }` |

### POST /api/posts

**Purpose:** Create a new post for the logged-in user.

**Request Headers:** `x-user-id`, `Content-Type: application/json`

**Request Body:**

| Field | Type | Rule |
|---|---|---|
| title | string | required |
| content | string | required |
| excerpt | string | optional |
| category | string | required |
| tags | string[] | optional |
| readTime | number | optional |

**Success Response (201):**

```json
{
  "message": "Post created successfully",
  "post": {
    "_id": "ObjectId",
    "title": "…",
    "content": "…",
    "excerpt": "provided, or auto-generated from the content",
    "category": "…",
    "tags": ["provided or empty array"],
    "readTime": 5,
    "published": true,
    "author": { "_id": "…", "name": "…", "email": "…", "bio": "…" },
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

**Error Responses:**

| Status | Body |
|---|---|
| 401 | `{ "message": "Not authenticated" }` |
| 400 | `{ "message": "Title, content, and category are required" }` |

### PUT /api/posts/:id

**Purpose:** Update a post. Only the post's author may update it.

**Request Headers:** `x-user-id`, `Content-Type: application/json`

**Request Body:** any subset of `title`, `content`, `excerpt`, `category`, `tags`, `readTime`, `published`. Only the provided fields are changed.

**Success Response (200):**

```json
{
  "message": "Post updated successfully",
  "post": { "…": "the updated post, author populated" }
}
```

**Error Responses:**

| Status | Body |
|---|---|
| 401 | `{ "message": "Not authenticated" }` |
| 400 | `{ "message": "Invalid post ID" }` |
| 404 | `{ "message": "Post not found" }` |
| 403 | `{ "message": "Not authorized to update this post" }` — when the requester is not the author |

### DELETE /api/posts/:id

**Purpose:** Delete a post. Only the post's author may delete it.

**Request Headers:** `x-user-id`

**Success Response (200):** `{ "message": "Post deleted successfully" }`

**Error Responses:**

| Status | Body |
|---|---|
| 401 | `{ "message": "Not authenticated" }` |
| 400 | `{ "message": "Invalid post ID" }` |
| 404 | `{ "message": "Post not found" }` |
| 403 | `{ "message": "Not authorized to delete this post" }` — when the requester is not the author |

### POST /api/auth/login

**Purpose:** Log in with email and password.

**Request Body:** `{ "email": "…", "password": "…" }`

**Success Response (200):** `{ "message": "Login successful", "user": { … } }` — the user object must never include the `password` field.

**Error Responses:**

| Status | Body |
|---|---|
| 400 | `{ "message": "Email and password are required" }` |
| 401 | `{ "message": "Invalid credentials" }` |

## Additional Information

- A created or updated post must be saved to the database.
- `published` is always `true` on creation.
- If no excerpt is provided when creating a post, the excerpt is the **first 150 characters of the content**.
- The public post list (`GET /api/posts`) contains **published posts only** — unpublished drafts must never appear there. My Posts shows all of the user's posts, drafts included.
- The `category` query parameter matches the post category **exactly**; the `search` query parameter matches post **titles case-insensitively**.
- Post lists are sorted newest first.
- `author` is populated with the user's `_id`, `name`, `email` and `bio`. The author's `password` must never appear in any response.
- Only the post's author can update or delete it; anyone else receives a 403 with the exact message above.
- Deleting a post removes exactly the requested post and nothing else.
- Restarting the server resets the database.
- Running the tests resets the database.

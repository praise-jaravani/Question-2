# Actor Follow(MERN): Follows and Notifications

## Overview

Actor Follow is a MERN application where users follow their favourite actors, browse a feed of movies featuring the actors they follow, and get notified when an admin adds a newly released movie. Since the last release, follows don't stick, follower counts move the wrong way, and the feed shows the wrong movies. Your task is to fix the backend so it matches the expected API behavior below.

## Expected API Behavior

### GET /api/actors

**Purpose:** Return every actor, sorted by name.

**Request Headers:** none required.

**Success Response (200):**

```json
{
  "actors": [
    {
      "_id": "ObjectId",
      "name": "…",
      "bio": "…",
      "followerCount": 0,
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ]
}
```

### GET /api/actors/:id

**Purpose:** Return a single actor, plus whether the requesting user follows them.

**Request Headers:** `x-user-id` (optional; without it `isFollowing` is `false`).

**Success Response (200):** `{ "actor": { … }, "isFollowing": true }`

**Error Responses:**

| Status | Body |
|---|---|
| 400 | `{ "message": "Invalid actor ID" }` |
| 404 | `{ "message": "Actor not found" }` |

### POST /api/actors/:id/follow

**Purpose:** Follow an actor.

**Request Headers:** `x-user-id`

**Success Response (201):**

```json
{
  "message": "Now following <actor name>",
  "follow": {
    "_id": "ObjectId",
    "user": "ObjectId",
    "actor": "ObjectId",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

**Error Responses:**

| Status | Body |
|---|---|
| 401 | `{ "message": "Not authenticated" }` |
| 400 | `{ "message": "Invalid actor ID" }` |
| 404 | `{ "message": "Actor not found" }` |
| 409 | `{ "message": "You are already following this actor" }` |

### DELETE /api/actors/:id/follow

**Purpose:** Unfollow an actor.

**Request Headers:** `x-user-id`

**Success Response (200):** `{ "message": "Unfollowed <actor name>" }`

**Error Responses:**

| Status | Body |
|---|---|
| 401 | `{ "message": "Not authenticated" }` |
| 400 | `{ "message": "Invalid actor ID" }` |
| 404 | `{ "message": "Actor not found" }` — unknown actor id |
| 404 | `{ "message": "You are not following this actor" }` — no follow exists |

### GET /api/users/me/following

**Purpose:** Return the actors the logged-in user follows, most recent first.

**Request Headers:** `x-user-id`

**Success Response (200):**

```json
{
  "following": [
    {
      "_id": "ObjectId",
      "user": "ObjectId",
      "actor": { "_id": "ObjectId", "name": "…" },
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ]
}
```

**Error Responses:**

| Status | Body |
|---|---|
| 401 | `{ "message": "Not authenticated" }` |

### GET /api/feed

**Purpose:** Return the movies featuring any actor the logged-in user follows, **newest release first**, each movie's `actors` populated with their names.

**Request Headers:** `x-user-id`

**Success Response (200):**

```json
{
  "movies": [
    {
      "_id": "ObjectId",
      "title": "…",
      "genre": "…",
      "releaseDate": "ISO date",
      "actors": [{ "_id": "ObjectId", "name": "…" }],
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ]
}
```

**Error Responses:**

| Status | Body |
|---|---|
| 401 | `{ "message": "Not authenticated" }` |

### POST /api/movies

**Purpose:** Add a newly released movie (admins only), then notify the followers of its cast.

**Request Headers:** `x-user-id`, `Content-Type: application/json`

**Request Body:**

| Field | Type | Rule |
|---|---|---|
| title | string | required |
| genre | string | optional |
| releaseDate | date string | required |
| actors | ObjectId[] | required, at least one |

**Success Response (201):** `{ "message": "Movie added", "movie": { … } }`

**Error Responses:**

| Status | Body |
|---|---|
| 401 | `{ "message": "Not authenticated" }` |
| 403 | `{ "message": "Admin access required" }` — when the requester is not an admin |
| 400 | `{ "message": "Title, release date and at least one actor are required" }` |

### GET /api/notifications

**Purpose:** Return the logged-in user's notifications, newest first, plus how many are unread.

**Request Headers:** `x-user-id`

**Success Response (200):**

```json
{
  "notifications": [
    {
      "_id": "ObjectId",
      "user": "ObjectId",
      "movie": "ObjectId",
      "actor": "ObjectId",
      "message": "<actor name> is in a new movie: <title>",
      "read": false,
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ],
  "unreadCount": 1
}
```

**Error Responses:**

| Status | Body |
|---|---|
| 401 | `{ "message": "Not authenticated" }` |

### PATCH /api/notifications/:id/read

**Purpose:** Mark one of your notifications as read.

**Request Headers:** `x-user-id`

**Success Response (200):** `{ "notification": { …, "read": true } }`

**Error Responses:**

| Status | Body |
|---|---|
| 401 | `{ "message": "Not authenticated" }` |
| 400 | `{ "message": "Invalid notification ID" }` |
| 404 | `{ "message": "Notification not found" }` |
| 403 | `{ "message": "Not authorized to update this notification" }` |

### POST /api/auth/login and GET /api/auth/me

**Login (200):** `{ "message": "Login successful", "user": { … } }`; errors: 400 `Email and password are required`, 401 `Invalid credentials`.

**Me (200):** `{ "user": { … } }` — includes the user's `role` (`user` or `admin`); errors: 401 `Not authenticated`, 404 `User not found`.

The user object must never include the `password` field.

## Additional Information

- **A follow must be saved to the database when created** — it must appear on the Following page, count towards the actor's `followerCount`, and be found when unfollowing.
- Following an actor increases their `followerCount` by one; unfollowing decreases it by one.
- Following an actor you already follow returns the 409 above; unfollowing an actor you don't follow returns the 404 above.
- The following list populates each entry's `actor` with its `_id` and `name`.
- The feed contains **only** movies featuring at least one followed actor, sorted **newest release first**, with each movie's cast populated (`_id` and `name`).
- Only admins can add movies. Adding a movie creates **exactly one notification per follower** of its cast — a user who follows several of the movie's actors is still notified only once, with the message `"<actor name> is in a new movie: <title>"` using the first of their followed actors.
- `unreadCount` counts **unread notifications only**; notifications are returned newest first.
- Restarting the server resets the database.
- Running the tests resets the database.

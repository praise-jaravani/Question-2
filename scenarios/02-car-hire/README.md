# Car Hire(MERN): Listings and Bookings

## Overview

Car Hire is a MERN application where owners list their cars for daily hire and renters browse, filter and book them. After the latest deployment nothing car-related loads, new listings vanish, edits don't stick, and My Cars shows every car on the platform. Your task is to fix the backend so it matches the expected API behavior below.

## Expected API Behavior

### GET /api/cars

**Purpose:** Return the public list of cars that are available for hire.

**Request Headers:** none required.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| location | string | optional; return only cars in this location, matched **case-insensitively** |

**Success Response (200):**

```json
{
  "cars": [
    {
      "_id": "ObjectId",
      "make": "Toyota",
      "model": "Corolla",
      "year": 2021,
      "pricePerDay": 450,
      "location": "Cape Town",
      "description": "…",
      "available": true,            // the public list contains available cars only
      "owner": {                    // populated with name and email
        "_id": "ObjectId",
        "name": "…",
        "email": "…"
      },
      "createdAt": "ISO date",      // cars are sorted newest first
      "updatedAt": "ISO date"
    }
  ]
}
```

### GET /api/cars/my-cars

**Purpose:** Return every car belonging to the logged-in user, available or not, newest first.

**Request Headers:** `x-user-id: <the logged-in user's id>`

**Success Response (200):** `{ "cars": [ … ] }` — same car shape as above, `owner` populated.

**Error Responses:**

| Status | Body |
|---|---|
| 401 | `{ "message": "Not authenticated" }` — when the `x-user-id` header is missing |

### GET /api/cars/:id

**Purpose:** Return a single car by its id.

**Success Response (200):** `{ "car": { … } }` — `owner` populated with `name` and `email`.

**Error Responses:**

| Status | Body |
|---|---|
| 400 | `{ "message": "Invalid car ID" }` — when `:id` is not a valid ObjectId |
| 404 | `{ "message": "Car not found" }` |

### POST /api/cars

**Purpose:** List a new car for the logged-in user.

**Request Headers:** `x-user-id`, `Content-Type: application/json`

**Request Body:**

| Field | Type | Rule |
|---|---|---|
| make | string | required |
| model | string | required |
| year | number | required |
| pricePerDay | number | required, at least 1 |
| location | string | required |
| description | string | optional |

**Success Response (201):**

```json
{
  "message": "Car listed successfully",
  "car": {
    "_id": "ObjectId",
    "make": "…",
    "model": "…",
    "year": 2022,
    "pricePerDay": 500,
    "location": "…",
    "description": "…",
    "available": true,
    "owner": "ObjectId",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

**Error Responses:**

| Status | Body |
|---|---|
| 401 | `{ "message": "Not authenticated" }` |
| 400 | `{ "message": "Make, model, year, price per day and location are required" }` |

### PUT /api/cars/:id

**Purpose:** Update a car. Only the car's owner may update it.

**Request Headers:** `x-user-id`, `Content-Type: application/json`

**Request Body:** any subset of `make`, `model`, `year`, `pricePerDay`, `location`, `description`. Only the provided fields are changed.

**Success Response (200):**

```json
{
  "message": "Car updated successfully",
  "car": { "…": "the updated car" }
}
```

**Error Responses:**

| Status | Body |
|---|---|
| 401 | `{ "message": "Not authenticated" }` |
| 400 | `{ "message": "Invalid car ID" }` |
| 404 | `{ "message": "Car not found" }` |
| 403 | `{ "message": "Not authorized to update this car" }` — when the requester is not the owner |

### DELETE /api/cars/:id

**Purpose:** Delete a car. Only the car's owner may delete it.

**Request Headers:** `x-user-id`

**Success Response (200):** `{ "message": "Car deleted successfully" }`

**Error Responses:**

| Status | Body |
|---|---|
| 401 | `{ "message": "Not authenticated" }` |
| 400 | `{ "message": "Invalid car ID" }` |
| 404 | `{ "message": "Car not found" }` |
| 403 | `{ "message": "Not authorized to delete this car" }` |

### PATCH /api/cars/:id/availability

**Purpose:** Toggle whether a car is available for hire. Only the car's owner may toggle it.

**Request Headers:** `x-user-id`

**Success Response (200):**

```json
{
  "message": "Availability updated",
  "car": { "…": "the car, with `available` flipped" }
}
```

**Error Responses:**

| Status | Body |
|---|---|
| 401 | `{ "message": "Not authenticated" }` |
| 400 | `{ "message": "Invalid car ID" }` |
| 404 | `{ "message": "Car not found" }` |
| 403 | `{ "message": "Not authorized to update this car" }` |

### POST /api/cars/:id/bookings

**Purpose:** Book a car for a date range.

**Request Headers:** `x-user-id`, `Content-Type: application/json`

**Request Body:** `{ "startDate": "2030-03-10", "endDate": "2030-03-15" }`

**Success Response (201):**

```json
{
  "message": "Booking confirmed",
  "booking": {
    "_id": "ObjectId",
    "car": { "…": "the booked car, populated" },
    "renter": "ObjectId",
    "startDate": "ISO date",
    "endDate": "ISO date",
    "totalPrice": 2000,
    "status": "confirmed",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

**Error Responses (in the order they are checked):**

| Status | Body |
|---|---|
| 401 | `{ "message": "Not authenticated" }` |
| 400 | `{ "message": "Invalid car ID" }` |
| 404 | `{ "message": "Car not found" }` |
| 400 | `{ "message": "Start date and end date are required" }` |
| 400 | `{ "message": "End date must be after start date" }` |
| 400 | `{ "message": "You cannot book your own car" }` |
| 400 | `{ "message": "Car is not available" }` |
| 409 | `{ "message": "Car is already booked for these dates" }` |

### GET /api/bookings/my-bookings

**Purpose:** Return the logged-in user's bookings, newest first, with each booking's `car` populated.

**Request Headers:** `x-user-id`

**Success Response (200):** `{ "bookings": [ … ] }`

**Error Responses:**

| Status | Body |
|---|---|
| 401 | `{ "message": "Not authenticated" }` |

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

- A listed car must be saved to the database, and an owner's edits must be persisted.
- `available` defaults to `true` on a new listing. The public list (`GET /api/cars`) contains **available cars only**; My Cars shows all of the owner's cars.
- The `location` query parameter matches the car's location **case-insensitively** (searching `cape town` finds cars in `Cape Town`).
- Car lists are sorted newest first.
- `owner` is populated with the user's `name` and `email` on car lists and car details. The owner's `password` must never appear in any response.
- Only the car's owner can update, delete, or toggle availability; anyone else receives a 403 with the exact message above.
- **Booking price:** `totalPrice = days × pricePerDay`, where `days` is the number of nights between the start and end dates — from the 10th to the 15th is **5 days**.
- **Overlaps:** a booking overlaps an existing confirmed booking when it starts before that booking ends **and** ends after that booking starts. Overlapping bookings are rejected with the 409 above. A booking that starts exactly on the day an existing one ends is allowed.
- You cannot book your own car, and unavailable cars cannot be booked.
- Restarting the server resets the database.
- Running the tests resets the database.

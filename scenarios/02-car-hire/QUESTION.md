# Issue: Listings and Bookings

Car Hire is a MERN application where owners list their cars for daily hire and renters browse, filter and book them. After yesterday's deployment the app is effectively unusable, and support is flooded with reports.

## Reported Problems

1. **Nothing loads.** Browse Cars and My Cars both show a "Something went wrong" error, car pages won't open, and booking fails. Every part of the app that deals with cars appears to be down.
2. **New listings vanish.** In the build that was briefly live earlier this week, owners reported that listing a new car showed "Car listed successfully" but the car never appeared anywhere — not in My Cars and not in Browse Cars.
3. **Edits don't stick.** From the same reports: editing a car showed "Car updated successfully" and the new details on screen, but after a refresh the old details were back.
4. **My Cars shows everyone's cars.** Owners also saw every car on the platform listed under My Cars, not just their own.

## Steps to Reproduce

1. Run `npm start` and open http://localhost:3000.
2. Log in as `john@example.com` / `password123`.
3. The Browse Cars page shows an error toast and no cars → problem 1.
4. Once the app loads at all, use **List a Car** to add a car, then open **My Cars** → the new car is missing (problem 2), and the list contains other people's cars (problem 4).
5. Edit one of John's cars, change the price, save, then refresh → the change is gone (problem 3).

## Expected Behavior

- Browse Cars lists available cars; My Cars lists the logged-in owner's cars — and only theirs.
- Listing a car saves it, and it appears in My Cars right away.
- An owner's edits are persisted.

Your task is to fix these backend issues. Refer to the README.md file for more details.

**Note:** The acceptance criteria for this task require that your solution pass all predefined unit tests.

// Each movie lists its cast as indexes into the actors seed array;
// utils/seed.js resolves them to ids.
export const movies = [
  {
    title: 'Midnight Harbor',
    genre: 'Thriller',
    releaseDate: '2021-06-18T00:00:00.000Z',
    actorIndexes: [0, 1]
  },
  {
    title: 'The Glass Orchard',
    genre: 'Drama',
    releaseDate: '2022-03-11T00:00:00.000Z',
    actorIndexes: [2]
  },
  {
    title: 'Signal Fade',
    genre: 'Sci-Fi',
    releaseDate: '2022-11-04T00:00:00.000Z',
    actorIndexes: [1, 3]
  },
  {
    title: 'Cobalt Sky',
    genre: 'Action',
    releaseDate: '2023-07-21T00:00:00.000Z',
    actorIndexes: [4, 5]
  },
  {
    title: 'The Long Quiet',
    genre: 'Drama',
    releaseDate: '2024-02-09T00:00:00.000Z',
    actorIndexes: [0, 2, 4]
  },
  {
    title: 'Paper Lanterns',
    genre: 'Romance',
    releaseDate: '2024-10-17T00:00:00.000Z',
    actorIndexes: [1]
  },
  {
    title: 'Iron Meridian',
    genre: 'Action',
    releaseDate: '2025-05-30T00:00:00.000Z',
    actorIndexes: [3, 5]
  },
  {
    title: 'Second Sunrise',
    genre: 'Drama',
    releaseDate: '2026-01-23T00:00:00.000Z',
    actorIndexes: [0, 5]
  }
];

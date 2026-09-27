// Bookings reference cars and users by seed index; utils/seed.js resolves the ids.
export const bookings = [
  {
    carIndex: 0, // John's Toyota Corolla
    renterIndex: 1, // Sarah Johnson
    startDate: '2030-01-10T00:00:00.000Z',
    endDate: '2030-01-15T00:00:00.000Z',
    totalPrice: 2250, // 5 days x 450
    status: 'confirmed',
    createdAt: '2024-08-25T11:00:00.000Z',
    updatedAt: '2024-08-25T11:00:00.000Z'
  }
];

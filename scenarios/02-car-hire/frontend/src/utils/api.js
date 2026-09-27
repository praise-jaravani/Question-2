import baseURL from './baseURL';

const API_BASE_URL = `${baseURL}/api`;

const getAuthHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      if (user && user._id) {
        headers['x-user-id'] = user._id;
      }
    } catch (e) {
      // ignore malformed stored user
    }
  }
  return headers;
};

const handleResponse = async (response) => {
  let data = {};
  try {
    data = await response.json();
  } catch (e) {
    data = {};
  }
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export const login = (email, password) =>
  fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  }).then(handleResponse);

export const fetchCars = ({ location } = {}) => {
  const params = new URLSearchParams();
  if (location) params.append('location', location);
  const queryString = params.toString();
  return fetch(`${API_BASE_URL}/cars${queryString ? `?${queryString}` : ''}`, {
    headers: getAuthHeaders()
  }).then(handleResponse);
};

export const fetchMyCars = () =>
  fetch(`${API_BASE_URL}/cars/my-cars`, {
    headers: getAuthHeaders()
  }).then(handleResponse);

export const fetchCar = (id) =>
  fetch(`${API_BASE_URL}/cars/${id}`, {
    headers: getAuthHeaders()
  }).then(handleResponse);

export const createCar = (carData) =>
  fetch(`${API_BASE_URL}/cars`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(carData)
  }).then(handleResponse);

export const updateCar = (id, carData) =>
  fetch(`${API_BASE_URL}/cars/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(carData)
  }).then(handleResponse);

export const deleteCar = (id) =>
  fetch(`${API_BASE_URL}/cars/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  }).then(handleResponse);

export const toggleAvailability = (id) =>
  fetch(`${API_BASE_URL}/cars/${id}/availability`, {
    method: 'PATCH',
    headers: getAuthHeaders()
  }).then(handleResponse);

export const createBooking = (carId, bookingData) =>
  fetch(`${API_BASE_URL}/cars/${carId}/bookings`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(bookingData)
  }).then(handleResponse);

export const fetchMyBookings = () =>
  fetch(`${API_BASE_URL}/bookings/my-bookings`, {
    headers: getAuthHeaders()
  }).then(handleResponse);

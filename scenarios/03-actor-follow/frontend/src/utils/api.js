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

export const fetchActors = () =>
  fetch(`${API_BASE_URL}/actors`, { headers: getAuthHeaders() }).then(handleResponse);

export const fetchActor = (id) =>
  fetch(`${API_BASE_URL}/actors/${id}`, { headers: getAuthHeaders() }).then(handleResponse);

export const followActor = (id) =>
  fetch(`${API_BASE_URL}/actors/${id}/follow`, {
    method: 'POST',
    headers: getAuthHeaders()
  }).then(handleResponse);

export const unfollowActor = (id) =>
  fetch(`${API_BASE_URL}/actors/${id}/follow`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  }).then(handleResponse);

export const fetchFollowing = () =>
  fetch(`${API_BASE_URL}/users/me/following`, { headers: getAuthHeaders() }).then(
    handleResponse
  );

export const fetchFeed = () =>
  fetch(`${API_BASE_URL}/feed`, { headers: getAuthHeaders() }).then(handleResponse);

export const addMovie = (movieData) =>
  fetch(`${API_BASE_URL}/movies`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(movieData)
  }).then(handleResponse);

export const fetchNotifications = () =>
  fetch(`${API_BASE_URL}/notifications`, { headers: getAuthHeaders() }).then(handleResponse);

export const markNotificationRead = (id) =>
  fetch(`${API_BASE_URL}/notifications/${id}/read`, {
    method: 'PATCH',
    headers: getAuthHeaders()
  }).then(handleResponse);

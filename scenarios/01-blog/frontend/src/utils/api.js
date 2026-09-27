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

export const fetchPosts = ({ category, search } = {}) => {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (search) params.append('search', search);
  const queryString = params.toString();
  return fetch(`${API_BASE_URL}/posts${queryString ? `?${queryString}` : ''}`, {
    headers: getAuthHeaders()
  }).then(handleResponse);
};

export const fetchMyPosts = () =>
  fetch(`${API_BASE_URL}/posts/my-posts`, {
    headers: getAuthHeaders()
  }).then(handleResponse);

export const fetchPost = (id) =>
  fetch(`${API_BASE_URL}/posts/${id}`, {
    headers: getAuthHeaders()
  }).then(handleResponse);

export const createPost = (postData) =>
  fetch(`${API_BASE_URL}/posts`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(postData)
  }).then(handleResponse);

export const updatePost = (id, postData) =>
  fetch(`${API_BASE_URL}/posts/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(postData)
  }).then(handleResponse);

export const deletePost = (id) =>
  fetch(`${API_BASE_URL}/posts/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  }).then(handleResponse);

const API_URL = 'http://localhost:5000';

const apiRequest = async (endpoint, method = 'GET', body = null, token = null) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await fetch(`${API_URL}${endpoint}`, { method, headers, body: body ? JSON.stringify(body) : null });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
};

export const signup = (username, password, name) =>
  apiRequest('/auth/signup', 'POST', { username, password, name });

export const login = (username, password) =>
  apiRequest('/auth/login', 'POST', { username, password });

export const getUser = (token) =>
  apiRequest('/profile', 'GET', null, token);

export const updateUser = (token, name, profilePicture) =>
  apiRequest('/profile', 'PUT', { name, profilePicture }, token);

export const getVocab = (token) =>
  apiRequest('/vocab', 'GET', null, token);

export const addVocab = (token, kanji, word) =>
  apiRequest('/vocab', 'POST', { kanji, word }, token);

export const deleteVocab = (token, id) =>
  apiRequest(`/vocab/${id}`, 'DELETE', null, token);

export const getKanji = (character) =>
  apiRequest(`/kanji/${character}`);

export const searchKanji = (query) =>
  apiRequest(`/kanji/search/${query}`);
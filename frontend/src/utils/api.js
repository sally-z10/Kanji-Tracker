const API_URL = 'http://localhost:5000';

const apiRequest = async (endpoint, method = 'GET', body = null, token = null) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  console.log('Making API request to:', `${API_URL}${endpoint}`);
  console.log('Request headers:', headers);
  try {
    const response = await fetch(`${API_URL}${endpoint}`, { method, headers, body: body ? JSON.stringify(body) : null });
    const data = await response.json();
    console.log('API response:', data);
    if (!response.ok) throw new Error(data.error || 'Request failed');
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export const signup = async (email, username, password) => {
  try {
    console.log('Attempting signup with:', { email, username });
    const response = await apiRequest('/api/auth/register', 'POST', { email, username, password });
    console.log('Signup response:', response);
    return response;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

export const login = (email, password) =>
  apiRequest('/api/auth/login', 'POST', { email, password });

export const getUser = (token) =>
  apiRequest('/api/profile', 'GET', null, token);

export const updateUser = (token, name, profilePicture) =>
  apiRequest('/profile', 'PUT', { name, profilePicture }, token);

export const getWords = (token, page = 1, limit = 10) =>
  apiRequest(`/words?page=${page}&limit=${limit}`, 'GET', null, token);

export const addWord = (token, word, reading, meaning, kanjiCharacter) =>
  apiRequest('/words', 'POST', { word, reading, meaning, kanjiCharacter }, token);

export const updateWord = (token, id, reading, meaning) =>
  apiRequest(`/words/${id}`, 'PUT', { reading, meaning }, token);

export const deleteWord = (token, id) =>
  apiRequest(`/words/${id}`, 'DELETE', null, token);

export const getWordsForKanji = (token, character) =>
  apiRequest(`/words/kanji/${character}`, 'GET', null, token);

export const getKanji = (character) =>
  apiRequest(`/kanji/${character}`);

export const searchKanji = (query) =>
  apiRequest(`/kanji/search/${query}`);
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
  apiRequest('/api/profile', 'PUT', { name, profilePicture }, token);

export const getWords = (token, page = 1, limit = 10) =>
  apiRequest(`/api/words?page=${page}&limit=${limit}`, 'GET', null, token);

const validateWord = async (word) => {
  try {
    const response = await fetch(`https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(word)}`);
    const data = await response.json();
    return data.data.length > 0 && data.data[0].japanese.some(j => j.word === word);
  } catch (error) {
    console.error('Error validating word:', error);
    return false;
  }
};

export const addWord = (token, word, kanjiCharacter) => {
  console.log('API: Adding word:', { word, kanjiCharacter });
  return apiRequest('/api/words', 'POST', { 
    word, 
    kanjiCharacter,
    reading: '',  // Send empty string for reading
    meaning: []   // Send empty array for meaning
  }, token);
};

export const updateWord = (token, id, reading, meaning) =>
  apiRequest(`/api/words/${id}`, 'PUT', { reading, meaning }, token);

export const deleteWord = (token, id) =>
  apiRequest(`/api/words/${id}`, 'DELETE', null, token);

export const getWordsForKanji = (token, character) =>
  apiRequest(`/api/words/kanji/${character}`, 'GET', null, token);

export const getKanji = (character) =>
  apiRequest(`/api/kanji/${character}`);

export const searchKanji = (query) =>
  apiRequest(`/api/kanji/search/${query}`);
const { describe, it, expect, afterAll, beforeAll } = require('@jest/globals');
const request = require('supertest');
const { app } = require('../index');
const jwt = require('jsonwebtoken');

let token;
let wordId;
let userId;

// Test user data
const testUser = {
  email: 'test@example.com',
  username: 'testuser',
  password: 'password123'
};

// Test word data
const testWord = {
  word: '日本語',
  reading: 'にほんご',
  meaning: ['Japanese language'],
  kanjiCharacter: '日'
};

// Clean up after all tests
afterAll(async () => {
  if (app.server) {
    await new Promise((resolve) => app.server.close(resolve));
  }
});

describe('API Endpoints', () => {
  // Auth endpoints
  describe('Auth Endpoints', () => {
    it('should login a user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      token = res.body.token;
      userId = jwt.verify(token, process.env.JWT_SECRET).id;
    });

    it('should register a new user if not exists', async () => {
      // Try to register with a unique email
      const uniqueUser = {
        ...testUser,
        email: `test${Date.now()}@example.com`,
        username: `testuser${Date.now()}`
      };
      
      const res = await request(app)
        .post('/api/auth/register')
        .send(uniqueUser);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
    });
  });

  // Profile endpoints
  describe('Profile Endpoints', () => {
    it('should get user profile', async () => {
      const res = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('username');
    });

    it('should update user profile', async () => {
      const newUsername = `updateduser${Date.now()}`;
      const res = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ username: newUsername });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('username', newUsername);
    });
  });

  // Words endpoints
  describe('Words Endpoints', () => {
    it('should get user words', async () => {
      const res = await request(app)
        .get('/api/words')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('words');
    });

    it('should log a new word', async () => {
      const res = await request(app)
        .post('/api/words')
        .set('Authorization', `Bearer ${token}`)
        .send(testWord);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      wordId = res.body.id;
    });

    it('should update a word', async () => {
      const res = await request(app)
        .put(`/api/words/${wordId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ reading: 'にほんご', meaning: ['Japanese language', 'Nihongo'] });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('reading', 'にほんご');
    });

    it('should delete a word', async () => {
      const res = await request(app)
        .delete(`/api/words/${wordId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Word deleted successfully');
    });

    it('should get words for a kanji', async () => {
      const encodedKanji = encodeURIComponent(testWord.kanjiCharacter);
      const res = await request(app)
        .get(`/api/words/kanji/${encodedKanji}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  // Progress endpoints
  describe('Progress Endpoints', () => {
    it('should get kanji progress', async () => {
      const res = await request(app)
        .get('/api/progress/kanji')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('total');
    });

    it('should get word progress', async () => {
      const res = await request(app)
        .get('/api/progress/words')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('total_words');
    });
  });

  // Kanji endpoints
  describe('Kanji Endpoints', () => {
    it('should get kanji list', async () => {
      const res = await request(app)
        .get('/api/kanji');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('kanji');
    });

    it('should get kanji details', async () => {
      const encodedKanji = encodeURIComponent(testWord.kanjiCharacter);
      const res = await request(app)
        .get(`/api/kanji/${encodedKanji}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('character', testWord.kanjiCharacter);
    });
  });
}); 
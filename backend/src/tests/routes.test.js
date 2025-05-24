const request = require('supertest');
const app = require('../index');
const User = require('../models/User');
const Word = require('../models/Word');
const Progress = require('../models/Progress');

let authToken;
let testUser;

beforeAll(async () => {
  // Create test user
  testUser = await User.createUser(
    'test@example.com',
    'testuser',
    'password123'
  );
});

beforeEach(async () => {
  // Login to get auth token
  const response = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'test@example.com',
      password: 'password123'
    });
  
  authToken = response.body.token;
});

describe('Auth Routes', () => {
  test('should register new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'new@example.com',
        username: 'newuser',
        password: 'password123'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toHaveProperty('email', 'new@example.com');
  });

  test('should login user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toHaveProperty('email', 'test@example.com');
  });
});

describe('Words Routes', () => {
  test('should log new word', async () => {
    const response = await request(app)
      .post('/api/words')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        word: '日本語',
        reading: 'にほんご',
        meaning: ['Japanese language'],
        kanjiCharacter: '日'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('word', '日本語');
  });

  test('should get user words', async () => {
    const response = await request(app)
      .get('/api/words')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});

describe('Progress Routes', () => {
  test('should get user progress', async () => {
    const response = await request(app)
      .get('/api/progress')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('kanjiProgress');
    expect(response.body).toHaveProperty('wordProgress');
  });

  test('should get learning streak', async () => {
    const response = await request(app)
      .get('/api/progress/streak')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('current_streak');
    expect(response.body).toHaveProperty('longest_streak');
  });
});

afterAll(async () => {
  // Clean up test data
  await User.deleteUser(testUser.id);
}); 
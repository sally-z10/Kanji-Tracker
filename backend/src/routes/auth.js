const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  const { username, password, name } = req.body;
  try {
    const userExists = await pool.query('SELECT * FROM Users WHERE username = $1', [username]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      'INSERT INTO Users (username, password_hash, name) VALUES ($1, $2, $3) RETURNING id, username, name',
      [username, passwordHash, name || username]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await pool.query('SELECT * FROM Users WHERE username = $1', [username]);
    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ userId: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({
      token,
      user: {
        id: user.rows[0].id,
        username: user.rows[0].username,
        name: user.rows[0].name,
        profile_picture: user.rows[0].profile_picture,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
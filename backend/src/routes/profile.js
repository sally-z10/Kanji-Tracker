const express = require('express');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get profile
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await pool.query('SELECT id, username, name, profile_picture FROM Users WHERE id = $1', [req.userId]);
    const vocab = await pool.query('SELECT kanji, word FROM Vocabulary WHERE user_id = $1', [req.userId]);

    const uniqueKanji = [...new Set(vocab.rows.map((item) => item.kanji))];
    res.json({
      username: user.rows[0].username,
      name: user.rows[0].name,
      profile_picture: user.rows[0].profile_picture,
      totalKanjiLearned: uniqueKanji.length,
      totalWordsAdded: vocab.rows.length,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update profile
router.put('/', authMiddleware, async (req, res) => {
  const { name, profile_picture } = req.body;
  try {
    await pool.query(
      'UPDATE Users SET name = $1, profile_picture = $2 WHERE id = $3',
      [name, profile_picture, req.userId]
    );
    res.json({ message: 'Profile updated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
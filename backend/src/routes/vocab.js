const express = require('express');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get all vocab for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const vocab = await pool.query('SELECT id, kanji, word FROM Vocabulary WHERE user_id = $1', [req.userId]);
    res.json(vocab.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add vocab
router.post('/', authMiddleware, async (req, res) => {
  const { kanji, word } = req.body;
  try {
    const newVocab = await pool.query(
      'INSERT INTO Vocabulary (user_id, kanji, word) VALUES ($1, $2, $3) RETURNING *',
      [req.userId, kanji, word]
    );
    res.status(201).json(newVocab.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update vocab
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { kanji, word } = req.body;
  try {
    await pool.query(
      'UPDATE Vocabulary SET kanji = $1, word = $2 WHERE id = $3 AND user_id = $4',
      [kanji, word, id, req.userId]
    );
    res.json({ message: 'Vocab updated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete vocab
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM Vocabulary WHERE id = $1 AND user_id = $2', [id, req.userId]);
    res.json({ message: 'Vocab deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
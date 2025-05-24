const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Progress = require('../models/Progress');

// Get kanji progress
router.get('/kanji', auth, async (req, res) => {
  try {
    const progress = await Progress.getKanjiProgress(req.userId);
    res.json(progress);
  } catch (error) {
    console.error('Error fetching kanji progress:', error);
    res.status(500).json({ error: 'Error fetching kanji progress' });
  }
});

// Get word progress
router.get('/words', auth, async (req, res) => {
  try {
    console.log('Fetching word progress for user:', req.userId);
    const progress = await Progress.getWordProgress(req.userId);
    console.log('Word progress result:', progress);
    res.json(progress);
  } catch (error) {
    console.error('Error fetching word progress:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Error fetching word progress',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router; 
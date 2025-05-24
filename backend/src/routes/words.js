const express = require('express');
const router = express.Router();
const Word = require('../models/Word');
const auth = require('../middleware/auth');

// Get user's words with pagination
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const words = await Word.getUserWords(req.userId, page, limit);
    res.json(words);
  } catch (error) {
    console.error('Error fetching words:', error);
    res.status(500).json({ error: 'Error fetching words', details: error.message });
  }
});

// Log new word
router.post('/', auth, async (req, res) => {
  try {
    const { word, kanjiCharacter } = req.body;
    
    console.log('Received word data:', { word, kanjiCharacter });
    
    // Check for duplicates
    const isDuplicate = await Word.wordExists(req.userId, word, kanjiCharacter);
    console.log('Duplicate check result:', isDuplicate);
    
    if (isDuplicate) {
      return res.status(400).json({ error: 'Word already logged' });
    }

    const wordData = {
      userId: req.userId,
      word,
      kanjiCharacter
    };
    console.log('Attempting to log word with data:', wordData);
    
    const newWord = await Word.logWord(wordData);
    console.log('Word logged successfully:', newWord);
    
    res.status(201).json(newWord);
  } catch (error) {
    console.error('Error logging word:', error);
    res.status(500).json({ 
      error: 'Error logging word',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Update word
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { word, reading, meaning } = req.body;

    const updatedWord = await Word.updateWord(id, req.userId, { word, reading, meaning });
    if (!updatedWord) {
      return res.status(404).json({ error: 'Word not found' });
    }

    res.json(updatedWord);
  } catch (error) {
    console.error('Error updating word:', error);
    res.status(500).json({ error: 'Error updating word', details: error.message });
  }
});

// Delete word
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Word.deleteWord(id, req.userId);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Word not found' });
    }

    res.json({ message: 'Word deleted successfully' });
  } catch (error) {
    console.error('Error deleting word:', error);
    res.status(500).json({ error: 'Error deleting word', details: error.message });
  }
});

// Get words for kanji
router.get('/kanji/:character', auth, async (req, res) => {
  try {
    const { character } = req.params;
    const words = await Word.getWordsForKanji(req.userId, character);
    res.json(words);
  } catch (error) {
    console.error('Error fetching words for kanji:', error);
    res.status(500).json({ error: 'Error fetching words for kanji', details: error.message });
  }
});

module.exports = router; 
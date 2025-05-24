const express = require('express');
const router = express.Router();
const Word = require('../models/Word');
const auth = require('../middleware/auth');

// Get user's words with pagination
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const words = await Word.getUserWords(req.user.id, page, limit);
    res.json(words);
  } catch (error) {
    console.error('Error fetching words:', error);
    res.status(500).json({ error: 'Error fetching words' });
  }
});

// Log new word
router.post('/', auth, async (req, res) => {
  try {
    const { word, reading, meaning, kanjiCharacter } = req.body;
    
    // Validate word with Jisho API
    const validation = await Word.validateWord(word, reading);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Invalid word or reading',
        suggestions: validation.suggestions
      });
    }

    // Check for duplicates
    const isDuplicate = await Word.checkDuplicate(req.user.id, word);
    if (isDuplicate) {
      return res.status(400).json({ error: 'Word already logged' });
    }

    const newWord = await Word.logWord(req.user.id, word, reading, meaning, kanjiCharacter);
    res.status(201).json(newWord);
  } catch (error) {
    console.error('Error logging word:', error);
    res.status(500).json({ error: 'Error logging word' });
  }
});

// Update word
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { reading, meaning } = req.body;

    const updatedWord = await Word.updateWord(req.user.id, id, reading, meaning);
    if (!updatedWord) {
      return res.status(404).json({ error: 'Word not found' });
    }

    res.json(updatedWord);
  } catch (error) {
    console.error('Error updating word:', error);
    res.status(500).json({ error: 'Error updating word' });
  }
});

// Delete word
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Word.deleteWord(req.user.id, id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Word not found' });
    }

    res.json({ message: 'Word deleted successfully' });
  } catch (error) {
    console.error('Error deleting word:', error);
    res.status(500).json({ error: 'Error deleting word' });
  }
});

// Get words for specific kanji
router.get('/kanji/:character', auth, async (req, res) => {
  try {
    const { character } = req.params;
    const words = await Word.getWordsForKanji(req.user.id, character);
    res.json(words);
  } catch (error) {
    console.error('Error fetching kanji words:', error);
    res.status(500).json({ error: 'Error fetching kanji words' });
  }
});

// Get recent words
router.get('/recent', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const words = await Word.getRecentWords(req.user.id, limit);
    res.json(words);
  } catch (error) {
    console.error('Error fetching recent words:', error);
    res.status(500).json({ error: 'Error fetching recent words' });
  }
});

module.exports = router; 
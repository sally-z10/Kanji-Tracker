const express = require('express');
const JishoAPI = require('unofficial-jisho-api');
const router = express.Router();
const jisho = new JishoAPI();
const Kanji = require('../models/Kanji');

// Get paginated list of kanji
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const jlptLevel = req.query.jlpt_level || null;

    const result = await Kanji.getKanjiList(page, limit, jlptLevel);
    res.json(result);
  } catch (error) {
    console.error('Error fetching kanji list:', error);
    res.status(500).json({ error: 'Error fetching kanji list' });
  }
});

// Fetch Kanji details for a specific character
router.get('/:character', async (req, res) => {
  const { character } = req.params;
  try {
    const result = await jisho.searchForKanji(character);
    if (!result.found) {
      return res.status(404).json({ error: 'Kanji not found' });
    }

    const kanjiData = {
      character: result.query,
      onyomi: result.onyomi || [],
      kunyomi: result.kunyomi || [],
      meanings: result.meaning.split(', ') || [],
      strokeCount: result.strokeCount || 0,
      jlptLevel: result.jlptLevel || 'Unknown',
      grade: result.grade || 'Unknown'
    };
    res.json(kanjiData);
  } catch (error) {
    console.error('Error fetching Kanji data:', error);
    res.status(500).json({ error: 'Error fetching Kanji data' });
  }
});

// Search for Kanji or phrases (supports romaji)
router.get('/search/:query', async (req, res) => {
  const { query } = req.params;
  try {
    const result = await jisho.searchForPhrase(query);
    if (!result.data || result.data.length === 0) {
      return res.status(404).json({ error: 'No results found' });
    }

    // Map the results to a simplified format
    const searchResults = result.data.map(item => {
      const kanji = item.japanese[0]?.word || item.japanese[0]?.reading || '';
      return {
        kanji: kanji,
        reading: item.japanese[0]?.reading || '',
        meanings: item.senses[0]?.english_definitions || [],
        slug: kanji // Use kanji as slug for navigation
      };
    });
    res.json(searchResults);
  } catch (error) {
    console.error('Error searching for phrase:', error);
    res.status(500).json({ error: 'Error searching for phrase' });
  }
});

module.exports = router;
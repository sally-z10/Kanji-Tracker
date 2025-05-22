const express = require('express');
const axios = require('axios');
const router = express.Router();

// Fetch Kanji data from Jisho API
router.get('/:character', async (req, res) => {
  const { character } = req.params;
  try {
    const response = await axios.get(`https://jisho.org/api/v1/search/words?keyword=${character}`);
    const data = response.data.data[0]; // Get the first result
    if (!data) {
      return res.status(404).json({ error: 'Kanji not found' });
    }

    const kanjiData = {
      character: character,
      onyomi: data.readings?.map((r) => r.on)?.filter(Boolean) || [],
      kunyomi: data.readings?.map((r) => r.kun)?.filter(Boolean) || [],
      example: data.senses?.map((s) => s.english_definitions.join(', ')) || [],
    };
    res.json(kanjiData);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching Kanji data' });
  }
});

module.exports = router;
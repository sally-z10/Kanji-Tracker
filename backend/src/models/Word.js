const pool = require('../config/db');
const JishoAPI = require('unofficial-jisho-api');
const jisho = new JishoAPI();
const Kanji = require('./Kanji');

/**
 * Word model for vocabulary logging and validation
 * Handles word creation, validation against Jisho API, and user word management
 */
class Word {
  /**
   * Log new word for specific kanji with reading validation
   * Validates word against Jisho API and enforces minimum word requirements
   * @param {Object} wordData - Word data (word, reading, meaning, kanjiId, userId)
   * @returns {Promise<Object>} Created word object with validation status
   */
  static async logWord(wordData) {
    const { word, kanjiCharacter, userId } = wordData;

    // Ensure kanji exists in database
    await Kanji.ensureKanjiExists(kanjiCharacter);

    // Validate word against Jisho API
    const validation = await this.validateWordWithJisho(word, '');
    if (!validation.isValid) {
      throw new Error('Invalid Japanese word. Please check the spelling.');
    }

    // Check if word already exists for this user and kanji
    if (await this.wordExists(userId, word, kanjiCharacter)) {
      throw new Error('Word already exists for this kanji');
    }

    const query = `
      INSERT INTO user_kanji_words (
        user_id, kanji_character, word, created_at
      )
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const result = await pool.query(query, [
      userId,
      kanjiCharacter,
      word
    ]);

    return result.rows[0];
  }

  /**
   * Get all words logged by specific user
   * Returns paginated list with kanji associations
   * @param {number} userId - User ID
   * @param {number} page - Page number for pagination
   * @param {number} limit - Words per page
   * @returns {Promise<Object>} Paginated user words with metadata
   */
  static async getUserWords(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const query = `
      SELECT w.*, k.jlpt_level, k.grade,
             COUNT(*) OVER() as total_count
      FROM user_kanji_words w
      JOIN kanji k ON w.kanji_character = k.character
      WHERE w.user_id = $1
      ORDER BY w.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [userId, limit, offset]);
    const totalCount = result.rows[0]?.total_count || 0;

    return {
      words: result.rows,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    };
  }

  /**
   * Get words associated with specific kanji character
   * Shows all words logged by user for given kanji
   * @param {number} userId - User ID
   * @param {string} kanjiCharacter - Kanji character
   * @returns {Promise<Array>} Array of words for the kanji
   */
  static async getWordsForKanji(userId, kanjiCharacter) {
    const query = `
      SELECT *
      FROM user_kanji_words
      WHERE user_id = $1 AND kanji_character = $2
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [userId, kanjiCharacter]);
    return result.rows;
  }

  /**
   * Validate word and reading against Jisho API
   * Ensures word authenticity and correct reading
   * @param {string} word - Word text to validate
   * @param {string} reading - Reading in hiragana/katakana
   * @returns {Promise<Object>} Validation result with suggestions
   */
  static async validateWordWithJisho(word, reading) {
    try {
      const result = await jisho.searchForPhrase(word);
      if (!result.data || result.data.length === 0) {
        return {
          isValid: false,
          suggestions: []
        };
      }

      // If no reading is provided, just check if the word exists
      if (!reading) {
        const wordExists = result.data.some(item => 
          item.japanese.some(j => j.word === word)
        );
        return {
          isValid: wordExists,
          suggestions: result.data.slice(0, 3).map(item => ({
            word: item.japanese[0]?.word,
            reading: item.japanese[0]?.reading,
            meanings: item.senses[0]?.english_definitions
          }))
        };
      }

      // If reading is provided, check for exact match
      const exactMatch = result.data.find(item => 
        item.japanese.some(j => j.word === word && j.reading === reading)
      );

      return {
        isValid: !!exactMatch,
        suggestions: result.data.slice(0, 3).map(item => ({
          word: item.japanese[0]?.word,
          reading: item.japanese[0]?.reading,
          meanings: item.senses[0]?.english_definitions
        }))
      };
    } catch (error) {
      console.error('Error validating word:', error);
      return {
        isValid: false,
        suggestions: []
      };
    }
  }

  /**
   * Update existing word entry
   * Allows modification of word, reading, and meaning
   * @param {number} wordId - Word ID to update
   * @param {number} userId - User ID for ownership verification
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated word object
   */
  static async updateWord(wordId, userId, updateData) {
    const { word, reading, meaning } = updateData;

    // Verify ownership
    const ownershipCheck = await pool.query(
      'SELECT * FROM user_kanji_words WHERE id = $1 AND user_id = $2',
      [wordId, userId]
    );

    if (!ownershipCheck.rows[0]) {
      throw new Error('Word not found or unauthorized');
    }

    // If word is being updated, validate with Jisho
    if (word) {
      const validation = await this.validateWordWithJisho(word, '');
      if (!validation.isValid) {
        throw new Error('Invalid Japanese word. Please check the spelling.');
      }
    }

    const query = `
      UPDATE user_kanji_words
      SET word = COALESCE($1, word),
          reading = COALESCE($2, reading),
          meaning = COALESCE($3, meaning),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 AND user_id = $5
      RETURNING *
    `;

    const result = await pool.query(query, [
      word,
      reading,
      meaning,
      wordId,
      userId
    ]);

    return result.rows[0];
  }

  /**
   * Delete word entry with ownership verification
   * Removes word and updates kanji completion status
   * @param {number} wordId - Word ID to delete
   * @param {number} userId - User ID for ownership verification
   * @returns {Promise<boolean>} True if deletion successful
   */
  static async deleteWord(wordId, userId) {
    const query = `
      DELETE FROM user_kanji_words
      WHERE id = $1 AND user_id = $2
      RETURNING kanji_character
    `;

    const result = await pool.query(query, [wordId, userId]);
    return result.rowCount > 0;
  }

  /**
   * Count words logged for specific kanji by user
   * Used to determine kanji completion status (minimum 3 words)
   * @param {number} userId - User ID
   * @param {string} kanjiCharacter - Kanji character
   * @returns {Promise<number>} Number of words logged for kanji
   */
  static async countWordsForKanji(userId, kanjiCharacter) {
    const query = `
      SELECT COUNT(*) as count
      FROM user_kanji_words
      WHERE user_id = $1 AND kanji_character = $2
    `;

    const result = await pool.query(query, [userId, kanjiCharacter]);
    return parseInt(result.rows[0].count);
  }

  /**
   * Check if word already exists for user and kanji
   * Prevents duplicate word entries
   * @param {number} userId - User ID
   * @param {string} word - Word text
   * @param {string} kanjiCharacter - Associated kanji
   * @returns {Promise<boolean>} True if word already exists
   */
  static async wordExists(userId, word, kanjiCharacter) {
    const query = `
      SELECT EXISTS(
        SELECT 1 FROM user_kanji_words
        WHERE user_id = $1 AND word = $2 AND kanji_character = $3
      )
    `;

    const result = await pool.query(query, [userId, word, kanjiCharacter]);
    return result.rows[0].exists;
  }
}

module.exports = Word; 
const pool = require('../config/db');
const JishoAPI = require('unofficial-jisho-api');
const jisho = new JishoAPI();

/**
 * Kanji model for managing kanji data and Jisho API integration
 * Handles caching, JLPT level filtering, and kanji details
 */
class Kanji {
  /**
   * Get paginated list of kanji with optional JLPT level filtering
   * Returns cached data from database or fetches from Jisho API
   * @param {number} page - Page number for pagination (default: 1)
   * @param {number} limit - Number of kanji per page (default: 20)
   * @param {string} jlptLevel - JLPT level filter (N5, N4, N3, N2, N1)
   * @returns {Promise<Object>} Paginated kanji list with metadata
   */
  static async getKanjiList(page = 1, limit = 20, jlptLevel = null) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT k.*, COUNT(*) OVER() as total_count
      FROM kanji k
    `;
    const params = [];

    if (jlptLevel) {
      query += ' WHERE k.jlpt_level = $1';
      params.push(jlptLevel);
    }

    query += ' ORDER BY k.character LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await pool.query(query, params);
    const totalCount = result.rows[0]?.total_count || 0;

    return {
      kanji: result.rows,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    };
  }

  /**
   * Get detailed information for specific kanji character
   * Includes readings, meanings, examples, and JLPT level
   * @param {string} kanjiCharacter - Single kanji character
   * @returns {Promise<Object|null>} Detailed kanji information or null
   */
  static async getKanjiDetails(kanjiCharacter) {
    // First check cache
    const cachedKanji = await this.getCachedKanji(kanjiCharacter);
    if (cachedKanji) {
      return cachedKanji;
    }

    // If not in cache, fetch from Jisho API
    try {
      const result = await jisho.searchForKanji(kanjiCharacter);
      if (!result.found) {
        return null;
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

      // Cache the new data
      await this.cacheKanjiData(kanjiData);
      return kanjiData;
    } catch (error) {
      console.error('Error fetching kanji details:', error);
      return null;
    }
  }

  /**
   * Cache kanji data in PostgreSQL database
   * Stores kanji information retrieved from Jisho API
   * @param {Object} kanjiData - Kanji data from Jisho API
   * @returns {Promise<number>} Database ID of cached kanji
   */
  static async cacheKanjiData(kanjiData) {
    const query = `
      INSERT INTO kanji (
        character, onyomi, kunyomi, meanings, 
        stroke_count, jlpt_level, grade, last_updated
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      ON CONFLICT (character) 
      DO UPDATE SET
        onyomi = $2,
        kunyomi = $3,
        meanings = $4,
        stroke_count = $5,
        jlpt_level = $6,
        grade = $7,
        last_updated = CURRENT_TIMESTAMP
      RETURNING id
    `;

    const result = await pool.query(query, [
      kanjiData.character,
      kanjiData.onyomi,
      kanjiData.kunyomi,
      kanjiData.meanings,
      kanjiData.strokeCount,
      kanjiData.jlptLevel,
      kanjiData.grade
    ]);

    return result.rows[0].id;
  }

  /**
   * Check if kanji is already cached in database
   * Prevents duplicate API calls and improves performance
   * @param {string} kanjiCharacter - Kanji character to check
   * @returns {Promise<Object|null>} Cached kanji data or null
   */
  static async getCachedKanji(kanjiCharacter) {
    const query = `
      SELECT * FROM kanji 
      WHERE character = $1 
      AND last_updated > NOW() - INTERVAL '7 days'
    `;
    
    const result = await pool.query(query, [kanjiCharacter]);
    return result.rows[0] || null;
  }

  /**
   * Get all JLPT levels with kanji counts
   * Used for filtering interface and statistics
   * @returns {Promise<Array>} Array of JLPT levels with counts
   */
  static async getJLPTLevels() {
    const query = `
      SELECT jlpt_level, COUNT(*) as count
      FROM kanji
      WHERE jlpt_level IS NOT NULL
      GROUP BY jlpt_level
      ORDER BY jlpt_level
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Search kanji by meaning or reading
   * Performs fuzzy search across cached kanji data
   * @param {string} searchTerm - Search query
   * @param {number} limit - Maximum results to return
   * @returns {Promise<Array>} Array of matching kanji
   */
  static async searchKanji(searchTerm, limit = 10) {
    const query = `
      SELECT *
      FROM kanji
      WHERE 
        character ILIKE $1 OR
        onyomi @> ARRAY[$2] OR
        kunyomi @> ARRAY[$2] OR
        meanings @> ARRAY[$2]
      LIMIT $3
    `;
    
    const searchPattern = `%${searchTerm}%`;
    const result = await pool.query(query, [searchPattern, searchTerm, limit]);
    return result.rows;
  }

  /**
   * Get kanji completion status for specific user
   * Checks if user has logged minimum 3 words for kanji
   * @param {number} userId - User ID
   * @param {string} kanjiCharacter - Kanji character
   * @returns {Promise<boolean>} True if kanji is completed by user
   */
  static async getKanjiCompletionStatus(userId, kanjiCharacter) {
    const query = `
      SELECT COUNT(*) as word_count
      FROM user_kanji_words
      WHERE user_id = $1 AND kanji_character = $2
    `;
    
    const result = await pool.query(query, [userId, kanjiCharacter]);
    return result.rows[0].word_count >= 3;
  }

  /**
   * Update kanji cache with fresh data from Jisho API
   * Refreshes stale data and adds new kanji information
   * @param {string} kanjiCharacter - Kanji to update
   * @returns {Promise<Object>} Updated kanji data
   */
  static async refreshKanjiCache(kanjiCharacter) {
    const result = await jisho.searchForKanji(kanjiCharacter);
    if (!result.found) {
      throw new Error('Kanji not found in Jisho API');
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

    await this.cacheKanjiData(kanjiData);
    return kanjiData;
  }

  /**
   * Ensure kanji exists in database, fetch from Jisho if needed
   * @param {string} character - Kanji character
   * @returns {Promise<Object>} Kanji data
   */
  static async ensureKanjiExists(character) {
    // Check if kanji exists in database
    const existingKanji = await pool.query(
      'SELECT * FROM kanji WHERE character = $1',
      [character]
    );

    if (existingKanji.rows[0]) {
      return existingKanji.rows[0];
    }

    // Fetch kanji data from Jisho
    const result = await jisho.searchForKanji(character);
    if (!result.found) {
      throw new Error('Kanji not found in Jisho');
    }

    // Insert kanji into database
    const query = `
      INSERT INTO kanji (
        character, onyomi, kunyomi, meanings,
        stroke_count, jlpt_level, grade
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const kanjiData = {
      character: result.query,
      onyomi: result.onyomi || [],
      kunyomi: result.kunyomi || [],
      meanings: result.meaning.split(', ') || [],
      strokeCount: result.strokeCount || 0,
      jlptLevel: result.jlptLevel || 'Unknown',
      grade: result.grade || 'Unknown'
    };

    const newKanji = await pool.query(query, [
      kanjiData.character,
      kanjiData.onyomi,
      kanjiData.kunyomi,
      kanjiData.meanings,
      kanjiData.strokeCount,
      kanjiData.jlptLevel,
      kanjiData.grade
    ]);

    return newKanji.rows[0];
  }
}

module.exports = Kanji; 
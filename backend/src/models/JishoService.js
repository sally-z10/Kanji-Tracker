const JishoAPI = require('unofficial-jisho-api');
const jisho = new JishoAPI();

/**
 * Jisho API integration service for fetching kanji and vocabulary data
 * Handles API requests, rate limiting, and data normalization
 */
class JishoService {
  static #cache = new Map();
  static #lastRequestTime = 0;
  static #minRequestInterval = 1000; // 1 second between requests

  /**
   * Search for kanji information using Jisho API
   * Fetches detailed kanji data including readings and meanings
   * @param {string} kanjiCharacter - Single kanji character to search
   * @returns {Promise<Object|null>} Normalized kanji data or null if not found
   */
  static async searchKanji(kanjiCharacter) {
    const cacheKey = `kanji:${kanjiCharacter}`;
    const cached = this.getCachedResponse(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.handleRateLimit(() => 
        jisho.searchForKanji(kanjiCharacter)
      );

      if (!this.validateAPIResponse(response, 'kanji')) {
        return null;
      }

      const normalizedData = this.normalizeKanjiData(response);
      this.cacheResponse(cacheKey, normalizedData);
      return normalizedData;
    } catch (error) {
      console.error('Error searching kanji:', error);
      return null;
    }
  }

  /**
   * Search for word information and validate readings
   * Verifies word authenticity and reading accuracy
   * @param {string} word - Word to search for
   * @param {string} reading - Expected reading to validate
   * @returns {Promise<Object>} Word validation result with suggestions
   */
  static async searchWord(word, reading = null) {
    const cacheKey = `word:${word}:${reading}`;
    const cached = this.getCachedResponse(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.handleRateLimit(() => 
        jisho.searchForPhrase(word)
      );

      if (!this.validateAPIResponse(response, 'word')) {
        return { isValid: false, suggestions: [] };
      }

      const normalizedData = this.normalizeWordData(response);
      const result = {
        isValid: reading ? normalizedData.readings.includes(reading) : true,
        suggestions: normalizedData.suggestions
      };

      this.cacheResponse(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error searching word:', error);
      return { isValid: false, suggestions: [] };
    }
  }

  /**
   * Get kanji by JLPT level from Jisho API
   * Fetches kanji list filtered by proficiency level
   * @param {string} jlptLevel - JLPT level (N5, N4, N3, N2, N1)
   * @param {number} limit - Maximum kanji to return
   * @returns {Promise<Array>} Array of kanji for specified level
   */
  static async getKanjiByJLPTLevel(jlptLevel, limit = 100) {
    const cacheKey = `jlpt:${jlptLevel}:${limit}`;
    const cached = this.getCachedResponse(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.handleRateLimit(() => 
        jisho.searchForKanji(jlptLevel)
      );

      if (!this.validateAPIResponse(response, 'kanji')) {
        return [];
      }

      const kanjiList = response.data
        .filter(item => item.jlpt === jlptLevel)
        .slice(0, limit)
        .map(item => this.normalizeKanjiData(item));

      this.cacheResponse(cacheKey, kanjiList);
      return kanjiList;
    } catch (error) {
      console.error('Error fetching JLPT kanji:', error);
      return [];
    }
  }

  /**
   * Normalize kanji data from Jisho API response
   * Converts API response to consistent internal format
   * @param {Object} jishoResponse - Raw response from Jisho API
   * @returns {Object} Normalized kanji data object
   */
  static normalizeKanjiData(jishoResponse) {
    return {
      character: jishoResponse.query,
      onyomi: jishoResponse.onyomi || [],
      kunyomi: jishoResponse.kunyomi || [],
      meanings: jishoResponse.meaning.split(', ') || [],
      strokeCount: jishoResponse.strokeCount || 0,
      jlptLevel: jishoResponse.jlptLevel || 'Unknown',
      grade: jishoResponse.grade || 'Unknown'
    };
  }

  /**
   * Normalize word data from Jisho API response
   * Converts API response to consistent internal format
   * @param {Object} jishoResponse - Raw response from Jisho API
   * @returns {Object} Normalized word data object
   */
  static normalizeWordData(jishoResponse) {
    const firstResult = jishoResponse.data[0];
    if (!firstResult) return null;

    return {
      word: firstResult.japanese[0]?.word || '',
      readings: firstResult.japanese.map(j => j.reading).filter(Boolean),
      meanings: firstResult.senses[0]?.english_definitions || [],
      partsOfSpeech: firstResult.senses[0]?.parts_of_speech || [],
      tags: firstResult.tags || []
    };
  }

  /**
   * Handle API rate limiting with exponential backoff
   * Manages request throttling to respect Jisho API limits
   * @param {Function} apiCall - API function to execute with retry logic
   * @param {number} maxRetries - Maximum retry attempts
   * @returns {Promise<any>} API call result
   */
  static async handleRateLimit(apiCall, maxRetries = 3) {
    let retries = 0;
    while (retries < maxRetries) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.#lastRequestTime;
      
      if (timeSinceLastRequest < this.#minRequestInterval) {
        await new Promise(resolve => 
          setTimeout(resolve, this.#minRequestInterval - timeSinceLastRequest)
        );
      }

      try {
        this.#lastRequestTime = Date.now();
        return await apiCall();
      } catch (error) {
        retries++;
        if (retries === maxRetries) throw error;
        
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, retries) * 1000)
        );
      }
    }
  }

  /**
   * Cache API responses to reduce external requests
   * Stores frequent API responses in memory cache
   * @param {string} cacheKey - Unique key for cached data
   * @param {Object} data - Data to cache
   * @param {number} ttl - Time to live in seconds
   */
  static cacheResponse(cacheKey, data, ttl = 3600) {
    this.#cache.set(cacheKey, {
      data,
      expires: Date.now() + (ttl * 1000)
    });
  }

  /**
   * Retrieve cached API response if available
   * Checks memory cache before making external API call
   * @param {string} cacheKey - Cache key to lookup
   * @returns {Object|null} Cached data or null if expired/missing
   */
  static getCachedResponse(cacheKey) {
    const cached = this.#cache.get(cacheKey);
    if (!cached) return null;

    if (Date.now() > cached.expires) {
      this.#cache.delete(cacheKey);
      return null;
    }

    return cached.data;
  }

  /**
   * Validate API response structure and data quality
   * Ensures API responses meet expected format requirements
   * @param {Object} response - API response to validate
   * @param {string} type - Expected response type (kanji/word)
   * @returns {boolean} True if response is valid
   */
  static validateAPIResponse(response, type) {
    if (!response) return false;

    if (type === 'kanji') {
      return response.found && 
             response.query && 
             (response.onyomi || response.kunyomi);
    }

    if (type === 'word') {
      return response.data && 
             Array.isArray(response.data) && 
             response.data.length > 0 &&
             response.data[0].japanese &&
             response.data[0].senses;
    }

    return false;
  }
}

module.exports = JishoService; 
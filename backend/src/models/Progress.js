const pool = require('../config/db');

/**
 * Progress tracking model for kanji and word progress
 * Manages user learning statistics and completion tracking
 */
class Progress {
  /**
   * Get complete progress overview for user
   * Returns kanji progress, word progress, and completion statistics
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Complete progress data with percentages
   */
  static async getUserProgress(userId) {
    const [kanjiProgress, wordProgress, jlptProgress, streak] = await Promise.all([
      this.getKanjiProgress(userId),
      this.getWordProgress(userId),
      this.getProgressByJLPTLevel(userId),
      this.getLearningStreak(userId)
    ]);

    return {
      kanjiProgress,
      wordProgress,
      jlptProgress,
      streak,
      achievements: await this.getAchievements(userId)
    };
  }

  /**
   * Get kanji progress statistics
   * Counts completed kanji (with 3+ words) vs total kanji
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Kanji progress with completed/total counts
   */
  static async getKanjiProgress(userId) {
    const query = `
      WITH completed_kanji AS (
        SELECT kanji_character
        FROM user_kanji_words
        WHERE user_id = $1
        GROUP BY kanji_character
        HAVING COUNT(*) >= 3
      )
      SELECT 
        COUNT(DISTINCT k.character) as total_kanji,
        COUNT(DISTINCT ck.kanji_character) as completed_kanji
      FROM kanji k
      LEFT JOIN completed_kanji ck ON k.character = ck.kanji_character
    `;

    const result = await pool.query(query, [userId]);
    const { total_kanji, completed_kanji } = result.rows[0];

    return {
      total: total_kanji,
      completed: completed_kanji,
      percentage: total_kanji ? Math.round((completed_kanji / total_kanji) * 100) : 0
    };
  }

  /**
   * Get word progress statistics
   * Counts total words logged and words per kanji averages
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Word progress with total counts and averages
   */
  static async getWordProgress(userId) {
    const query = `
      WITH word_stats AS (
        SELECT 
          COUNT(*) as total_words,
          COUNT(DISTINCT kanji_character) as kanji_with_words,
          COUNT(*)::float / NULLIF(COUNT(DISTINCT kanji_character), 0) as avg_words_per_kanji
        FROM user_kanji_words
        WHERE user_id = $1
      )
      SELECT * FROM word_stats
    `;

    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  /**
   * Update kanji completion status when word threshold is met
   * Triggered by database trigger when 3rd word is logged
   * @param {number} userId - User ID
   * @param {string} kanjiCharacter - Kanji character completed
   * @returns {Promise<void>}
   */
  static async markKanjiComplete(userId, kanjiCharacter) {
    const query = `
      INSERT INTO completed_kanji (user_id, kanji_character, completed_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, kanji_character) DO NOTHING
    `;

    await pool.query(query, [userId, kanjiCharacter]);
  }

  /**
   * Get progress breakdown by JLPT level
   * Shows completion status for each JLPT level (N5-N1)
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Progress breakdown by JLPT level
   */
  static async getProgressByJLPTLevel(userId) {
    const query = `
      WITH completed_kanji AS (
        SELECT kanji_character
        FROM user_kanji_words
        WHERE user_id = $1
        GROUP BY kanji_character
        HAVING COUNT(*) >= 3
      )
      SELECT 
        k.jlpt_level,
        COUNT(DISTINCT k.character) as total_kanji,
        COUNT(DISTINCT ck.kanji_character) as completed_kanji,
        ROUND(COUNT(DISTINCT ck.kanji_character)::float / 
              NULLIF(COUNT(DISTINCT k.character), 0) * 100) as completion_percentage
      FROM kanji k
      LEFT JOIN completed_kanji ck ON k.character = ck.kanji_character
      WHERE k.jlpt_level IS NOT NULL
      GROUP BY k.jlpt_level
      ORDER BY k.jlpt_level
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  /**
   * Get learning streak information
   * Tracks consecutive days of vocabulary logging
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Streak data with current/longest streaks
   */
  static async getLearningStreak(userId) {
    const query = `
      WITH daily_activity AS (
        SELECT DISTINCT DATE(created_at) as activity_date
        FROM user_kanji_words
        WHERE user_id = $1
        ORDER BY activity_date
      ),
      streak_groups AS (
        SELECT 
          activity_date,
          activity_date - ROW_NUMBER() OVER (ORDER BY activity_date)::int as streak_group
        FROM daily_activity
      )
      SELECT 
        COUNT(*) as current_streak,
        MAX(streak_length) as longest_streak
      FROM (
        SELECT COUNT(*) as streak_length
        FROM streak_groups
        GROUP BY streak_group
      ) streaks
      WHERE streak_group = (
        SELECT streak_group
        FROM streak_groups
        WHERE activity_date = CURRENT_DATE
      )
    `;

    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  /**
   * Get daily progress statistics for charting
   * Returns word logging activity over specified time period
   * @param {number} userId - User ID
   * @param {number} days - Number of days to include (default: 30)
   * @returns {Promise<Array>} Daily progress data for visualization
   */
  static async getDailyProgress(userId, days = 30) {
    const query = `
      WITH date_series AS (
        SELECT generate_series(
          CURRENT_DATE - ($2 || ' days')::interval,
          CURRENT_DATE,
          '1 day'::interval
        )::date as date
      ),
      daily_counts AS (
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as words_logged
        FROM user_kanji_words
        WHERE user_id = $1
        AND created_at >= CURRENT_DATE - ($2 || ' days')::interval
        GROUP BY DATE(created_at)
      )
      SELECT 
        ds.date,
        COALESCE(dc.words_logged, 0) as words_logged
      FROM date_series ds
      LEFT JOIN daily_counts dc ON ds.date = dc.date
      ORDER BY ds.date
    `;

    const result = await pool.query(query, [userId, days]);
    return result.rows;
  }

  /**
   * Reset user progress (for testing or user request)
   * Clears all progress while preserving logged words
   * @param {number} userId - User ID
   * @returns {Promise<void>}
   */
  static async resetProgress(userId) {
    const query = `
      DELETE FROM completed_kanji
      WHERE user_id = $1
    `;

    await pool.query(query, [userId]);
  }

  /**
   * Get achievement milestones reached by user
   * Calculates and returns earned achievements based on progress
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of achieved milestones
   */
  static async getAchievements(userId) {
    const achievements = [];
    const progress = await this.getUserProgress(userId);

    // Word count achievements
    const wordCount = progress.wordProgress.total_words;
    if (wordCount >= 1000) achievements.push({ type: 'words', level: 'master', count: 1000 });
    else if (wordCount >= 500) achievements.push({ type: 'words', level: 'advanced', count: 500 });
    else if (wordCount >= 100) achievements.push({ type: 'words', level: 'intermediate', count: 100 });

    // Kanji completion achievements
    const kanjiCompletion = progress.kanjiProgress.completed;
    if (kanjiCompletion >= 1000) achievements.push({ type: 'kanji', level: 'master', count: 1000 });
    else if (kanjiCompletion >= 500) achievements.push({ type: 'kanji', level: 'advanced', count: 500 });
    else if (kanjiCompletion >= 100) achievements.push({ type: 'kanji', level: 'intermediate', count: 100 });

    // Streak achievements
    const streak = progress.streak.current_streak;
    if (streak >= 30) achievements.push({ type: 'streak', level: 'master', days: 30 });
    else if (streak >= 14) achievements.push({ type: 'streak', level: 'advanced', days: 14 });
    else if (streak >= 7) achievements.push({ type: 'streak', level: 'intermediate', days: 7 });

    return achievements;
  }
}

module.exports = Progress; 
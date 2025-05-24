const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const auth = require('../middleware/auth');

// Get complete progress overview
router.get('/', auth, async (req, res) => {
  try {
    const progress = await Progress.getUserProgress(req.user.id);
    res.json(progress);
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Error fetching progress' });
  }
});

// Get kanji progress
router.get('/kanji', auth, async (req, res) => {
  try {
    const progress = await Progress.getKanjiProgress(req.user.id);
    res.json(progress);
  } catch (error) {
    console.error('Error fetching kanji progress:', error);
    res.status(500).json({ error: 'Error fetching kanji progress' });
  }
});

// Get word progress
router.get('/words', auth, async (req, res) => {
  try {
    const progress = await Progress.getWordProgress(req.user.id);
    res.json(progress);
  } catch (error) {
    console.error('Error fetching word progress:', error);
    res.status(500).json({ error: 'Error fetching word progress' });
  }
});

// Get progress by JLPT level
router.get('/jlpt', auth, async (req, res) => {
  try {
    const progress = await Progress.getProgressByJLPTLevel(req.user.id);
    res.json(progress);
  } catch (error) {
    console.error('Error fetching JLPT progress:', error);
    res.status(500).json({ error: 'Error fetching JLPT progress' });
  }
});

// Get learning streak
router.get('/streak', auth, async (req, res) => {
  try {
    const streak = await Progress.getLearningStreak(req.user.id);
    res.json(streak);
  } catch (error) {
    console.error('Error fetching learning streak:', error);
    res.status(500).json({ error: 'Error fetching learning streak' });
  }
});

// Get daily progress
router.get('/daily', auth, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const progress = await Progress.getDailyProgress(req.user.id, days);
    res.json(progress);
  } catch (error) {
    console.error('Error fetching daily progress:', error);
    res.status(500).json({ error: 'Error fetching daily progress' });
  }
});

// Get achievements
router.get('/achievements', auth, async (req, res) => {
  try {
    const achievements = await Progress.getAchievements(req.user.id);
    res.json(achievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Error fetching achievements' });
  }
});

// Reset progress (admin only)
router.delete('/', auth, async (req, res) => {
  try {
    await Progress.resetProgress(req.user.id);
    res.json({ message: 'Progress reset successfully' });
  } catch (error) {
    console.error('Error resetting progress:', error);
    res.status(500).json({ error: 'Error resetting progress' });
  }
});

module.exports = router; 
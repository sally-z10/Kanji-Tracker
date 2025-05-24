const pool = require('../config/db');

async function migrateWordsTable() {
  try {
    // Drop the NOT NULL constraints
    await pool.query(`
      ALTER TABLE user_kanji_words 
      ALTER COLUMN reading DROP NOT NULL,
      ALTER COLUMN meaning DROP NOT NULL
    `);
    
    console.log('Successfully updated user_kanji_words table');
    process.exit(0);
  } catch (error) {
    console.error('Error migrating words table:', error);
    process.exit(1);
  }
}

migrateWordsTable(); 
require('dotenv').config();
const pool = require('../config/db');
const JishoAPI = require('unofficial-jisho-api');
const jisho = new JishoAPI();

// List of basic kanji to initialize
const basicKanji = [
  '日', '月', '水', '木', '金', '火', '土', '人', '口', '手',
  '目', '耳', '足', '山', '川', '田', '天', '中', '大', '小',
  '上', '下', '左', '右', '前', '後', '年', '月', '日', '時',
  '分', '秒', '今', '昨', '明', '毎', '週', '年', '月', '日',
  '一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
  '百', '千', '万', '円', '本', '冊', '個', '枚', '台', '階',
  '時', '分', '秒', '年', '月', '日', '曜', '週', '期', '間',
  '前', '後', '中', '外', '内', '上', '下', '左', '右', '間',
  '東', '西', '南', '北', '方', '向', '道', '路', '駅', '車',
  '電', '気', '水', '火', '風', '雨', '雪', '雷', '雲', '空',
  '地', '海', '山', '川', '森', '林', '花', '草', '木', '葉',
  '鳥', '魚', '虫', '犬', '猫', '馬', '牛', '豚', '羊', '鶏'
];

async function initializeKanji() {
  console.log('Starting kanji initialization...');
  
  for (const character of basicKanji) {
    try {
      console.log(`Fetching data for kanji: ${character}`);
      const result = await jisho.searchForKanji(character);
      
      if (!result.found) {
        console.error(`Kanji not found: ${character}`);
        continue;
      }

      // Truncate meanings to first 3 entries to avoid database constraints
      const meanings = result.meaning.split(', ').slice(0, 3);

      const kanjiData = {
        character: result.query,
        onyomi: result.onyomi || [],
        kunyomi: result.kunyomi || [],
        meanings: meanings,
        strokeCount: result.strokeCount || 0,
        jlptLevel: result.jlptLevel || 'Unknown',
        grade: result.grade || 'Unknown'
      };

      const query = `
        INSERT INTO kanji (
          character, onyomi, kunyomi, meanings,
          stroke_count, jlpt_level, grade
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (character) DO UPDATE SET
          onyomi = $2,
          kunyomi = $3,
          meanings = $4,
          stroke_count = $5,
          jlpt_level = $6,
          grade = $7
      `;

      await pool.query(query, [
        kanjiData.character,
        kanjiData.onyomi,
        kanjiData.kunyomi,
        kanjiData.meanings,
        kanjiData.strokeCount,
        kanjiData.jlptLevel,
        kanjiData.grade
      ]);

      console.log(`Successfully initialized kanji: ${character}`);
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error initializing kanji ${character}:`, error);
    }
  }

  console.log('Kanji initialization complete!');
  process.exit(0);
}

initializeKanji().catch(error => {
  console.error('Fatal error during initialization:', error);
  process.exit(1);
}); 
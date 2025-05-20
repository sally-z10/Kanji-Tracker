// src/pages/KanjiDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVocab } from '../context/VocabContext';
import '../index.css';

const KanjiDetailPage = () => {
  const { kanji } = useParams();
  const navigate = useNavigate();
  const { vocabList, addVocab } = useVocab();
  const [kanjiData, setKanjiData] = useState(null);
  const [newVocab, setNewVocab] = useState('');

  useEffect(() => {
    const mockData = {
      character: kanji,
      onyomi: ['にち', 'じつ'],
      kunyomi: ['ひ'],
      example: ['- sentence'],
    };
    setKanjiData(mockData);
  }, [kanji]);

  const handleAddVocab = () => {
    if (newVocab.trim() !== '') {
      addVocab(kanji, newVocab);
      setNewVocab('');
    }
  };

  if (!kanjiData) {
    return <div>Loading...</div>;
  }

  const kanjiVocabCount = vocabList.filter((item) => item.kanji === kanji).length;

  return (
    <div className="kanji-detail-page">
      <header className="kanji-header">
        <button onClick={() => navigate('/')}>Back</button>
        <div className="kanji-box-large">{kanjiData.character}</div>
      </header>
      <section className="kanji-info">
        <h2>Readings</h2>
        <div className="readings">
          <p><strong>Onyomi:</strong> {kanjiData.onyomi.join(', ')}</p>
          <p><strong>Kunyomi:</strong> {kanjiData.kunyomi.join(', ')}</p>
        </div>
        <h2>Example</h2>
        <p>{kanjiData.example.join(', ')}</p>
      </section>
      <section className="vocab-section">
        <h2>Add Vocabulary</h2>
        <div className="vocab-input">
          <input
            type="text"
            value={newVocab}
            onChange={(e) => setNewVocab(e.target.value)}
            placeholder="Enter word to study"
          />
          <button onClick={handleAddVocab}>Add</button>
        </div>
        <ul>
          {vocabList
            .filter((item) => item.kanji === kanji)
            .map((item, index) => (
              <li key={index}>{item.word}</li>
            ))}
        </ul>
        {kanjiVocabCount >= 4 && <p>Fully Studied!</p>}
      </section>
    </div>
  );
};

export default KanjiDetailPage;
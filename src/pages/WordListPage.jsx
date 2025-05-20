// src/pages/WordListPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useVocab } from '../context/VocabContext';
import '../index.css';

const WordListPage = () => {
  const navigate = useNavigate();
  const { vocabList } = useVocab();

  return (
    <div className="word-list-page">
      <header className="word-list-header">
        <button onClick={() => navigate('/')}>Back</button>
        <h1>Your Word List</h1>
      </header>
      <section className="word-list-section">
        {vocabList.length === 0 ? (
          <p>No words added yet.</p>
        ) : (
          <ul>
            {vocabList.map((item, index) => (
              <li key={index}>{`${item.kanji}:  ${item.word}`}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default WordListPage;
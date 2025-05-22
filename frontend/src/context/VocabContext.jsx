// src/context/VocabContext.jsx
import React, { createContext, useContext, useState } from 'react';

const VocabContext = createContext();

const VocabProvider = ({ children }) => {
  const [vocabList, setVocabList] = useState([]); // Format: [{ kanji: '日', word: '太陽' }, ...]

  const addVocab = (kanji, word) => {
    setVocabList((prev) => [...prev, { kanji, word }]);
  };

  return (
    <VocabContext.Provider value={{ vocabList, addVocab }}>
      {children}
    </VocabContext.Provider>
  );
};

// Define useVocab as a standalone custom hook
const useVocab = () => {
  const context = useContext(VocabContext);
  if (!context) {
    throw new Error('useVocab must be used within a VocabProvider');
  }
  return context;
};

// Export the provider and hook
export { VocabProvider, useVocab };
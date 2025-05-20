import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { VocabProvider } from './context/VocabContext';
import MainPage from './pages/MainPage';
import KanjiDetailPage from './pages/KanjiDetailPage';
import ProfilePage from './pages/ProfilePage';
import WordListPage from './pages/WordListPage';
import HowToUsePage from './pages/HowToUsePage';

function App() {
  return (
    <VocabProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/kanji/:kanji" element={<KanjiDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/wordlist" element={<WordListPage />} />
          <Route path="/howto" element={<HowToUsePage />} />
        </Routes>
      </Router>
    </VocabProvider>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SearchBar from '../components/search-bar';
import WelcomeMessage from '../components/messages';
import RefreshButton from '../components/buttons';
import KanjiBox from '../components/kanji-box';
import Sidebar from '../components/side-bar';
import '../index.css';

const MainPage = () => {
  const [suggestedKanji, setSuggestedKanji] = useState(['山', '水', '田', '月']);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, isLoggedIn } = useAuth();

  useEffect(() => {
    fetchSuggestedKanji();
  }, []);

  const fetchSuggestedKanji = () => {
    const newKanji = ['日', '中', '木', '川'];
    setSuggestedKanji(newKanji);
  };

  const handleSearch = (query) => {
    console.log('Search query:', query);
  };

  const handleKanjiClick = (kanji) => {
    navigate(`/kanji/${kanji}`);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="main-page">
      <header className="header">
        <button className="hamburger-menu" onClick={toggleSidebar}>
          ☰
        </button>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search Kanji"
            onChange={(e) => handleSearch(e.target.value)}
          />
          <button>Search</button>
        </div>
        {isLoggedIn && (
          <button className="refresh-button" onClick={logout}>
            Logout
          </button>
        )}
      </header>
      <main className="main-content">
        <h1 className="welcome-message">Welcome, {isLoggedIn ? 'User' : 'Guest'}!</h1>
        <div className="kanji-grid">
          {suggestedKanji.map((kanji, index) => (
            <div
              key={index}
              className="kanji-box"
              onClick={() => handleKanjiClick(kanji)}
            >
              {kanji}
            </div>
          ))}
        </div>
        <button className="refresh-button kanji-refresh-button" onClick={fetchSuggestedKanji}>
          Refresh Kanji
        </button>
      </main>
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button className="close-button" onClick={toggleSidebar}>
          ✕
        </button>
        <ul>
          <li><Link to="/profile" onClick={toggleSidebar}>Profile</Link></li>
          <li><Link to="/wordlist" onClick={toggleSidebar}>Your Word List</Link></li>
          <li><Link to="/howto" onClick={toggleSidebar}>How to Use</Link></li>
        </ul>
      </aside>
    </div>
  );
};

export default MainPage;
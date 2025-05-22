import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const HowToUsePage = () => {
  const navigate = useNavigate();

  return (
    <div className="how-to-use-page">
      <header className="how-to-use-header">
        <button onClick={() => navigate('/')}>Back</button>
        <h1>How to Use</h1>
      </header>
      <section className="how-to-use-section">
        <h2>Getting Started</h2>
        <p>1. Browse Kanji on the main page and click one to learn more.</p>
        <p>2. Add vocabulary words to study each Kanji.</p>
        <p>3. Track your progress in the Profile page.</p>
        <p>4. View all your added words in Your Word List.</p>
      </section>
    </div>
  );
};

export default HowToUsePage;
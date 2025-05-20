import React from 'react';

const KanjiBox = ({ kanji }) => {
  const handleClick = () => {
    console.log(`Selected Kanji: ${kanji}`);
    // Add logic to show Kanji details later
  };

  return (
    <div className="kanji-box" onClick={handleClick}>
      <span>{kanji}</span>
    </div>
  );
};

export default KanjiBox;
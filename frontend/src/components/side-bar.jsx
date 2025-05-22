import React from 'react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <button className="close-button" onClick={toggleSidebar}>
        ✕
      </button>
      <ul>
        <li><a href="#profile">Profile</a></li>
        <li><a href="#wordlist">Your Word List</a></li>
        <li><a href="#howto">How to Use</a></li>
      </ul>
    </aside>
  );
};

export default Sidebar;
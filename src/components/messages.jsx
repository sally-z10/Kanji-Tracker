import React from 'react';

const WelcomeMessage = ({ userName }) => {
  return (
    <div>
      <h1 className="welcome-message">
      Welcome, {userName}!
      </h1>
    </div>
  );
};

export default WelcomeMessage;
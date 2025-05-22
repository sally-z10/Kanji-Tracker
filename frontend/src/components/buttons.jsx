import React from 'react';

const RefreshButton = ({ onRefresh }) => {
  return (
    <button onClick={onRefresh} className="refresh-button">
      Refresh Work!
    </button>
  );
};

export default RefreshButton;
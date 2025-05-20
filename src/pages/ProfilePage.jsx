import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const user = { username: 'User', email: 'user@example.com' }; // Mock user data
  const studiedKanji = 10; // Mock progress data

  return (
    <div className="profile-page">
      <header className="profile-header">
        <button onClick={() => navigate('/')}>Back</button>
        <h1>Profile</h1>
      </header>
      <section className="profile-info">
        <div className="profile-card">
          <h2>{user.username}</h2>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Kanji Studied:</strong> {studiedKanji}</p>
          <button className="edit-profile-btn">Edit Profile</button>
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
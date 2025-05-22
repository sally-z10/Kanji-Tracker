import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useVocab } from '../context/VocabContext';
import '../index.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { username, userProfile, updateProfile } = useAuth();
  const { vocabList } = useVocab();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(userProfile.name);
  const [newPicture, setNewPicture] = useState(null);

  // Calculate total Kanji learned (unique Kanji in vocabList)
  const uniqueKanji = [...new Set(vocabList.map((item) => item.kanji))];
  const totalKanjiLearned = uniqueKanji.length;

  // Calculate total words added
  const totalWordsAdded = vocabList.length;

  const handleEditSubmit = (e) => {
    e.preventDefault();
    let pictureUrl = userProfile.picture;
    if (newPicture) {
      // Convert uploaded file to a base64 string (simulating a real upload)
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProfile(newName, reader.result);
        setIsEditing(false);
        setNewPicture(null);
      };
      reader.readAsDataURL(newPicture);
    } else {
      updateProfile(newName, pictureUrl);
      setIsEditing(false);
    }
  };

  return (
    <div className="profile-page">
      <header className="profile-header">
        <button onClick={() => navigate('/')}>Back</button>
        <h1>Profile</h1>
      </header>
      <section className="profile-info">
        <div className="profile-card">
          {userProfile.picture ? (
            <img
              src={userProfile.picture}
              alt="Profile"
              className="profile-picture"
            />
          ) : (
            <div className="profile-picture-placeholder">No Picture</div>
          )}
          <h2>Username: {username}</h2>
          <p><strong>Name:</strong> {userProfile.name}</p>
          <p><strong>Total Kanji Learned:</strong> {totalKanjiLearned}</p>
          <p><strong>Total Words Added:</strong> {totalWordsAdded}</p>
          {!isEditing ? (
            <button
              className="edit-profile-btn"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          ) : (
            <form onSubmit={handleEditSubmit} className="edit-profile-form">
              <div>
                <label>Name:</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Profile Picture:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewPicture(e.target.files[0])}
                />
              </div>
              <button type="submit" className="save-profile-btn">
                Save
              </button>
              <button
                type="button"
                className="cancel-profile-btn"
                onClick={() => {
                  setIsEditing(false);
                  setNewName(userProfile.name);
                  setNewPicture(null);
                }}
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
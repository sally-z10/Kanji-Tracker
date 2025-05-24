import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUser, updateUser } from '../utils/api';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [username, setUsername] = useState(''); // New state for editing username
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await getUser(token);
          setUser(userData);
          setProfilePictureUrl(userData.profilePictureUrl || '');
          setUsername(userData.username || ''); // Initialize username state
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);
  

  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token && user) {
        // Update user with both profile picture and username
        const updatedUser = await updateUser(token, { ...user, profilePictureUrl, username });
        setUser(updatedUser); // Update local user state with the response
        setIsEditing(false);
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    }
  };

  if (!user) return <p className="loading-text">Loading...</p>;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <Link to="/">
          <button className="back-button">Back</button>
        </Link>
        <h1 className="profile-heading">Profile</h1>
      </div>
      <div className="profile-info">
        <div className="profile-card">
          {profilePictureUrl ? (
            <img
              src={profilePictureUrl}
              alt="Profile"
              className="profile-picture"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/100'; // Fallback image
              }}
            />
          ) : (
            <div className="profile-picture-placeholder">No Image</div>
          )}
          {isEditing ? (
            <>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="profile-input profile-username-input"
              />
              <input
                type="text"
                value={profilePictureUrl}
                onChange={(e) => setProfilePictureUrl(e.target.value)}
                placeholder="Profile picture URL"
                className="profile-input profile-picture-input"
              />
            </>
          ) : (
            <>
              <p className="profile-detail"><strong>Username:</strong> {user.username}</p>
              <p className="profile-detail"><strong>Email:</strong> {user.email || 'Not set'}</p>
            </>
          )}
          {isEditing ? (
            <div className="profile-actions">
              <button onClick={handleUpdateProfile} className="save-button">
                Save Changes
              </button>
              <button onClick={() => setIsEditing(false)} className="cancel-button">
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setIsEditing(true)} className="edit-button">
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
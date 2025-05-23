import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUser, updateUser } from '../utils/api';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
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
        await updateUser(token, { ...user, profilePictureUrl });
        setIsEditing(false);
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <Link to="/">
          <button className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Back</button>
        </Link>
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
      </div>
      <div className="profile-info flex flex-col items-center">
        <div className="profile-card p-6 bg-white shadow-md rounded-lg border border-gray-200 max-w-md w-full">
          {profilePictureUrl ? (
            <img
              src={profilePictureUrl}
              alt="Profile"
              className="profile-picture mb-4"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/100'; // Fallback image
              }}
            />
          ) : (
            <div className="profile-picture-placeholder mb-4">No Image</div>
          )}
          <p className="text-lg"><strong>Username:</strong> {user.username}</p>
          <p className="text-lg"><strong>Name:</strong> {user.name || 'Not set'}</p>
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Stats</h2>
            <p className="text-lg">Kanji Learned: {user.kanjiLearned || 0}</p>
            <p className="text-lg">Words Added: {user.wordsAdded || 0}</p>
          </div>
          {isEditing ? (
            <div className="mt-4 flex flex-col items-center">
              <input
                type="text"
                value={profilePictureUrl}
                onChange={(e) => setProfilePictureUrl(e.target.value)}
                placeholder="Profile picture URL"
                className="border p-2 rounded mb-2 w-full max-w-xs"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleUpdateProfile}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Change Profile
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Change Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, updateUser, getVocab } from '../utils/api';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [vocabList, setVocabList] = useState([]);
  const [name, setName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const userData = await getUser(token);
        setUser(userData);
        setName(userData.name);
        setProfilePicture(userData.profilePicture || '');

        const vocabData = await getVocab(token);
        setVocabList(vocabData);
      } catch (error) {
        console.error('Error fetching data:', error);
        localStorage.removeItem('token');
        navigate('/login');
      }
    };
    fetchData();
  }, [token, navigate]);

  const handleUpdate = async () => {
    try {
      await updateUser(token, name, profilePicture);
      const updatedUser = await getUser(token);
      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Profile</h1>
      <div className="mb-4">
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Name:</strong> {user.name}</p>
        {user.profilePicture && (
          <img src={user.profilePicture} alt="Profile" className="w-32 h-32 rounded-full mt-2" />
        )}
      </div>
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Stats</h2>
        <p><strong>Kanji Learned:</strong> {new Set(vocabList.map((v) => v.kanji)).size}</p>
        <p><strong>Words Added:</strong> {vocabList.length}</p>
      </div>
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Update Profile</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Update name"
          className="border p-2 mr-2"
        />
        <input
          type="text"
          value={profilePicture}
          onChange={(e) => setProfilePicture(e.target.value)}
          placeholder="Profile picture URL"
          className="border p-2 mr-2"
        />
        <button onClick={handleUpdate} className="bg-blue-500 text-white p-2 rounded">
          Update
        </button>
      </div>
      <button onClick={handleLogout} className="bg-red-500 text-white p-2 rounded">
        Logout
      </button>
    </div>
  );
};

export default ProfilePage;
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MainPage from './pages/MainPage';
import KanjiDetailPage from './pages/KanjiDetailPage';
import ProfilePage from './pages/ProfilePage';
import WordListPage from './pages/WordListPage';
import HowToUsePage from './pages/HowToUsePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignUpPage';
import { getUser } from './utils/api'; // Use getUser instead of getProfile

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const fetchUser = async () => {
        try {
          const userData = await getUser(token);
          setUser(userData);
        } catch (error) {
          console.error('Error fetching user:', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      };
      fetchUser();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <Router>
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 text-white h-screen p-4">
          <h1 className="text-2xl font-bold mb-4">Kanji Tracker</h1>
          <nav>
            <Link to="/" className="block py-2 px-4 hover:bg-gray-700">Home</Link>
            {user ? (
              <>
                <Link to="/profile" className="block py-2 px-4 hover:bg-gray-700">Profile</Link>
                <Link to="/wordlist" className="block py-2 px-4 hover:bg-gray-700">Your Word List</Link>
                <Link to="/howtouse" className="block py-2 px-4 hover:bg-gray-700">How to Use</Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 px-4 hover:bg-gray-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 px-4 hover:bg-gray-700">Login</Link>
                <Link to="/signup" className="block py-2 px-4 hover:bg-gray-700">Sign Up</Link>
              </>
            )}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4">
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/kanji/:kanji" element={<KanjiDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/wordlist" element={<WordListPage />} />
            <Route path="/howtouse" element={<HowToUsePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
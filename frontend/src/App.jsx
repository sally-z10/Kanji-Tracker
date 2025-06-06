import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MainPage from './pages/MainPage';
import KanjiDetailPage from './pages/KanjiDetailPage';
import ProfilePage from './pages/ProfilePage';
import WordListPage from './pages/WordListPage';
import HowToUsePage from './pages/HowToUsePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignUpPage';
import { getUser } from './utils/api';

const App = () => {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Initial token check:', token);
    if (token) {
      const fetchUser = async () => {
        try {
          console.log('Fetching user data with token:', token);
          const userData = await getUser(token);
          console.log('User data received:', userData);
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
    console.log('Logging out...');
    localStorage.removeItem('token');
    setUser(null);
    console.log('Logout complete, user state:', null);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Router>
      <div className="main-page">
        <header className="header">
          <button className="hamburger-menu" onClick={toggleSidebar}>
            ☰
          </button>
          <h1 className="header-text">Kanji Tracker</h1>
          {user && (
            <div className="header-controls">
              <span className="user-greeting">Welcome, {user.username}!</span>
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </header>
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <button className="close-button" onClick={toggleSidebar}>
            ×
          </button>
          <h1 className="text-2xl font-bold mb-4">Kanji Tracker</h1>
          <nav>
            <Link to="/" className="block py-2 px-4 hover:bg-gray-700" onClick={toggleSidebar}>Home</Link>
            {user ? (
              <>
                <Link to="/profile" className="block py-2 px-4 hover:bg-gray-700" onClick={toggleSidebar}>Profile</Link>
                <Link to="/wordlist" className="block py-2 px-4 hover:bg-gray-700" onClick={toggleSidebar}>Your Word List</Link>
                <Link to="/howtouse" className="block py-2 px-4 hover:bg-gray-700" onClick={toggleSidebar}>How to Use</Link>
                <button
                  onClick={() => { handleLogout(); toggleSidebar(); }}
                  className="logout-button"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 px-4 hover:bg-gray-700" onClick={toggleSidebar}>Login</Link>
                <Link to="/signup" className="block py-2 px-4 hover:bg-gray-700" onClick={toggleSidebar}>Sign Up</Link>
              </>
            )}
          </nav>
        </aside>
        <main className={`main-content ${sidebarOpen ? 'ml-[200px]' : ''}`}>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/kanji/:kanji" element={<KanjiDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/wordlist" element={<WordListPage />} />
            <Route path="/howtouse" element={<HowToUsePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
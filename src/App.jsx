import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { VocabProvider } from './context/VocabContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainPage from './pages/MainPage';
import KanjiDetailPage from './pages/KanjiDetailPage';
import ProfilePage from './pages/ProfilePage';
import WordListPage from './pages/WordListPage';
import HowToUsePage from './pages/HowToUsePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';

function App() {
  return (
    <AuthProvider>
      <VocabProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route
              path="/"
              element={<RequireAuth><MainPage /></RequireAuth>}
            />
            <Route
              path="/kanji/:kanji"
              element={<RequireAuth><KanjiDetailPage /></RequireAuth>}
            />
            <Route
              path="/profile"
              element={<RequireAuth><ProfilePage /></RequireAuth>}
            />
            <Route
              path="/wordlist"
              element={<RequireAuth><WordListPage /></RequireAuth>}
            />
            <Route
              path="/howto"
              element={<RequireAuth><HowToUsePage /></RequireAuth>}
            />
          </Routes>
        </Router>
      </VocabProvider>
    </AuthProvider>
  );
}

const RequireAuth = ({ children }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

export default App;
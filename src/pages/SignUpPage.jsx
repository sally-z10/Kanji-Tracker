import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../index.css';

const SignUpPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = (e) => {
    e.preventDefault();
    if (signup(username, password)) {
      setError('');
      navigate('/login'); // Redirect to login after signup
    } else {
      setError('Username already taken');
    }
  };

  return (
    <div className="signup-page">
      <header className="signup-header">
        <h1>Welcome to Kanji Tracker!</h1>
        <p>Sign Up to track your Kanji Journey</p>
      </header>
      <section className="signup-section">
        <form onSubmit={handleSignUp}>
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit" className="signup-button">Sign Up</button>
        </form>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </section>
    </div>
  );
};

export default SignUpPage;
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup } from '../utils/api';
import '../index.css';


const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await signup(email, username, password);
      localStorage.setItem('token', response.token);
      window.location.href = '/';
    } catch (err) {
      setError('Signup failed: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-header">
        <h1>Hello, there!</h1>
        <p>Please sign up to create an account</p>
      </div>
      <div className="signup-section">
      <form onSubmit={handleSignup} className="">
        <h2>Sign Up</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div>
          <label>Email: </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Username: </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password: </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">
          Sign Up
        </button>
      </form>
    </div>
      <div className="login-link">
        <p>Already have an account? <a href="/login">Login</a></p>
      </div>
    </div>
  );
};

export default SignupPage;
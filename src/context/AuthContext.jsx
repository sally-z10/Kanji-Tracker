import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState([
    { username: 'user', password: 'pass' }, // Default user
  ]);

  const login = (user, pass) => {
    const foundUser = users.find(
      (u) => u.username === user && u.password === pass
    );
    if (foundUser) {
      setIsLoggedIn(true);
      setUsername(user);
      return true;
    }
    return false;
  };

  const signup = (user, pass) => {
    // Check if username already exists
    if (users.some((u) => u.username === user)) {
      return false; // Username taken
    }
    setUsers([...users, { username: user, password: pass }]);
    return true; // Signup successful
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUsername('');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState([
    { username: 'user', password: 'pass', name: 'Default User', picture: '' },
  ]);
  const [userProfile, setUserProfile] = useState({ name: '', picture: '' });

  const login = (user, pass) => {
    const foundUser = users.find(
      (u) => u.username === user && u.password === pass
    );
    if (foundUser) {
      setIsLoggedIn(true);
      setUsername(user);
      setUserProfile({ name: foundUser.name, picture: foundUser.picture });
      return true;
    }
    return false;
  };

  const signup = (user, pass) => {
    if (users.some((u) => u.username === user)) {
      return false;
    }
    const newUser = { username: user, password: pass, name: user, picture: '' };
    setUsers([...users, newUser]);
    return true;
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setUserProfile({ name: '', picture: '' });
  };

  const updateProfile = (newName, newPicture) => {
    setUserProfile({ name: newName, picture: newPicture });
    setUsers(users.map((u) => 
      u.username === username ? { ...u, name: newName, picture: newPicture } : u
    ));
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, userProfile, login, signup, logout, updateProfile }}>
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
import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");

  // Load user from localStorage on refresh
  useEffect(() => {
    const savedUser = localStorage.getItem("reelstream_user");
    const savedToken = localStorage.getItem("reelstream_token");

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
  }, []);

  // LOGIN — Save user + token returned from backend
  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);

    localStorage.setItem("reelstream_user", JSON.stringify(userData));
    localStorage.setItem("reelstream_token", authToken);
  };

  // LOGOUT — Clear everything
  const logout = () => {
    setUser(null);
    setToken("");

    localStorage.removeItem("reelstream_user");
    localStorage.removeItem("reelstream_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
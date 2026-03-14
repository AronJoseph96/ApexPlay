import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user,  setUserState] = useState(null);
  const [token, setToken]     = useState("");

  useEffect(() => {
    const savedUser  = localStorage.getItem("apexplay_user");
    const savedToken = localStorage.getItem("apexplay_token");
    if (savedUser && savedToken) {
      setUserState(JSON.parse(savedUser));
      setToken(savedToken);
    }
  }, []);

  const login = (userData, authToken) => {
    setUserState(userData);
    setToken(authToken);
    localStorage.setItem("apexplay_user",  JSON.stringify(userData));
    localStorage.setItem("apexplay_token", authToken);
  };

  // Exposed so Profile page can update user without full re-login
  const setUser = (updated) => {
    setUserState(updated);
    localStorage.setItem("apexplay_user", JSON.stringify(updated));
  };

  const logout = () => {
    setUserState(null);
    setToken("");
    localStorage.removeItem("apexplay_user");
    localStorage.removeItem("apexplay_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
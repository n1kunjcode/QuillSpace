import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

function getUserFromToken() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      return null;
    }
    return decoded;
  } catch {
    localStorage.removeItem("token");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // true until first token check
  const [userMeta, setUserMeta] = useState(() => {
    try {
      const saved = localStorage.getItem("user_meta");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  useEffect(() => {
    // Restore auth state synchronously from localStorage
    const tokenUser = getUserFromToken();
    if (tokenUser) setUser(tokenUser);
    setAuthLoading(false); // done checking — let guards and data fetches proceed
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user_meta", JSON.stringify(userData));
    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
    } catch {
      setUser(userData);
    }
    setUserMeta(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_meta");
    setUser(null);
    setUserMeta(null);
  };

  const isAuthenticated = !!user;
  const isAdmin = !!(userMeta && userMeta.isAdmin);

  return (
    <AuthContext.Provider value={{ user, userMeta, login, logout, isAuthenticated, authLoading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
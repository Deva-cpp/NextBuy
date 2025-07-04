import { createContext, useContext, useEffect, useState } from "react";
const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const storedIsLoggedIn = JSON.parse(localStorage.getItem("isLoggedIn"));
  const [user, setUser] = useState(storedUser || null);
  const [isLoggedIn, setIsLoggedIn] = useState(storedIsLoggedIn || false);
  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("isLoggedIn", JSON.stringify(isLoggedIn));
  }, [user, isLoggedIn]);
  const login = async (credentials) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        setIsLoggedIn(true);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("isLoggedIn", true);
      } else {
        console.error("❌ Login failed:", data.message);
      }
    } catch (error) {
      console.error("❌ Login error:", error);
    }
  };
  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
  };
  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn, login, logout, setUser, setIsLoggedIn }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

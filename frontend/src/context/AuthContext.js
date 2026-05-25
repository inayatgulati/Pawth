import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const API = process.env.REACT_APP_API_URL;
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);

  // Decode token + fetch full profile to get profilePicUrl and displayName
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded); // set basic info first (id, username, role)

        // Then fetch full profile to get profilePicUrl and displayName
        fetch(`${API}/api/users/profile`, {
          headers: { Authorization: token },
        })
          .then((r) => r.json())
          .then((data) => {
            setUser((prev) => ({
              ...prev,
              profilePicUrl: data.profilePicUrl || "",
              displayName: data.displayName || "",
              email: data.email || "",
            }));
          })
          .catch(() => {});
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
  };
  const refreshProfile = () => {
    if (!token) return;
    fetch(`${API}/api/users/profile`, {
      headers: { Authorization: token },
    })
      .then((r) => r.json())
      .then((data) => {
        setUser((prev) => ({
          ...prev,
          profilePicUrl: data.profilePicUrl || "",
          displayName: data.displayName || "",
          email: data.email || "",
        }));
      })
      .catch(() => {});
  };

  return (
    <AuthContext.Provider
      value={{ token, user, login, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

import { createContext, useState, useEffect } from "react";
import API_BASE from "../config.js"

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user"))
  );
  const [authChecked, setAuthChecked] = useState(false); //Avoid flicker

  useEffect(() => {
    fetch(`${API_BASE}/auth/verify`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data.loggedIn) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        } else {
          setUser(null);
          localStorage.removeItem("user");
        }
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem("user");
      })
      .finally(() => setAuthChecked(true));
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, authChecked }}>
      {children}
    </AuthContext.Provider>
  );
}

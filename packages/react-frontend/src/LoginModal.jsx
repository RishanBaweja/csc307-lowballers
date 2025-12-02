// LoginModal.jsx
import { useContext, useState } from "react";
import { AuthContext } from "./context/AuthContext.jsx";
import API_BASE from "./config.js";
import "./loginModal.css"; // styles below

export default function LoginModal() {
  const { setUser } = useContext(AuthContext);
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const endpoint = isRegistering ? "register" : "login";

    try {
      const res = await fetch(`${API_BASE}/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || "Something went wrong");
        return;
      }

      // Backend returns { user: {...} } on login, and on register you're sending user as well
      setUser(data.user || data.userData || data);
      localStorage.setItem("user", JSON.stringify(data.user || data.userData || data));
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-overlay">
      <div className="login-modal">
        <h2>{isRegistering ? "Create an Account" : "Log In"}</h2>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            autoComplete="username"
          />
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            autoComplete={isRegistering ? "new-password" : "current-password"}
          />

          {errorMsg && <p className="login-error">{errorMsg}</p>}

          <button type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : isRegistering
              ? "Register"
              : "Login"}
          </button>

          <button
            type="button"
            className="login-toggle"
            onClick={() => setIsRegistering(prev => !prev)}
          >
            {isRegistering
              ? "Already have an account? Log in"
              : "Need an account? Register"}
          </button>
        </form>
      </div>
    </div>
  );
}

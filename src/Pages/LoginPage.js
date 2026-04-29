import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API = "http://localhost:5002";

export default function LoginPage() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "Login failed");

    login(data.token); // saves token to localStorage via AuthContext
    navigate("/dashboard");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-logo">🐾 Pawth</h1>
        <h2>Welcome Back</h2>
        {error && <p className="auth-error">{error}</p>}
        <form className="form" onSubmit={handleSubmit}>
          <label>Username</label>
          <input
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <label>Password</label>
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" className="btn-primary">
            Log In
          </button>
        </form>
        <p className="auth-switch">
          New here? <Link to="/register">Join as a Member</Link>
        </p>
        <p className="auth-switch">
          Forgot your password? <Link to="/forgot-password">Reset it</Link>
        </p>
      </div>
    </div>
  );
}

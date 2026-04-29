import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API = "http://localhost:5002";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await fetch(`${API}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "Something went wrong.");
    if (!data.resetToken) return setError("No account found with that email.");

    // Redirect to reset page with token in URL
    navigate(`/reset-password?token=${data.resetToken}`);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-logo">🐾 Pawth</h1>
        <h2>Forgot Password</h2>
        {error && <p className="auth-error">{error}</p>}
        <form className="form" onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
          <button type="submit" className="btn-primary">
            Rest New Password
          </button>
        </form>
        <p className="auth-switch">
          Remembered it? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

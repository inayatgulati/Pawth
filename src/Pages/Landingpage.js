import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Landing.css";

const PETS = ["🐶", "🐱", "🐰", "🐹", "🦜", "🐠", "🐾", "🦮", "🐈", "🦔"];

const FEATURES = [
  {
    icon: "📸",
    title: "Share Your World",
    desc: "Post photos and stories of your pets. Celebrate the little moments that make every day special.",
    color: "#b8a6e6",
    bg: "#f3f0fc",
  },
  {
    icon: "📍",
    title: "Discover Pet Places",
    desc: "Find vet clinics, dog parks, groomers, and pet-friendly cafés near you — all in one map.",
    color: "#7f9f80",
    bg: "#eef4ee",
  },
  {
    icon: "🤝",
    title: "Build Community",
    desc: "Connect with fellow pet lovers. Save your favourites, leave reactions, and grow together.",
    color: "#c8956c",
    bg: "#fdf3ec",
  },
];

export default function LandingPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [floaters, setFloaters] = useState([]);

  // Redirect logged-in users straight to the feed
  useEffect(() => {
    if (token) navigate("/dashboard");
  }, [token, navigate]);

  // Generate floating pet emojis once
  useEffect(() => {
    setFloaters(
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        emoji: PETS[i % PETS.length],
        left: `${Math.random() * 90 + 5}%`,
        delay: `${Math.random() * 12}s`,
        duration: `${14 + Math.random() * 10}s`,
        size: `${1.1 + Math.random() * 1.4}rem`,
        opacity: 0.18 + Math.random() * 0.22,
      })),
    );
  }, []);

  return (
    <div className="landing-shell">
      {/* Floating background emojis */}
      <div className="landing-floaters" aria-hidden="true">
        {floaters.map((f) => (
          <span
            key={f.id}
            className="landing-floater"
            style={{
              left: f.left,
              fontSize: f.size,
              opacity: f.opacity,
              animationDelay: f.delay,
              animationDuration: f.duration,
            }}
          >
            {f.emoji}
          </span>
        ))}
      </div>

      {/* Blob shapes */}
      <div className="landing-blob landing-blob-1" aria-hidden="true" />
      <div className="landing-blob landing-blob-2" aria-hidden="true" />
      <div className="landing-blob landing-blob-3" aria-hidden="true" />

      {/* ── Nav ── */}
      <nav className="landing-nav">
        <span className="landing-nav-logo">🐾 Pawth</span>
        <div className="landing-nav-links">
          <button
            className="landing-btn-ghost"
            onClick={() => navigate("/login")}
          >
            Log In
          </button>
          <button
            className="landing-btn-primary"
            onClick={() => navigate("/register")}
          >
            Join Free
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="landing-hero">
        <div className="landing-hero-badge">
          The social app made for pet lovers
        </div>

        <h1 className="landing-hero-title">
          Every pet has a<br />
          <span className="landing-hero-accent">story worth sharing</span>
        </h1>

        <p className="landing-hero-sub">
          Pawth is the cozy corner of the internet where your pets are the
          stars. Share moments, find local pet spots, and connect with a
          community that gets it.
        </p>

        <div className="landing-hero-ctas">
          <button
            className="landing-cta-primary"
            onClick={() => navigate("/register")}
          >
            Get Started
            <span className="landing-cta-arrow">→</span>
          </button>
          <button
            className="landing-cta-secondary"
            onClick={() => navigate("/dashboard")}
          >
            Browse the feed
          </button>
        </div>

        <p className="landing-hero-note">
          No ads. No algorithm games. Just pets. 🐾
        </p>
      </section>

      {/* ── Preview pill ── */}
      <div className="landing-preview-row" aria-hidden="true">
        {[
          "🐶 Golden moment",
          "🐱 Cat nap vibes",
          "🐰 Bunny hour",
          "🦜 Morning chirps",
          "🐾 Walk time",
        ].map((t, i) => (
          <div className="landing-preview-pill" key={i}>
            {t}
          </div>
        ))}
        {[
          "🐶 Golden moment",
          "🐱 Cat nap vibes",
          "🐰 Bunny hour",
          "🦜 Morning chirps",
          "🐾 Walk time",
        ].map((t, i) => (
          <div
            className="landing-preview-pill"
            key={`b${i}`}
            aria-hidden="true"
          >
            {t}
          </div>
        ))}
      </div>

      {/* ── Features ── */}
      <section className="landing-features">
        <p className="landing-section-eyebrow">Why Pawth?</p>
        <h2 className="landing-section-title">
          Everything your pet life needs
        </h2>
        <div className="landing-features-grid">
          {FEATURES.map((f) => (
            <div
              className="landing-feature-card"
              key={f.title}
              style={{ "--card-color": f.color, "--card-bg": f.bg }}
            >
              <div className="landing-feature-icon">{f.icon}</div>
              <h3 className="landing-feature-title">{f.title}</h3>
              <p className="landing-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Social proof ── */}
      <section className="landing-social">
        <div className="landing-social-avatars">
          {["🐶", "🐱", "🦮", "🐈", "🐰"].map((e, i) => (
            <div key={i} className="landing-social-avatar">
              {e}
            </div>
          ))}
        </div>
        <p className="landing-social-text">
          Join a growing community of pet lovers sharing joy every day
        </p>
      </section>

      {/* ── CTA banner ── */}
      <section className="landing-cta-banner">
        <h2 className="landing-cta-banner-title">
          Ready to share your pet's story?
        </h2>
        <p className="landing-cta-banner-sub">
          Create your free account in seconds. No credit card needed.
        </p>
        <button
          className="landing-cta-primary large"
          onClick={() => navigate("/register")}
        >
          Create your account
          <span className="landing-cta-arrow">→</span>
        </button>
        <p className="landing-cta-banner-login">
          Already have an account?{" "}
          <button
            className="landing-link-btn"
            onClick={() => navigate("/login")}
          >
            Log in here
          </button>
        </p>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <span className="landing-footer-logo">🐾 Pawth</span>
        <p className="landing-footer-copy">
          Made with ❤️ for pets everywhere · © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}

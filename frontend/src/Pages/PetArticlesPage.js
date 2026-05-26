import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Home, PlusSquare, User, MapPin, Calendar,
  BookOpen, Search, Heart, FileText, X, ShieldCheck,
} from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL;

const QUICK_PETS = ["dog", "cat", "rabbit", "fish", "hamster", "parrot", "turtle"];
const CATEGORIES = ["All", "Health", "Nutrition", "Behavior", "Training", "Grooming", "Housing"];
const CAT_COLORS = {
  Health:    { bg: "#e8f5ee", color: "#1a5c32" },
  Nutrition: { bg: "#edf5e2", color: "#2d5a10" },
  Behavior:  { bg: "#eeecfd", color: "#3b3190" },
  Training:  { bg: "#e6f0f8", color: "#1a4470" },
  Grooming:  { bg: "#fbe8f0", color: "#7a2048" },
  Housing:   { bg: "#faeedd", color: "#6b3a0a" },
};

export default function PetArticlesPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [query, setQuery] = useState("");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("browse");
  const [saved, setSaved] = useState({});
  const [notes, setNotes] = useState({});
  const [noteModal, setNoteModal] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [error, setError] = useState("");

  const handleSearch = async (pet) => {
    const q = (pet || query).trim();
    if (!q) return;
    setQuery(q);
    setActiveFilter("All");
    setActiveTab("browse");
    setLoading(true);
    setError("");
    setArticles([]);
    try {
      const res = await fetch(`${API_URL}/api/ai/generate-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
  prompt: `Return ONLY a valid JSON array, no markdown, no explanation.
Give me 6 helpful pet care articles about: ${q}
Each item: {"id":"unique-slug","title":"...","pet":"${q.toLowerCase()}","category":"Health or Nutrition or Behavior or Training or Grooming or Housing","summary":"2-3 sentences of advice."}`,
}),
      });
      const data = await res.json();
      const text = (data.result || "").replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(text);
      setArticles(parsed);
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const toggleSave = (article) => {
    setSaved((prev) => {
      const group = prev[article.pet] || [];
      const exists = group.find((a) => a.id === article.id);
      return {
        ...prev,
        [article.pet]: exists
          ? group.filter((a) => a.id !== article.id)
          : [...group, article],
      };
    });
  };

  const isSaved = (id, pet) => !!(saved[pet]?.find((a) => a.id === id));
  const hasNote = (id) => !!(notes[id]?.trim());

  const openNote = (article) => {
    setNoteModal(article);
    setNoteText(notes[article.id] || "");
  };

  const saveNote = () => {
    if (!noteModal) return;
    setNotes((prev) => ({ ...prev, [noteModal.id]: noteText.trim() }));
    setNoteModal(null);
  };

  const savedAll = Object.values(saved).flat();
  const savedByPet = Object.entries(saved).filter(([, arts]) => arts.length > 0);
  const presentCategories = new Set(articles.map((a) => a.category));
  const filteredArticles = activeFilter === "All"
    ? articles
    : articles.filter((a) => a.category === activeFilter);

  // ── Article card ──
  const ArticleCard = ({ article }) => {
    const s = isSaved(article.id, article.pet);
    const n = hasNote(article.id);
    const note = notes[article.id];
    const cat = CAT_COLORS[article.category] || { bg: "#f0f0f0", color: "#333" };
    return (
      <div className="masonry-card" style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        {/* Title + actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <p style={{ fontSize: "0.875rem", fontWeight: 600, lineHeight: 1.4, flex: 1, color: "var(--text)", margin: 0 }}>
            {article.title}
          </p>
          <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
            <button
              onClick={() => openNote(article)}
              title={n ? "Edit note" : "Add note"}
              style={{
                width: 30, height: 30, border: "none", background: "none",
                cursor: "pointer", borderRadius: 8, display: "flex",
                alignItems: "center", justifyContent: "center",
                color: n ? "#1a4470" : "#ccc",
              }}
            >
              <FileText size={15} />
            </button>
            <button
              onClick={() => toggleSave(article)}
              title={s ? "Unsave" : "Save"}
              style={{
                width: 30, height: 30, border: "none", background: "none",
                cursor: "pointer", borderRadius: 8, display: "flex",
                alignItems: "center", justifyContent: "center",
                color: s ? "#e0245e" : "#ccc",
              }}
            >
              <Heart size={15} fill={s ? "#e0245e" : "none"} />
            </button>
          </div>
        </div>

        {/* Tags */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 500, padding: "2px 9px", borderRadius: 999, background: "var(--accent)", color: "var(--muted-text)" }}>
            {article.pet}
          </span>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, padding: "2px 9px", borderRadius: 999, background: cat.bg, color: cat.color }}>
            {article.category}
          </span>
        </div>

        {/* Summary */}
        <p style={{ fontSize: "0.813rem", color: "var(--muted-text)", lineHeight: 1.65, margin: 0 }}>
          {article.summary}
        </p>

        {/* Note preview */}
        {note && (
          <div style={{ fontSize: "0.75rem", color: "#1a4470", background: "#e6f0f8", padding: "6px 10px", borderLeft: "2px solid #1a4470", lineHeight: 1.5 }}>
            {note}
          </div>
        )}

        <button
          onClick={() => alert(`Ask more:\n"Tell me more about: ${article.title}"`)}
          style={{ fontSize: "0.813rem", color: "var(--secondary)", background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left", fontWeight: 500 }}
        >
          Read more →
        </button>
      </div>
    );
  };

  return (
    <div className="app-shell">
      {/* ── Top bar ── */}
      <header className="topbar">
        <h1 style={{ fontSize: "1.25rem", margin: 0 }}>🐾 Pawth</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {user?.role === "admin" && (
            <button
              onClick={() => navigate("/admin")}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 6, border: "none", background: "#111", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
            >
              <ShieldCheck size={13} /> Admin
            </button>
          )}
          {user ? (
            <div
              onClick={() => navigate("/profile")}
              style={{ width: 32, height: 32, borderRadius: "50%", overflow: "hidden", cursor: "pointer", border: "2px solid var(--border)", flexShrink: 0 }}
            >
              {user.profilePicUrl ? (
                <img src={user.profilePicUrl} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", background: "var(--primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>
                  {user.username?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
          ) : (
            <button className="badge-btn" onClick={() => navigate("/login")}>Log in</button>
          )}
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="main">

        {/* Search bar */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <div className="search-wrap" style={{ flex: 1 }}>
            <Search size={15} className="search-icon" />
            <input
              className="search-input"
              placeholder="Search by pet (e.g. cat, dog, rabbit...)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <button
            onClick={() => handleSearch()}
            style={{ padding: "0 18px", borderRadius: 999, border: "none", background: "var(--primary)", color: "var(--text)", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", whiteSpace: "nowrap" }}
          >
            Search
          </button>
        </div>

        {/* Quick pet chips */}
        <div className="pet-chips" style={{ marginBottom: 12 }}>
          {QUICK_PETS.map((p) => (
            <button key={p} className="pet-chip" onClick={() => handleSearch(p)} style={{ textTransform: "capitalize" }}>
              {p}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border)", marginBottom: 14 }}>
          {[
            { key: "browse", label: "Browse" },
            { key: "saved", label: `Saved (${savedAll.length})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                padding: "8px 16px", border: "none", background: "none", cursor: "pointer",
                fontSize: "0.875rem", fontWeight: 500, marginBottom: -1,
                color: activeTab === key ? "var(--secondary)" : "var(--muted-text)",
                borderBottom: activeTab === key ? "2px solid var(--secondary)" : "2px solid transparent",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Category filters — browse only */}
        {activeTab === "browse" && articles.length > 0 && (
          <div className="pet-chips" style={{ marginBottom: 14 }}>
            {CATEGORIES.filter((c) => c === "All" || presentCategories.has(c)).map((cat) => (
              <button
                key={cat}
                className={`pet-chip ${activeFilter === cat ? "active" : ""}`}
                onClick={() => setActiveFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* ── Browse tab ── */}
        {activeTab === "browse" && (
          <>
            {loading && (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted-text)", fontSize: "0.875rem" }}>
                <div style={{ width: 28, height: 28, border: "2px solid var(--border)", borderTopColor: "var(--secondary)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
                Fetching articles...
              </div>
            )}
            {!loading && error && (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted-text)" }}>
                <p style={{ fontSize: 36, margin: "0 0 8px" }}>⚠️</p>
                <p style={{ fontSize: "0.875rem" }}>{error}</p>
              </div>
            )}
            {!loading && !error && filteredArticles.length === 0 && (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted-text)" }}>
                <p style={{ fontSize: 36, margin: "0 0 8px" }}>🐾</p>
                <p style={{ fontSize: "0.875rem" }}>
                  {articles.length === 0 ? "Search for a pet to discover articles and tips" : "No articles match this filter"}
                </p>
              </div>
            )}
            {!loading && !error && filteredArticles.length > 0 && (
              <div className="masonry-grid">
                {filteredArticles.map((a) => <ArticleCard key={a.id} article={a} />)}
              </div>
            )}
          </>
        )}

        {/* ── Saved tab ── */}
        {activeTab === "saved" && (
          savedAll.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted-text)" }}>
              <p style={{ fontSize: 36, margin: "0 0 8px" }}>🤍</p>
              <p style={{ fontSize: "0.875rem" }}>No saved articles yet — heart an article to save it</p>
            </div>
          ) : (
            savedByPet.map(([pet, arts]) => (
              <div key={pet} style={{ marginBottom: "1.5rem" }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted-text)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, textTransform: "capitalize" }}>
                  {pet}
                </p>
                <div className="masonry-grid">
                  {arts.map((a) => <ArticleCard key={a.id} article={a} />)}
                </div>
              </div>
            ))
          )
        )}
      </main>

      {/* ── Note Modal ── */}
      {noteModal && (
        <div
          onClick={(e) => e.target === e.currentTarget && setNoteModal(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 100 }}
        >
          <div style={{ background: "#fff", borderRadius: 18, padding: "1.25rem", width: "100%", maxWidth: 420, boxShadow: "0 8px 40px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 12 }}>
              <p style={{ fontSize: "0.875rem", fontWeight: 600, lineHeight: 1.4, flex: 1, margin: 0 }}>{noteModal.title}</p>
              <button onClick={() => setNoteModal(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa" }}>
                <X size={18} />
              </button>
            </div>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Write your personal notes about this article..."
              style={{ width: "100%", minHeight: 120, padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 10, fontFamily: "inherit", fontSize: "0.813rem", color: "var(--text)", background: "var(--background)", resize: "vertical", outline: "none", marginBottom: 12, boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setNoteText("")} style={{ padding: "8px 16px", borderRadius: 999, border: "1px solid var(--border)", background: "#fff", cursor: "pointer", fontSize: "0.813rem" }}>
                Clear
              </button>
              <button onClick={saveNote} style={{ padding: "8px 16px", borderRadius: 999, border: "none", background: "var(--secondary)", color: "#fff", cursor: "pointer", fontSize: "0.813rem", fontWeight: 600 }}>
                Save note
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Bottom nav ── */}
      <nav className="bottom-nav">
        <button className={location.pathname === "/dashboard" ? "active" : ""} onClick={() => navigate("/dashboard")}>
          <Home size={22} /><span>Feed</span>
        </button>
        <button className={location.pathname === "/places" ? "active" : ""} onClick={() => navigate("/places")}>
          <MapPin size={22} /><span>Places</span>
        </button>
        <button className={location.pathname === "/events" ? "active" : ""} onClick={() => navigate("/events")}>
          <Calendar size={22} /><span>Events</span>
        </button>
        <button className={location.pathname === "/articles" ? "active" : ""} onClick={() => navigate("/articles")}>
          <BookOpen size={22} /><span>Articles</span>
        </button>
        <button className={location.pathname === "/create" ? "active" : ""} onClick={() => navigate(token ? "/create" : "/login")}>
          <PlusSquare size={22} /><span>Create</span>
        </button>
        <button className={location.pathname === "/profile" ? "active" : ""} onClick={() => navigate(token ? "/profile" : "/login")}>
          <User size={22} /><span>Profile</span>
        </button>
      </nav>
    </div>
  );
}
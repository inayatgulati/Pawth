import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Home,
  PlusSquare,
  User,
  MapPin,
  Calendar,
  BookOpen,
  Search,
  Heart,
  FileText,
  X,
  ShieldCheck,
} from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL;

const QUICK_PETS = ["dog", "cat", "rabbit", "fish", "hamster", "parrot", "turtle"];
const CATEGORIES = ["All", "Health", "Nutrition", "Behavior", "Training", "Grooming", "Housing"];

const CATEGORY_STYLES = {
  Health: { background: "#e8f5ee", color: "#1a5c32" },
  Nutrition: { background: "#edf5e2", color: "#2d5a10" },
  Behavior: { background: "#eeecfd", color: "#3b3190" },
  Training: { background: "#e6f0f8", color: "#1a4470" },
  Grooming: { background: "#fbe8f0", color: "#7a2048" },
  Housing: { background: "#faeedd", color: "#6b3a0a" },
};

export default function PetArticlesPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [query, setQuery] = useState("");
  const [articles, setArticles] = useState([]);
  const [savedArticles, setSavedArticles] = useState({});
  const [notes, setNotes] = useState({});
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("browse");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [noteArticle, setNoteArticle] = useState(null);
  const [noteText, setNoteText] = useState("");

  const savedList = Object.values(savedArticles).flat();
  const savedCount = savedList.length;
  const presentCategories = new Set(articles.map((article) => article.category));

  const filteredArticles =
    activeFilter === "All"
      ? articles
      : articles.filter((article) => article.category === activeFilter);

  const handleSearch = async (selectedPet) => {
    const pet = (selectedPet || query).trim().toLowerCase();
    if (!pet) return;

    setQuery(pet);
    setActiveTab("browse");
    setActiveFilter("All");
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/ai/generate-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `You are a pet care knowledge expert. Return ONLY a valid JSON array. Do not include markdown fences, preamble, or trailing text.
Return exactly 6 helpful articles about: ${pet}
Each item must follow this format: {"id":"unique-kebab-slug","title":"...","pet":"${pet}","category":"<one of: Health, Nutrition, Behavior, Training, Grooming, Housing>","summary":"2-3 sentence helpful advice."}`,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not generate articles right now.");
      }

      const data = await response.json();
      const cleanText = (data.result || "[]").replace(/```json|```/g, "").trim();
      const parsedArticles = JSON.parse(cleanText);

      setArticles(Array.isArray(parsedArticles) ? parsedArticles : []);
    } catch (err) {
      console.error(err);
      setArticles([]);
      setError("Something went wrong. Check your backend AI route and Anthropic API key.");
    } finally {
      setLoading(false);
    }
  };

  const isSaved = (article) => {
    return Boolean(savedArticles[article.pet]?.some((saved) => saved.id === article.id));
  };

  const toggleSave = (article) => {
    setSavedArticles((prev) => {
      const petGroup = prev[article.pet] || [];
      const alreadySaved = petGroup.some((saved) => saved.id === article.id);

      return {
        ...prev,
        [article.pet]: alreadySaved
          ? petGroup.filter((saved) => saved.id !== article.id)
          : [...petGroup, article],
      };
    });
  };

  const openNoteModal = (article) => {
    setNoteArticle(article);
    setNoteText(notes[article.id] || "");
  };

  const saveNote = () => {
    if (!noteArticle) return;
    setNotes((prev) => ({ ...prev, [noteArticle.id]: noteText.trim() }));
    setNoteArticle(null);
    setNoteText("");
  };

  const ArticleCard = ({ article }) => {
    const saved = isSaved(article);
    const note = notes[article.id];
    const categoryStyle = CATEGORY_STYLES[article.category] || {
      background: "var(--accent)",
      color: "var(--text)",
    };

    return (
      <article className="article-card">
        <div className="article-card-header">
          <h2>{article.title}</h2>
          <div className="article-actions">
            <button
              type="button"
              className={note ? "article-icon active-note" : "article-icon"}
              onClick={() => openNoteModal(article)}
              aria-label={note ? "Edit note" : "Add note"}
            >
              <FileText size={16} />
            </button>

            <button
              type="button"
              className={saved ? "article-icon saved" : "article-icon"}
              onClick={() => toggleSave(article)}
              aria-label={saved ? "Unsave article" : "Save article"}
            >
              <Heart size={16} fill={saved ? "#e0245e" : "none"} />
            </button>
          </div>
        </div>

        <div className="article-tags">
          <span className="article-pet-tag">{article.pet}</span>
          <span className="article-category-tag" style={categoryStyle}>
            {article.category}
          </span>
        </div>

        <p className="article-summary">{article.summary}</p>

        {note && <div className="article-note">{note}</div>}

        <button
          type="button"
          className="article-read-more"
          onClick={() => alert(`Ask your AI assistant:\n"Tell me more about: ${article.title}"`)}
        >
          Read more →
        </button>
      </article>
    );
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <h1 className="topbar-logo">🐾 Pawth</h1>

        <div className="topbar-actions">
          {user?.role === "admin" && (
            <button className="admin-pill" onClick={() => navigate("/admin")}>
              <ShieldCheck size={14} /> Admin
            </button>
          )}

          {user ? (
            <button className="profile-bubble" onClick={() => navigate("/profile")}>
              {user.profilePicUrl ? (
                <img src={user.profilePicUrl} alt="profile" />
              ) : (
                <span>{user.username?.[0]?.toUpperCase()}</span>
              )}
            </button>
          ) : (
            <button className="badge-btn" onClick={() => navigate("/login")}>
              Log in
            </button>
          )}
        </div>
      </header>

      <main className="main articles-main">
        <section className="articles-intro">
          <p className="small-text">AI pet care guide</p>
          <h2>Find quick care articles for your pet</h2>
          <p>
            Search any pet type and Pawth will generate helpful articles you can save,
            filter, and annotate.
          </p>
        </section>

        <section className="feed-filters articles-filters">
          <div className="search-wrap articles-search-wrap">
            <Search className="search-icon" size={16} />
            <input
              className="search-input"
              value={query}
              placeholder="Search by pet: dog, cat, rabbit..."
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && handleSearch()}
            />
            <button className="article-search-btn" onClick={() => handleSearch()}>
              Search
            </button>
          </div>

          <div className="pet-chips">
            {QUICK_PETS.map((pet) => (
              <button
                key={pet}
                className="pet-chip"
                onClick={() => handleSearch(pet)}
              >
                {pet}
              </button>
            ))}
          </div>
        </section>

        <section className="article-tabs">
          <button
            className={activeTab === "browse" ? "active" : ""}
            onClick={() => setActiveTab("browse")}
          >
            Browse
          </button>
          <button
            className={activeTab === "saved" ? "active" : ""}
            onClick={() => setActiveTab("saved")}
          >
            Saved ({savedCount})
          </button>
        </section>

        {activeTab === "browse" && articles.length > 0 && (
          <section className="pet-chips article-category-filters">
            {CATEGORIES.filter((category) => category === "All" || presentCategories.has(category)).map(
              (category) => (
                <button
                  key={category}
                  className={`pet-chip ${activeFilter === category ? "active" : ""}`}
                  onClick={() => setActiveFilter(category)}
                >
                  {category}
                </button>
              ),
            )}
          </section>
        )}

        {activeTab === "browse" && (
          <section>
            {loading ? (
              <div className="article-empty-state">
                <div className="article-spinner" />
                <p>Fetching articles...</p>
              </div>
            ) : error ? (
              <div className="article-empty-state">
                <p>⚠️</p>
                <span>{error}</span>
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="article-empty-state">
                <p>🐾</p>
                <span>
                  {articles.length === 0
                    ? "Search for a pet to discover articles and tips."
                    : "No articles match this filter."}
                </span>
              </div>
            ) : (
              <div className="articles-grid">
                {filteredArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "saved" && (
          <section>
            {savedCount === 0 ? (
              <div className="article-empty-state">
                <p>🤍</p>
                <span>No saved articles yet — heart an article to save it.</span>
              </div>
            ) : (
              Object.entries(savedArticles).map(
                ([pet, petArticles]) =>
                  petArticles.length > 0 && (
                    <div className="saved-article-group" key={pet}>
                      <h3>{pet}</h3>
                      <div className="articles-grid">
                        {petArticles.map((article) => (
                          <ArticleCard key={article.id} article={article} />
                        ))}
                      </div>
                    </div>
                  ),
              )
            )}
          </section>
        )}
      </main>

      {noteArticle && (
        <div
          className="article-modal-backdrop"
          onClick={(event) => event.target === event.currentTarget && setNoteArticle(null)}
        >
          <div className="article-modal">
            <div className="article-modal-header">
              <h2>{noteArticle.title}</h2>
              <button onClick={() => setNoteArticle(null)} aria-label="Close note modal">
                <X size={18} />
              </button>
            </div>

            <textarea
              value={noteText}
              onChange={(event) => setNoteText(event.target.value)}
              placeholder="Write your personal notes about this article..."
            />

            <div className="article-modal-actions">
              <button onClick={() => setNoteText("")}>Clear</button>
              <button className="primary" onClick={saveNote}>
                Save note
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="bottom-nav">
        <button
          className={location.pathname === "/dashboard" ? "active" : ""}
          onClick={() => navigate("/dashboard")}
        >
          <Home size={22} /> <span>Feed</span>
        </button>
        <button
          className={location.pathname === "/places" ? "active" : ""}
          onClick={() => navigate("/places")}
        >
          <MapPin size={22} /> <span>Places</span>
        </button>
        <button
          className={location.pathname === "/events" ? "active" : ""}
          onClick={() => navigate("/events")}
        >
          <Calendar size={22} /> <span>Events</span>
        </button>
        <button
          className={location.pathname === "/articles" ? "active" : ""}
          onClick={() => navigate("/articles")}
        >
          <BookOpen size={22} /> <span>Articles</span>
        </button>
        <button onClick={() => navigate(token ? "/create" : "/login")}>
          <PlusSquare size={22} /> <span>Create</span>
        </button>
        <button onClick={() => navigate(token ? "/profile" : "/login")}>
          <User size={22} /> <span>Profile</span>
        </button>
      </nav>
    </div>
  );
}
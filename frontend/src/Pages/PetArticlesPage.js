import React, { useMemo, useState } from "react";
import "./PetArticlesExplorer.css";

const API_KEY = "YOUR_ANTHROPIC_API_KEY";

const CATEGORIES = [
  "All",
  "Health",
  "Nutrition",
  "Behavior",
  "Training",
  "Grooming",
  "Housing",
];

function HeartIcon({ filled }) {
  return filled ? (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="#c0392b" stroke="#c0392b" strokeWidth="1.5">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ) : (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function NoteIcon({ active }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? "#1a4a7a" : "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function EmptyIcon({ type = "heart" }) {
  if (type === "search") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    );
  }

  if (type === "error") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export default function PetArticlesExplorer() {
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState({});
  const [notes, setNotes] = useState({});
  const [browseArticles, setBrowseArticles] = useState([]);
  const [currentTab, setCurrentTab] = useState("browse");
  const [activeFilter, setActiveFilter] = useState("All");
  const [editingArticle, setEditingArticle] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const savedCount = useMemo(() => Object.values(saved).flat().length, [saved]);

  const presentCategories = useMemo(() => {
    return new Set(browseArticles.map((article) => article.category));
  }, [browseArticles]);

  const filteredArticles = useMemo(() => {
    if (activeFilter === "All") return browseArticles;
    return browseArticles.filter((article) => article.category === activeFilter);
  }, [activeFilter, browseArticles]);

  const savedArticles = useMemo(() => Object.values(saved).flat(), [saved]);

  const savedByPet = useMemo(() => {
    return savedArticles.reduce((groups, article) => {
      if (!groups[article.pet]) groups[article.pet] = [];
      groups[article.pet].push(article);
      return groups;
    }, {});
  }, [savedArticles]);

  const isSaved = (id, pet) => {
    return !!saved[pet]?.find((article) => article.id === id);
  };

  const hasNote = (id) => {
    return !!(notes[id] && notes[id].trim());
  };

  const quickSearch = (pet) => {
    setQuery(pet);
    handleSearch(pet);
  };

  const toggleSave = (article) => {
    setSaved((prevSaved) => {
      const pet = article.pet;
      const petArticles = prevSaved[pet] ? [...prevSaved[pet]] : [];
      const existingIndex = petArticles.findIndex((item) => item.id === article.id);

      if (existingIndex >= 0) {
        petArticles.splice(existingIndex, 1);
      } else {
        petArticles.push(article);
      }

      return {
        ...prevSaved,
        [pet]: petArticles,
      };
    });
  };

  const openNoteModal = (article) => {
    setEditingArticle(article);
    setNoteDraft(notes[article.id] || "");
  };

  const closeNoteModal = () => {
    setEditingArticle(null);
    setNoteDraft("");
  };

  const saveNote = () => {
    if (!editingArticle) return;

    setNotes((prevNotes) => ({
      ...prevNotes,
      [editingArticle.id]: noteDraft.trim(),
    }));

    closeNoteModal();
  };

  const clearNote = () => {
    setNoteDraft("");
  };

  const switchTab = (tab) => {
    setCurrentTab(tab);
  };

  const askMore = (title) => {
    alert(`Ask your AI assistant:\n\n"Tell me more about: ${title}"`);
  };

  const handleSearch = async (searchTerm = query) => {
    const cleanQuery = searchTerm.trim();
    if (!cleanQuery) return;

    setActiveFilter("All");
    setLoading(true);
    setError(false);
    setCurrentTab("browse");

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system:
            'You are a pet care knowledge expert. Return ONLY a valid JSON array — no markdown fences, no preamble, no trailing text. Return exactly 6 articles about the pet the user searches for. Each item must have: {"id":"unique-kebab-slug","title":"...","pet":"<searched pet name, lowercase>","category":"<one of: Health, Nutrition, Behavior, Training, Grooming, Housing>","summary":"2-3 sentence helpful advice."}',
          messages: [{ role: "user", content: `Give me 6 helpful articles about: ${cleanQuery}` }],
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      const text = data.content?.find((block) => block.type === "text")?.text || "[]";
      const clean = text.replace(/```json|```/g, "").trim();
      const articles = JSON.parse(clean);

      setBrowseArticles(articles);
    } catch (err) {
      console.error(err);
      setError(true);
      setBrowseArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const renderArticleCard = (article) => {
    const savedArticle = isSaved(article.id, article.pet);
    const articleHasNote = hasNote(article.id);
    const note = notes[article.id];

    return (
      <div className="card" key={article.id}>
        <div className="card-top">
          <div className="card-title">{article.title}</div>

          <div className="card-actions">
            <button
              className={`icon-btn${articleHasNote ? " has-note" : ""}`}
              onClick={() => openNoteModal(article)}
              title={articleHasNote ? "Edit note" : "Add note"}
              type="button"
            >
              <NoteIcon active={articleHasNote} />
            </button>

            <button
              className={`icon-btn${savedArticle ? " saved" : ""}`}
              onClick={() => toggleSave(article)}
              title={savedArticle ? "Unsave" : "Save"}
              type="button"
            >
              <HeartIcon filled={savedArticle} />
            </button>
          </div>
        </div>

        <div className="tags">
          <span className="tag">{article.pet}</span>
          <span className={`cat-tag cat-${article.category}`}>{article.category}</span>
        </div>

        <div className="summary">{article.summary}</div>

        {note && <div className="note-preview">{note}</div>}

        <button className="read-more-btn" onClick={() => askMore(article.title)} type="button">
          Read full article →
        </button>
      </div>
    );
  };

  const renderBrowseContent = () => {
    if (loading) {
      return (
        <div className="loading">
          <div className="spinner" />
          Fetching articles...
        </div>
      );
    }

    if (error) {
      return (
        <div className="empty">
          <EmptyIcon type="error" />
          <p>Something went wrong. Check your API key and try again.</p>
        </div>
      );
    }

    if (browseArticles.length === 0) {
      return (
        <div className="empty">
          <EmptyIcon />
          <p>Search for a pet to discover articles and tips</p>
        </div>
      );
    }

    if (filteredArticles.length === 0) {
      return (
        <div className="empty">
          <EmptyIcon type="search" />
          <p>No articles match this filter.</p>
        </div>
      );
    }

    return <div className="grid">{filteredArticles.map(renderArticleCard)}</div>;
  };

  const renderSavedContent = () => {
    if (savedArticles.length === 0) {
      return (
        <div className="empty">
          <EmptyIcon />
          <p>No saved articles yet — heart an article to save it.</p>
        </div>
      );
    }

    return Object.entries(savedByPet).map(([pet, articles]) => (
      <div className="section-group" key={pet}>
        <div className="section-group-label">{pet}</div>
        <div className="grid">{articles.map(renderArticleCard)}</div>
      </div>
    ));
  };

  return (
    <>
      <header>
        <div className="logo">
          Paw<span>Articles</span>
        </div>
      </header>

      <main>
        <div className="search-wrap">
          <input
            type="text"
            value={query}
            placeholder="Search by pet (e.g. cat, dog, rabbit...)"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSearch();
            }}
          />

          <button className="btn primary" onClick={() => handleSearch()} type="button">
            <SearchIcon />
            Search
          </button>
        </div>

        <div className="quick-row">
          <span className="sec-label">Quick:</span>
          {['dog', 'cat', 'rabbit', 'fish', 'hamster', 'parrot', 'turtle'].map((pet) => (
            <button className="chip" onClick={() => quickSearch(pet)} type="button" key={pet}>
              {pet.charAt(0).toUpperCase() + pet.slice(1)}
            </button>
          ))}
        </div>

        {currentTab === "browse" && browseArticles.length > 0 && (
          <div className="filters-row">
            <span className="sec-label">Filter:</span>
            {CATEGORIES.map((category) => {
              if (category !== "All" && !presentCategories.has(category)) return null;

              return (
                <button
                  className={`fchip${activeFilter === category ? " active" : ""}`}
                  onClick={() => setActiveFilter(category)}
                  type="button"
                  key={category}
                >
                  {category}
                </button>
              );
            })}
          </div>
        )}

        <div className="tabs">
          <button
            className={`tab${currentTab === "browse" ? " active" : ""}`}
            onClick={() => switchTab("browse")}
            type="button"
          >
            Browse
          </button>

          <button
            className={`tab${currentTab === "saved" ? " active" : ""}`}
            onClick={() => switchTab("saved")}
            type="button"
          >
            Saved <span>({savedCount})</span>
          </button>
        </div>

        <div>{currentTab === "saved" ? renderSavedContent() : renderBrowseContent()}</div>
      </main>

      {editingArticle && (
        <div className="modal-backdrop open" onClick={(event) => {
          if (event.target.classList.contains("modal-backdrop")) closeNoteModal();
        }}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editingArticle.title}</div>

              <button className="icon-btn" onClick={closeNoteModal} aria-label="Close" type="button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <textarea
              value={noteDraft}
              placeholder="Write your personal notes about this article..."
              onChange={(event) => setNoteDraft(event.target.value)}
            />

            <div className="modal-footer">
              <button className="btn" onClick={clearNote} type="button">
                Clear
              </button>

              <button className="btn primary" onClick={saveNote} type="button">
                Save note
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

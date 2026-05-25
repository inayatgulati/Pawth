import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Home,
  PlusSquare,
  User,
  Heart,
  Bookmark,
  MessageCircle,
  Search,
  ShieldCheck,
  MapPin,
  Calendar,
  X,
} from "lucide-react";
import "../styles/Dashboard.css";

const API = process.env.REACT_APP_API_URL;

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export default function DashboardPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [posts, setPosts] = useState([]);
  const [petFilter, setPetFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debounceTimer = useRef(null);

  // Debounce search — only fires 300ms after user stops typing
  const handleSearch = useCallback((value) => {
    setQuery(value);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(value);
    }, 300);
  }, []);
  const [openComments, setOpenComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  // Fetch all public posts
  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API}/api/posts`);
      const data = await res.json();
      if (Array.isArray(data)) setPosts(shuffle(data));
    } catch (err) {
      console.error("Fetch posts error:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchesType = petFilter === "all" ? true : p.petType === petFilter;
      const q = debouncedQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        (p.caption || "").toLowerCase().includes(q) ||
        (p.authorUsername || "").toLowerCase().includes(q) ||
        (p.petType || "").toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });
  }, [posts, petFilter, debouncedQuery]);

  const handleLike = async (postId) => {
    if (!token) return navigate("/login");
    const res = await fetch(`${API}/api/posts/${postId}/like`, {
      method: "POST",
      headers: { Authorization: token },
    });
    const data = await res.json();
    if (res.ok) {
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, likesCount: data.likesCount, likedBy: data.likedBy }
            : p,
        ),
      );
    }
  };

  const handleSave = async (postId) => {
    if (!token) return navigate("/login");
    const res = await fetch(`${API}/api/posts/${postId}/save`, {
      method: "POST",
      headers: { Authorization: token },
    });
    const data = await res.json();
    if (res.ok) {
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, savedBy: data.savedBy } : p,
        ),
      );
    }
  };

  const toggleComments = (postId) =>
    setOpenComments((prev) => ({ ...prev, [postId]: !prev[postId] }));

  const handleAddComment = async (postId) => {
    const text = (commentInputs[postId] || "").trim();
    if (!text || !token) return;
    const res = await fetch(`${API}/api/posts/${postId}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify({ text }),
    });
    const comments = await res.json();
    if (res.ok) {
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, comments } : p)),
      );
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <h1 className="topbar-logo">🐾 Pawth</h1>
        <div
          className="topbar-right"
          style={{ display: "flex", alignItems: "center", gap: 10 }}
        >
          {/* Admin button - only visible to admins */}
          {user?.role === "admin" && (
            <button
              onClick={() => navigate("/admin")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 11px",
                borderRadius: 6,
                border: "none",
                background: "#111",
                color: "#fff",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <ShieldCheck size={13} /> Admin
            </button>
          )}

          {/* Login button or username */}
          {user ? (
            <div
              onClick={() => navigate("/profile")}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                overflow: "hidden",
                cursor: "pointer",
                border: "2px solid var(--border)",
                flexShrink: 0,
              }}
            >
              {user.profilePicUrl ? (
                <img
                  src={user.profilePicUrl}
                  alt="profile"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "var(--primary)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  {user.username?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
          ) : (
            <button className="badge-btn" onClick={() => navigate("/login")}>
              Log in
            </button>
          )}
        </div>
      </header>

      <main className="main">
        {token && (
          <div
            style={{
              background: "linear-gradient(135deg, #f5f0ff 0%, #e8f4ff 100%)",
              borderRadius: 14,
              padding: "1rem 1.2rem",
              marginBottom: "1rem",
            }}
          >
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>
              Welcome back, @{user?.username}!
            </p>
          </div>
        )}
        {/* ── Filters & Search ── */}
        <div className="feed-filters">
          <div className="search-wrap">
            <Search size={15} className="search-icon" />
            <input
              className="search-input"
              placeholder="Search pets, captions, usernames..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setDebouncedQuery("");
                }}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "#ddd",
                  border: "none",
                  borderRadius: "50%",
                  width: 18,
                  height: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <X size={11} color="#666" />
              </button>
            )}
          </div>
          <div className="pet-chips">
            {[
              { val: "all", label: "All" },
              { val: "dog", label: "Dog" },
              { val: "cat", label: "Cat" },
              { val: "bird", label: "Bird" },
              { val: "other", label: "Other" },
            ].map(({ val, label }) => (
              <button
                key={val}
                className={`pet-chip ${petFilter === val ? "active" : ""}`}
                onClick={() => setPetFilter(val)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Posts Grid ── */}
        <div className="masonry-grid">
          {filteredPosts.length === 0 ? (
            <div
              style={{
                columnSpan: "all",
                textAlign: "center",
                padding: "48px 16px",
                color: "#aaa",
                gridColumn: "1 / -1",
              }}
            >
              <p style={{ fontSize: 36, margin: "0 0 8px" }}>🐾</p>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#888",
                  margin: "0 0 4px",
                }}
              >
                No posts found
              </p>
              <p style={{ fontSize: 13, margin: 0 }}>
                {query
                  ? `No results for "${query}" — try a different search`
                  : "No posts match the selected filter"}
              </p>
              {(query || petFilter !== "all") && (
                <button
                  onClick={() => {
                    setQuery("");
                    setDebouncedQuery("");
                    setPetFilter("all");
                  }}
                  style={{
                    marginTop: 14,
                    padding: "8px 20px",
                    borderRadius: 999,
                    border: "1px solid #ddd",
                    background: "#fff",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            filteredPosts.map((post) => {
              const liked = user && post.likedBy?.includes(user.username);
              const saved = user && post.savedBy?.includes(user.username);
              const commentsOpen = openComments[post._id];

              return (
                <div key={post._id} className="masonry-card">
                  {/* Clicking the image navigates to detail view */}
                  <div
                    className="masonry-img-wrap"
                    onClick={() => navigate(`/posts/${post._id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={post.imageUrl}
                      alt={post.caption}
                      className="masonry-img"
                      onError={(e) => {
                        e.target.src = "https://placehold.co/400x300?text=🐾";
                      }}
                    />
                    <span className="pet-type-badge">{post.petType}</span>
                  </div>
                  <div className="card-body">
                    <p
                      className="card-caption"
                      onClick={() => navigate(`/posts/${post._id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      {post.caption}
                    </p>
                    <p className="card-author">@{post.authorUsername}</p>

                    <div className="action-row">
                      <button
                        className={`action-btn ${liked ? "liked" : ""}`}
                        onClick={() => handleLike(post._id)}
                        title={!token ? "Log in to like" : ""}
                      >
                        <Heart
                          size={14}
                          fill={liked ? "#e0245e" : "none"}
                          color={liked ? "#e0245e" : "#555"}
                        />
                        <span>{post.likesCount || 0}</span>
                      </button>
                      <button
                        className={`action-btn ${saved ? "saved" : ""}`}
                        onClick={() => handleSave(post._id)}
                        title={!token ? "Log in to save" : ""}
                      >
                        <Bookmark
                          size={14}
                          fill={saved ? "#4a6fa5" : "none"}
                          color={saved ? "#4a6fa5" : "#555"}
                        />
                        <span>{post.savedBy?.length || 0}</span>
                      </button>
                      <button
                        className={`action-btn ${commentsOpen ? "commenting" : ""}`}
                        onClick={() => toggleComments(post._id)}
                      >
                        <MessageCircle
                          size={14}
                          color={commentsOpen ? "#111" : "#555"}
                        />
                        <span>{post.comments?.length || 0}</span>
                      </button>
                    </div>

                    {commentsOpen && (
                      <div className="comment-section">
                        <div className="comment-list">
                          {post.comments?.length === 0 && (
                            <p className="no-comments">No comments yet.</p>
                          )}
                          {post.comments?.map((c, i) => (
                            <div key={i} className="comment-item">
                              <span className="comment-author">
                                @{c.username}
                              </span>
                              <span className="comment-text">{c.text}</span>
                            </div>
                          ))}
                        </div>
                        {token ? (
                          <div className="comment-input-row">
                            <input
                              className="comment-input"
                              placeholder="Add a comment..."
                              value={commentInputs[post._id] || ""}
                              onChange={(e) =>
                                setCommentInputs((prev) => ({
                                  ...prev,
                                  [post._id]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter")
                                  handleAddComment(post._id);
                              }}
                            />
                            <button
                              className="comment-submit"
                              onClick={() => handleAddComment(post._id)}
                            >
                              Post
                            </button>
                          </div>
                        ) : (
                          <p className="login-prompt">
                            <button onClick={() => navigate("/login")}>
                              Log in
                            </button>{" "}
                            to comment
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      <nav className="bottom-nav">
        <button
          className={location.pathname === "/dashboard" ? "active" : ""}
          onClick={() => navigate("/dashboard")}
        >
          <Home size={22} />
          <span>Feed</span>
        </button>
        <button
          className={location.pathname === "/places" ? "active" : ""}
          onClick={() => navigate("/places")}
        >
          <MapPin size={22} />
          <span>Places</span>
        </button>
        <button
          className={location.pathname === "/events" ? "active" : ""}
          onClick={() => navigate("/events")}
        >
          <Calendar size={22} />
          <span>Events</span>
        </button>
        <button
          className={location.pathname === "/create" ? "active" : ""}
          onClick={() => navigate(token ? "/create" : "/login")}
        >
          <PlusSquare size={22} />
          <span>Create</span>
        </button>
        <button
          className={location.pathname === "/profile" ? "active" : ""}
          onClick={() => navigate(token ? "/profile" : "/login")}
        >
          <User size={22} />
          <span>Profile</span>
        </button>
      </nav>
    </div>
  );
}

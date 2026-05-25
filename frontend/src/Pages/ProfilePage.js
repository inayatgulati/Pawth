import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Home,
  PlusSquare,
  User,
  Grid,
  Bookmark,
  Trash2,
  LogOut,
  Edit2,
  Check,
  X,
  MapPin,
  Pencil,
  Calendar,
} from "lucide-react";
import "../styles/Profile.css";

const API = process.env.REACT_APP_API_URL;

// Resize + compress an image File to a base64 data URL (max 800px, quality 0.75)
// This keeps the payload well under Express's default 100kb JSON body limit.

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const MAX = 800;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) {
            height = Math.round((height * MAX) / width);
            width = MAX;
          } else {
            width = Math.round((width * MAX) / height);
            height = MAX;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

// Small reusable upload-button pair (gallery)
function ImageUploadButtons({ onFile, compact = false }) {
  const galleryRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    onFile(base64, file.name);
    e.target.value = "";
  };

  const btnStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: compact ? "6px 10px" : "8px 14px",
    borderRadius: 8,
    border: "1.5px dashed #b8a6e6",
    background: "#fff4e6",
    cursor: "pointer",
    fontSize: compact ? 12 : 13,
    fontWeight: 600,
    color: "#2c2c2c",
    transition: "background 0.2s",
  };

  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
      <button
        type="button"
        style={btnStyle}
        onClick={() => galleryRef.current?.click()}
      >
        Upload from Gallery
      </button>

      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFile}
      />
    </div>
  );
}

export default function ProfilePage() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("posts");
  const [myPosts, setMyPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [profile, setProfile] = useState({
    displayName: "",
    profilePicUrl: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);

  // Edit profile state
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: "",
    profilePicUrl: "",
  });
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState(false);
  const [profilePicFileName, setProfilePicFileName] = useState("");

  // Edit post state
  const [editingPost, setEditingPost] = useState(null);
  const [postEditForm, setPostEditForm] = useState({
    caption: "",
    imageUrl: "",
    petType: "other",
  });
  const [postEditError, setPostEditError] = useState("");
  const [postImageFileName, setPostImageFileName] = useState("");

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/users/profile`, { headers: { Authorization: token } })
      .then((res) => res.json())
      .then((data) => {
        setMyPosts(data.myPosts || []);
        setSavedPosts(data.savedPosts || []);
        setProfile({
          displayName: data.displayName || "",
          profilePicUrl: data.profilePicUrl || "",
          email: data.email || "",
        });
        setEditForm({
          displayName: data.displayName || "",
          profilePicUrl: data.profilePicUrl || "",
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  const handleUnsave = async (postId) => {
    const res = await fetch(`${API}/api/posts/${postId}/save`, {
      method: "POST",
      headers: { Authorization: token },
    });
    if (res.ok) setSavedPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  const handleDeleteMyPost = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    const res = await fetch(`${API}/api/posts/${postId}`, {
      method: "DELETE",
      headers: { Authorization: token },
    });
    if (res.ok) setMyPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  const handleSaveProfile = async () => {
    setEditError("");
    setEditSuccess(false);
    const res = await fetch(`${API}/api/users/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify(editForm),
    });
    const data = await res.json();
    if (!res.ok) {
      setEditError(data.message || "Failed to update profile.");
      return;
    }
    setProfile((prev) => ({
      ...prev,
      displayName: data.displayName || "",
      profilePicUrl: data.profilePicUrl || "",
    }));
    setEditSuccess(true);
    setEditing(false);
    setProfilePicFileName("");
    setTimeout(() => setEditSuccess(false), 3000);
  };

  const openEditPost = (post) => {
    setEditingPost(post);
    setPostEditForm({
      caption: post.caption || "",
      imageUrl: post.imageUrl || "",
      petType: post.petType || "other",
    });
    setPostEditError("");
    setPostImageFileName("");
  };

  const handleEditPost = async () => {
    setPostEditError("");
    const res = await fetch(`${API}/api/posts/${editingPost._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify(postEditForm),
    });
    const data = await res.json();
    if (!res.ok) {
      setPostEditError(data.message || "Failed to update post.");
      return;
    }
    setMyPosts((prev) =>
      prev.map((p) =>
        p._id === editingPost._id ? { ...p, ...postEditForm } : p,
      ),
    );
    setEditingPost(null);
    setPostImageFileName("");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const currentPosts = activeTab === "posts" ? myPosts : savedPosts;

  return (
    <div className="profile-shell">
      <header className="profile-topbar">
        <h1 className="profile-topbar-logo">🐾 Pawth</h1>
      </header>

      <main className="profile-main">
        {/* ── User info ── */}
        <div className="profile-header-row">
          <div className="profile-avatar-large">
            {profile.profilePicUrl ? (
              <img
                src={profile.profilePicUrl}
                alt="avatar"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              user?.username[0].toUpperCase()
            )}
          </div>
          <div className="profile-meta">
            <h2 className="profile-username-large">@{user?.username}</h2>
            {profile.displayName && (
              <p style={{ margin: "2px 0 4px", fontSize: 14, color: "#555" }}>
                {profile.displayName}
              </p>
            )}
            {profile.email && (
              <p style={{ margin: "0 0 4px", fontSize: 13, color: "#999" }}>
                {profile.email}
              </p>
            )}
            <span className="profile-role-badge">{user?.role}</span>
          </div>
        </div>

        {/* ── Edit Profile Button ── */}
        <button
          onClick={() => {
            setEditing(!editing);
            setEditError("");
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: "7px 14px",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            marginBottom: "1rem",
          }}
        >
          <Edit2 size={13} /> {editing ? "Cancel Edit" : "Edit Profile"}
        </button>

        {/* ── Edit Profile Form ── */}
        {editing && (
          <div
            style={{
              background: "#f8f9fa",
              borderRadius: 10,
              padding: "1rem 1.2rem",
              marginBottom: "1rem",
              border: "1px solid #e8e8e8",
            }}
          >
            <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>
              Edit Profile
            </h3>
            {editError && (
              <p style={{ color: "#e74c3c", fontSize: 13, margin: "0 0 8px" }}>
                {editError}
              </p>
            )}
            {editSuccess && (
              <p style={{ color: "#27ae60", fontSize: 13, margin: "0 0 8px" }}>
                ✅ Profile updated!
              </p>
            )}

            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                display: "block",
                marginBottom: 4,
              }}
            >
              Display Name
            </label>
            <input
              value={editForm.displayName}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, displayName: e.target.value }))
              }
              placeholder="Your display name"
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 7,
                border: "1px solid #ddd",
                fontSize: 14,
                marginBottom: 10,
                boxSizing: "border-box",
              }}
            />

            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                display: "block",
                marginBottom: 6,
              }}
            >
              Profile Picture
            </label>

            {/* Upload buttons for profile picture */}
            <ImageUploadButtons
              compact
              onFile={(base64, name) => {
                setEditForm((f) => ({ ...f, profilePicUrl: base64 }));
                setProfilePicFileName(name);
              }}
            />

            {/* Profile pic preview */}
            {editForm.profilePicUrl && (
              <div
                style={{
                  position: "relative",
                  display: "inline-block",
                  marginBottom: 8,
                }}
              >
                <img
                  src={editForm.profilePicUrl}
                  alt="profile preview"
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #b8a6e6",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setEditForm((f) => ({ ...f, profilePicUrl: "" }));
                    setProfilePicFileName("");
                  }}
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    background: "rgba(0,0,0,0.55)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    width: 18,
                    height: 18,
                    cursor: "pointer",
                    fontSize: 10,
                    padding: 0,
                    lineHeight: "18px",
                    textAlign: "center",
                  }}
                >
                  ✕
                </button>
              </div>
            )}

            {/* OR paste URL divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                margin: "4px 0 8px",
                color: "#999",
                fontSize: 12,
              }}
            >
              <span style={{ flex: 1, height: 1, background: "#ddd" }} />
              <span>or paste a URL</span>
              <span style={{ flex: 1, height: 1, background: "#ddd" }} />
            </div>

            <input
              type="url"
              value={
                profilePicFileName ||
                editForm.profilePicUrl?.startsWith("data:")
                  ? ""
                  : editForm.profilePicUrl
              }
              onChange={(e) => {
                setProfilePicFileName("");
                setEditForm((f) => ({ ...f, profilePicUrl: e.target.value }));
              }}
              placeholder={
                profilePicFileName
                  ? `📎 ${profilePicFileName}`
                  : editForm.profilePicUrl?.startsWith("data:")
                    ? "📎 Image selected from gallery"
                    : "https://..."
              }
              disabled={
                !!profilePicFileName ||
                !!editForm.profilePicUrl?.startsWith("data:")
              }
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 7,
                border: "1px solid #ddd",
                fontSize: 14,
                marginBottom: 12,
                boxSizing: "border-box",
                background:
                  profilePicFileName ||
                  editForm.profilePicUrl?.startsWith("data:")
                    ? "#f0f0f0"
                    : undefined,
                color:
                  profilePicFileName ||
                  editForm.profilePicUrl?.startsWith("data:")
                    ? "#888"
                    : undefined,
              }}
            />

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleSaveProfile}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 18px",
                  borderRadius: 7,
                  border: "none",
                  background: "#111",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                <Check size={14} /> Save Changes
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setEditError("");
                  setProfilePicFileName("");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 7,
                  border: "1px solid #ddd",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                <X size={14} /> Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Stats ── */}
        <div className="profile-stats-row">
          <div className="profile-stat">
            <span className="profile-stat-num">{myPosts.length}</span>
            <span className="profile-stat-label">Posts</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-num">{savedPosts.length}</span>
            <span className="profile-stat-label">Saved</span>
          </div>
        </div>

        {/* ── Logout ── */}
        <button className="profile-logout-btn" onClick={handleLogout}>
          <LogOut size={15} /> Log out
        </button>

        {/* ── Sub-tabs ── */}
        <div className="profile-subtabs">
          <button
            className={`profile-subtab ${activeTab === "posts" ? "active" : ""}`}
            onClick={() => setActiveTab("posts")}
          >
            <Grid size={15} /> My Posts
          </button>
          <button
            className={`profile-subtab ${activeTab === "saved" ? "active" : ""}`}
            onClick={() => setActiveTab("saved")}
          >
            <Bookmark size={15} /> Saved
          </button>
        </div>

        {/* ── Grid ── */}
        {loading ? (
          <p className="profile-loading">Loading...</p>
        ) : (
          <div className="profile-posts-grid">
            {currentPosts.length === 0 ? (
              <div className="profile-empty">
                <div className="profile-empty-icon">
                  {activeTab === "posts" ? (
                    <Grid size={36} strokeWidth={1.2} />
                  ) : (
                    <Bookmark size={36} strokeWidth={1.2} />
                  )}
                </div>
                <p className="profile-empty-text">
                  {activeTab === "posts"
                    ? "No posts yet."
                    : "No saved posts yet."}
                </p>
              </div>
            ) : (
              currentPosts.map((post) => (
                <div
                  key={post._id}
                  className="profile-post-tile"
                  onClick={() => navigate(`/posts/${post._id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={post.imageUrl}
                    alt={post.caption}
                    onError={(e) => {
                      e.target.src = "https://placehold.co/200x200?text=🐾";
                    }}
                  />
                  <div className="tile-overlay">
                    <p className="tile-caption">{post.caption}</p>
                  </div>
                  <span className="tile-pet-chip">{post.petType}</span>
                  <button
                    className="tile-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      activeTab === "posts"
                        ? handleDeleteMyPost(post._id)
                        : handleUnsave(post._id);
                    }}
                    title={
                      activeTab === "posts"
                        ? "Delete post"
                        : "Remove from saved"
                    }
                  >
                    <Trash2 size={14} color="#c0392b" />
                  </button>
                  {/* Edit button — only on My Posts tab */}
                  {activeTab === "posts" && (
                    <button
                      className="tile-action-btn"
                      style={{ top: 38 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditPost(post);
                      }}
                      title="Edit post"
                    >
                      <Pencil size={14} color="#4a6fa5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* ── Edit Post Modal ── */}
      {editingPost && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "1.4rem 1.5rem",
              width: "100%",
              maxWidth: 440,
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                Edit Post
              </h3>
              <button
                onClick={() => setEditingPost(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {postEditError && (
              <p style={{ color: "#e74c3c", fontSize: 13, margin: "0 0 10px" }}>
                {postEditError}
              </p>
            )}

            {/* Caption */}
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                display: "block",
                marginBottom: 4,
              }}
            >
              Caption
            </label>
            <textarea
              value={postEditForm.caption}
              onChange={(e) =>
                setPostEditForm((f) => ({ ...f, caption: e.target.value }))
              }
              rows={3}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid #ddd",
                fontSize: 14,
                marginBottom: 12,
                boxSizing: "border-box",
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />

            {/* Image — upload buttons */}
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                display: "block",
                marginBottom: 6,
              }}
            >
              Image
            </label>

            <ImageUploadButtons
              compact
              onFile={(base64, name) => {
                setPostEditForm((f) => ({ ...f, imageUrl: base64 }));
                setPostImageFileName(name);
              }}
            />

            {/* OR paste URL divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                margin: "0 0 8px",
                color: "#999",
                fontSize: 12,
              }}
            >
              <span style={{ flex: 1, height: 1, background: "#ddd" }} />
              <span>or paste a URL</span>
              <span style={{ flex: 1, height: 1, background: "#ddd" }} />
            </div>

            <input
              type="url"
              value={postImageFileName ? "" : postEditForm.imageUrl}
              onChange={(e) => {
                setPostImageFileName("");
                setPostEditForm((f) => ({ ...f, imageUrl: e.target.value }));
              }}
              placeholder={
                postImageFileName ? `📎 ${postImageFileName}` : "https://..."
              }
              disabled={!!postImageFileName}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid #ddd",
                fontSize: 14,
                marginBottom: 12,
                boxSizing: "border-box",
                background: postImageFileName ? "#f0f0f0" : undefined,
                color: postImageFileName ? "#888" : undefined,
              }}
            />

            {/* Image preview */}
            {postEditForm.imageUrl && (
              <div style={{ position: "relative", marginBottom: 12 }}>
                <img
                  src={postEditForm.imageUrl}
                  alt="preview"
                  style={{
                    width: "100%",
                    height: 130,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setPostEditForm((f) => ({ ...f, imageUrl: "" }));
                    setPostImageFileName("");
                  }}
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    background: "rgba(0,0,0,0.55)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    width: 22,
                    height: 22,
                    cursor: "pointer",
                    fontSize: 11,
                    padding: 0,
                    lineHeight: "22px",
                    textAlign: "center",
                  }}
                >
                  ✕
                </button>
              </div>
            )}

            {/* Pet Type */}
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                display: "block",
                marginBottom: 4,
              }}
            >
              Pet Type
            </label>
            <select
              value={postEditForm.petType}
              onChange={(e) =>
                setPostEditForm((f) => ({ ...f, petType: e.target.value }))
              }
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid #ddd",
                fontSize: 14,
                marginBottom: 16,
                boxSizing: "border-box",
                background: "#fff",
              }}
            >
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
              <option value="bird">Bird</option>
              <option value="other">Other</option>
            </select>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleEditPost}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "9px 0",
                  borderRadius: 8,
                  border: "none",
                  background: "#111",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                <Check size={14} /> Save Changes
              </button>
              <button
                onClick={() => setEditingPost(null)}
                style={{
                  padding: "9px 16px",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                Cancel
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

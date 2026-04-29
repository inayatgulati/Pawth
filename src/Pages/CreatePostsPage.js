import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/CreatePosts.css";

const API = "http://localhost:5002";

export default function CreatePostPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [caption, setCaption] = useState("");
  const [petType, setPetType] = useState("dog");
  const [imageFile, setImageFile] = useState(null); // raw File object
  const [imagePreview, setImagePreview] = useState(""); // blob URL for preview
  const [imageUrl, setImageUrl] = useState(""); // manual URL input
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const galleryInputRef = useRef(null);

  // Handle file picked from gallery
  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setUploadedFileName(file.name);
    setImageUrl(""); // clear any manual URL
    setImagePreview(URL.createObjectURL(file)); // fast local preview
    e.target.value = "";
  };

  // Handle manual URL input
  const handleUrlChange = (e) => {
    setImageUrl(e.target.value);
    setImageFile(null);
    setUploadedFileName("");
    setImagePreview(e.target.value);
  };

  // Clear image selection
  const clearImage = () => {
    setImageFile(null);
    setUploadedFileName("");
    setImageUrl("");
    setImagePreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let res;

      if (imageFile) {
        // ── Send as multipart/form-data (raw file, no base64 bloat) ──
        const fd = new FormData();
        fd.append("image", imageFile);
        fd.append("caption", caption);
        fd.append("petType", petType);

        res = await fetch(`${API}/api/posts`, {
          method: "POST",
          headers: { Authorization: token },
          // Do NOT set Content-Type — browser sets it automatically with boundary
          body: fd,
        });
      } else {
        // ── Send as JSON when using a URL ──
        res = await fetch(`${API}/api/posts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({ imageUrl, caption, petType }),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.message || "Failed to create post");
        setLoading(false);
        return;
      }

      navigate("/dashboard");
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-wrapper">
      <div className="create-card">
        <h1 className="create-title">🐾 Pawth</h1>
        <h2 className="create-title">Create a Post</h2>

        <p className="create-username">
          Posting as <b>@{user?.username}</b>
        </p>

        {error && <p className="auth-error">{error}</p>}

        <form className="create-form" onSubmit={handleSubmit}>
          {/* ── Image section ── */}
          <label>Image</label>

          <div className="image-upload-row">
            <button
              type="button"
              className="upload-btn"
              onClick={() => galleryInputRef.current?.click()}
            >
              Upload from Gallery
            </button>
          </div>

          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageFile}
          />

          <div className="upload-or-divider">
            <span>or paste a URL</span>
          </div>

          <input
            type="url"
            name="imageUrl"
            value={uploadedFileName ? "" : imageUrl}
            onChange={handleUrlChange}
            placeholder={
              uploadedFileName ? `📎 ${uploadedFileName}` : "https://..."
            }
            disabled={!!uploadedFileName}
            style={
              uploadedFileName
                ? { color: "var(--muted-text)", background: "#f0f0f0" }
                : {}
            }
          />

          {/* Live preview */}
          {imagePreview && (
            <div style={{ position: "relative" }}>
              <img
                src={imagePreview}
                alt="preview"
                className="preview-image"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <button
                type="button"
                onClick={clearImage}
                style={{
                  position: "absolute",
                  top: 16,
                  right: 8,
                  background: "rgba(0,0,0,0.55)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "50%",
                  width: 26,
                  height: 26,
                  cursor: "pointer",
                  fontSize: 14,
                  lineHeight: "26px",
                  textAlign: "center",
                  padding: 0,
                }}
              >
                ✕
              </button>
            </div>
          )}

          <label>Pet Type</label>
          <select
            name="petType"
            value={petType}
            onChange={(e) => setPetType(e.target.value)}
          >
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
            <option value="bird">Bird</option>
            <option value="other">Other</option>
          </select>

          <label>Caption</label>
          <input
            type="text"
            name="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Say something cute..."
            required
          />

          <button type="submit" className="create-submit" disabled={loading}>
            {loading ? "Posting..." : "Post"}
          </button>
        </form>

        <button
          type="button"
          className="create-cancel"
          onClick={() => navigate("/dashboard")}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Heart, Bookmark, MessageCircle, ArrowLeft } from "lucide-react";
import "../styles/PostDetails.css";

const API = "http://localhost:5002";

export default function PostDetailPage() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/api/posts/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Post not found.");
        setLoading(false);
      });
  }, [id]);

  const handleLike = async () => {
    if (!token) return navigate("/login");
    const res = await fetch(`${API}/api/posts/${id}/like`, {
      method: "POST",
      headers: { Authorization: token },
    });
    const data = await res.json();
    if (res.ok)
      setPost((prev) => ({
        ...prev,
        likesCount: data.likesCount,
        likedBy: data.likedBy,
      }));
  };

  const handleSave = async () => {
    if (!token) return navigate("/login");
    const res = await fetch(`${API}/api/posts/${id}/save`, {
      method: "POST",
      headers: { Authorization: token },
    });
    const data = await res.json();
    if (res.ok) setPost((prev) => ({ ...prev, savedBy: data.savedBy }));
  };

  const handleComment = async () => {
    const text = commentText.trim();
    if (!text || !token) return;
    const res = await fetch(`${API}/api/posts/${id}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify({ text }),
    });
    const comments = await res.json();
    if (res.ok) {
      setPost((prev) => ({ ...prev, comments }));
      setCommentText("");
    }
  };

  if (loading) return <div className="postdetail-loading">Loading...</div>;

  if (error || !post)
    return (
      <div className="postdetail-error">
        <p>{error || "Post not found."}</p>
        <button
          className="postdetail-error-btn"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Feed
        </button>
      </div>
    );

  const liked = user && post.likedBy?.includes(user.username);
  const saved = user && post.savedBy?.includes(user.username);

  return (
    <div className="postdetail-shell">
      <div className="postdetail-content">
        {/* Back button */}
        <button className="postdetail-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={17} /> Back
        </button>

        <div className="postdetail-card">
          {/* Image */}
          <img
            src={post.imageUrl}
            alt={post.caption}
            onError={(e) => {
              e.target.src =
                "https://placehold.co/600x400?text=Image+Unavailable";
            }}
          />

          <div className="postdetail-body">
            {/* Pet type badge */}
            <span className="postdetail-pet-badge">{post.petType}</span>

            {/* Caption & author */}
            <p className="postdetail-caption">{post.caption}</p>
            <p className="postdetail-author">@{post.authorUsername}</p>

            {/* Action buttons */}
            <div className="postdetail-actions">
              <button
                className={`postdetail-action-btn ${liked ? "liked" : ""}`}
                onClick={handleLike}
                title={!token ? "Log in to like" : ""}
              >
                <Heart
                  size={18}
                  fill={liked ? "#e0245e" : "none"}
                  color={liked ? "#e0245e" : "#555"}
                />
                {post.likesCount || 0} Likes
              </button>
              <button
                className={`postdetail-action-btn ${saved ? "saved" : ""}`}
                onClick={handleSave}
                title={!token ? "Log in to save" : ""}
              >
                <Bookmark
                  size={18}
                  fill={saved ? "#4a6fa5" : "none"}
                  color={saved ? "#4a6fa5" : "#555"}
                />
                {post.savedBy?.length || 0} Saves
              </button>
              <span className="postdetail-comments-count">
                <MessageCircle size={18} />
                {post.comments?.length || 0} Comments
              </span>
            </div>

            {/* Comments section */}
            <div className="postdetail-comments">
              <h3>Comments</h3>

              {post.comments?.length === 0 && (
                <p className="postdetail-no-comments">
                  No comments yet. Be the first!
                </p>
              )}

              <div className="postdetail-comment-list">
                {post.comments?.map((c, i) => (
                  <div key={i} className="postdetail-comment-item">
                    <div className="postdetail-comment-avatar">
                      {c.username[0].toUpperCase()}
                    </div>
                    <div>
                      <span className="postdetail-comment-username">
                        @{c.username}
                      </span>
                      <p className="postdetail-comment-text">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {token ? (
                <div className="postdetail-comment-input-row">
                  <input
                    className="postdetail-comment-input"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    onKeyDown={(e) => e.key === "Enter" && handleComment()}
                  />
                  <button
                    className="postdetail-comment-submit"
                    onClick={handleComment}
                  >
                    Post
                  </button>
                </div>
              ) : (
                <p className="postdetail-login-prompt">
                  <button onClick={() => navigate("/login")}>Log in</button> to
                  leave a comment.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

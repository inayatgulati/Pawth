import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Trash2,
  ShieldOff,
  ShieldCheck,
  ArrowLeft,
  Users,
  Grid,
  Shield,
} from "lucide-react";
import "../styles/Admin.css";

const API = "http://localhost:5002";

function RoleBadge({ role }) {
  const labels = {
    admin: "Admin",
    member: "Member",
    user: "Member (legacy)",
  };
  return (
    <span
      className={`role-badge ${role === "admin" ? "admin" : role === "member" ? "member" : "user"}`}
    >
      {labels[role] || "Member (legacy)"}
    </span>
  );
}

export default function AdminPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/admin/users`, {
        headers: { Authorization: token },
      }).then((r) => r.json()),
      fetch(`${API}/api/admin/posts`, {
        headers: { Authorization: token },
      }).then((r) => r.json()),
    ])
      .then(([u, p]) => {
        setUsers(Array.isArray(u) ? u : []);
        setPosts(Array.isArray(p) ? p : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load admin data.");
        setLoading(false);
      });
  }, [token]);

  const handleSuspend = async (id) => {
    const res = await fetch(`${API}/api/admin/users/${id}/suspend`, {
      method: "PATCH",
      headers: { Authorization: token },
    });
    const data = await res.json();
    if (res.ok)
      setUsers((prev) =>
        prev.map((u) =>
          u._id === id ? { ...u, suspended: data.suspended } : u,
        ),
      );
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Permanently delete this user and all their data?"))
      return;
    const res = await fetch(`${API}/api/admin/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: token },
    });
    if (res.ok) setUsers((prev) => prev.filter((u) => u._id !== id));
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    const res = await fetch(`${API}/api/admin/posts/${id}`, {
      method: "DELETE",
      headers: { Authorization: token },
    });
    if (res.ok) setPosts((prev) => prev.filter((p) => p._id !== id));
  };

  const memberCount = users.filter(
    (u) => u.role === "member" || u.role === "user",
  ).length;
  const adminCount = users.filter((u) => u.role === "admin").length;

  const filteredUsers = users.filter((u) => {
    if (roleFilter === "all") return true;
    if (roleFilter === "member")
      return u.role === "member" || u.role === "user";
    return u.role === roleFilter;
  });

  return (
    <div className="admin-shell">
      {/* Header */}
      <header className="admin-header">
        <h1>🐾 Pawth - Admin Dashboard</h1>
        <button
          className="admin-back-btn"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={14} /> Back to Feed
        </button>
      </header>

      <div className="admin-content">
        {/* Summary cards */}
        <div className="admin-stats-grid">
          {[
            {
              label: "Members",
              subtitle: "Registered & authenticated",
              value: memberCount,
              icon: <Users size={22} />,
              color: "#27ae60",
            },
            {
              label: "Admins",
              subtitle: "Full access",
              value: adminCount,
              icon: <Shield size={22} />,
              color: "#c0392b",
            },
          ].map(({ label, subtitle, value, icon, color }) => (
            <div key={label} className="admin-stat-card">
              <div
                className="admin-stat-icon"
                style={{ background: color + "18", color }}
              >
                {icon}
              </div>
              <div>
                <p className="admin-stat-num">{value}</p>
                <p className="admin-stat-label">{label}</p>
                <p className="admin-stat-subtitle">{subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Posts count card */}
        <div className="admin-posts-card">
          <div
            className="admin-stat-icon"
            style={{ background: "#4a6fa518", color: "#4a6fa5" }}
          >
            <Grid size={22} />
          </div>
          <div>
            <p>{posts.length}</p>
            <p>Total Posts</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          {[
            { key: "users", label: `Users (${users.length})` },
            { key: "posts", label: `Posts (${posts.length})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`admin-tab-btn ${tab === key ? "active" : "inactive"}`}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {error && <p className="admin-error">{error}</p>}
        {loading ? (
          <p className="admin-loading">Loading...</p>
        ) : tab === "users" ? (
          <>
            {/* Role filter */}
            <div className="admin-role-filter">
              <span className="admin-role-filter-label">Filter by role:</span>
              {[
                { value: "all", label: `All (${users.length})` },
                { value: "member", label: `Members (${memberCount})` },
                { value: "admin", label: `Admins (${adminCount})` },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  className={`admin-role-btn ${roleFilter === value ? "active" : "inactive"}`}
                  onClick={() => setRoleFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Users table */}
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="admin-th">Username</th>
                    <th className="admin-th">Email</th>
                    <th className="admin-th">Role</th>
                    <th className="admin-th">Status</th>
                    <th className="admin-th">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="admin-td"
                        style={{
                          textAlign: "center",
                          color: "#aaa",
                          padding: "2rem",
                        }}
                      >
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u._id}>
                        <td className="admin-td">
                          <strong>@{u.username}</strong>
                          {u.displayName && (
                            <span className="admin-display-name">
                              {u.displayName}
                            </span>
                          )}
                        </td>
                        <td className={`admin-td admin-td-email`}>
                          {u.email || "—"}
                        </td>
                        <td className="admin-td">
                          <RoleBadge role={u.role} />
                        </td>
                        <td className="admin-td">
                          <span
                            className={
                              u.suspended
                                ? "admin-status-suspended"
                                : "admin-status-active"
                            }
                          >
                            {u.suspended ? "Suspended" : "Active"}
                          </span>
                        </td>
                        <td className="admin-td">
                          {u.role !== "admin" ? (
                            <>
                              <button
                                className="admin-action-btn"
                                onClick={() => handleSuspend(u._id)}
                                title={
                                  u.suspended
                                    ? "Unsuspend member"
                                    : "Suspend member"
                                }
                              >
                                {u.suspended ? (
                                  <ShieldCheck size={14} color="#27ae60" />
                                ) : (
                                  <ShieldOff size={14} color="#f39c12" />
                                )}
                              </button>
                              <button
                                className="admin-action-btn"
                                onClick={() => handleDeleteUser(u._id)}
                                title="Delete member"
                              >
                                <Trash2 size={14} color="#e74c3c" />
                              </button>
                            </>
                          ) : (
                            <span className="admin-protected">Protected</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          /* Posts grid */
          <div className="admin-posts-grid">
            {posts.map((post) => (
              <div key={post._id} className="admin-post-card">
                <img
                  src={post.imageUrl}
                  alt={post.caption}
                  onError={(e) => {
                    e.target.src = "https://placehold.co/400x300?text=No+Image";
                  }}
                />
                <div className="admin-post-body">
                  <span className="admin-post-type">{post.petType}</span>
                  <p className="admin-post-caption">{post.caption}</p>
                  <p className="admin-post-meta">
                    @{post.authorUsername} · ❤️ {post.likesCount || 0}
                  </p>
                  <button
                    className="admin-delete-post-btn"
                    onClick={() => handleDeletePost(post._id)}
                  >
                    <Trash2 size={13} /> Delete Post
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

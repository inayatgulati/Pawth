import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import { useAuth, AuthProvider } from "./context/AuthContext";
import DashboardPage from "./Pages/DashboardPage";
import LoginPage from "./Pages/LoginPage";
import RegisterPage from "./Pages/RegisterPage";
import ProfilePage from "./Pages/ProfilePage";
import CreatePostPage from "./Pages/CreatePostsPage";
import AdminPage from "./Pages/AdminPage";
import PostDetailPage from "./Pages/PostDetailPage";
import PetPlacesPage from "./Pages/Petplacespage";
import ForgotPasswordPage from "./Pages/ForgotPasswordPage";
import ResetPasswordPage from "./Pages/ResetPasswordPage";
import LandingPage from "./Pages/Landingpage";
import EventPlannerPage from "./Pages/Eventplannerpage";
import PetArticlesPage from "./Pages/PetArticlesPage";
import "./App.css";

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" />;
  if (user?.role !== "admin") return <Navigate to="/not-authorized" />;
  return children;
}

function NotAuthorized() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
        background: "#fafafa",
      }}
    >
      <h1 style={{ fontSize: "4rem", margin: 0, color: "#e74c3c" }}>403</h1>
      <h2 style={{ color: "#333" }}>Not Authorized</h2>
      <p style={{ color: "#666" }}>
        You don't have permission to view this page.
      </p>
      <a
        href="/dashboard"
        style={{
          marginTop: "1rem",
          padding: "10px 24px",
          background: "#111",
          color: "#fff",
          borderRadius: "6px",
          textDecoration: "none",
          fontWeight: "bold",
        }}
      >
        Back to Feed
      </a>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public — visitors */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/not-authorized" element={<NotAuthorized />} />
      <Route path="/places" element={<PetPlacesPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/events" element={<EventPlannerPage />} />
      <Route path="/articles" element={<PetArticlesPage />} />

      {/* Public — post detail view (visitors can read) */}
      <Route path="/posts/:id" element={<PostDetailPage />} />

      {/* Private — members only */}
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/create"
        element={
          <PrivateRoute>
            <CreatePostPage />
          </PrivateRoute>
        }
      />

      {/* Admin only */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

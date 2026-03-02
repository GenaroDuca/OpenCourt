import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminPanel from "./pages/AdminPanel";
import { Analytics } from "@vercel/analytics/react"

export default function App() {
  return (
    <>
      <Analytics />
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--color-background-card-color)",
              color: "var(--color-text-color)",
              border: "1px solid var(--color-border-color)",
              padding: "12px 16px",
              borderRadius: "var(--radius-lg)",
            },
            className: "text-xs md:text-base",
          }}
        />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </>
  );
}

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "Invalid login credentials");
      login(data.user, data.token);
      navigate(data.user.role === "ADMIN" ? "/admin/dashboard" : "/");
    } catch {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h3 className="mb-1 text-center">Welcome back</h3>
        <p className="text-center mb-4" style={{ color: "var(--text-muted)", fontSize: "14px" }}>
          Sign in to ApexPlay
        </p>

        {error && (
          <div className="alert alert-danger py-2" style={{ fontSize: "14px", borderRadius: "10px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={{ color: "var(--text-secondary)", fontSize: "13px", fontWeight: 600 }}>Email</label>
          <input className="form-control mb-3 mt-1" placeholder="you@example.com"
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />

          <label style={{ color: "var(--text-secondary)", fontSize: "13px", fontWeight: 600 }}>Password</label>
          <input className="form-control mb-4 mt-1" placeholder="••••••••"
            type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />

          <button className="btn btn-danger w-100" style={{ borderRadius: "10px", fontWeight: 700, padding: "11px" }}>
            Login
          </button>
        </form>

        <p className="text-center mt-3 mb-0" style={{ fontSize: "14px", color: "var(--text-muted)" }}>
          Don't have an account?{" "}
          <Link to="/signup" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
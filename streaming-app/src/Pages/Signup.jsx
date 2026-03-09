import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError]     = useState("");

  const isStrong = (pwd) =>
    pwd.length >= 8 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) &&
    /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim())           return setError("Username is required");
    if (!email.trim())          return setError("Email is required");
    if (password !== confirm)   return setError("Passwords do not match");
    if (!isStrong(password))    return setError("Password must be 8+ chars with upper, lower, number & symbol");
    try {
      const res = await fetch("http://localhost:5000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "Signup failed");
      alert("Account created! Please login.");
      navigate("/login");
    } catch {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h3 className="mb-1 text-center">Create account</h3>
        <p className="text-center mb-4" style={{ color: "var(--text-muted)", fontSize: "14px" }}>
          Join ApexPlay today
        </p>

        {error && (
          <div className="alert alert-danger py-2" style={{ fontSize: "14px", borderRadius: "10px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {[
            { label: "Username", val: name,     set: setName,     type: "text",     ph: "Your name" },
            { label: "Email",    val: email,    set: setEmail,    type: "email",    ph: "you@example.com" },
            { label: "Password", val: password, set: setPassword, type: "password", ph: "Min 8 chars" },
            { label: "Confirm Password", val: confirm, set: setConfirm, type: "password", ph: "Repeat password" },
          ].map(({ label, val, set, type, ph }) => (
            <div key={label} className="mb-3">
              <label style={{ color: "var(--text-secondary)", fontSize: "13px", fontWeight: 600 }}>{label}</label>
              <input className="form-control mt-1" placeholder={ph} type={type}
                value={val} onChange={(e) => set(e.target.value)} />
            </div>
          ))}

          <button className="btn btn-danger w-100 mt-1"
            style={{ borderRadius: "10px", fontWeight: 700, padding: "11px" }}>
            Create Account
          </button>
        </form>

        <p className="text-center mt-3 mb-0" style={{ fontSize: "14px", color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
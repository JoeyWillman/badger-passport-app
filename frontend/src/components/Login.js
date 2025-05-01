// src/components/Login.js
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import { toast } from "react-toastify";

export default function Login() {
  const navigate = useNavigate();
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Sign in with Firebase
      await signInWithEmailAndPassword(auth, email.trim(), password);

      toast.success("✅ Logged in successfully!");
      navigate("/map");
    } catch (err) {
      console.error("❌ Login error:", err);
      // Friendly error for invalid credentials
      if (err.code === "auth/invalid-email" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        toast.error("Invalid email or password.");
      } else {
        toast.error(err.message || "Login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg p-5" style={{ maxWidth: 400, width: "100%" }}>
        <h2 className="text-center mb-4">🔑 Welcome Back</h2>
        <form onSubmit={handleLogin}>
          {/* Email */}
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              id="email"
              type="email"
              className="form-control"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="input-group">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary w-100 py-2"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="text-center mt-3">
          <small className="text-muted">
            Don’t have an account? <a href="/signup">Sign up</a>
          </small>
        </div>
      </div>
    </div>
  );
}

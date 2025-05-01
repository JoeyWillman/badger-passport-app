// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import { toast } from 'react-toastify';

const API = 'https://badger-passport-app.onrender.com';  // ← your Render backend

export default function Login() {
  const navigate = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1) Sign in via Firebase
      await auth.signInWithEmailAndPassword(email, password);

      // 2) Fetch your backend to create/get a session (if you do server‐side login)
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${API}/api/users/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Server rejected login');
      }

      // 3) All good—go to the map
      toast.success('✅ Logged in successfully!');
      navigate('/map');
    } catch (err) {
      console.error('❌ Login error:', err);
      toast.error(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <form className="card p-4" style={{ minWidth: 320 }} onSubmit={handleSubmit}>
        <h3 className="mb-3 text-center">🔑 Log In</h3>
        <div className="mb-2">
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="btn btn-primary w-100" disabled={loading}>
          {loading ? 'Logging in…' : 'Log In'}
        </button>
      </form>
    </div>
  );
}

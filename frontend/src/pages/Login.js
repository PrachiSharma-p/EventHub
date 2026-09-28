// pages/Login.js — Authenticates a user and stores the JWT in localStorage
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', form);
      onLogin(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="container form-page">
      <form onSubmit={submit}>
        <h2>Login</h2>
        <input placeholder="Name" autoComplete="name" required
          onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Email" type="email" autoComplete="email" required
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Password" type="password" autoComplete="current-password" required
          onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <Link to="/forgot-password">Forgot password?</Link>
        <button type="submit">Login</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}

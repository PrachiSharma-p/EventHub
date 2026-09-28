// pages/Register.js — Sign up as either an "organizer" or an "attendee"
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

export default function Register({ onLogin }) {
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', profilePicture: '', role: 'attendee',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/register', form);
      onLogin(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="container form-page">
      <form onSubmit={submit}>
        <h2>Create Account</h2>
        <input placeholder="Full name" required onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Email" type="email" required onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Password (at least 8 characters)" type="password" minLength="8" required
          onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <input placeholder="Phone (optional)" type="tel" onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input placeholder="Profile picture URL (optional)" type="url"
          onChange={(e) => setForm({ ...form, profilePicture: e.target.value })} />
        <label>I am a:</label>
        <select onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="attendee">Attendee (book tickets)</option>
          <option value="organizer">Organizer (create events)</option>
        </select>
        <button type="submit">Register</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}

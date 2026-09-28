import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/api';

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password });
      setMessage(data.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to reset password');
    }
  };

  return (
    <div className="container form-page">
      <form onSubmit={submit}>
        <h2>Reset password</h2>
        <input type="password" placeholder="New password (at least 8 characters)" minLength="8"
          required value={password} onChange={(event) => setPassword(event.target.value)} />
        <input type="password" placeholder="Confirm new password" required value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)} />
        <button type="submit">Update password</button>
        {message && <p>{message} <Link to="/login">Log in</Link></p>}
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}
import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setResetUrl('');
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMessage(data.message);
      setResetUrl(data.resetUrl || '');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to request a password reset');
    }
  };

  return (
    <div className="container form-page">
      <form onSubmit={submit}>
        <h2>Forgot password</h2>
        <input type="email" placeholder="Email" required value={email}
          onChange={(event) => setEmail(event.target.value)} />
        <button type="submit">Send reset instructions</button>
        {message && <p>{message}</p>}
        {resetUrl && <p><a href={resetUrl}>Open password reset link</a></p>}
        {error && <p className="error">{error}</p>}
        <Link to="/login">Back to login</Link>
      </form>
    </div>
  );
}
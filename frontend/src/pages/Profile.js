import { useEffect, useState } from 'react';
import api from '../api/api';
import BookingHistory from '../components/BookingHistory';

export default function Profile({ onProfileUpdate }) {
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', profilePicture: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/auth/me')
      .then(({ data }) => setProfile(data))
      .catch((requestError) => {
        setError(requestError.response?.data?.message || 'Could not load profile');
      });
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      const { data } = await api.put('/auth/me', profile);
      setProfile(data);
      onProfileUpdate(data);
      setMessage('Profile updated');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update profile');
    }
  };

  return (
    <div className="container profile-page">
      <h1>My Profile</h1>
      <div className="profile-layout">
        <div className="profile-avatar-wrap">
          {profile.profilePicture ? (
            <img className="profile-avatar" src={profile.profilePicture} alt={`${profile.name}'s profile`} />
          ) : (
            <div className="profile-avatar profile-avatar-placeholder" aria-label="No profile picture">
              {profile.name.charAt(0).toUpperCase() || '?'}
            </div>
          )}
        </div>
        <form className="profile-form" onSubmit={submit}>
          <label htmlFor="profile-name">Name</label>
          <input id="profile-name" required value={profile.name}
            onChange={(event) => setProfile({ ...profile, name: event.target.value })} />
          <label htmlFor="profile-email">Email</label>
          <input id="profile-email" type="email" required value={profile.email}
            onChange={(event) => setProfile({ ...profile, email: event.target.value })} />
          <label htmlFor="profile-phone">Phone</label>
          <input id="profile-phone" type="tel" value={profile.phone || ''}
            onChange={(event) => setProfile({ ...profile, phone: event.target.value })} />
          <button type="submit">Save profile</button>
          {message && <p>{message}</p>}
          {error && <p className="error">{error}</p>}
        </form>
      </div>
      <section className="profile-bookings">
        <h2>My bookings and booking history</h2>
        <BookingHistory />
      </section>
    </div>
  );
}
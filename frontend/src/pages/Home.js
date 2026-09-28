// pages/Home.js — Public event browsing & search page
import { useEffect, useState } from 'react';
import api from '../api/api';
import EventCard from '../components/EventCard';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async (q = '') => {
    const { data } = await api.get(`/events${q ? `?search=${q}` : ''}`);
    setEvents(data);
  };

  return (
    <div className="container">
      <div className="hero">
        <h1>Find your next event</h1>
        <input
          placeholder="Search events by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchEvents(search)}
        />
      </div>
      <div className="event-grid">
        {events.map((ev) => (
          <EventCard key={ev._id} event={ev} />
        ))}
      </div>
    </div>
  );
}

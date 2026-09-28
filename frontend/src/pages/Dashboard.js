// pages/Dashboard.js — Organizer: create events and see events they manage
import { useEffect, useState } from 'react';
import api from '../api/api';

const emptyForm = () => ({
  title: '', description: '', category: 'Music', venue: '',
  date: '', price: 0, ticketType: 'General', totalSeats: 100, imageUrl: '',
});

export default function Dashboard() {
  const [myEvents, setMyEvents] = useState([]);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [editingEventId, setEditingEventId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    api.get('/events/mine/list')
      .then((res) => setMyEvents(res.data))
      .catch((err) => {
        setLoadError(err.response?.data?.message || 'Could not load your events. Please log in again.');
      });
  }, []);

  const updateForm = (e) => {
    const { name, value } = e.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const saveEvent = async (e) => {
    e.preventDefault();
    try {
      if (editingEventId) {
        const { data } = await api.put(`/events/${editingEventId}`, form);
        setMyEvents((events) => events.map((event) => (
          event._id === editingEventId ? data : event
        )));
        setEditingEventId(null);
      } else {
        const { data } = await api.post('/events', form);
        setMyEvents((events) => [...events, data]);
      }
      setForm(emptyForm());
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save event');
    }
  };

  const startEditing = (event) => {
    const eventDate = new Date(event.date);
    const localDate = new Date(eventDate.getTime() - eventDate.getTimezoneOffset() * 60000)
      .toISOString().slice(0, 16);
    setEditingEventId(event._id);
    setForm({
      title: event.title || '',
      description: event.description || '',
      category: event.category || 'Music',
      venue: event.venue || '',
      date: localDate,
      price: event.price ?? 0,
      ticketType: event.ticketType || 'General',
      totalSeats: event.totalSeats ?? 100,
      imageUrl: event.imageUrl || '',
    });
    setError('');
  };

  const cancelEditing = () => {
    setEditingEventId(null);
    setForm(emptyForm());
    setError('');
  };

  const deleteEvent = async (event) => {
    if (!window.confirm(`Delete "${event.title}"?`)) return;

    try {
      await api.delete(`/events/${event._id}`);
      setMyEvents((events) => events.filter((item) => item._id !== event._id));
      setDeleteError('');
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Event deletion failed');
    }
  };

  return (
    <div className="container dashboard-page">
      <header className="dashboard-heading">
        <div>
          <span className="dashboard-kicker">EVENT WORKSPACE</span>
          <h1>My Dashboard</h1>
        </div>
        <span className="dashboard-count"><strong>{myEvents.length}</strong> events</span>
      </header>

      <form className={`create-event-form${editingEventId ? ' is-editing' : ''}`} onSubmit={saveEvent}>
        <h3>{editingEventId ? 'Edit Event' : 'Create New Event'}</h3>
        <input name="title" placeholder="Title" required value={form.title} onChange={updateForm} />
        <textarea name="description" placeholder="Description" required value={form.description}
          onChange={updateForm} />
        <input name="category" placeholder="Category" required value={form.category} onChange={updateForm} />
        <input name="venue" placeholder="Venue" required value={form.venue} onChange={updateForm} />
        <input name="date" type="datetime-local" required value={form.date} onChange={updateForm} />
        <input name="price" type="number" placeholder="Price per ticket" min="0" value={form.price}
          onChange={updateForm} />
        <label htmlFor="ticketType">Ticket type</label>
        <select id="ticketType" name="ticketType" value={form.ticketType} onChange={updateForm}>
          <option value="General">General</option>
          <option value="VIP">VIP</option>
          <option value="Premium">Premium</option>
        </select>
        <input name="totalSeats" type="number" placeholder="Total Seats" min="1" required
          value={form.totalSeats} onChange={updateForm} />
        <input name="imageUrl" placeholder="Image URL" value={form.imageUrl} onChange={updateForm} />
        {form.imageUrl && <img className="event-image-preview" src={form.imageUrl} alt="Event preview" />}
        <button type="submit">{editingEventId ? 'Save Changes' : 'Publish Event'}</button>
        {editingEventId && <button type="button" onClick={cancelEditing}>Cancel Edit</button>}
        {error && <p className="error">{error}</p>}
      </form>

      <section className="dashboard-events">
      <div className="dashboard-section-heading">
        <h2>My Events</h2>
        <span>{myEvents.length} total</span>
      </div>
      {loadError && <p className="error">{loadError}</p>}
      {myEvents.length === 0 && !loadError ? (
        <p className="dashboard-empty">No events yet. Create your first event above.</p>
      ) : (
        <div className="dashboard-table-scroll">
          <table className="events-table">
            <thead>
              <tr><th>Event</th><th>Date</th><th>Seats booked</th><th>Capacity</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {myEvents.map((ev) => (
                <tr key={ev._id}>
                  <td className="dashboard-event-title">{ev.title}</td>
                  <td>{new Date(ev.date).toLocaleDateString()}</td>
                  <td>{ev.seatsBooked}</td>
                  <td>{ev.totalSeats}</td>
                  <td>
                    <div className="dashboard-actions">
                <button
                  type="button"
                  className="edit-event-button"
                  onClick={() => startEditing(ev)}
                  aria-label={`Edit ${ev.title}`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="delete-event-button"
                  onClick={() => deleteEvent(ev)}
                  aria-label={`Delete ${ev.title}`}
                >
                  Delete
                </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {deleteError && <p className="error">{deleteError}</p>}
      </section>
    </div>
  );
}

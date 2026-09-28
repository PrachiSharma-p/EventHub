// components/EventCard.js — Card used in the event browsing grid
import { Link } from 'react-router-dom';

export default function EventCard({ event }) {
  const seatsLeft = event.totalSeats - event.seatsBooked;
  return (
    <Link to={`/events/${event._id}`} className="event-card">
      <div className="event-card-img" style={{ backgroundImage: `url(${event.imageUrl})` }} />
      <div className="event-card-body">
        <span className="badge">{event.category}</span>
        <h3>{event.title}</h3>
        <p>{new Date(event.date).toLocaleDateString()} · {event.venue}</p>
        <div className="event-card-footer">
          <strong>₹{event.price}</strong>
          <span>{seatsLeft} seats left</span>
        </div>
      </div>
    </Link>
  );
}

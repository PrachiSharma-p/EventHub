// pages/EventDetail.js — Event details + ticket booking form + digital confirmation
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/api';
import TicketQr from '../components/TicketQr';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState(1);
  const [confirmation, setConfirmation] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/events/${id}`).then((res) => setEvent(res.data));
  }, [id]);

  const bookTickets = async () => {
    let user;
    try {
      user = JSON.parse(localStorage.getItem('user'));
    } catch {
      user = null;
    }
    if (!user?.token) {
      window.alert('Please login to book the event ticket.');
      navigate('/login');
      return;
    }

    try {
      const { data } = await api.post('/bookings', { eventId: id, seats: Number(seats) });
      setConfirmation(data); // digital booking confirmation
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    }
  };

  if (!event) return <p className="container">Loading...</p>;

  return (
    <div className="container">
      <div className="event-detail">
        <img src={event.imageUrl} alt={event.title} />
        <div>
          <span className="badge">{event.category}</span>
          <h1>{event.title}</h1>
          <p>{event.description}</p>
          <p><strong>Venue:</strong> {event.venue}</p>
          <p><strong>Date:</strong> {new Date(event.date).toLocaleString()}</p>
          <p><strong>Organizer:</strong> {event.organizer?.name || 'Event organizer'}</p>
          <p><strong>Ticket type:</strong> {event.ticketType || 'General'}</p>
          <p><strong>Price:</strong> ₹{event.price} / seat</p>
          <p><strong>Seats available:</strong> {event.totalSeats - event.seatsBooked}</p>

          {!confirmation ? (
            <div className="booking-box">
              <label>Number of seats</label>
              <input
                type="number"
                min="1"
                max={event.totalSeats - event.seatsBooked}
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
              />
              <button onClick={bookTickets}>Book Tickets</button>
              {error && <p className="error">{error}</p>}
            </div>
          ) : (
            <div className="confirmation-box">
              <h2>🎉 Booking Confirmed!</h2>
              <TicketQr bookingCode={confirmation.bookingCode} />
              <p>Booking Code: <strong>{confirmation.bookingCode}</strong></p>
              <p>Seats: {confirmation.seats}</p>
              <p>Total amount: ₹{confirmation.totalAmount}</p>
              <p>Payment status: <strong>{confirmation.paymentStatus || 'pending'}</strong></p>
              <p className="booking-note">
                <strong>NOTE:</strong> Your booking is confirmed. After payment is completed, the amount is
                non-refundable and your ticket will be sent to the email address you provided.
              </p>
              <p>A digital confirmation has been saved to "My Bookings".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

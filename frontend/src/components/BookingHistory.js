import { useEffect, useState } from 'react';
import api from '../api/api';
import TicketQr from './TicketQr';

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/bookings/mine')
      .then((res) => setBookings(res.data))
      .catch((requestError) => {
        setError(requestError.response?.data?.message || 'Could not load booking history');
      });
  }, []);

  const cancel = async (id) => {
    try {
      await api.put(`/bookings/${id}/cancel`);
      setBookings((items) => items.map((booking) => (
        booking._id === id ? { ...booking, status: 'cancelled' } : booking
      )));
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not cancel booking');
    }
  };

  return (
    <div className="booking-history">
      {error && <p className="error">{error}</p>}
      {!error && bookings.length === 0 && <p>No booking history yet.</p>}
      {bookings.map((booking) => (
        <div key={booking._id} className={`ticket ${booking.status}`}>
          <div>
            <h3>{booking.event?.title || 'Event no longer available'}</h3>
            {booking.event && <p>{new Date(booking.event.date).toLocaleString()} · {booking.event.venue}</p>}
            <TicketQr bookingCode={booking.bookingCode} />
            <p>Booking Code: <strong>{booking.bookingCode}</strong></p>
            <p>Seats: {booking.seats} · Total amount: ₹{booking.totalAmount}</p>
            <p>Payment status: <strong>{booking.paymentStatus || 'pending'}</strong></p>
            <span className="status">{booking.status}</span>
          </div>
          {booking.status === 'confirmed' && (
            <button type="button" onClick={() => cancel(booking._id)}>Cancel</button>
          )}
        </div>
      ))}
    </div>
  );
}
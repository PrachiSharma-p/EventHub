// pages/MyBookings.js — View digital ticket confirmations and booking history
import BookingHistory from '../components/BookingHistory';

export default function MyBookings() {
  return (
    <div className="container">
      <h1>My Bookings and Booking History</h1>
      <BookingHistory />
    </div>
  );
}

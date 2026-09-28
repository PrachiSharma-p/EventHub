export default function TicketQr({ bookingCode }) {
  if (!bookingCode) return null;

  const qrUrl = new URL('https://api.qrserver.com/v1/create-qr-code/');
  qrUrl.searchParams.set('size', '180x180');
  qrUrl.searchParams.set('data', bookingCode);

  return (
    <img
      className="ticket-qr"
      src={qrUrl.toString()}
      alt={`QR code for ticket ${bookingCode}`}
      width="180"
      height="180"
      loading="lazy"
    />
  );
}
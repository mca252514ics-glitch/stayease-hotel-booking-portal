import { useState } from "react";
import { ArrowUpRight, CalendarDays, CheckCircle2, Search, XCircle } from "lucide-react";
import api from "../../services/api";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? String(value).slice(0, 10)
    : new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(date);
};

export default function BookingLookup() {
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [booking, setBooking] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [loading, setLoading] = useState(false);

  const lookupBooking = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setBooking(null);

    try {
      const response = await api.get(`/bookings/${encodeURIComponent(reference.trim())}`, {
        params: { email: email.trim() },
      });
      setBooking(response.data.data);
      setMessageType("success");
      setMessage("Your booking details are ready.");
    } catch (error) {
      setMessageType("error");
      setMessage(error.response?.data?.message || "We couldn't find that booking. Check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async () => {
    if (!window.confirm("Cancel this reservation? This action cannot be undone.")) return;
    setLoading(true);
    setMessage("");

    try {
      const response = await api.patch(
        `/bookings/${encodeURIComponent(booking.booking_reference)}/cancel`,
        { email: email.trim() },
      );
      setBooking((current) => ({ ...current, status: "CANCELLED" }));
      setMessageType("success");
      setMessage(response.data.message || "Your booking has been cancelled.");
    } catch (error) {
      setMessageType("error");
      setMessage(error.response?.data?.message || "Unable to cancel this booking right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="manage-section" id="my-booking">
      <div className="manage-copy">
        <span className="section-kicker">YOUR TRIP, YOUR WAY</span>
        <h2>Manage your booking</h2>
        <p>Already reserved a stay? Look up your booking with the reference number and email used at checkout.</p>
        <div className="manage-points">
          <span><CheckCircle2 size={16} /> View reservation details</span>
          <span><CheckCircle2 size={16} /> Check booking status</span>
          <span><CheckCircle2 size={16} /> Cancel a reservation</span>
        </div>
      </div>

      <div className="lookup-card">
        <form onSubmit={lookupBooking}>
          <label className="field">
            <span>Booking reference</span>
            <input value={reference} onChange={(event) => setReference(event.target.value.toUpperCase())} placeholder="HTL-XXXXXXXXXX" autoCapitalize="characters" required />
          </label>
          <label className="field">
            <span>Email address</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required />
          </label>
          <button className="button button-primary button-wide" disabled={loading}>
            {loading ? <><span className="button-spinner" /> Searching…</> : <><Search size={17} /> Find my booking</>}
          </button>
        </form>

        {message && (
          <div className={`inline-alert ${messageType === "success" ? "inline-alert-success" : "inline-alert-error"}`} role="status">
            {messageType === "success" ? <CheckCircle2 size={17} /> : <XCircle size={17} />}
            {message}
          </div>
        )}

        {booking && (
          <article className="lookup-result">
            <div className="lookup-result-top">
              <div>
                <span className="section-kicker">RESERVATION DETAILS</span>
                <h3>{booking.hotel_name}</h3>
                <p>{booking.location} · {booking.category}</p>
              </div>
              <span className={`status-pill ${booking.status === "CONFIRMED" ? "status-active" : "status-cancelled"}`}>
                {booking.status === "CONFIRMED" ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                {booking.status}
              </span>
            </div>
            <div className="lookup-dates">
              <div><small>CHECK-IN</small><strong>{formatDate(booking.check_in)}</strong></div>
              <CalendarDays size={17} />
              <div><small>CHECK-OUT</small><strong>{formatDate(booking.check_out)}</strong></div>
            </div>
            <div className="lookup-result-bottom">
              <div><small>BOOKING REFERENCE</small><strong>{booking.booking_reference}</strong></div>
              <div><small>TOTAL PAID / DUE</small><strong>₹{Number(booking.total_amount).toLocaleString("en-IN")}</strong></div>
            </div>
            {booking.status === "CONFIRMED" && (
              <button className="button button-danger button-wide" onClick={cancelBooking} disabled={loading}>
                {loading ? "Cancelling…" : <>Cancel this booking <ArrowUpRight size={16} /></>}
              </button>
            )}
          </article>
        )}
      </div>
    </section>
  );
}

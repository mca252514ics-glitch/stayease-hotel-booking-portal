import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, CheckCircle2, Clipboard, Home, MapPin } from "lucide-react";
import { formatINR } from "../utils/booking";

export default function BookingSuccessPage() {
  const { state } = useLocation();
  const booking = state?.booking;
  const [copied, setCopied] = useState(false);

  const copyReference = async () => {
    if (!booking?.booking_reference || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(booking.booking_reference);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  if (!booking) {
    return (
      <main className="success-page">
        <section className="success-card success-missing">
          <span className="success-icon"><CheckCircle2 size={30} /></span>
          <h1>Looking for your confirmation?</h1>
          <p>This page needs the confirmation details from the booking session. You can retrieve your reservation using your booking reference and email from the home page.</p>
          <Link to="/#my-booking" className="button button-primary">Find my booking <ArrowRight size={16} /></Link>
        </section>
      </main>
    );
  }

  return (
    <main className="success-page">
      <div className="success-confetti" aria-hidden="true" />
      <section className="success-card" aria-labelledby="success-title">
        <span className="success-icon"><CheckCircle2 size={32} /></span>
        <span className="section-kicker">YOUR STAY IS CONFIRMED</span>
        <h1 id="success-title">It's time to look forward to it.</h1>
        <p className="success-intro">Your reservation has been saved. Keep your booking reference handy so you can retrieve or cancel your stay.</p>
        <div className="success-reference">
          <small>BOOKING REFERENCE</small>
          <strong>{booking.booking_reference}</strong>
          <button type="button" onClick={copyReference}><Clipboard size={15} /> {copied ? "Copied" : "Copy reference"}</button>
        </div>
        <div className="success-details">
          <div><span>Hotel</span><strong>{booking.hotel_name}</strong></div>
          {booking.location && <div><span>Location</span><strong><MapPin size={14} /> {booking.location}</strong></div>}
          <div><span>Guest</span><strong>{booking.customer_name}</strong></div>
          <div><span>Check-in</span><strong>{String(booking.check_in).slice(0, 10)}</strong></div>
          <div><span>Check-out</span><strong>{String(booking.check_out).slice(0, 10)}</strong></div>
          <div><span>Room</span><strong>{booking.room_category}</strong></div>
          <div className="success-total"><span>Total amount</span><strong>{formatINR(booking.total_amount)}</strong></div>
        </div>
        <div className="success-actions">
          <Link to="/#my-booking" className="button button-primary">Manage my booking <ArrowRight size={16} /></Link>
          <Link to="/" className="success-home-link"><Home size={15} /> Back to StayEase</Link>
        </div>
        <p className="success-note">No payment has been collected. This confirmation records your reservation in the demo booking system.</p>
      </section>
    </main>
  );
}

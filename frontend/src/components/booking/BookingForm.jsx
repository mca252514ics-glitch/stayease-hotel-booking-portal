import { CheckCircle2, CreditCard, ShieldCheck } from "lucide-react";
import BookingSummary from "./BookingSummary";

export default function BookingForm({ hotel, availability, onBook, loading }) {
  if (!hotel || !availability) return null;

  return (
    <section className="booking-card" aria-labelledby="booking-form-title">
      <div className="booking-card-heading">
        <div>
          <span className="section-kicker">JUST ONE MORE STEP</span>
          <h2 id="booking-form-title">Complete your stay</h2>
        </div>
        <span className="secure-note"><ShieldCheck size={15} /> Secure details</span>
      </div>

      <BookingSummary hotel={hotel} availability={availability} />

      {availability.available ? (
        <form onSubmit={onBook} className="guest-form" id="guest-information">
          <div className="form-heading">
            <h3>Guest information</h3>
            <span><CheckCircle2 size={14} /> {availability.available_rooms} room{availability.available_rooms === 1 ? "" : "s"} available</span>
          </div>
          <div className="field-grid">
            <label className="field">
              <span>Full name</span>
              <input name="customerName" autoComplete="name" placeholder="e.g. Aditi Sharma" maxLength="150" required />
            </label>
            <label className="field">
              <span>Email address</span>
              <input name="email" type="email" autoComplete="email" placeholder="you@example.com" maxLength="255" required />
            </label>
          </div>
          <button className="button button-primary button-wide" type="submit" disabled={loading}>
            {loading ? <><span className="button-spinner" /> Confirming booking…</> : <><CreditCard size={17} /> Confirm booking</>}
          </button>
          <p className="form-reassurance">No payment is collected in this demo. Your reservation is saved when confirmed.</p>
        </form>
      ) : (
        <div className="inline-alert inline-alert-warning">This room is no longer available for the selected dates. Please choose different dates.</div>
      )}
    </section>
  );
}

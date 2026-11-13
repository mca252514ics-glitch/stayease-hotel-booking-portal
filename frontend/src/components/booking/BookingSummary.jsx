import { CalendarDays, ChevronUp, MapPin } from "lucide-react";
import { formatINR } from "../../utils/booking";

export default function BookingSummary({ hotel, availability }) {
  if (!hotel || !availability) return null;

  const scrollToGuestForm = () => {
    document.getElementById("guest-information")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  return (
    <>
      <div className="booking-price-summary">
        <div className="summary-hotel">
          <span className="summary-icon"><CalendarDays size={18} /></span>
          <div>
            <strong>{hotel.name}</strong>
            <span>{availability.category} · {availability.nights} {availability.nights === 1 ? "night" : "nights"}</span>
          </div>
        </div>
        <div className="summary-location"><MapPin size={14} /> {hotel.location}</div>
        <div className="summary-dates">
          <div><small>CHECK-IN</small><strong>{availability.check_in}</strong></div>
          <div className="date-divider" />
          <div><small>CHECK-OUT</small><strong>{availability.check_out}</strong></div>
        </div>
        <div className="price-line">
          <span>{formatINR(availability.price_per_night)} × {availability.nights} nights</span>
          <strong>{formatINR(availability.total_amount)}</strong>
        </div>
        <div className="price-total">
          <span>Total amount</span>
          <strong>{formatINR(availability.total_amount)}</strong>
        </div>
        <p className="price-footnote">Final amount is calculated and confirmed by the booking server.</p>
      </div>
      {availability.available && (
        <div className="mobile-booking-bar" aria-label="Booking price summary">
          <div>
            <small>Total for {availability.nights} {availability.nights === 1 ? "night" : "nights"}</small>
            <strong>{formatINR(availability.total_amount)}</strong>
          </div>
          <button type="button" onClick={scrollToGuestForm}>Continue <ChevronUp size={16} /></button>
        </div>
      )}
    </>
  );
}

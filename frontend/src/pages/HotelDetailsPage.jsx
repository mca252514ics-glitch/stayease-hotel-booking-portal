import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, MapPin, ShieldCheck } from "lucide-react";
import api from "../services/api";
import OptimizedImage from "../components/common/OptimizedImage";
import BookingForm from "../components/booking/BookingForm";
import { isValidStay } from "../utils/booking";

const localToday = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

export default function HotelDetailsPage() {
  const { hotelId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [roomId, setRoomId] = useState("");
  const [checkIn, setCheckIn] = useState(location.state?.checkIn || "");
  const [checkOut, setCheckOut] = useState(location.state?.checkOut || "");
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");
  const today = localToday();
  const selectedRoom = hotel?.rooms?.find((room) => String(room.id) === String(roomId));

  useEffect(() => {
    let active = true;
    api.get(`/hotels/${hotelId}`)
      .then(({ data }) => {
        if (!active) return;
        const result = data.data;
        setHotel(result);
        if (result.rooms?.length) setRoomId(String(result.rooms[0].id));
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || "We couldn't load this hotel. Please try again.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [hotelId]);

  const checkAvailability = async (event) => {
    event.preventDefault();
    if (!selectedRoom) return;
    if (!isValidStay(checkIn, checkOut, today)) {
      setError("Choose a valid check-in and check-out date. Check-in cannot be in the past, and check-out must be later.");
      return;
    }
    setChecking(true);
    setError("");
    setAvailability(null);
    try {
      const { data } = await api.get(`/rooms/${selectedRoom.id}/availability`, {
        params: { checkIn, checkOut },
      });
      setAvailability(data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to check availability for these dates.");
    } finally {
      setChecking(false);
    }
  };

  const confirmBooking = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setBookingLoading(true);
    setError("");
    try {
      const { data } = await api.post("/bookings", {
        roomId: selectedRoom.id,
        customerName: formData.get("customerName"),
        email: formData.get("email"),
        checkIn,
        checkOut,
      });
      navigate("/booking/success", { state: { booking: data.data }, replace: false });
    } catch (err) {
      setError(err.response?.data?.message || "Booking could not be completed. Please try again.");
      try {
        const { data } = await api.get(`/rooms/${selectedRoom.id}/availability`, { params: { checkIn, checkOut } });
        setAvailability(data.data);
      } catch {
        // Keep the original booking error visible.
      }
    } finally {
      setBookingLoading(false);
      form.reset();
    }
  };

  if (loading) {
    return <main className="route-page"><div className="route-loading"><span className="button-spinner" /> Loading hotel details…</div></main>;
  }

  if (!hotel) {
    return <main className="route-page"><div className="route-message"><h1>We couldn't find that stay</h1><p>{error || "This hotel may no longer be available."}</p><Link className="button button-primary" to="/">Back to all stays</Link></div></main>;
  }

  return (
    <main className="route-page hotel-detail-route">
      <div className="page-container">
        <Link to="/" className="back-link"><ArrowLeft size={16} /> Back to explore stays</Link>
        {error && <div className="global-alert alert-error" role="alert">{error}</div>}
        <div className="route-hotel-heading">
          <span className="hotel-location-label"><MapPin size={14} /> {hotel.location}</span>
          <h1>{hotel.name}</h1>
          <p>{hotel.description}</p>
        </div>
        <OptimizedImage src={hotel.image_url} alt={`${hotel.name} property`} className="route-hotel-image" width={1500} />
        <div className="route-details-grid">
          <section className="route-property-info">
            <div className="route-section-heading"><span className="section-kicker">THE PROPERTY</span><h2>A stay to look forward to.</h2></div>
            <div className="details-amenity-list">
              {(Array.isArray(hotel.amenities) ? hotel.amenities : []).map((amenity) => <span key={amenity}><CheckCircle2 size={15} /> {amenity}</span>)}
            </div>
            <div className="route-room-card">
              <div><span className="section-kicker">ROOM TYPE</span><h3>Choose your room</h3><p>Select the room category for your stay.</p></div>
              <label className="field"><span>Room category</span><select value={roomId} onChange={(event) => { setRoomId(event.target.value); setAvailability(null); }}>
                {hotel.rooms.map((room) => <option key={room.id} value={room.id}>{room.category} — ₹{Number(room.price_per_night).toLocaleString("en-IN")}/night</option>)}
              </select></label>
              {selectedRoom && <strong className="route-room-price">₹{Number(selectedRoom.price_per_night).toLocaleString("en-IN")} <small>/ night</small></strong>}
            </div>
          </section>
          <aside className="route-date-card">
            <span className="section-kicker">PLAN YOUR STAY</span>
            <h2>When would you like to go?</h2>
            <form onSubmit={checkAvailability} className="route-date-form">
              <label className="field"><span>Check-in</span><input type="date" min={today} value={checkIn} onChange={(event) => { setCheckIn(event.target.value); setAvailability(null); }} required /></label>
              <label className="field"><span>Check-out</span><input type="date" min={checkIn || today} value={checkOut} onChange={(event) => { setCheckOut(event.target.value); setAvailability(null); }} required /></label>
              <button className="button button-primary button-wide" type="submit" disabled={checking || !selectedRoom}>{checking ? "Checking dates…" : <>Check availability <ArrowRight size={16} /></>}</button>
            </form>
            <p className="availability-reassurance"><ShieldCheck size={15} /> Availability is checked against current reservations.</p>
          </aside>
        </div>
        {availability && <div className="route-booking-area"><BookingForm hotel={hotel} availability={availability} onBook={confirmBooking} loading={bookingLoading} /></div>}
      </div>
    </main>
  );
}

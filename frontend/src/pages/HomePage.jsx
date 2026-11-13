import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowDown, ArrowRight, ArrowUpRight, CalendarDays,
  Compass, MapPin, Search, ShieldCheck, Sparkles, X,
} from "lucide-react";
import api from "../services/api";
import HotelCard from "../components/hotels/HotelCard";
import BookingLookup from "../components/booking/BookingLookup";
import OptimizedImage from "../components/common/OptimizedImage";
import "../App.css";

const getLocalToday = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

function HomePage() {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchLabel, setSearchLabel] = useState("All stays");
  const today = getLocalToday();

  const resultCountLabel = useMemo(
    () => `${hotels.length} ${hotels.length === 1 ? "stay" : "stays"} to explore`,
    [hotels.length],
  );

  const fetchHotels = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/hotels");
      setHotels(response.data.data || []);
      setSearchLabel("All stays");
    } catch (err) {
      setError(err.response?.data?.message || "We couldn't load hotels. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    api.get("/hotels")
      .then((response) => {
        if (active) {
          setHotels(response.data.data || []);
          setSearchLabel("All stays");
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.response?.data?.message || "We couldn't load hotels. Please try again.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);


  const searchHotels = async (event) => {
    event.preventDefault();
    if (checkIn && checkIn < today) {
      setError("Check-in date cannot be in the past.");
      return;
    }
    if (checkIn && checkOut && checkOut <= checkIn) {
      setError("Check-out must be after check-in.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const query = location.trim();
      const response = query
        ? await api.get("/hotels/search", { params: { location: query } })
        : await api.get("/hotels");
      setHotels(response.data.data || []);
      setSearchLabel(query ? `Stays in ${query}` : "All stays");
      document.getElementById("hotels")?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      setError(err.response?.data?.message || "Hotel search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const showAllHotels = () => {
    setLocation("");
    fetchHotels();
    document.getElementById("hotels")?.scrollIntoView({ behavior: "smooth" });
  };

  const selectHotel = (hotel) => {
    navigate(`/hotels/${hotel.hotel_id}`, {
      state: { checkIn, checkOut, from: "/" },
    });
  };


  const chooseDestination = (destination) => {
    setLocation(destination);
    setError("");
    setLoading(true);
    api.get("/hotels/search", { params: { location: destination } })
      .then((response) => {
        setHotels(response.data.data || []);
        setSearchLabel(`Stays in ${destination}`);
        document.getElementById("hotels")?.scrollIntoView({ behavior: "smooth" });
      })
      .catch((err) => setError(err.response?.data?.message || "Unable to search this destination."))
      .finally(() => setLoading(false));
  };

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#home" aria-label="StayEase home">
          <span className="brand-mark"><Compass size={19} strokeWidth={2.2} /></span>
          <span>stay<span className="brand-accent">ease</span></span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#hotels">Explore stays</a>
          <a href="#why-stayease">Why StayEase</a>
          <a href="#my-booking">My booking</a>
        </nav>
        <a className="header-cta" href="#hotels">Find a stay <ArrowUpRight size={15} /></a>
      </header>

      <main id="home">
        <section className="hero-section">
          <div className="hero-image">
            <OptimizedImage
              src="https://images.unsplash.com/photo-1571896349842-33c89424de2d"
              alt="A serene resort swimming pool surrounded by tropical greenery"
              className="hero-photo"
              width={1800}
              priority
            />
          </div>
          <div className="hero-overlay" />
          <div className="hero-content page-container">
            <div className="hero-copy">
              <span className="hero-eyebrow"><Sparkles size={14} /> A better way to get away</span>
              <h1>Find your place<br />in the <em>world.</em></h1>
              <p>Thoughtful stays for the moments that matter. Discover somewhere lovely and make it yours.</p>
            </div>

            <form className="search-panel" onSubmit={searchHotels}>
              <label className="search-field destination-field">
                <span className="search-icon"><MapPin size={18} /></span>
                <span className="search-field-copy">
                  <span className="search-label">Destination</span>
                  <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Where are you going?" aria-label="Destination or city" />
                </span>
              </label>
              <div className="search-divider" />
              <label className="search-field">
                <span className="search-icon"><CalendarDays size={18} /></span>
                <span className="search-field-copy">
                  <span className="search-label">Check in</span>
                  <input type="date" min={today} value={checkIn} onChange={(event) => { setCheckIn(event.target.value); }} aria-label="Check-in date" />
                </span>
              </label>
              <div className="search-divider" />
              <label className="search-field">
                <span className="search-icon"><CalendarDays size={18} /></span>
                <span className="search-field-copy">
                  <span className="search-label">Check out</span>
                  <input type="date" min={checkIn || today} value={checkOut} onChange={(event) => { setCheckOut(event.target.value); }} aria-label="Check-out date" />
                </span>
              </label>
              <button className="search-submit" type="submit" disabled={loading}>
                <Search size={18} /> <span>Search stays</span>
              </button>
            </form>
            <div className="hero-footnote"><ShieldCheck size={14} /> Simple booking · Clear pricing · No hidden fees</div>
          </div>
          <a href="#hotels" className="hero-scroll" aria-label="Scroll to explore stays"><ArrowDown size={17} /></a>
        </section>

        {error && (
          <div className="page-container">
            <div className="global-alert alert-error" role="alert">
              <span>{error}</span>
              <button type="button" onClick={() => setError("")} aria-label="Dismiss error"><X size={17} /></button>
            </div>
          </div>
        )}
        <section className="destinations-section page-container" aria-labelledby="destinations-title">
          <div className="section-intro compact-intro">
            <div><span className="section-kicker">A LITTLE INSPIRATION</span><h2 id="destinations-title">Where to next?</h2></div>
            <p>Pick a place and let the getaway begin.</p>
          </div>
          <div className="destination-pills">
            {["Goa", "Mumbai", "Manali", "Pune", "Jaipur"].map((place) => (
              <button type="button" key={place} className={location.toLowerCase() === place.toLowerCase() ? "destination-pill active" : "destination-pill"} onClick={() => chooseDestination(place)}>
                {place}<ArrowUpRight size={14} />
              </button>
            ))}
          </div>
        </section>

        <section className="hotels-section page-container" id="hotels">
          <div className="section-intro">
            <div>
              <span className="section-kicker">THE STAYEASE COLLECTION</span>
              <h2>Stays worth slowing down for</h2>
              <p className="section-subtitle">Places with a little something special, selected for your next escape.</p>
            </div>
            <button type="button" className="outline-button" onClick={showAllHotels}>View all stays <ArrowRight size={15} /></button>
          </div>

          <div className="results-toolbar">
            <span>{searchLabel} <span className="results-count">· {resultCountLabel}</span></span>
            {location && <button type="button" className="clear-filter" onClick={showAllHotels}>Clear destination <X size={13} /></button>}
          </div>

          {loading ? (
            <div className="hotel-grid" aria-label="Loading hotels" aria-busy="true">
              {Array.from({ length: 3 }).map((_, index) => <div className="hotel-skeleton" key={index}><div className="skeleton-image" /><div className="skeleton-lines"><i /><i /><i /></div></div>)}
            </div>
          ) : hotels.length > 0 ? (
            <div className="hotel-grid">
              {hotels.map((hotel, index) => <HotelCard key={hotel.hotel_id} hotel={hotel} onSelect={selectHotel} index={index} />)}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon"><Search size={22} /></span>
              <h3>No stays found just yet</h3>
              <p>Try another destination or browse all of our available stays.</p>
              <button type="button" className="button button-primary" onClick={showAllHotels}>Explore all stays</button>
            </div>
          )}
        </section>


        <section className="why-section page-container" id="why-stayease">
          <div className="why-heading"><span className="section-kicker">THE STAYEASE DIFFERENCE</span><h2>Travel should feel<br /><em>effortless.</em></h2></div>
          <div className="why-grid">
            <article><span className="why-number">01</span><h3>Find your fit</h3><p>Explore stays by destination and discover the details that matter to you.</p></article>
            <article><span className="why-number">02</span><h3>Know the total</h3><p>See your stay price upfront, calculated clearly for your selected dates.</p></article>
            <article><span className="why-number">03</span><h3>Stay in control</h3><p>Retrieve your reservation and manage your booking whenever you need.</p></article>
          </div>
        </section>

        <div className="page-container"><BookingLookup /></div>
      </main>

      <footer className="site-footer">
        <div className="footer-main">
          <a className="brand footer-brand" href="#home"><span className="brand-mark"><Compass size={18} /></span><span>stay<span className="brand-accent">ease</span></span></a>
          <p>Find somewhere lovely. Make it yours.</p>
          <a href="#home" className="back-to-top">Back to top <ArrowUpRight size={15} /></a>
        </div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} StayEase. Hotel Booking Portal.</span><span>Made for better getaways.</span></div>
      </footer>
    </div>
  );
}

export default HomePage;

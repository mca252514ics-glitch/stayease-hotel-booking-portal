import { ArrowUpRight, MapPin, Wifi, Waves, Car, Utensils, Coffee } from "lucide-react";
import OptimizedImage from "../common/OptimizedImage";

const amenityIcons = {
  wifi: Wifi,
  "free wifi": Wifi,
  "swimming pool": Waves,
  parking: Car,
  restaurant: Utensils,
  "room service": Coffee,
};

function Amenity({ name }) {
  const Icon = amenityIcons[name.toLowerCase()] || Coffee;
  return (
    <span className="amenity-chip">
      <Icon size={13} aria-hidden="true" />
      {name}
    </span>
  );
}

export default function HotelCard({ hotel, onSelect, index = 0 }) {
  const price = Number(hotel.price_per_night || 0);
  const amenities = Array.isArray(hotel.amenities) ? hotel.amenities : [];

  return (
    <article className="hotel-card" style={{ "--card-index": index }}>
      <button
        type="button"
        className="hotel-card-image-button"
        onClick={() => onSelect(hotel)}
        aria-label={`View ${hotel.name} details`}
      >
        <OptimizedImage
          src={hotel.image_url}
          alt={`${hotel.name} in ${hotel.location}`}
          className="hotel-card-image"
          width={720}
        />
        <span className="image-label">Guest favourite</span>
      </button>

      <div className="hotel-card-body">
        <div className="hotel-card-meta">
          <span><MapPin size={13} /> {hotel.location}</span>
          <span className="rating"><span aria-hidden="true">★</span> 4.8 <small>(guest pick)</small></span>
        </div>
        <h3>{hotel.name}</h3>
        <p className="hotel-description">{hotel.description}</p>

        <div className="amenity-list" aria-label="Hotel amenities">
          {amenities.slice(0, 3).map((item) => <Amenity key={item} name={item} />)}
          {amenities.length > 3 && <span className="amenity-more">+{amenities.length - 3} more</span>}
        </div>

        <div className="hotel-card-bottom">
          <div className="price-block">
            <strong>₹{price.toLocaleString("en-IN")}</strong>
            <span> / night</span>
          </div>
          <button type="button" className="text-link-button" onClick={() => onSelect(hotel)}>
            Explore <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}

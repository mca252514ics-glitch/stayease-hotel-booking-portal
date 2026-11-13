USE hotel_booking;

-- Adds optional factual fields used by StayEase AI.
-- Existing hotel/room/booking data is preserved.

ALTER TABLE hotels
  ADD COLUMN rating DECIMAL(2,1) NULL,
  ADD COLUMN distance_to_city_center_km DECIMAL(6,2) NULL,
  ADD COLUMN breakfast_included BOOLEAN NULL,
  ADD COLUMN free_wifi BOOLEAN NULL,
  ADD COLUMN free_parking BOOLEAN NULL,
  ADD COLUMN family_friendly BOOLEAN NULL,
  ADD COLUMN business_friendly BOOLEAN NULL,
  ADD COLUMN policies TEXT NULL;

-- Example data only: verify and edit these values for your real sample hotels.
UPDATE hotels SET
  rating = 4.2,
  distance_to_city_center_km = 3.5,
  breakfast_included = 1,
  free_wifi = 1,
  free_parking = 0,
  family_friendly = 1,
  business_friendly = 1,
  policies = 'Check-in: 2 PM; Check-out: 11 AM; Contact hotel for specific cancellation terms'
WHERE name = 'Grand Palace Hotel';

UPDATE hotels SET
  rating = 4.4,
  distance_to_city_center_km = 5.0,
  breakfast_included = 1,
  free_wifi = 1,
  free_parking = 1,
  family_friendly = 1,
  business_friendly = 0,
  policies = 'Check-in: 1 PM; Check-out: 10 AM; Contact hotel for specific cancellation terms'
WHERE name = 'Sea View Resort';

UPDATE hotels SET
  rating = 4.5,
  distance_to_city_center_km = 2.0,
  breakfast_included = 0,
  free_wifi = 1,
  free_parking = 1,
  family_friendly = 1,
  business_friendly = 0,
  policies = 'Check-in: 2 PM; Check-out: 11 AM; Contact hotel for specific cancellation terms'
WHERE name = 'Mountain Retreat';

UPDATE hotels SET
  rating = 4.0,
  distance_to_city_center_km = 1.5,
  breakfast_included = 0,
  free_wifi = 1,
  free_parking = 0,
  family_friendly = 0,
  business_friendly = 1,
  policies = 'Check-in: 12 PM; Check-out: 11 AM; Contact hotel for specific cancellation terms'
WHERE name = 'City Comfort';

UPDATE hotels SET
  rating = 4.3,
  distance_to_city_center_km = 2.8,
  breakfast_included = 1,
  free_wifi = 1,
  free_parking = 1,
  family_friendly = 1,
  business_friendly = 1,
  policies = 'Check-in: 1 PM; Check-out: 11 AM; Contact hotel for specific cancellation terms'
WHERE name = 'Royal Residency';

-- verify
SELECT
    id,
    name,
    location,
    rating,
    breakfast_included,
    free_wifi,
    free_parking,
    family_friendly,
    business_friendly,
    distance_to_city_center_km
FROM hotels;
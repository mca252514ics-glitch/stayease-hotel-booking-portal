
USE hotel_booking;

CREATE TABLE IF NOT EXISTS hotels (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    name VARCHAR(150) NOT NULL,

    location VARCHAR(150) NOT NULL,

    description TEXT,

    amenities JSON,

    image_url VARCHAR(500),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE IF NOT EXISTS rooms (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    hotel_id BIGINT NOT NULL,

    category VARCHAR(100) NOT NULL,

    price_per_night DECIMAL(10,2) NOT NULL,

    total_rooms INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_room_hotel
        FOREIGN KEY (hotel_id)
        REFERENCES hotels(id),

    CONSTRAINT chk_room_price
        CHECK (price_per_night > 0),

    CONSTRAINT chk_total_rooms
        CHECK (total_rooms > 0)
);



CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    booking_reference VARCHAR(30) NOT NULL UNIQUE,

    room_id BIGINT NOT NULL,

    customer_name VARCHAR(150) NOT NULL,

    email VARCHAR(255) NOT NULL,

    check_in DATE NOT NULL,

    check_out DATE NOT NULL,

    total_amount DECIMAL(10,2) NOT NULL,

    status ENUM('CONFIRMED', 'CANCELLED')
        NOT NULL DEFAULT 'CONFIRMED',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    cancelled_at TIMESTAMP NULL,

    CONSTRAINT fk_booking_room
        FOREIGN KEY (room_id)
        REFERENCES rooms(id),

    CONSTRAINT chk_booking_dates
        CHECK (check_out > check_in),

    CONSTRAINT chk_booking_amount
        CHECK (total_amount >= 0)
);


CREATE INDEX idx_hotels_location
ON hotels(location);

CREATE INDEX idx_rooms_hotel
ON rooms(hotel_id);

CREATE INDEX idx_bookings_room_dates
ON bookings(room_id, status, check_in, check_out);

CREATE INDEX idx_bookings_email
ON bookings(email);



INSERT INTO hotels
(id, name, location, description, amenities, image_url)
VALUES

(
    1,
    'Grand Palace Hotel',
    'Mumbai',
    'A premium hotel offering comfortable rooms and excellent city access.',
    JSON_ARRAY('Free WiFi', 'Swimming Pool', 'Parking', 'Restaurant'),
    'https://images.unsplash.com/photo-1566073771259-6a8506099945'
),

(
    2,
    'Sea View Resort',
    'Goa',
    'A beautiful resort near the beach with relaxing accommodation.',
    JSON_ARRAY('Free WiFi', 'Beach Access', 'Restaurant', 'Parking'),
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d'
),

(
    3,
    'Mountain Retreat',
    'Manali',
    'A peaceful mountain hotel surrounded by beautiful landscapes.',
    JSON_ARRAY('Free WiFi', 'Mountain View', 'Restaurant', 'Heating'),
    'https://images.unsplash.com/photo-1518732714860-b62714ce0c59'
),

(
    4,
    'City Comfort',
    'Pune',
    'A comfortable hotel suitable for business and leisure travellers.',
    JSON_ARRAY('Free WiFi', 'Parking', 'Restaurant', 'Room Service'),
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791'
),

(
    5,
    'Royal Residency',
    'Jaipur',
    'A stylish hotel offering a pleasant stay with traditional hospitality.',
    JSON_ARRAY('Free WiFi', 'Swimming Pool', 'Restaurant', 'Parking'),
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb'
);



INSERT INTO rooms
(id, hotel_id, category, price_per_night, total_rooms)
VALUES

(1, 1, 'Deluxe Room', 2000.00, 5),

(2, 2, 'Sea View Room', 3500.00, 8),

(3, 3, 'Mountain View Room', 2800.00, 6),

(4, 4, 'Standard Room', 1800.00, 10),

(5, 5, 'Premium Room', 2500.00, 7);

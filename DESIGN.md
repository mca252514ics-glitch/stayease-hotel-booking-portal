# DESIGN.md – StayEase Hotel Booking Portal

## 1. Introduction

StayEase is a web-based hotel booking application designed to simplify the process of discovering hotels, checking room availability, making reservations, and managing bookings.

The system provides a user-friendly interface for browsing hotel information and booking rooms for selected dates.

An additional feature, **StayEase AI**, provides hotel information and comparison capabilities through a Retrieval-Augmented Generation (RAG) approach using MySQL and the Groq API.

The design focuses on clear separation between frontend presentation, backend business logic, database operations, and AI integration.

---

## 2. Project Objectives

The main objectives are:

1. Allow users to browse available hotels.
2. Provide hotel search by location.
3. Display hotel details, amenities, room types, and prices.
4. Check room availability for selected dates.
5. Allow users to book one room.
6. Generate a unique booking reference.
7. Allow booking retrieval using reference and email.
8. Allow users to cancel bookings.
9. Prevent overbooking for overlapping stay dates.
10. Provide an AI-powered hotel information and comparison assistant.

---

## 3. System Architecture

The application follows a client-server architecture.

### Architecture Components

**Frontend – React**

Responsible for:
- Displaying hotel listings.
- Providing search functionality.
- Showing hotel details.
- Collecting booking information.
- Displaying booking confirmations.
- Retrieving and cancelling bookings.
- Providing the StayEase AI chatbot interface.

**Backend – Node.js and Express**

Responsible for:
- Exposing REST APIs.
- Validating user input.
- Retrieving hotel and room information.
- Checking room availability.
- Calculating booking totals.
- Creating and cancelling bookings.
- Integrating with the Groq API.

**Database – MySQL**

Responsible for storing:
- Hotel information.
- Room categories and prices.
- Total room inventory.
- Booking information.
- Booking status and dates.
- Additional hotel facts used by the AI assistant.

### Architecture Diagram

```text
             USER
               |
               v
       REACT FRONTEND
               |
               | REST API Requests
               v
       NODE.JS + EXPRESS
               |
       +-------+--------+
       |                |
       v                v
   MYSQL DATABASE    GROQ API
       |                ^
       |                |
       +---- Retrieved -+
            Hotel Context
```

The frontend communicates with the backend through REST APIs. The backend interacts with MySQL for application data and calls Groq for natural-language generation in the AI assistant.

### Technology Stack

| Component | Technology |
|---|---|
| Frontend | React.js |
| Build Tool | Vite |
| Styling | CSS |
| Routing | React Router |
| Backend | Node.js |
| Backend Framework | Express.js |
| Database | MySQL |
| Database Driver | mysql2 |
| AI Integration | Groq API |
| AI SDK | Groq SDK |

**Technology decision note:** The assignment's technical expectations mention Spring Boot, while the implemented backend uses Node.js and Express. Express was selected during development to reuse existing experience and the available implementation. This difference should be clarified with the evaluator if Spring Boot is mandatory.

---

## 4. Database Design

The application uses MySQL as its relational database.

The main database entities are:

1. Hotels
2. Rooms
3. Bookings

### 4.1 Hotels Table

The hotels table stores general information about each hotel.

Important fields include:

| Field | Description |
|---|---|
| id | Unique hotel identifier |
| name | Hotel name |
| location | Hotel location |
| description | Hotel description |
| amenities | Available hotel amenities |
| image_url | Hotel image reference |
| created_at | Record creation timestamp |

Additional fields used by StayEase AI include:

| Field | Description |
|---|---|
| rating | Hotel rating |
| distance_to_city_center_km | Distance from city centre |
| breakfast_included | Breakfast availability |
| free_wifi | Free Wi-Fi availability |
| free_parking | Free parking availability |
| family_friendly | Family suitability |
| business_friendly | Business suitability |
| policies | Hotel policies |

### 4.2 Rooms Table

The rooms table stores room-category and pricing information.

| Field | Description |
|---|---|
| id | Unique room identifier |
| hotel_id | Reference to the hotel |
| category | Room category |
| price_per_night | Price per night |
| total_rooms | Total rooms available in the category |
| created_at | Record creation timestamp |

The assignment allows one room category per hotel, which is sufficient for the current implementation.

### 4.3 Bookings Table

The bookings table stores customer reservation details.

| Field | Description |
|---|---|
| id | Unique booking identifier |
| booking_reference | Unique booking reference |
| room_id | Selected room category |
| customer_name | Customer name |
| email | Customer email |
| check_in | Check-in date |
| check_out | Check-out date |
| total_amount | Calculated booking amount |
| status | Booking status |
| created_at | Booking creation time |
| cancelled_at | Cancellation time |

Booking status values used in the design:

- CONFIRMED
- CANCELLED

### 4.4 Database Relationships

- One hotel can have multiple room-category records.
- Each room category belongs to one hotel.
- One room category can be associated with multiple bookings.
- Each booking refers to one room category.

```text
HOTELS
  |
  | One-to-Many
  |
ROOMS
  |
  | One-to-Many
  |
BOOKINGS
```

The actual SQL schema should be treated as the final authority for exact column types, constraints, and indexes.

---

## 5. Booking Workflow

The booking workflow is designed to validate the user's request and prevent invalid reservations.

### Step 1: Hotel Selection

The user browses available hotels and selects a hotel.

### Step 2: Room and Date Selection

The user selects a room category and provides check-in and check-out dates.

### Step 3: Availability Check

The backend checks existing confirmed bookings for overlapping stay dates.

### Step 4: Customer Details

The user enters:
- Customer name
- Email address

### Step 5: Price Calculation

The backend calculates the final amount using:

```text
Number of Nights = Check-out Date - Check-in Date

Total Amount = Number of Nights × Price Per Night
```

Example:

```text
Price per Night = ₹2,000
Number of Nights = 3

Total Amount = ₹6,000
```

The backend calculates the final amount independently rather than trusting the amount sent by the frontend.

### Step 6: Booking Confirmation

After successful validation and availability checking, the backend creates the booking and generates a unique booking reference.

The frontend displays the confirmation details.

---

## 6. Room Availability and Overbooking Prevention

Room availability is calculated using the room category's total inventory and existing confirmed bookings.

### Overlapping Stay Logic

Two bookings overlap when:

```sql
existing.check_in < requested.check_out
AND existing.check_out > requested.check_in
```

The application treats the stay interval as:

```text
[Check-in Date, Check-out Date)
```

This means the checkout date is not counted as an occupied night.

### Availability Calculation

```text
Available Rooms =
Total Rooms - Overlapping Confirmed Bookings
```

Only confirmed bookings are included in the occupied-room count.

Cancelled bookings are excluded, which releases inventory for future bookings.

### Simultaneous Booking Handling

The discussed implementation uses a MySQL transaction and `SELECT ... FOR UPDATE` to lock the selected room record while checking availability and creating a booking.

The backend:
1. Starts a transaction.
2. Locks the selected room row.
3. Counts overlapping confirmed bookings.
4. Checks whether room capacity remains.
5. Creates the booking if capacity is available.
6. Commits the transaction.
7. Rolls back if the operation fails.

This design helps prevent two users from booking the final available room simultaneously, provided the transaction and locking logic are correctly implemented using InnoDB.

---

## 7. Booking Retrieval and Cancellation

### Booking Retrieval

Users can retrieve an existing booking using:
- Booking reference
- Email address used during booking

The backend checks both values before returning the booking details.

### Booking Cancellation

The cancellation process:
1. Receives the booking reference and email.
2. Validates the booking.
3. Updates the booking status to CANCELLED.
4. Records the cancellation timestamp.
5. Excludes the cancelled booking from future availability calculations.

The original assignment does not specify payment refunds or detailed cancellation deadlines, so these are outside the documented scope.

---

## 8. REST API Design

The backend exposes REST endpoints for the main application operations.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/hotels` | Retrieve all hotels |
| GET | `/api/hotels/:id` | Retrieve hotel details |
| GET | `/api/hotels/search` | Search hotels by location |
| GET | `/api/rooms/:roomId/availability` | Check room availability |
| POST | `/api/bookings` | Create a booking |
| GET | `/api/bookings/:reference` | Retrieve a booking |
| PATCH | `/api/bookings/:reference/cancel` | Cancel a booking |
| POST | `/api/ai/hotels` | Ask StayEase AI |

Refer to the actual route and controller files for exact request parameters and response structures.

---

## 9. Surprise Feature – StayEase AI

### 9.1 Overview

StayEase AI is an AI-powered hotel information and comparison assistant integrated into the application.

It allows users to ask questions about hotel information using natural language.

### 9.2 Example Questions

- Which hotels have free Wi-Fi?
- Is breakfast included?
- Does the hotel provide free parking?
- Which hotel is cheaper?
- Which hotel is closer to the city centre?
- Which hotel is suitable for families?
- Compare two hotels based on price, location and amenities.

### 9.3 RAG Architecture

The feature uses a Quick RAG approach.

Retrieval-Augmented Generation combines information retrieval with language generation.

Instead of asking the AI model to answer from its general knowledge, the application retrieves relevant hotel information from MySQL and supplies that information as context.

### 9.4 RAG Workflow

1. The user enters a question in the chatbot.
2. The React frontend sends the question to the Express backend.
3. The backend validates the question.
4. SQL queries retrieve relevant hotel and room information from MySQL.
5. Retrieved records are converted into a context object.
6. The context and question are passed to the Groq API.
7. Groq generates a natural-language answer based on the supplied context.
8. The backend returns the answer and source hotel records.
9. The frontend displays the response and its sources.

### 9.5 Why MySQL Retrieval Is Used

The current hotel catalogue contains structured information such as:
- Hotel names
- Locations
- Amenities
- Ratings
- Room prices
- Policies
- Guest suitability

SQL-based retrieval is suitable for this small relational dataset and avoids the additional complexity of introducing a vector database.

This implementation is a lightweight structured-data RAG approach rather than embedding-based semantic search.

### 9.6 Grounded Responses

The AI prompt instructs the model to:
- Use only the retrieved hotel information.
- Avoid inventing hotel amenities or policies.
- Avoid making unsupported price or rating claims.
- State when information is unavailable.
- Compare only hotels and facts present in the retrieved context.
- Avoid claiming live room availability.

The application also displays the hotel records used as sources.

The AI model is not the authority for booking availability or final booking totals. Those remain responsibilities of the normal backend booking APIs.

### 9.7 Error Handling

If the Groq API is unavailable or the request fails, the assistant displays an error message.

This AI failure should not prevent users from browsing hotels or using the normal booking functionality.

---

## 10. Security and Validation

The application follows these security practices:

- Backend validation of user input.
- Parameterized SQL queries.
- Environment variables for database credentials.
- Backend-only storage of the Groq API key.
- Server-side booking price calculation.
- Database constraints for unique booking references.
- Transaction-based booking operations.

Sensitive environment files must not be committed to the public GitHub repository.

---

## 11. Testing Strategy

The application should be tested for the following cases:

| Test Case | Expected Result |
|---|---|
| Valid booking | Booking is created |
| Check-in date in the past | Request is rejected |
| Check-out before check-in | Request is rejected |
| Valid multi-night stay | Correct total amount is calculated |
| No room availability | Booking is rejected |
| Overlapping confirmed booking | Inventory is reduced |
| Cancelled booking | Inventory is released |
| Booking lookup with matching details | Booking is retrieved |
| Booking lookup with incorrect email | Booking is not disclosed |
| AI question about existing hotel data | Answer is generated from retrieved records |
| AI question about unavailable information | Assistant reports missing information |

Actual automated test coverage and results should be recorded based on the tests present in the final repository.

---

## 12. Design Decisions and Trade-offs

| Decision | Reason |
|---|---|
| React frontend | Provides a component-based user interface |
| Express backend | Reuses existing Node.js development experience |
| MySQL database | Suitable for relational hotel, room and booking information |
| One room category per hotel | Sufficient for the assignment's stated scope |
| Backend price calculation | Prevents reliance on client-submitted totals |
| Transaction and row locking | Helps prevent overbooking |
| SQL-based RAG | Simple and efficient for the current structured hotel catalogue |
| Groq API | Provides natural-language generation using retrieved context |
| No payment integration | Payment processing is not required |
| No admin panel | Administrative functionality is not required |

### Technology Stack Clarification

The assignment's technical expectations mention Spring Boot, but the current implementation uses Express. This should be treated as a framework deviation and clarified with the evaluator if Spring Boot is mandatory.

---

## 13. Limitations

- The current RAG implementation uses SQL keyword retrieval rather than vector embeddings.
- AI answer quality depends on the completeness and accuracy of the database records.
- The assistant cannot guarantee live availability; the booking APIs must be used.
- Sample hotel information must be verified or clearly treated as demonstration data.
- Detailed cancellation deadlines and refund processing are outside the current scope.
- The backend framework differs from the explicit Spring Boot technical expectation.

---

## 14. Future Enhancements

Possible future improvements include:

- Semantic vector search for larger hotel knowledge bases.
- More advanced hotel recommendation algorithms.
- Additional comparison filters.
- More comprehensive backend integration and concurrency tests.
- Improved monitoring and logging.
- Migration to Spring Boot if required by the assignment evaluator.

---

## 15. Conclusion

StayEase combines a hotel discovery and reservation workflow with an AI-powered hotel information assistant.

The main application uses React, Express and MySQL to manage hotel information, room availability and bookings.

StayEase AI enhances the user experience by retrieving relevant hotel information from MySQL and using Groq to generate natural-language answers.

The database and backend remain the authoritative sources for hotel records, room prices, booking calculations and availability.

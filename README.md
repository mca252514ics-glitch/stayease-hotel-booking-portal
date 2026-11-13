# StayEase – Hotel Booking Portal

## 1. Project Overview

StayEase is a web-based Hotel Booking Portal that allows users to explore hotels, check room availability, make reservations, retrieve existing bookings, and cancel bookings.

The application provides a simple and user-friendly interface for customers to search hotels by location, view hotel details, select check-in and check-out dates, and book rooms.

The project also includes **StayEase AI**, an AI-powered hotel information and comparison assistant. It uses a Quick Retrieval-Augmented Generation (RAG) approach with MySQL and the Groq API to answer questions based on hotel information stored in the database.

### Key Features

- Browse available hotels.
- Search hotels by location.
- View hotel descriptions, amenities, room categories, and prices.
- Check room availability for selected dates.
- Book a room using customer name and email.
- Calculate the total booking amount.
- Generate a unique booking reference.
- Retrieve bookings using booking reference and email.
- Cancel existing bookings.
- Prevent overlapping reservations from exceeding room inventory.
- Ask hotel-related questions using StayEase AI.
- Compare hotels based on available database information.

---

## 2. Technology Stack

### Frontend
- React.js
- Vite
- JavaScript
- CSS
- React Router
- Axios / Fetch API (as used by individual frontend modules)

### Backend
- Node.js
- Express.js
- JavaScript
- REST APIs

### Database
- MySQL
- MySQL2

### AI Integration
- Groq API
- Groq SDK
- SQL-based retrieval for the RAG workflow

---

## 3. Project Structure

```text
hotel-booking-portal/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── services/
│   │
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   │
│   ├── package.json
│   └── .env.example
│
├── database/
│   ├── schema.sql
│   └── hotel_ai_columns.sql
│
├── screenshots/
│
├── README.md
├── DESIGN.md
└── .gitignore
```

---

## 4. Prerequisites

Before running the application, install the following:

1. Node.js and npm
2. MySQL Server
3. MySQL Workbench (recommended)
4. Git
5. A Groq API key for the AI assistant
6. Visual Studio Code or another code editor

---

## 5. Database Setup

### Step 1: Create the database

Open MySQL Workbench and execute:

```sql
CREATE DATABASE hotel_booking;
USE hotel_booking;
```

### Step 2: Create tables and insert sample data

Open:

`database/schema.sql`

Execute the complete SQL script.

This script creates the required hotel booking database tables and includes the project's five sample hotels and their room records.

### Step 3: Configure additional hotel information for AI

Open:

`database/hotel_ai_columns.sql`

This script contains the additional hotel information used by StayEase AI, such as:

- Hotel rating
- Distance to city centre
- Breakfast availability
- Free Wi-Fi
- Free parking
- Family-friendly information
- Business-friendly information
- Hotel policies

Review the SQL statements and execute the applicable migration statements once.

**Important:** Do not execute an `ALTER TABLE` statement again if its columns already exist. Verify that the hotel information is populated in MySQL before testing the AI assistant.

### Step 4: Verify database records

Execute:

```sql
USE hotel_booking;

SELECT * FROM hotels;

SELECT * FROM rooms;

SELECT * FROM bookings;
```

---

## 6. Backend Setup

### Step 1: Open the backend folder

```bash
cd backend
```

### Step 2: Install dependencies

```bash
npm install
```

Install the Groq SDK if it is not already listed in your backend dependencies:

```bash
npm install groq-sdk
```

### Step 3: Configure environment variables

Create a `.env` file inside the backend folder.

Example:

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=hotel_booking
DB_PORT=3306

FRONTEND_URL=http://localhost:5173

GROQ_API_KEY=YOUR_GROQ_API_KEY
GROQ_MODEL=llama-3.3-70b-versatile
```

Replace the placeholder values with your own configuration.

Never upload the actual `.env` file or expose your API keys publicly.

### Step 4: Start the backend

```bash
npm run dev
```

The backend should run at:

```text
http://localhost:5000
```

**Note:** If your backend uses a different port or npm script, follow the configuration in `backend/package.json`.

---

## 7. Frontend Setup

### Step 1: Open another terminal

```bash
cd frontend
```

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Configure frontend environment variables

Create `frontend/.env` if your frontend uses a Vite API base URL:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Step 4: Start the frontend

```bash
npm run dev
```

Vite will display the local application URL, usually:

```text
http://localhost:5173
```

Open this URL in your browser.

---

## 8. Main Application Workflows

### Hotel Browsing

1. Open the homepage.
2. Browse the available hotel listings.
3. Search hotels using a location.
4. Open a hotel to view its details.

### Room Availability

1. Select a hotel.
2. Choose check-in and check-out dates.
3. Submit the availability request.
4. View the availability result.

### Hotel Booking

1. Select a room.
2. Enter customer name and email.
3. Provide valid check-in and check-out dates.
4. Review the booking amount.
5. Confirm the booking.
6. Receive a unique booking reference.

### Booking Retrieval

1. Open the booking lookup section.
2. Enter the booking reference.
3. Enter the email address used during booking.
4. Retrieve the booking information.

### Booking Cancellation

1. Retrieve the existing booking.
2. Request cancellation.
3. The backend validates the booking details.
4. The booking status is updated to CANCELLED.
5. Cancelled bookings are excluded from future availability calculations.

---

## 9. StayEase AI – Hotel Information Assistant

StayEase AI is an additional feature that allows users to ask natural-language questions about hotels.

### Example Questions

- Which hotels have free Wi-Fi?
- Is breakfast included?
- Does the hotel provide free parking?
- Which hotel is cheaper?
- Which hotel is closer to the city centre?
- Which hotel is suitable for families?
- Compare Grand Palace Hotel and City Comfort.

### How It Works

1. The user enters a hotel-related question.
2. The React frontend sends the question to the Express backend.
3. The backend retrieves relevant hotel and room information from MySQL.
4. The retrieved database records are passed to the Groq API as context.
5. Groq generates a natural-language response using the retrieved information.
6. The answer and source hotel information are returned to the frontend.

The assistant is instructed not to invent hotel information. If a requested fact is not present in the retrieved database records, it should state that the information is unavailable.

The current implementation uses SQL-based retrieval over structured hotel data. It does not require a separate vector database.

The AI assistant does not confirm bookings or replace the application's room availability and booking APIs.

---

## 10. API Overview

The application provides REST APIs for hotel information, availability, bookings, cancellation, and AI assistance.

The main API operations include:

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/hotels` | Retrieve hotels |
| GET | `/api/hotels/:id` | Retrieve hotel details |
| GET | `/api/hotels/search` | Search hotels by location |
| GET | `/api/rooms/:roomId/availability` | Check room availability |
| POST | `/api/bookings` | Create a booking |
| GET | `/api/bookings/:reference` | Retrieve a booking |
| PATCH | `/api/bookings/:reference/cancel` | Cancel a booking |
| POST | `/api/ai/hotels` | Ask StayEase AI |

Refer to the backend route files for the exact request parameters and response formats.

---

## 11. Booking and Availability Rules

- Check-in cannot be in the past.
- Check-out must be later than check-in.
- The backend calculates the final booking amount.
- The booking amount is based on the number of nights and room price per night.
- Availability is checked against existing confirmed bookings.
- Overlapping bookings are considered when calculating room availability.
- Cancelled bookings do not consume room inventory.
- Database transactions and room-level locking are used in the discussed booking implementation to help prevent overbooking.

---

## 12. Screenshots and Demo

The `screenshots/` folder contains screenshots of the application's main workflows.

Recommended screenshots:

1. Homepage and hotel listings
2. Hotel details and room information
3. Room availability
4. Booking form
5. Booking confirmation
6. Booking lookup and cancellation
7. StayEase AI chatbot

A short demonstration video may also be included to show the complete booking and AI assistant workflows.

---

## 13. Security Considerations

- Database credentials are stored in environment variables.
- Groq API keys are stored on the backend.
- Parameterized SQL queries are used for database operations.
- User input is validated by the backend.
- Final booking totals are calculated on the server.
- Environment files and secrets must not be committed to GitHub.

---

## 14. Future Enhancements

Possible future improvements include:

- Semantic vector search for larger hotel knowledge bases.
- More advanced hotel recommendation functionality.
- Additional hotel comparison filters.
- Improved automated integration and concurrency tests.
- Additional accessibility and user experience improvements.

---

## 15. Author

**Project:** StayEase – Hotel Booking Portal

**Purpose:** Full-stack hotel booking application developed as part of an academic/interview assignment.

**Repository:** Add your GitHub repository URL here after publishing.

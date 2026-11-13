import { BrowserRouter, Route, Routes } from "react-router-dom";

import HomePage from "./pages/HomePage";
import HotelDetailsPage from "./pages/HotelDetailsPage";
import BookingSuccessPage from "./pages/BookingSuccessPage";
import NotFoundPage from "./pages/NotFoundPage";

import HotelAIAssistant from "./components/HotelAIAssistant";

export default function App() {
  return (
    <BrowserRouter>
      {/* Only Route components should be inside Routes */}
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/hotels/:hotelId" element={<HotelDetailsPage />} />

        <Route path="/booking/success" element={<BookingSuccessPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* Keep the AI assistant outside Routes */}
      <HotelAIAssistant />
    </BrowserRouter>
  );
}

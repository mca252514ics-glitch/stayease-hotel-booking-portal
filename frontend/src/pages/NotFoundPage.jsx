import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <main className="route-page"><div className="route-message">
      <span className="section-kicker">404 · PAGE NOT FOUND</span>
      <h1>This page took a little detour.</h1>
      <p>The page you're looking for doesn't exist or may have moved.</p>
      <Link to="/" className="button button-primary"><ArrowLeft size={16} /> Return to StayEase</Link>
    </div></main>
  );
}

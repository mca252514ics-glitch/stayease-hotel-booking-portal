import { useState } from "react";
import "./HotelAIAssistant.css";
import ReactMarkdown from "react-markdown";

const suggestions = [
  "Which hotels have free Wi-Fi?",
  "Is breakfast included?",
  "Which hotel is cheapest?",
  "Compare hotels for a family trip",
];

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function HotelAIAssistant() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! I'm StayEase AI. Ask me about hotel amenities, prices, locations, policies, or comparisons.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendQuestion(value = question) {
    const clean = value.trim();
    if (!clean || loading) return;

    setMessages((current) => [...current, { role: "user", text: clean }]);
    setQuestion("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/ai/hotels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: clean }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Unable to get an answer.");

      setMessages((current) => [
        ...current,
        { role: "assistant", text: data.answer, sources: data.sources || [] },
      ]);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          className="stay-ai-launcher"
          onClick={() => setOpen(true)}
          aria-label="Open StayEase AI assistant"
        >
          <span className="stay-ai-spark">✦</span>
          <span>Ask StayEase AI</span>
        </button>
      )}

      {open && (
        <section
          className="stay-ai-panel"
          aria-label="StayEase AI hotel assistant"
        >
          <header className="stay-ai-header">
            <div className="stay-ai-brand">
              <div className="stay-ai-logo">S</div>
              <div>
                <strong>StayEase AI</strong>
                <small>Hotel information assistant</small>
              </div>
            </div>
            <button
              className="stay-ai-close"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
            >
              ×
            </button>
          </header>

          <div className="stay-ai-messages" aria-live="polite">
            <div className="stay-ai-note">
              Answers are generated from hotel records in our database.
            </div>
            {messages.map((message, index) => (
              <div key={index} className={`stay-ai-message ${message.role}`}>
                <div className="stay-ai-bubble">
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                </div>
                {message.sources?.length > 0 && (
                  <div className="stay-ai-sources">
                    <strong>Hotel data used</strong>
                    {message.sources.map((source) => (
                      <div className="stay-ai-source" key={source.hotelId}>
                        <b>{source.name}</b>
                        <span>{source.location || "Location not listed"}</span>
                        <span>
                          {source.pricePerNight != null
                            ? `₹${Number(source.pricePerNight).toLocaleString("en-IN")} / night`
                            : "Price not listed"}
                          {source.rating != null ? ` · ★ ${source.rating}` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="stay-ai-typing">
                Searching hotel records and preparing an answer…
              </div>
            )}
            {error && <div className="stay-ai-error">{error}</div>}
          </div>

          {messages.length === 1 && (
            <div className="stay-ai-suggestions">
              <span>Try asking</span>
              {suggestions.map((item) => (
                <button
                  key={item}
                  onClick={() => sendQuestion(item)}
                  disabled={loading}
                >
                  {item}
                </button>
              ))}
            </div>
          )}

          <form
            className="stay-ai-form"
            onSubmit={(e) => {
              e.preventDefault();
              sendQuestion();
            }}
          >
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about hotels..."
              maxLength={500}
              aria-label="Ask a hotel question"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              aria-label="Send question"
            >
              ➤
            </button>
          </form>
          <div className="stay-ai-disclaimer">
            Hotel facts only · Verify availability before booking
          </div>
        </section>
      )}
    </>
  );
}

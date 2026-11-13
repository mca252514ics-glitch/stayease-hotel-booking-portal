const { answerHotelQuestion } = require("../services/hotelRagService");

async function askHotelAssistant(req, res) {
  try {
    const question = typeof req.body?.question === "string"
      ? req.body.question.trim()
      : "";

    if (!question) {
      return res.status(400).json({ message: "Please enter a hotel-related question." });
    }
    if (question.length > 500) {
      return res.status(400).json({ message: "Question must be 500 characters or fewer." });
    }

    const result = await answerHotelQuestion(question);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Hotel AI error:", error.message);
    if (error.message.includes("GROQ_API_KEY")) {
      return res.status(503).json({ message: "AI assistant is not configured. Please contact the administrator." });
    }
    return res.status(502).json({
      message: "The hotel assistant is temporarily unavailable. Please try again.",
    });
  }
}

module.exports = { askHotelAssistant };

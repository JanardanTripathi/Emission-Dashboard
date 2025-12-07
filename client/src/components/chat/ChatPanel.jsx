import { useState } from "react";
import { sendChat } from "../../services/api";

export default function ChatPanel({ data }) {
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setHistory((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await sendChat(input, data);
      const botMsg = { role: "assistant", content: res.data.answer };
      setHistory((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      const botMsg = {
        role: "assistant",
        content: "Sorry, I could not fetch an answer right now.",
      };
      setHistory((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ flex: 1, borderLeft: "1px solid #ddd", padding: "1rem" }}>
      <h2>Chat about Emissions</h2>
      <div
        style={{
          height: "70vh",
          overflowY: "auto",
          border: "1px solid #eee",
          padding: "0.5rem",
          marginBottom: "0.5rem",
          backgroundColor: "#fafafa",
          fontSize: "0.9rem",
        }}
      >
        {history.length === 0 && (
          <p style={{ color: "#777" }}>
            Ask anything like: "Which sector emits the most?" or
            "Compare India and USA emissions".
          </p>
        )}
        {history.map((msg, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: "0.5rem",
              textAlign: msg.role === "user" ? "right" : "left",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "0.4rem 0.6rem",
                borderRadius: "8px",
                backgroundColor:
                  msg.role === "user" ? "#d0ebff" : "#e9ecef",
              }}
            >
              <strong>
                {msg.role === "user" ? "You" : "Assistant"}:
              </strong>{" "}
              <span style={{ whiteSpace: "pre-line" }}>{msg.content}</span>
            </div>
          </div>
        ))}
        {loading && <p>Thinking...</p>}
      </div>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <textarea
          rows={2}
          style={{ flex: 1, resize: "none" }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about emissions or this dashboard..."
        />
        <button onClick={handleSend} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}
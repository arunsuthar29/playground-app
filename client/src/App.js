import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [input, setInput] = useState("");
  const [editInput, setEditInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [slidesData, setSlidesData] = useState(null);
  const [pptUrl, setPptUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  
  const sendPrompt = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const aiRes = await axios.post(`${process.env.REACT_APP_API_URL}/api/ai`, { prompt: input });
      setSlidesData(aiRes.data);

      const pptRes = await axios.post(`${process.env.REACT_APP_API_URL}/api/ppt`, aiRes.data);
      setMessages((m) => [...m, { sender: "ai", text: "✅ Slides generated successfully!" }]);
      setPptUrl(pptRes.data.downloadUrl);
    } catch (err) {
      console.error(err);
      setMessages((m) => [...m, { sender: "ai", text: "❌ Error generating slides." }]);
    } finally {
      setLoading(false);
    }
  };

  // ✏️ Edit slides
  const handleEdit = async () => {
    if (!editInput.trim() || !slidesData) {
      alert("Please create slides first and then provide an edit prompt.");
      return;
    }

    setLoading(true);
    setMessages((m) => [...m, { sender: "user", text: `✏️ Edit: ${editInput}` }]);

    try {
      const editRes = await axios.post(`${process.env.REACT_APP_API_URL}/api/ai/edit`, {
        prompt: editInput,
        slides: slidesData,
      });

      setSlidesData(editRes.data);
      setMessages((m) => [...m, { sender: "ai", text: "🧩 Slides updated as requested!" }]);

      // regenerate ppt
      const pptRes = await axios.post(`${process.env.REACT_APP_API_URL}/api/ppt`, editRes.data);
      setPptUrl(pptRes.data.downloadUrl);
    } catch (err) {
      console.error(err);
      setMessages((m) => [...m, { sender: "ai", text: "❌ Error editing slides." }]);
    } finally {
      setLoading(false);
      setEditInput("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendPrompt();
  };

  return (
    <div className="app-container">
      <header className="header">🎓 AI Slide Generator</header>

      <div className="chat-container">
        <div className="messages-box">
          {messages.length === 0 ? (
            <div className="placeholder">
              💡 Ask me to create slides! <br />
              <em>Example:</em> “Create 5 slides on AI in Healthcare”
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`message ${msg.sender === "user" ? "user" : "ai"}`}
              >
                <span>{msg.text}</span>
              </div>
            ))
          )}
          <div ref={chatEndRef}></div>
        </div>

        {/* Main input */}
        <div className="input-box">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask AI to create new slides..."
          />
          <button onClick={sendPrompt} disabled={loading}>
            {loading ? "..." : "Send"}
          </button>
        </div>

        {/* Edit section (visible after slides are created) */}
        {slidesData && (
          <div className="edit-section">
            <h4>✏️Edit Slides via Prompt</h4>
            <div className="input-box">
              <input
                value={editInput}
                onChange={(e) => setEditInput(e.target.value)}
                placeholder='e.g. "Change slide 2 title to AI in Imaging"'
              />
              <button onClick={handleEdit} disabled={loading}>
                {loading ? "Editing..." : "Edit"}
              </button>
            </div>
          </div>
        )}

        {pptUrl && (
          <div className="download-section">
            <a href={pptUrl} download>
              ⬇️ Download Updated PPT
            </a>
          </div>
        )}
      </div>

      
    </div>
  );
}

export default App;

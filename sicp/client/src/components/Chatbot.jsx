import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Mic, Sparkles } from "lucide-react";
import { COLORS } from "../theme.js";
import { inputStyle } from "./ui.jsx";
import { speak } from "../i18n.js";
import { api } from "../api.js";

export default function Chatbot({ lang, t }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ from: "bot", text: t.chatWelcome }]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, open]);
  useEffect(() => { setMsgs([{ from: "bot", text: t.chatWelcome }]); }, [lang]);

  async function send(text) {
    const val = (text ?? input).trim();
    if (!val) return;
    setMsgs((m) => [...m, { from: "user", text: val }]);
    setInput("");
    try {
      const { reply } = await api.chatbot(val, lang);
      setMsgs((m) => [...m, { from: "bot", text: reply }]);
      speak(reply, lang);
    } catch {
      const fallback = lang === "khortha" || lang === "kht"
        ? "माफ करिया, अभी जवाब ना मिल पारे।"
        : lang === "hi"
        ? "क्षमा करें, अभी उत्तर नहीं मिल सका।"
        : "Sorry, I couldn't get a reply just now.";
      setMsgs((m) => [...m, { from: "bot", text: fallback }]);
    }
  }

  function startVoice() {
    const SR = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SR) {
      send(
        lang === "khortha" || lang === "kht"
          ? "इ ब्राउजर में आवाज पहचान सुविधा नइखे।"
          : lang === "hi"
          ? "आवाज़ पहचान उपलब्ध नहीं है।"
          : "Voice recognition isn't available in this browser."
      );
      return;
    }
    const rec = new SR();
    rec.lang = lang === "hi" || lang === "khortha" || lang === "kht" ? "hi-IN" : "en-IN";
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onresult = (e) => send(e.results[0][0].transcript);
    rec.start();
  }

  return (
    <>
      <button onClick={() => setOpen((o) => !o)} aria-label="chatbot" style={{
        position: "fixed", bottom: 22, right: 22, width: 58, height: 58, borderRadius: "50%",
        background: COLORS.ochre, color: "#fff", border: "none", boxShadow: "0 6px 18px rgba(0,0,0,.22)",
        display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 60,
      }}>
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
      {open && (
        <div style={{
          position: "fixed", bottom: 90, right: 22, width: 340, maxWidth: "88vw", height: 440,
          background: "#fff", borderRadius: 14, boxShadow: "0 10px 34px rgba(0,0,0,.25)",
          display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 60, border: `1px solid ${COLORS.line}`,
        }}>
          <div style={{ background: COLORS.forest, color: "#fff", padding: "12px 16px", display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={17} />
            <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 14.5 }}>{t.chatTitle}</div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 14, background: COLORS.cream, display: "flex", flexDirection: "column", gap: 10 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.from === "bot" ? "flex-start" : "flex-end",
                background: m.from === "bot" ? "#fff" : COLORS.forest,
                color: m.from === "bot" ? COLORS.charcoal : "#fff",
                padding: "8px 12px", borderRadius: 12, maxWidth: "84%", fontSize: 13, lineHeight: 1.45,
                border: m.from === "bot" ? `1px solid ${COLORS.line}` : "none",
              }}>{m.text}</div>
            ))}
            <div ref={endRef} />
          </div>
          <div style={{ padding: 10, borderTop: `1px solid ${COLORS.line}`, display: "flex", gap: 6 }}>
            <button onClick={startVoice} style={{
              border: "none", background: listening ? COLORS.danger : COLORS.plaster, color: listening ? "#fff" : COLORS.forest,
              width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
            }} title={t.speak}><Mic size={16} /></button>
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={t.chatPlaceholder} style={{ ...inputStyle, flex: 1 }} />
            <button onClick={() => send()} style={{
              border: "none", background: COLORS.ochre, color: "#fff", width: 36, height: 36, borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
            }}><Send size={15} /></button>
          </div>
        </div>
      )}
    </>
  );
}

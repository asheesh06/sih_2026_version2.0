require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDb } = require("./db");

const authRoutes = require("./routes/auth");
const problemRoutes = require("./routes/problems");
const chatbotRoutes = require("./routes/chatbot");

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      // Echo origin back so credentials and all Vercel domains work seamlessly
      callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.get("/api/health", (req, res) => res.json({ ok: true, service: "sicp-server" }));
app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/chatbot", chatbotRoutes);

app.use((err, req, res, next) => {
  console.error("[Server Error]", err);
  if (err.type === "entity.too.large" || err.status === 413) {
    return res.status(413).json({ error: "Image file is too large. Please select a smaller photo." });
  }
  res.status(err.status || 500).json({ error: err.message || "Something went wrong on the server" });
});

const PORT = process.env.PORT || 4000;

connectDb()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => console.log(`SICP server listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  });

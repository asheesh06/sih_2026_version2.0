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
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true, service: "sicp-server" }));
app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/chatbot", chatbotRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server" });
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

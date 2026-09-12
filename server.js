require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { connectDb } = require("./sicp/server/src/db");

const authRoutes = require("./sicp/server/src/routes/auth");
const problemRoutes = require("./sicp/server/src/routes/problems");
const chatbotRoutes = require("./sicp/server/src/routes/chatbot");
const translateRoutes = require("./sicp/server/src/routes/translate");

async function startServer() {
  const app = express();

  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // OAuth Popup Callback Handler (AI Studio iframe postMessage bridge)
  app.get(["/auth/callback", "/auth/callback/"], (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head><title>Authentication Callback</title></head>
<body>
<script>
  try {
    const hash = window.location.hash.substring(1);
    const search = window.location.search.substring(1);
    const params = new URLSearchParams(hash || search);
    const access_token = params.get('access_token') || params.get('token') || params.get('code');
    if (window.opener) {
      window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', token: access_token }, '*');
      window.close();
    } else {
      window.location.href = '/';
    }
  } catch(e) {
    if (window.opener) window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
    window.close();
  }
</script>
<p style="font-family: sans-serif; text-align: center; margin-top: 40px;">
  Authentication successful. This window should close automatically.
</p>
</body>
</html>`);
  });

  // API Routes
  app.get("/api/health", (req, res) => res.json({ ok: true, service: "sicp-server" }));
  app.use("/api/auth", authRoutes);
  app.use("/api/problems", problemRoutes);
  app.use("/api/chatbot", chatbotRoutes);
  app.use("/api/translate", translateRoutes);

  // Mongoose error handling middleware as per AI Studio guidelines
  app.use((err, req, res, next) => {
    if (
      err.name === "MongooseError" ||
      err.name === "MongoNetworkError" ||
      (err.message && err.message.includes("buffering timed out"))
    ) {
      console.warn("[AI Studio] Database offline — returning fallback response");
      if (req.method === "GET") {
        return res.json(req.path.endsWith("s") || req.path.endsWith("s/") ? [] : {});
      }
      return res.status(503).json({ error: "Service temporarily unavailable (database offline)" });
    }
    if (req.path.startsWith("/api/")) {
      console.error(err);
      return res.status(500).json({ error: "Something went wrong on the server" });
    }
    next(err);
  });

  const clientRoot = path.resolve(__dirname, "sicp/client");
  const distPath = path.resolve(clientRoot, "dist");

  // Client Frontend Serving
  if (process.env.NODE_ENV !== "production") {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true, host: "0.0.0.0" },
        appType: "spa",
        root: clientRoot,
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.warn("Could not start Vite dev middleware, serving static:", e.message);
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  } else {
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Global fallback error handler
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Something went wrong on the server" });
  });

  const PORT = 3000;

  await connectDb();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SICP server listening on port ${PORT} (0.0.0.0)`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

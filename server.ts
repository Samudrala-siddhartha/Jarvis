import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import jarvisRouter from "./server/routes";
import { PORT } from "./server/config";

const app = express();

/**
 * Middleware: Core security and capability buffers
 */
app.use(express.json({ limit: "50mb" })); // Sufficient for high-res tactical imagery

/**
 * JARVIS Routing Intelligence
 */
app.use("/api/jarvis", jarvisRouter);

/**
 * Core Initialization Sequence
 * In dev: Injects Vite middleware for HMR-less elite processing
 * In prod: Serves optimized artifacts from dist/
 */
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\x1b[36m[JARVIS]\x1b[0m Core systems online at http://localhost:${PORT}`);
  });
}

startServer();


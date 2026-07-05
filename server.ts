import express from "express";
import path from "path";
import { promises as fs } from "fs";
import { createServer as createViteServer } from "vite";

const PORT = 3000;
const HOST = "0.0.0.0";
const REPORTS_FILE_PATH = path.join(process.cwd(), "reports.json");

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "50mb" }));

  // API Route: Get all ads and collections
  app.get("/api/reports", async (req, res) => {
    try {
      try {
        await fs.access(REPORTS_FILE_PATH);
        const data = await fs.readFile(REPORTS_FILE_PATH, "utf-8");
        return res.json(JSON.parse(data));
      } catch (err) {
        // If file does not exist, return empty lists so no data remains loaded
        return res.json({ ads: [], collections: [] });
      }
    } catch (error) {
      console.error("Error reading reports file:", error);
      res.status(500).json({ error: "Failed to read reports data" });
    }
  });

  // API Route: Save ads and collections
  app.post("/api/reports", async (req, res) => {
    try {
      const { ads, collections } = req.body;
      const payload = {
        ads: ads || [],
        collections: collections || [],
        updatedAt: new Date().toISOString()
      };
      await fs.writeFile(REPORTS_FILE_PATH, JSON.stringify(payload, null, 2), "utf-8");
      res.json({ success: true, message: "Reports saved successfully" });
    } catch (error) {
      console.error("Error saving reports file:", error);
      res.status(500).json({ error: "Failed to save reports data" });
    }
  });

  // Integration with Vite
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

  app.listen(PORT, HOST, () => {
    console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});

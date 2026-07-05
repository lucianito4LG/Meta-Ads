import express from "express";
import path from "path";
import { promises as fs } from "fs";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const PORT = 3000;
const HOST = "0.0.0.0";
const REPORTS_FILE_PATH = path.join(process.cwd(), "reports.json");

let db: any = null;

async function initFirebase() {
  try {
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    await fs.access(configPath);
    const configRaw = await fs.readFile(configPath, "utf-8");
    const config = JSON.parse(configRaw);
    
    const firebaseConfig = {
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      storageBucket: config.storageBucket,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId
    };
    
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app, config.firestoreDatabaseId);
    console.log("Firebase Firestore initialized successfully with database ID:", config.firestoreDatabaseId);
  } catch (err) {
    console.error("Firebase not initialized. Falling back to local file reports.json:", err);
  }
}

async function startServer() {
  await initFirebase();

  const app = express();
  app.use(express.json({ limit: "50mb" }));

  // API Route: Get all ads and collections
  app.get("/api/reports", async (req, res) => {
    try {
      // 1. Try reading from Firebase Firestore first if available
      if (db) {
        try {
          const docRef = doc(db, "reports", "data");
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("Loaded data from Firestore successfully.");
            return res.json({
              ads: data.ads || [],
              collections: data.collections || [],
              source: "firestore"
            });
          }
        } catch (firestoreErr) {
          console.error("Failed to fetch from Firestore, falling back to local file:", firestoreErr);
        }
      }

      // 2. Fallback to reports.json
      try {
        await fs.access(REPORTS_FILE_PATH);
        const data = await fs.readFile(REPORTS_FILE_PATH, "utf-8");
        const parsed = JSON.parse(data);
        return res.json({
          ads: parsed.ads || [],
          collections: parsed.collections || [],
          source: "file"
        });
      } catch (err) {
        // If file does not exist, return empty lists so no data remains loaded
        return res.json({ ads: [], collections: [], source: "none" });
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

      // 1. Try saving to Firebase Firestore if available
      let firestoreSaved = false;
      if (db) {
        try {
          const docRef = doc(db, "reports", "data");
          await setDoc(docRef, payload);
          console.log("Saved data to Firestore successfully.");
          firestoreSaved = true;
        } catch (firestoreErr) {
          console.error("Failed to save to Firestore:", firestoreErr);
        }
      }

      // 2. Also save to local reports.json as local cache/fallback
      await fs.writeFile(REPORTS_FILE_PATH, JSON.stringify(payload, null, 2), "utf-8");

      res.json({
        success: true,
        message: "Reports saved successfully",
        firestoreSaved
      });
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

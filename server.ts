import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Ensure data directory exists
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const STORAGE_FILE = path.join(DATA_DIR, "storage.json");

// Helper to load storage from disk on startup
let memoryStore: Record<string, any> = {};

function loadStorageOnStartup() {
  if (!fs.existsSync(STORAGE_FILE)) {
    memoryStore = {};
    return;
  }
  try {
    const data = fs.readFileSync(STORAGE_FILE, "utf-8");
    memoryStore = JSON.parse(data);
  } catch (err) {
    console.error("Error reading storage file on startup:", err);
    memoryStore = {};
  }
}

// Initial load on server boot-up
loadStorageOnStartup();

// Helper to write memoryStore to storage file safely
function writeStorage() {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(memoryStore, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing storage file:", err);
  }
}

// 1. API: Get all keys
app.get("/api/storage/all", (req, res) => {
  res.json(memoryStore);
});

// 2. API: Get specific key
app.get("/api/storage/get", (req, res) => {
  const { key } = req.query;
  if (!key || typeof key !== "string") {
    return res.status(400).json({ error: "Missing key parameter" });
  }
  res.json({ key, value: memoryStore[key] || null });
});

// 3. API: Set key value
app.post("/api/storage/set", (req, res) => {
  const { key, value } = req.body;
  if (!key || typeof key !== "string") {
    return res.status(400).json({ error: "Missing key or invalid format" });
  }
  memoryStore[key] = value;
  writeStorage();
  res.json({ success: true });
});

// 4. API: Remove key
app.post("/api/storage/remove", (req, res) => {
  const { key } = req.body;
  if (!key || typeof key !== "string") {
    return res.status(400).json({ error: "Missing key or invalid format" });
  }
  delete memoryStore[key];
  writeStorage();
  res.json({ success: true });
});

// Vite & Static Asset Handling
async function setupVite() {
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
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

setupVite().catch((error) => {
  console.error("Failed to start server:", error);
});

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

  if (key === 'linkfluence_users_roster') {
    // Prevent client overrides by merging rosters securely on the server
    let currentRoster: string[] = [];
    if (memoryStore['linkfluence_users_roster']) {
      try {
        const parsed = typeof memoryStore['linkfluence_users_roster'] === 'string'
          ? JSON.parse(memoryStore['linkfluence_users_roster'])
          : memoryStore['linkfluence_users_roster'];
        if (Array.isArray(parsed)) {
          currentRoster = parsed;
        }
      } catch (e) {}
    }

    let newRoster: string[] = [];
    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      if (Array.isArray(parsed)) {
        newRoster = parsed;
      }
    } catch (e) {}

    const mergedRoster = Array.from(new Set([...currentRoster, ...newRoster]));
    memoryStore[key] = JSON.stringify(mergedRoster);
  } else {
    memoryStore[key] = value;
  }

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

// --- CENTRALIZED BACKEND DB ENDPOINTS FOR USER REGISTRATION, RETRIEVAL & LISTING ---

// Endpoint A: User Registration
app.post("/api/users/register", (req, res) => {
  const { email, name, password, country, phone } = req.body;
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Email address is required." });
  }
  const normalizedEmail = email.trim().toLowerCase();

  const profileKey = `linkfluence_user_profile_${normalizedEmail}`;
  const dataKey = `linkfluence_user_data_${normalizedEmail}`;

  // Check if profile already exists in the central server memoryStore
  if (memoryStore[profileKey]) {
    return res.status(400).json({ error: "A user account with this email already exists." });
  }

  // Create Profile
  const profile = {
    name: name || normalizedEmail.split("@")[0],
    email: normalizedEmail,
    country: country || "United States",
    phone: phone || ""
  };
  memoryStore[profileKey] = JSON.stringify(profile);

  // Initialize central UserState
  const defaultData = {
    balance: 350.00, // Seed initial starting reward
    totalProfit: 12.50,
    totalWithdrawals: 0.00,
    totalInvestments: 300.00,
    activePlans: [
      {
        id: 'p1',
        name: 'Starter Plan',
        amount: 300.00,
        dailyYieldPercent: 1.5,
        accruedInterest: 12.50,
        daysActive: 3,
        totalDays: 30,
        dateStarted: new Date().toISOString().substring(0, 10)
      }
    ],
    kyc: { 
      status: 'Approved', 
      fullName: (name || normalizedEmail.split("@")[0]).toUpperCase(), 
      documentType: 'National ID Card', 
      documentNumber: 'ID-' + Math.floor(100000 + Math.random() * 900000), 
      country: country || 'United States' 
    },
    transactions: [
      {
        id: 'TXN-' + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        type: 'deposit',
        amount: 300.00,
        status: 'Approved',
        methodOrPlan: 'USDT (TRC20)',
        destinationOrDetail: 'TLeS3Z9rXv89...oWk2bX',
        reference: 'TX-' + Math.floor(100000 + Math.random() * 900000)
      }
    ]
  };
  memoryStore[dataKey] = JSON.stringify(defaultData);

  // Safely update and merge the central roster index
  let roster: string[] = [];
  if (memoryStore["linkfluence_users_roster"]) {
    try {
      const parsed = typeof memoryStore["linkfluence_users_roster"] === 'string'
        ? JSON.parse(memoryStore["linkfluence_users_roster"])
        : memoryStore["linkfluence_users_roster"];
      if (Array.isArray(parsed)) {
        roster = parsed;
      }
    } catch (e) {}
  }
  if (!roster.includes(normalizedEmail)) {
    roster.push(normalizedEmail);
    memoryStore["linkfluence_users_roster"] = JSON.stringify(roster);
  }

  writeStorage();
  res.json({ success: true, profile, data: defaultData });
});

// Endpoint B: Specific User Profile & Local State Retrieval
app.get("/api/users/profile/:email", (req, res) => {
  const email = req.params.email.trim().toLowerCase();
  const profileKey = `linkfluence_user_profile_${email}`;
  const dataKey = `linkfluence_user_data_${email}`;

  if (!memoryStore[profileKey]) {
    return res.status(404).json({ error: "User profile not found in centralized datastore." });
  }

  let profile = {};
  let data = {};
  try {
    profile = typeof memoryStore[profileKey] === "string" ? JSON.parse(memoryStore[profileKey]) : memoryStore[profileKey];
  } catch (e) {
    profile = memoryStore[profileKey] || {};
  }
  try {
    data = memoryStore[dataKey] 
      ? (typeof memoryStore[dataKey] === "string" ? JSON.parse(memoryStore[dataKey]) : memoryStore[dataKey]) 
      : {};
  } catch (e) {
    data = memoryStore[dataKey] || {};
  }

  res.json({ email, profile, data });
});

// Endpoint C: Admin Authorized Global User list compilation
app.get("/api/users/list", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== "Bearer Lamba1###") {
    return res.status(401).json({ error: "Access Denied. Only system administrators can query the global user listing." });
  }

  // Compile active master roster list
  let roster: string[] = [];
  if (memoryStore["linkfluence_users_roster"]) {
    try {
      const parsed = typeof memoryStore["linkfluence_users_roster"] === 'string'
        ? JSON.parse(memoryStore["linkfluence_users_roster"])
        : memoryStore["linkfluence_users_roster"];
      if (Array.isArray(parsed)) {
        roster = parsed;
      }
    } catch (e) {}
  }

  // Scan profile keys for extra consistency
  const activeScanned = new Set<string>();
  Object.keys(memoryStore).forEach(key => {
    if (key.startsWith("linkfluence_user_profile_")) {
      const email = key.substring("linkfluence_user_profile_".length);
      if (email) activeScanned.add(email.trim().toLowerCase());
    }
  });
  roster.forEach(email => activeScanned.add(email.trim().toLowerCase()));

  const compiledUsersList = Array.from(activeScanned).map(email => {
    const profileKey = `linkfluence_user_profile_${email}`;
    const dataKey = `linkfluence_user_data_${email}`;

    let profile = { name: email.split("@")[0], email, country: "United States", phone: "" };
    if (memoryStore[profileKey]) {
      try {
        const parsed = typeof memoryStore[profileKey] === "string" ? JSON.parse(memoryStore[profileKey]) : memoryStore[profileKey];
        profile = { ...profile, ...parsed };
      } catch (e) {}
    }

    let userData = {
      balance: 0.00,
      totalProfit: 0.00,
      totalWithdrawals: 0.00,
      totalInvestments: 0.00,
      activePlans: [],
      kyc: { status: 'Unregistered', fullName: '', documentType: '', documentNumber: '', country: '' },
      transactions: []
    };
    if (memoryStore[dataKey]) {
      try {
        const parsed = typeof memoryStore[dataKey] === "string" ? JSON.parse(memoryStore[dataKey]) : memoryStore[dataKey];
        userData = { ...userData, ...parsed };
      } catch (e) {}
    }

    return { ...profile, ...userData };
  });

  res.json({ users: compiledUsersList });
});

// Endpoint D: User Management Update Actions
app.post("/api/users/update", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== "Bearer Lamba1###") {
    return res.status(401).json({ error: "Access Denied. Admin authentication is mandatory." });
  }

  const { email, updatedProfile, updatedData } = req.body;
  if (!email) {
    return res.status(400).json({ error: "User email ID is required." });
  }
  const normalizedEmail = email.trim().toLowerCase();

  if (updatedProfile) {
    memoryStore[`linkfluence_user_profile_${normalizedEmail}`] = typeof updatedProfile === 'string'
      ? updatedProfile
      : JSON.stringify(updatedProfile);
  }
  if (updatedData) {
    memoryStore[`linkfluence_user_data_${normalizedEmail}`] = typeof updatedData === 'string'
      ? updatedData
      : JSON.stringify(updatedData);
  }

  // Ensure user is present inside central roster
  let roster: string[] = [];
  if (memoryStore["linkfluence_users_roster"]) {
    try {
      const parsed = typeof memoryStore["linkfluence_users_roster"] === 'string'
        ? JSON.parse(memoryStore["linkfluence_users_roster"])
        : memoryStore["linkfluence_users_roster"];
      if (Array.isArray(parsed)) {
        roster = parsed;
      }
    } catch (e) {}
  }
  if (!roster.includes(normalizedEmail)) {
    roster.push(normalizedEmail);
    memoryStore["linkfluence_users_roster"] = JSON.stringify(roster);
  }

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

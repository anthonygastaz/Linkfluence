import 'dotenv/config';
import express from "express";
import path from "path";
import { createKycSignedUrl } from "./lib/kycSignedUrlHandler";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "50mb" }));

app.post("/api/admin/kyc-signed-url", async (req, res) => {
  const result = await createKycSignedUrl(req.body);
  res.status(result.status).json(result.body);
});

// Vite & Static Asset Handling
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      configFile: false,
      root: process.cwd(),
      appType: "spa",
      plugins: [react(), tailwindcss()],
      resolve: {
        alias: {
          "@": process.cwd(),
        },
      },
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== "true",
        watch: process.env.DISABLE_HMR === "true" ? null : {},
      },
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

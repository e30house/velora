import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import path from "node:path";
import express, { type Request, type Response } from "express";
import cors from "cors";
import { askClaude } from "./claude.js";
import { buildFallbackAnswer } from "./fallback.js";
import { accountRoutes } from "./accountRoutes.js";
import type { AskVeloraRequest } from "./types.js";

// Load server/.env by absolute path rather than relying on process.cwd(),
// since this file may be launched from the repo root (npm workspaces,
// task runners) rather than from inside server/.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = Number(process.env.PORT ?? 8787);
const HAS_API_KEY = Boolean(process.env.ANTHROPIC_API_KEY);
const HAS_ACCOUNTS = Boolean(process.env.DATABASE_URL && process.env.JWT_SECRET);

app.use(cors());
app.use(express.json());
app.use("/api", accountRoutes);

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, aiMode: HAS_API_KEY ? "claude" : "fallback", accounts: HAS_ACCOUNTS });
});

app.post("/api/ask-velora", async (req: Request, res: Response) => {
  const body = req.body as Partial<AskVeloraRequest>;

  if (!body.prompt || !body.destination || !body.vehicle) {
    res.status(400).json({ error: "Missing required fields: prompt, destination, vehicle" });
    return;
  }

  const request: AskVeloraRequest = {
    prompt: body.prompt,
    destination: body.destination,
    vehicle: body.vehicle,
    prefs: body.prefs ?? { avoidTolls: false, parkingFirst: false },
    trafficEvent: body.trafficEvent ?? null,
    tripMemory: body.tripMemory ?? null,
    activePlan: body.activePlan ?? null,
    unitPref: body.unitPref ?? "mi",
  };

  if (!HAS_API_KEY) {
    res.json(buildFallbackAnswer(request));
    return;
  }

  try {
    const answer = await askClaude(request);
    res.json(answer);
  } catch (err) {
    console.error("Claude call failed, falling back to rule-based answer:", err);
    res.json(buildFallbackAnswer(request));
  }
});

app.listen(PORT, () => {
  console.log(`Velora API listening on http://localhost:${PORT}`);
  console.log(`AI mode: ${HAS_API_KEY ? "Claude (ANTHROPIC_API_KEY found)" : "fallback (no ANTHROPIC_API_KEY set)"}`);
  console.log(`Accounts: ${HAS_ACCOUNTS ? "enabled" : "disabled (set DATABASE_URL and JWT_SECRET to enable)"}`);
});

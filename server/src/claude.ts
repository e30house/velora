import Anthropic from "@anthropic-ai/sdk";
import type { AskVeloraRequest, AskVeloraResponse, VeloraAction, Confidence } from "./types.js";

const MODEL = "claude-sonnet-5";

const VALID_ACTIONS: VeloraAction[] = ["parking", "scenic", "date", "airport", "garage", "score", "route"];
const VALID_CONFIDENCE: Confidence[] = ["High", "Medium"];

const SYSTEM_PROMPT = `You are Velora, a contextual AI driving companion embedded in a navigation app.
You are not a general chatbot: every answer must be grounded in the live trip context you're given
(destination, vehicle, traffic, preferences, memory, active multi-stop plan) — never invent places,
distances, or facts that aren't in that context.

Style:
- 1-3 sentences, spoken like a calm co-pilot, not a search engine.
- Be concrete: reference the actual destination name, vehicle name, or traffic event you were given.
- If the user's question can't be answered from the given context, say what you'd need instead of making it up.

You must respond by calling the velora_answer tool with:
- title: a short (2-5 word) headline for the answer
- text: the actual spoken answer, 1-3 sentences
- confidence: "High" if the route/zone/parking facts are known and stable, "Medium" if traffic or parking is uncertain
- action: the single UI action this answer maps to, from the fixed set (parking, scenic, date, airport, garage, score, route) — pick "route" if none of the others clearly fit
- actionLabel: a short (2-4 word) button label for that action, e.g. "Use parking-first"`;

const ANSWER_TOOL = {
  name: "velora_answer",
  description: "Structured answer for the Velora driving companion UI.",
  input_schema: {
    type: "object" as const,
    properties: {
      title: { type: "string" as const },
      text: { type: "string" as const },
      confidence: { type: "string" as const, enum: VALID_CONFIDENCE },
      action: { type: "string" as const, enum: VALID_ACTIONS },
      actionLabel: { type: "string" as const },
    },
    required: ["title", "text", "confidence", "action", "actionLabel"],
  },
};

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

export async function askClaude(req: AskVeloraRequest): Promise<AskVeloraResponse> {
  const anthropic = getClient();

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 500,
    system: SYSTEM_PROMPT,
    tools: [ANSWER_TOOL],
    tool_choice: { type: "tool", name: "velora_answer" },
    messages: [
      {
        role: "user",
        content: `Driver's question: "${req.prompt}"\n\nLive trip context (JSON):\n${JSON.stringify(
          {
            destination: req.destination,
            vehicle: req.vehicle,
            routePreferences: req.prefs,
            currentTrafficEvent: req.trafficEvent,
            rememberedPreference: req.tripMemory,
            activeMultiStopPlan: req.activePlan,
            distanceUnit: req.unitPref,
          },
          null,
          2
        )}`,
      },
    ],
  });

  const toolUse = message.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not return a structured velora_answer response");
  }

  const input = toolUse.input as Record<string, unknown>;
  const action = VALID_ACTIONS.includes(input.action as VeloraAction) ? (input.action as VeloraAction) : "route";
  const confidence = VALID_CONFIDENCE.includes(input.confidence as Confidence) ? (input.confidence as Confidence) : "High";

  return {
    title: String(input.title ?? "Velora"),
    text: String(input.text ?? ""),
    confidence,
    action,
    actionLabel: String(input.actionLabel ?? "Continue"),
    source: "claude",
  };
}

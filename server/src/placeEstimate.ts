import Anthropic from "@anthropic-ai/sdk";
import type { EstimatePlaceRequest, EstimatePlaceResponse } from "./types.js";

const MODEL = "claude-sonnet-5";

const PARKING_VALUES = ["Easy", "Moderate", "Difficult"] as const;

const ESTIMATE_TOOL = {
  name: "place_estimate",
  description: "A plausible, clearly-estimated set of driving-relevant facts about a real place.",
  input_schema: {
    type: "object" as const,
    properties: {
      parking: { type: "string" as const, enum: PARKING_VALUES },
      parkingDetail: { type: "string" as const, description: "One short sentence, e.g. 'Street parking is common nearby.'" },
      cost: { type: "number" as const, description: "Rough estimated visit cost in whole local-currency units (use USD-equivalent if unsure), 0 if free/not applicable" },
      zoneRestricted: { type: "boolean" as const, description: "True if this area plausibly has a low-emission/restricted-access zone (dense historic city centers often do; suburbs/highways usually don't)" },
      note: { type: "string" as const, description: "One short, useful sentence about arriving/driving here." },
    },
    required: ["parking", "parkingDetail", "cost", "zoneRestricted", "note"],
  },
};

const SYSTEM_PROMPT = `You estimate plausible, driving-relevant facts about a real-world place for Velora, a driving companion app.
You do not have live data — give a reasonable, honest estimate based on the place's name, address, and category,
the way a knowledgeable local would guess. Keep it grounded and modest; don't invent specific facts you couldn't
plausibly infer (exact space counts, exact prices). You must respond by calling the place_estimate tool.`;

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

export function buildFallbackEstimate(req: EstimatePlaceRequest): EstimatePlaceResponse {
  const category = (req.category ?? "").toLowerCase();

  if (category.includes("airport")) {
    return { parking: "Easy", parkingDetail: "Large paid parking structures are typical at airports.", cost: 15, zoneRestricted: false, note: "Build in extra time for terminal traffic.", type: "Airport", source: "fallback" };
  }
  if (category.includes("restaurant") || category.includes("cafe") || category.includes("coffee") || category.includes("bar")) {
    return { parking: "Moderate", parkingDetail: "Street parking or a nearby garage is likely.", cost: 10, zoneRestricted: false, note: "Parking may be tighter during peak meal hours.", type: "Restaurant", source: "fallback" };
  }
  if (category.includes("park") || category.includes("outdoor")) {
    return { parking: "Moderate", parkingDetail: "Look for a nearby lot or street parking.", cost: 0, zoneRestricted: false, note: "A pleasant stop if you don't mind a short walk in.", type: "Park", source: "fallback" };
  }

  return { parking: "Moderate", parkingDetail: "Parking conditions are estimated — check on arrival.", cost: 5, zoneRestricted: false, note: "Velora doesn't have live data for this specific place yet.", type: "Place", source: "fallback" };
}

export async function estimateWithClaude(req: EstimatePlaceRequest): Promise<EstimatePlaceResponse> {
  const anthropic = getClient();

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 400,
    system: SYSTEM_PROMPT,
    tools: [ESTIMATE_TOOL],
    tool_choice: { type: "tool", name: "place_estimate" },
    messages: [
      {
        role: "user",
        content: `Place: ${req.name}\nAddress: ${req.address}\nCategory: ${req.category ?? "unknown"}\nCoordinates: ${req.lat}, ${req.lng}`,
      },
    ],
  });

  const toolUse = message.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not return a structured place_estimate response");
  }

  const input = toolUse.input as Record<string, unknown>;
  const parking = PARKING_VALUES.includes(input.parking as (typeof PARKING_VALUES)[number]) ? (input.parking as (typeof PARKING_VALUES)[number]) : "Moderate";

  return {
    parking,
    parkingDetail: String(input.parkingDetail ?? "Parking conditions are estimated."),
    cost: Number.isFinite(input.cost) ? Number(input.cost) : 0,
    zoneRestricted: Boolean(input.zoneRestricted),
    note: String(input.note ?? ""),
    type: req.category ?? "Place",
    source: "claude",
  };
}

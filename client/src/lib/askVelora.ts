import { API_BASE } from "./apiBase";
import type { Destination, Plan, RoutePrefs, TrafficEvent, TripMemory, UnitPref, Vehicle } from "../types";

export type VeloraAction = "parking" | "scenic" | "date" | "airport" | "garage" | "score" | "route";

export interface AskVeloraAnswer {
  title: string;
  text: string;
  confidence: "High" | "Medium";
  action: VeloraAction;
  actionLabel: string;
  source: "claude" | "fallback";
}

export interface AskVeloraArgs {
  prompt: string;
  destination: Destination;
  vehicle: Vehicle;
  prefs: RoutePrefs;
  trafficEvent: TrafficEvent | null;
  tripMemory: TripMemory | null;
  activePlan: Plan | null;
  unitPref: UnitPref;
}

// The one call that used to be a local keyword-matching function
// (buildVeloraAnswer) is now a real request to the Velora API, which calls
// Claude server-side (API key never touches the browser) and falls back to
// the old rule-based logic if no key is configured yet.
export async function askVelora(args: AskVeloraArgs): Promise<AskVeloraAnswer> {
  const response = await fetch(`${API_BASE}/api/ask-velora`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: args.prompt,
      destination: {
        name: args.destination.name,
        type: args.destination.type,
        area: args.destination.area,
        eta: args.destination.eta,
        cost: args.destination.cost,
        parking: args.destination.parking,
        parkingDetail: args.destination.parkingDetail,
        note: args.destination.note,
        zoneRestricted: args.destination.zoneRestricted,
      },
      vehicle: {
        name: args.vehicle.name,
        type: args.vehicle.type,
        level: args.vehicle.level,
        range: args.vehicle.range,
        compliance: args.vehicle.compliance,
      },
      prefs: args.prefs,
      trafficEvent: args.trafficEvent ? { name: args.trafficEvent.name, detail: args.trafficEvent.detail, impact: args.trafficEvent.impact } : null,
      tripMemory: args.tripMemory ? { title: args.tripMemory.title, detail: args.tripMemory.detail } : null,
      activePlan: args.activePlan ? { title: args.activePlan.title, stops: args.activePlan.stops } : null,
      unitPref: args.unitPref,
    }),
  });

  if (!response.ok) {
    throw new Error(`Velora API error: ${response.status}`);
  }

  return (await response.json()) as AskVeloraAnswer;
}

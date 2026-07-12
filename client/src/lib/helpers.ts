import { Battery, Fuel } from "lucide-react";
import { destinations } from "../data/destinations";
import { friends } from "../data/social";
import type {
  AiDecision,
  ColorKey,
  Destination,
  DrivingMode,
  Friend,
  Plan,
  RoutePrefs,
  ThemeTokens,
  TrafficEvent,
  TripMemory,
  UnitPref,
  Vehicle,
} from "../types";

export function color(t: ThemeTokens, key: ColorKey): string {
  return t[key] || t.blue;
}

export function findDestination(name: string): Destination {
  const found = destinations.find((d) => d.name === name);
  if (found) return found;
  const fallback = destinations[0];
  if (!fallback) throw new Error("destinations list is empty");
  return fallback;
}

export function findFriend(id: string): Friend {
  const found = friends.find((f) => f.id === id);
  if (found) return found;
  const fallback = friends[0];
  if (!fallback) throw new Error("friends list is empty");
  return fallback;
}

export function canEnter(vehicle: Vehicle, destination: Destination): boolean {
  if (!destination.zoneRestricted) return true;
  return vehicle.compliance === "compliant";
}

// baseEtaMinutes defaults to the destination's mock estimate, but callers
// with a real routed duration (from Mapbox) should pass that instead —
// the mode/prefs/traffic adjustments layer on top either way.
export function getEta(destination: Destination, mode: DrivingMode, prefs: RoutePrefs, traffic: TrafficEvent | null, baseEtaMinutes: number = destination.eta): number {
  let extra = 0;
  if (mode === "Eco") extra += 2;
  if (mode === "Scenic") extra += 5;
  if (prefs.avoidTolls) extra += 3;
  if (prefs.parkingFirst && destination.parking !== "Easy") extra += 2;
  if (traffic) extra += 3;
  return baseEtaMinutes + extra;
}

export function planStats(stops: string[]): { eta: number; cost: number; hardParking: boolean } {
  const places = stops.map(findDestination);
  return {
    eta: places.reduce((sum, p) => sum + p.eta, 0),
    cost: places.reduce((sum, p) => sum + p.cost, 0),
    hardParking: places.some((p) => p.parking === "Difficult"),
  };
}

interface BuildAIDecisionArgs {
  destination: Destination;
  vehicle: Vehicle;
  mode: DrivingMode;
  prefs: RoutePrefs;
  trafficEvent: TrafficEvent | null;
  chosenStop: { name: string } | null;
  activePlan: Plan | null;
  tripMemory: TripMemory | null;
}

export function buildAIDecision({
  destination,
  vehicle,
  mode,
  prefs,
  trafficEvent,
  chosenStop,
  activePlan,
  tripMemory,
}: BuildAIDecisionArgs): AiDecision {
  const allowed = canEnter(vehicle, destination);
  const parkingScore = destination.parking === "Easy" ? 96 : destination.parking === "Moderate" ? 78 : prefs.parkingFirst ? 74 : 52;
  const trafficScore = trafficEvent ? 64 : mode === "Scenic" ? 91 : 84;
  const timeScore = mode === "Express" ? 92 : mode === "Eco" ? 84 : 76;
  const safetyScore = trafficEvent ? 76 : mode === "Scenic" ? 94 : 88;
  const stressScore = prefs.parkingFirst || destination.parking === "Easy" ? 93 : destination.parking === "Moderate" ? 81 : 61;
  const costScore = mode === "Eco" ? 92 : destination.cost <= 7 ? 89 : destination.cost <= 15 ? 78 : 63;
  const zoneScore = allowed ? 100 : 42;

  const score = Math.round(
    timeScore * 0.18 +
      trafficScore * 0.17 +
      parkingScore * 0.18 +
      safetyScore * 0.15 +
      stressScore * 0.16 +
      costScore * 0.08 +
      zoneScore * 0.08
  );

  const confidence: "High" | "Medium" = trafficEvent ? "Medium" : !allowed ? "High" : destination.parking === "Difficult" ? "Medium" : "High";
  const confidenceReason = trafficEvent
    ? "Traffic is changing quickly, so Velora is watching for a better moment to reroute."
    : !allowed
      ? "Zone restriction logic is clear, so Velora will route to parking before entry."
      : destination.parking === "Difficult"
        ? "Parking is estimated, so Velora suggests garage-first routing."
        : "Route, parking, and vehicle checks agree.";

  const reasons: string[] = [
    prefs.parkingFirst || destination.parking === "Difficult"
      ? "Parking is handled before arrival so you are not circling at the end."
      : "Parking looks manageable near the destination.",
    trafficEvent
      ? `${trafficEvent.name} lowers the traffic score, so Velora keeps the instructions calmer and earlier.`
      : "Traffic risk is low enough to keep the route direct.",
    allowed
      ? `${vehicle.name} passes the zone check for this destination.`
      : `${vehicle.name} may be restricted, so Velora avoids entering the zone.`,
    mode === "Scenic"
      ? "Scenic mode improves stress and safety, even if it adds a few minutes."
      : mode === "Eco"
        ? "Eco mode protects range and cost by avoiding unnecessary stop-start roads."
        : "Express mode keeps the fastest clear route.",
  ];

  if (chosenStop) reasons.push(`${chosenStop.name} is already added, so Velora adjusts the route around that stop.`);
  if (activePlan) reasons.push(`Your active plan, ${activePlan.title}, is being protected as a full journey, not just one destination.`);
  if (tripMemory) reasons.push(`Velora remembers you prefer ${tripMemory.title.toLowerCase()}, so that preference affects the recommendation.`);

  return {
    score,
    confidence,
    confidenceReason,
    metrics: [
      { label: "Time", value: timeScore },
      { label: "Traffic", value: trafficScore },
      { label: "Parking", value: parkingScore },
      { label: "Safety", value: safetyScore },
      { label: "Stress", value: stressScore },
      { label: "Cost", value: costScore },
      { label: "Zone", value: zoneScore },
    ],
    reasons,
  };
}

export function rangeMiles(vehicle: Vehicle): number {
  if (typeof vehicle.rangeMi === "number") return vehicle.rangeMi;
  const parsed = Number.parseFloat(String(vehicle.range || "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatRange(vehicle: Vehicle, unitPref: UnitPref): string {
  const miles = rangeMiles(vehicle);
  if (!miles) return vehicle.range || "Range not set";
  if (unitPref === "km") return `${Math.round(miles * 1.609)} km`;
  return `${Math.round(miles)} mi`;
}

export function turnDistance(unitPref: UnitPref): string {
  return unitPref === "km" ? "60 m" : "200 ft";
}

export function makeVehicleId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return `vehicle-${crypto.randomUUID()}`;
  return `vehicle-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface MakeVehicleArgs {
  name: string;
  year: string;
  type: "Electric" | "Gas";
  rangeMi: string;
  level: string;
}

export function makeVehicle({ name, year, type, rangeMi, level }: MakeVehicleArgs): Vehicle {
  const electric = type === "Electric";
  const numericRange = Number(rangeMi) || (electric ? 280 : 340);
  return {
    id: makeVehicleId(),
    name: name.trim() || "New vehicle",
    year: year.trim() || "2024",
    type,
    level: level.trim() || (electric ? "80%" : "55%"),
    range: `${numericRange} mi`,
    rangeMi: numericRange,
    compliance: electric ? "compliant" : "limited",
    zoneLabel: electric ? "Zone compliant" : "Check zone",
    note: electric ? "Can enter most low-emission zones." : "May be restricted in central low-emission zones.",
    color: electric ? "green" : "gold",
    Icon: electric ? Battery : Fuel,
  };
}

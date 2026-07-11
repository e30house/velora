import { AlertTriangle, Building2, Coffee, Fuel, Mountain, ShieldCheck, TrafficCone, Wrench } from "lucide-react";
import type { NearbyStop, TrafficEvent } from "../types";

export const nearbyStops: NearbyStop[] = [
  { name: "Quick Coffee Stop", type: "Coffee", etaAdd: "+4 min", detail: "On your route · easy pull-in", color: "gold", Icon: Coffee },
  { name: "Garage B12", type: "Parking", etaAdd: "+2 min", detail: "78 spaces likely · safer than street parking", color: "green", Icon: Building2 },
  { name: "Low-cost Fuel", type: "Fuel", etaAdd: "+6 min", detail: "Usually cheaper outside the center", color: "gold", Icon: Fuel },
  { name: "Quiet Scenic Pull-off", type: "Scenic", etaAdd: "+5 min", detail: "Calmer road · better arrival", color: "blue", Icon: Mountain },
];

export const trafficEvents: TrafficEvent[] = [
  { name: "Accident ahead", detail: "Right lane blocked near the next merge.", impact: "+7 min", color: "red", Icon: AlertTriangle },
  { name: "Roadwork", detail: "Temporary daytime works near Centro.", impact: "+5 min", color: "gold", Icon: Wrench },
  { name: "Heavy congestion", detail: "Traffic building faster than usual.", impact: "+9 min", color: "red", Icon: TrafficCone },
  { name: "Police checkpoint", detail: "Reports from nearby drivers.", impact: "+3 min", color: "blue", Icon: ShieldCheck },
];

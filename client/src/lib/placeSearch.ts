import { Building2, Coffee, Heart, Mountain, Plane, MapPin } from "lucide-react";
import { estimatePlace } from "./placeEstimate";
import type { GeocodedPlace } from "./geocoding";
import type { ColorKey, Destination, IconType } from "../types";

function iconForCategory(category: string | null): { Icon: IconType; color: ColorKey } {
  const c = (category ?? "").toLowerCase();
  if (c.includes("airport")) return { Icon: Plane, color: "blue" };
  if (c.includes("coffee") || c.includes("cafe")) return { Icon: Coffee, color: "gold" };
  if (c.includes("restaurant") || c.includes("bar") || c.includes("food")) return { Icon: Heart, color: "red" };
  if (c.includes("park") || c.includes("outdoor")) return { Icon: Mountain, color: "green" };
  if (c.includes("parking") || c.includes("garage")) return { Icon: Building2, color: "green" };
  return { Icon: MapPin, color: "purple" };
}

// Rough straight-line estimate for the brief moment before the real Mapbox
// route (fetched once this destination is opened) replaces it.
function roughEtaMinutes(from: [number, number], to: [number, number]): number {
  const R = 6371;
  const [lng1, lat1] = from;
  const [lng2, lat2] = to;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  const distanceKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const avgSpeedKmh = 35;
  return Math.max(1, Math.round((distanceKm / avgSpeedKmh) * 60));
}

function areaFromAddress(address: string): string {
  const parts = address.split(",").map((p) => p.trim());
  return parts.length > 1 ? parts[1]! : address;
}

// Turns a real, arbitrary Mapbox search result into a full Destination —
// the same shape the curated demo places use — so it flows through the
// existing DestinationSheet/JourneyScreen/AI-scoring UI unchanged.
export async function buildDestinationFromSearch(place: GeocodedPlace, origin: [number, number]): Promise<Destination> {
  const estimate = await estimatePlace(place);
  const { Icon, color } = iconForCategory(place.category);

  return {
    name: place.name,
    type: estimate.type,
    area: areaFromAddress(place.address),
    eta: roughEtaMinutes(origin, place.coords),
    cost: estimate.cost,
    parking: estimate.parking,
    parkingDetail: estimate.parkingDetail,
    note: estimate.note,
    zoneRestricted: estimate.zoneRestricted,
    color,
    Icon,
    coords: place.coords,
  };
}

import { API_BASE } from "./apiBase";
import type { GeocodedPlace } from "./geocoding";

export interface PlaceEstimate {
  parking: "Easy" | "Moderate" | "Difficult";
  parkingDetail: string;
  cost: number;
  zoneRestricted: boolean;
  note: string;
  type: string;
  source: "claude" | "fallback";
}

// Real searched places don't come with known parking/cost/zone facts the
// way the curated demo destinations do, so Velora estimates them — via
// Claude when configured, or a category-based heuristic otherwise.
export async function estimatePlace(place: GeocodedPlace): Promise<PlaceEstimate> {
  const response = await fetch(`${API_BASE}/api/estimate-place`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: place.name,
      address: place.address,
      category: place.category,
      lat: place.coords[1],
      lng: place.coords[0],
    }),
  });
  if (!response.ok) throw new Error(`Place estimate failed: ${response.status}`);
  return (await response.json()) as PlaceEstimate;
}

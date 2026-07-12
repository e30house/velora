export interface RouteStep {
  instruction: string;
  distanceMeters: number;
}

export interface RouteResult {
  durationMinutes: number;
  distanceMeters: number;
  steps: RouteStep[];
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

export function hasMapboxToken(): boolean {
  return Boolean(MAPBOX_TOKEN);
}

export function formatStepDistance(meters: number, unitPref: "mi" | "km"): string {
  if (unitPref === "km") return `${Math.round(meters)} m`;
  return `${Math.round(meters * 3.28084)} ft`;
}

export function formatRouteDistance(meters: number, unitPref: "mi" | "km"): string {
  if (unitPref === "km") return `${(meters / 1000).toFixed(1)} km`;
  return `${(meters / 1609.34).toFixed(1)} mi`;
}

// Public Mapbox tokens are designed to be used client-side (restrict them to
// your domain in the Mapbox dashboard) — unlike the Anthropic key, this one
// doesn't need a server proxy. Uses the traffic-aware driving profile so the
// duration reflects real live conditions, matching Velora's "traffic-aware"
// framing rather than just static distance/speed math.
export async function fetchRoute(origin: [number, number], destination: [number, number]): Promise<RouteResult> {
  if (!MAPBOX_TOKEN) throw new Error("VITE_MAPBOX_TOKEN is not configured");

  const coords = `${origin[0]},${origin[1]};${destination[0]},${destination[1]}`;
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${coords}?steps=true&geometries=geojson&overview=false&access_token=${MAPBOX_TOKEN}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Mapbox Directions request failed: ${response.status}`);
  }

  const data = await response.json();
  const route = data.routes?.[0];
  if (!route) throw new Error("Mapbox returned no route");

  const steps: RouteStep[] = (route.legs?.[0]?.steps ?? []).map((step: { maneuver?: { instruction?: string }; distance?: number }) => ({
    instruction: step.maneuver?.instruction ?? "Continue on route",
    distanceMeters: step.distance ?? 0,
  }));

  return {
    durationMinutes: Math.round(route.duration / 60),
    distanceMeters: route.distance,
    steps,
  };
}

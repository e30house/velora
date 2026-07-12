const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

export interface GeocodedPlace {
  name: string;
  address: string;
  category: string | null;
  coords: [number, number];
}

interface MapboxFeature {
  text?: string;
  place_name?: string;
  center?: [number, number];
  place_type?: string[];
  properties?: { category?: string };
}

// Real place search, anywhere in the world — replaces picking from a fixed
// list of curated demo destinations. Biases results toward `proximity`
// (the driver's real or fallback location) when provided.
export async function searchPlaces(query: string, proximity?: [number, number]): Promise<GeocodedPlace[]> {
  if (!MAPBOX_TOKEN || !query.trim()) return [];

  const params = new URLSearchParams({ access_token: MAPBOX_TOKEN, autocomplete: "true", limit: "6" });
  if (proximity) params.set("proximity", `${proximity[0]},${proximity[1]}`);

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Mapbox geocoding failed: ${response.status}`);

  const data = (await response.json()) as { features?: MapboxFeature[] };
  return (data.features ?? [])
    .filter((f): f is MapboxFeature & { center: [number, number] } => Array.isArray(f.center))
    .map((f) => ({
      name: f.text || f.place_name || query,
      address: f.place_name || f.text || query,
      category: f.properties?.category ?? f.place_type?.[0] ?? null,
      coords: f.center,
    }));
}

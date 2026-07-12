const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

export interface GeocodedPlace {
  name: string;
  address: string;
  category: string | null;
  coords: [number, number];
}

interface SearchBoxFeature {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string;
    full_address?: string;
    place_formatted?: string;
    poi_category_ids?: string[];
  };
}

// Real place search, anywhere in the world — replaces picking from a fixed
// list of curated demo destinations. Uses Mapbox's Search Box API (not the
// older /geocoding/v5 endpoint, which has weak landmark/POI coverage — e.g.
// "Empire State Building" resolves to the wrong country without it) and
// biases results toward `proximity` (the driver's real or fallback location).
export async function searchPlaces(query: string, proximity?: [number, number]): Promise<GeocodedPlace[]> {
  if (!MAPBOX_TOKEN || !query.trim()) return [];

  // Note: /forward is the one-shot geocode endpoint and does not accept
  // session_token (that param is only for the /suggest + /retrieve
  // autocomplete pair) — sending it causes a 400.
  const params = new URLSearchParams({ access_token: MAPBOX_TOKEN, q: query, limit: "6" });
  if (proximity) params.set("proximity", `${proximity[0]},${proximity[1]}`);

  const url = `https://api.mapbox.com/search/searchbox/v1/forward?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Mapbox search failed: ${response.status}`);

  const data = (await response.json()) as { features?: SearchBoxFeature[] };
  return (data.features ?? []).map((f) => ({
    name: f.properties.name || query,
    address: f.properties.full_address || f.properties.place_formatted || f.properties.name || query,
    category: f.properties.poi_category_ids?.[0] ?? null,
    coords: f.geometry.coordinates,
  }));
}

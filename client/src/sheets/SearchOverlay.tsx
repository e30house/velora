import { useEffect, useState } from "react";
import { Search, Star, User } from "lucide-react";
import { destinations } from "../data/destinations";
import { friends } from "../data/social";
import { color, findDestination } from "../lib/helpers";
import { searchPlaces, type GeocodedPlace } from "../lib/geocoding";
import { buildDestinationFromSearch } from "../lib/placeSearch";
import { hasMapboxToken } from "../lib/mapbox";
import { ListButton, SectionLabel, Sheet } from "../components/ui";
import type { Destination, Friend, ThemeTokens } from "../types";

export function SearchOverlay({
  t,
  close,
  selectDestination,
  openFriend,
  savedPlaces = [],
  origin,
}: {
  t: ThemeTokens;
  close: () => void;
  selectDestination: (destination: Destination) => void;
  openFriend: (friend: Friend) => void;
  savedPlaces?: string[];
  origin: [number, number];
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodedPlace[]>([]);
  const [searching, setSearching] = useState(false);
  const [buildingPlace, setBuildingPlace] = useState<string | null>(null);
  const searchEnabled = hasMapboxToken();

  useEffect(() => {
    if (!searchEnabled || !query.trim()) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const timer = window.setTimeout(() => {
      searchPlaces(query, origin)
        .then((found) => {
          if (!cancelled) setResults(found);
        })
        .catch((err) => console.error("Place search failed:", err))
        .finally(() => {
          if (!cancelled) setSearching(false);
        });
    }, 350);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, origin[0], origin[1], searchEnabled]);

  async function handleSelectResult(place: GeocodedPlace) {
    setBuildingPlace(place.name);
    try {
      const destination = await buildDestinationFromSearch(place, origin);
      selectDestination(destination);
    } catch (err) {
      console.error("Could not build destination from search result:", err);
    } finally {
      setBuildingPlace(null);
    }
  }

  const showingSearchResults = searchEnabled && query.trim().length > 0;

  return (
    <Sheet t={t} close={close} title="Search" subtitle={searchEnabled ? "Search any real place, anywhere" : "Search places, guides, or parking"}>
      {searchEnabled && (
        <div style={{ border: `1px solid ${t.border}`, background: t.panel2, borderRadius: 18, padding: 13, display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <Search size={17} color={t.soft} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type an address, city, or place — anywhere"
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", color: t.text, fontSize: 14 }}
            autoFocus
          />
        </div>
      )}

      {showingSearchResults ? (
        <div style={{ display: "grid", gap: 9 }}>
          {searching && <div style={{ color: t.muted, fontSize: 13, padding: "8px 2px" }}>Searching…</div>}
          {!searching && results.length === 0 && <div style={{ color: t.muted, fontSize: 13, padding: "8px 2px" }}>No matches for "{query}"</div>}
          {results.map((place) => (
            <ListButton
              key={`${place.name}-${place.coords[0]}-${place.coords[1]}`}
              t={t}
              color={t.purple}
              Icon={Search}
              title={place.name}
              detail={buildingPlace === place.name ? "Getting parking, cost, and route info…" : place.address}
              onClick={() => handleSelectResult(place)}
            />
          ))}
        </div>
      ) : (
        <>
          {savedPlaces.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <SectionLabel t={t}>Saved places</SectionLabel>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {savedPlaces.map((name) => {
                  const place = findDestination(name);
                  return (
                    <button
                      key={name}
                      onClick={() => place && selectDestination(place)}
                      style={{
                        border: `1px solid ${t.gold}40`,
                        background: `${t.gold}14`,
                        color: t.gold,
                        borderRadius: 99,
                        padding: "7px 13px",
                        fontSize: 12.5,
                        fontWeight: 500,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Star size={12} />
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <SectionLabel t={t}>Friends (preview)</SectionLabel>
          <div style={{ display: "grid", gap: 9, marginBottom: 14 }}>
            {friends.map((friend) => (
              <ListButton key={friend.id} t={t} color={color(t, friend.color)} Icon={User} title={friend.name} detail={`${friend.handle} · ${friend.city}`} onClick={() => openFriend(friend)} />
            ))}
          </div>

          <SectionLabel t={t}>Suggested (example places)</SectionLabel>
          <div style={{ display: "grid", gap: 9 }}>
            {destinations.map((place) => (
              <ListButton key={place.name} t={t} color={color(t, place.color)} Icon={place.Icon} title={place.name} detail={`${place.type} · ${place.area} · ${place.eta} min`} onClick={() => selectDestination(place)} />
            ))}
          </div>
        </>
      )}
    </Sheet>
  );
}

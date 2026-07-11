import { Star, User } from "lucide-react";
import { destinations } from "../data/destinations";
import { friends } from "../data/social";
import { color, findDestination } from "../lib/helpers";
import { ListButton, SectionLabel, Sheet } from "../components/ui";
import type { Destination, Friend, ThemeTokens } from "../types";

export function SearchOverlay({
  t,
  close,
  selectDestination,
  openFriend,
  savedPlaces = [],
}: {
  t: ThemeTokens;
  close: () => void;
  selectDestination: (destination: Destination) => void;
  openFriend: (friend: Friend) => void;
  savedPlaces?: string[];
}) {
  return (
    <Sheet t={t} close={close} title="Search" subtitle="Search places, guides, or parking">
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
      <div style={{ display: "grid", gap: 9 }}>
        {friends.map((friend) => (
          <ListButton key={friend.id} t={t} color={color(t, friend.color)} Icon={User} title={friend.name} detail={`${friend.handle} · ${friend.city}`} onClick={() => openFriend(friend)} />
        ))}

        {destinations.map((place) => (
          <ListButton key={place.name} t={t} color={color(t, place.color)} Icon={place.Icon} title={place.name} detail={`${place.type} · ${place.area} · ${place.eta} min`} onClick={() => selectDestination(place)} />
        ))}
      </div>
    </Sheet>
  );
}

import { useState } from "react";
import { BookOpen, MapPin, Search, Sparkles, User, Users } from "lucide-react";
import { friends, guides } from "../data/social";
import { color, findDestination, findFriend } from "../lib/helpers";
import { Card, EmptyState, IconBadge, ListButton, NoticeCard, Pill, ScreenTitle, SectionLabel, Sheet } from "../components/ui";
import type { Destination, Friend, Guide, ThemeTokens } from "../types";

interface GuidesScreenProps {
  t: ThemeTokens;
  openGuide: (guide: Guide) => void;
  openFriend: (friend: Friend) => void;
}

export function GuidesScreen({ t, openGuide, openFriend }: GuidesScreenProps) {
  const [friendQuery, setFriendQuery] = useState("");

  const filteredFriends = friends.filter((friend) => {
    const q = friendQuery.toLowerCase().trim();
    if (!q) return true;
    return friend.name.toLowerCase().includes(q) || friend.handle.toLowerCase().includes(q) || friend.city.toLowerCase().includes(q) || friend.bio.toLowerCase().includes(q);
  });

  return (
    <div className="screen-scroll">
      <ScreenTitle t={t} title="City Guides" subtitle="Coffee, dates, parking, and places your friends recommend." />

      <NoticeCard
        t={t}
        color={t.purple}
        Icon={Sparkles}
        title="Preview — not live yet"
        text="This is a concept of Velora's social layer. Friends and guides shown here are examples, not real accounts."
      />

      <div style={{ marginTop: 14, border: `1px solid ${t.border}`, background: t.panel, borderRadius: 18, padding: 13, display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <Search size={17} color={t.soft} />
        <input
          value={friendQuery}
          onChange={(event) => setFriendQuery(event.target.value)}
          placeholder="Search friends or profiles"
          style={{ flex: 1, border: "none", outline: "none", background: "transparent", color: t.text, fontSize: 14 }}
        />
      </div>

      <SectionLabel t={t}>Friends</SectionLabel>

      {filteredFriends.length === 0 && (
        <div style={{ marginBottom: 14 }}>
          <EmptyState t={t} Icon={Users} title={`No matches for "${friendQuery}"`} text="Try a name, handle, or city — or invite friends to share their guides with you." />
        </div>
      )}

      <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 3, marginBottom: 14 }}>
        {filteredFriends.map((friend) => {
          const friendColor = color(t, friend.color);

          return (
            <button
              key={friend.id}
              onClick={() => openFriend(friend)}
              style={{ minWidth: 96, border: `1px solid ${t.border}`, background: t.panel, color: t.text, borderRadius: 18, padding: 12, cursor: "pointer", textAlign: "left" }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: `${friendColor}18`,
                  border: `1px solid ${friendColor}40`,
                  color: friendColor,
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 600,
                  marginBottom: 9,
                }}
              >
                {friend.name[0]}
              </div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{friend.name}</div>
              <div style={{ color: t.muted, fontSize: 11, marginTop: 3 }}>{friend.city}</div>
            </button>
          );
        })}
      </div>

      <SectionLabel t={t}>City Guides</SectionLabel>

      <div style={{ display: "grid", gap: 14 }}>
        {guides.map((guide) => {
          const guideColor = color(t, guide.color);
          const Icon = guide.Icon;
          const PrivacyIcon = guide.PrivacyIcon;
          const owner = findFriend(guide.ownerId);

          return (
            <Card key={guide.title} t={t} onClick={() => openGuide(guide)} style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ height: 96, background: `${guideColor}18`, borderBottom: `1px solid ${t.border}`, display: "grid", placeItems: "center" }}>
                <IconBadge color={guideColor}>
                  <Icon size={27} />
                </IconBadge>
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div>
                    <div style={{ color: t.text, fontWeight: 600, fontSize: 18 }}>{guide.title}</div>
                    <div style={{ color: t.muted, fontSize: 13, marginTop: 5 }}>{guide.subtitle}</div>
                    <div style={{ color: t.soft, fontSize: 12, marginTop: 8 }}>Shared by {owner.name}</div>
                  </div>
                  <Pill color={guideColor}>
                    <PrivacyIcon size={13} />
                    {guide.privacy}
                  </Pill>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function GuideDetailSheet({
  t,
  guide,
  close,
  openDestination,
  openFriend,
}: {
  t: ThemeTokens;
  guide: Guide;
  close: () => void;
  openDestination: (destination: Destination) => void;
  openFriend: (friend: Friend) => void;
}) {
  const guideColor = color(t, guide.color);
  const Icon = guide.Icon;
  const PrivacyIcon = guide.PrivacyIcon;
  const owner = findFriend(guide.ownerId);

  return (
    <Sheet t={t} close={close} title={guide.title} subtitle={guide.subtitle}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        <Pill color={guideColor}>
          <Icon size={13} />
          {guide.title}
        </Pill>
        <Pill color={guideColor}>
          <PrivacyIcon size={13} />
          {guide.privacy}
        </Pill>
        <button
          onClick={() => openFriend(owner)}
          style={{ border: `1px solid ${t.border}`, background: t.panel2, color: t.text, borderRadius: 999, padding: "6px 10px", fontSize: 12, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
        >
          <User size={13} />
          {owner.name}
        </button>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {guide.places.map((placeName) => {
          const place = findDestination(placeName);
          return (
            <ListButton key={place.name} t={t} color={color(t, place.color)} Icon={place.Icon} title={place.name} detail={`${place.type} · ${place.eta} min · parking ${place.parking.toLowerCase()}`} onClick={() => openDestination(place)} />
          );
        })}
      </div>
    </Sheet>
  );
}

export function FriendProfileSheet({
  t,
  friend,
  close,
  openDestination,
}: {
  t: ThemeTokens;
  friend: Friend;
  close: () => void;
  openDestination: (destination: Destination) => void;
}) {
  const friendColor = color(t, friend.color);

  return (
    <Sheet t={t} close={close} title={friend.name} subtitle={`${friend.handle} · ${friend.city}`}>
      <div style={{ color: t.muted, fontSize: 13, lineHeight: 1.45, marginBottom: 14 }}>{friend.bio}</div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        <Pill color={friendColor}>
          <BookOpen size={13} />4 guides
        </Pill>
        <Pill color={friendColor}>
          <MapPin size={13} />
          28 places
        </Pill>
        <Pill color={friendColor}>
          <Users size={13} />
          Friends only
        </Pill>
      </div>

      <SectionLabel t={t}>Recommended by {friend.name}</SectionLabel>

      <div style={{ display: "grid", gap: 10 }}>
        {friend.places.map((placeName) => {
          const place = findDestination(placeName);
          return <ListButton key={place.name} t={t} color={color(t, place.color)} Icon={place.Icon} title={place.name} detail={`${place.type} · ${place.eta} min · ${place.area}`} onClick={() => openDestination(place)} />;
        })}
      </div>
    </Sheet>
  );
}

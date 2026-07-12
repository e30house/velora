import { Brain, Car, CalendarDays, ChevronRight, EyeOff, Navigation2, Search, Settings, ShieldCheck, Share2, Sparkles, TrafficCone, BookmarkPlus } from "lucide-react";
import { destinations } from "../data/destinations";
import { color } from "../lib/helpers";
import { Card, IconBadge, ListButton, NoticeCard, ScreenTitle } from "../components/ui";
import type {
  Destination,
  EtaShared,
  ParkedCar,
  Plan,
  PrivacySettings,
  SavedGuideNotice,
  ThemeTokens,
  TrafficEvent,
  TripMemory,
  Vehicle,
} from "../types";

function timeAwareGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

interface HomeScreenProps {
  t: ThemeTokens;
  openSearch: () => void;
  goJourney: () => void;
  activeDestination: Destination;
  parkedCar: ParkedCar | null;
  openParkedCar: () => void;
  openSettings: () => void;
  openAskVelora: () => void;
  openDestination: (destination: Destination) => void;
  activeVehicle: Vehicle;
  etaShared: EtaShared | null;
  savedGuideNotice: SavedGuideNotice | null;
  tripMemory: TripMemory | null;
  trafficNotice: TrafficEvent | null;
  privacySettings: PrivacySettings;
  activePlan: Plan | null;
  planStopIndex: number;
}

export function HomeScreen({
  t,
  openSearch,
  goJourney,
  activeDestination,
  parkedCar,
  openParkedCar,
  openSettings,
  openAskVelora,
  openDestination,
  activeVehicle,
  etaShared,
  savedGuideNotice,
  tripMemory,
  trafficNotice,
  privacySettings,
  activePlan,
  planStopIndex,
}: HomeScreenProps) {
  const VehicleIcon = activeVehicle.Icon;
  const vehicleColor = color(t, activeVehicle.color);

  // Real shortcuts to the curated example destinations — no fabricated
  // "live" claims (no fake departure times, traffic, or weather here).
  const quickAccess = destinations.slice(0, 3);

  return (
    <div className="screen-scroll">
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <ScreenTitle t={t} title={timeAwareGreeting()} subtitle="Tell Velora where you're headed, or pick up where you left off." />
        </div>
        <button
          onClick={openSettings}
          aria-label="Settings"
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            border: `1px solid ${t.border}`,
            background: t.panel,
            color: t.muted,
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            marginTop: 4,
          }}
        >
          <Settings size={16} />
        </button>
      </div>

      <button
        onClick={openSearch}
        style={{
          width: "100%",
          textAlign: "left",
          border: `1px solid ${t.border}`,
          background: t.panel,
          color: t.text,
          borderRadius: 20,
          padding: 15,
          fontSize: 15,
          cursor: "pointer",
          marginBottom: 15,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Search size={19} color={t.blue} />
          <strong>Where to?</strong>
        </div>
        <div style={{ color: t.muted, fontSize: 13, marginTop: 6 }}>Search places, parking, guides, or people</div>
      </button>

      <Card
        t={t}
        onClick={openAskVelora}
        style={{
          marginBottom: 15,
          background: `linear-gradient(135deg, ${t.panel}, ${t.panel2})`,
          borderColor: `${t.purple}55`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <IconBadge color={t.purple}>
            <Brain size={21} />
          </IconBadge>
          <div style={{ flex: 1 }}>
            <div style={{ color: t.text, fontWeight: 850 }}>Ask Velora</div>
            <div style={{ color: t.muted, fontSize: 13, marginTop: 4 }}>Ask about routes, parking, traffic, plans, or your car.</div>
          </div>
          <Sparkles size={18} color={t.purple} />
        </div>
      </Card>

      <NoticeCard t={t} color={vehicleColor} Icon={VehicleIcon} title={`Using ${activeVehicle.name}`} text={`${activeVehicle.level} · ${activeVehicle.zoneLabel}`} />

      <NoticeCard
        t={t}
        color={privacySettings.hideHomeWork ? t.green : t.gold}
        Icon={privacySettings.hideHomeWork ? ShieldCheck : EyeOff}
        title={`Safe sharing is ${privacySettings.hideHomeWork ? "on" : "limited"}`}
        text={`ETA visibility: ${privacySettings.etaVisibility}`}
      />

      {activePlan && (
        <NoticeCard t={t} color={t.purple} Icon={CalendarDays} title="Trip plan ready" text={`${activePlan.title} · stop ${planStopIndex + 1} of ${activePlan.stops.length}`} />
      )}

      {trafficNotice && (
        <NoticeCard t={t} color={t.gold} Icon={TrafficCone} title="Traffic adjusted" text={`Velora handled ${trafficNotice.name.toLowerCase()} near your route.`} />
      )}

      {tripMemory && <NoticeCard t={t} color={t.purple} Icon={Brain} title="Trip memory saved" text={`Velora will remember: ${tripMemory.title}`} />}

      {etaShared && <NoticeCard t={t} color={t.purple} Icon={Share2} title="ETA shared" text={`${etaShared.friend} can see your arrival to ${etaShared.place}`} />}

      {savedGuideNotice && <NoticeCard t={t} color={t.green} Icon={BookmarkPlus} title="Saved to guide" text={`${savedGuideNotice.place} was added to ${savedGuideNotice.guide}`} />}

      <div style={{ color: t.soft, fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", margin: "18px 0 9px" }}>Quick access (suggested)</div>

      {quickAccess.map((place) => (
        <div key={place.name} style={{ marginTop: 10 }}>
          <ListButton t={t} color={color(t, place.color)} Icon={place.Icon} title={place.name} detail={place.note} onClick={() => openDestination(place)} />
        </div>
      ))}

      {parkedCar && (
        <div style={{ marginTop: 14 }}>
          <ListButton t={t} color={t.green} Icon={Car} title="Parked car saved" detail={`${parkedCar.location} · ${parkedCar.walk}`} onClick={openParkedCar} />
        </div>
      )}

      <Card t={t} style={{ marginTop: 14 }} onClick={goJourney}>
        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <IconBadge color={t.purple}>
            <Navigation2 size={21} />
          </IconBadge>
          <div style={{ flex: 1 }}>
            <div style={{ color: t.text, fontWeight: 600 }}>Continue route</div>
            <div style={{ color: t.muted, fontSize: 13, marginTop: 4 }}>
              {activeDestination.eta} min to {activeDestination.name}
            </div>
          </div>
          <ChevronRight color={t.soft} />
        </div>
      </Card>
    </div>
  );
}

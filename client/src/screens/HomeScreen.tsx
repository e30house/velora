import { AlertTriangle, Brain, Building2, Car, CalendarDays, ChevronRight, Clock, CloudRain, EyeOff, Navigation2, Search, Settings, ShieldCheck, Share2, Sparkles, TrafficCone, BookmarkPlus } from "lucide-react";
import { color, findDestination } from "../lib/helpers";
import { Card, IconBadge, ListButton, NoticeCard, Pill, ScreenTitle } from "../components/ui";
import type {
  ColorKey,
  Destination,
  EtaShared,
  IconType,
  ParkedCar,
  Plan,
  PrivacySettings,
  SavedGuideNotice,
  ThemeTokens,
  TrafficEvent,
  TripMemory,
  Vehicle,
} from "../types";

interface TodayItem {
  title: string;
  text: string;
  Icon: IconType;
  color: ColorKey;
  destination: string;
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

  const todayItems: TodayItem[] = [
    { title: "Leave by 8:42", text: "Work is 22 minutes away. M-30 slows down after 9:00.", Icon: Clock, color: "blue", destination: "Work" },
    { title: "Parking near Sol is filling", text: "Street parking is unlikely. Garage near Sol is safer.", Icon: Building2, color: "gold", destination: "Garage near Sol" },
    { title: "Rain may hit your route", text: "Light rain is likely in 18 minutes.", Icon: CloudRain, color: "blue", destination: "Fern & Copper" },
  ];

  return (
    <div className="screen-scroll">
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <ScreenTitle t={t} title="Morning, Paul" subtitle="Work is 22 minutes away. Leave by 8:42 to avoid the slowdown on M-30." />
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

      <Card t={t}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ color: t.text, fontSize: 21, fontWeight: 600, lineHeight: 1.15 }}>Leave by 8:42</div>
            <div style={{ color: t.muted, fontSize: 13, marginTop: 7, lineHeight: 1.35 }}>Traffic adds about 18 minutes after 9:00.</div>
          </div>
          <div style={{ textAlign: "right", color: t.blue, fontSize: 34, fontWeight: 600, letterSpacing: -1.5 }}>
            22
            <div style={{ fontSize: 12, color: t.muted, fontWeight: 500 }}>min</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
          <Pill color={t.blue}>
            <Clock size={13} />
            Usual route
          </Pill>
          <Pill color={t.gold}>
            <AlertTriangle size={13} />
            M-30 slower
          </Pill>
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

      <div style={{ color: t.soft, fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", margin: "18px 0 9px" }}>Today</div>

      {todayItems.map((item) => (
        <div key={item.title} style={{ marginTop: 10 }}>
          <ListButton t={t} color={color(t, item.color)} Icon={item.Icon} title={item.title} detail={item.text} onClick={() => openDestination(findDestination(item.destination))} />
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

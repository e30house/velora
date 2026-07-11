import { useState } from "react";
import { AlertTriangle, Building2, Car, CalendarDays, Coffee, EyeOff, ShieldCheck } from "lucide-react";
import { color } from "../lib/helpers";
import { Card, IconBadge, NoticeCard, PrivacyToggle, ScreenTitle } from "../components/ui";
import type { ColorKey, IconType, NearbyStop, ParkedCar, Plan, PrivacySettings, ThemeTokens, TrafficEvent, TripMemory } from "../types";

interface PrivacyScreenProps {
  t: ThemeTokens;
  privacySettings: PrivacySettings;
  setPrivacySettings: React.Dispatch<React.SetStateAction<PrivacySettings>>;
  tripMemory: TripMemory | null;
  parkedCar: ParkedCar | null;
  chosenStop: NearbyStop | null;
  selectedTraffic: TrafficEvent | null;
  activePlan: Plan | null;
}

interface HistoryItem {
  title: string;
  detail: string;
  color: ColorKey;
  Icon: IconType;
}

export function PrivacyScreen({ t, privacySettings, setPrivacySettings, tripMemory, parkedCar, chosenStop, selectedTraffic, activePlan }: PrivacyScreenProps) {
  const [guidePrivacy, setGuidePrivacy] = useState("Friends");

  function toggleSetting(key: "hideHomeWork" | "blurParking" | "memoryLock") {
    setPrivacySettings((current) => ({ ...current, [key]: !current[key] }));
  }

  function setEtaVisibility(value: PrivacySettings["etaVisibility"]) {
    setPrivacySettings((current) => ({ ...current, etaVisibility: value }));
  }

  const historyItems: HistoryItem[] = [
    { title: "Fern & Copper", detail: "Coffee route · garage recommended · 9 min", color: "gold", Icon: Coffee },
    { title: "Garage near Sol", detail: "Parked Level 3 · Section B12 · 2 min walk", color: "green", Icon: Building2 },
    ...(activePlan ? [{ title: activePlan.title, detail: `Trip plan · ${activePlan.stops.join(" → ")}`, color: "purple" as ColorKey, Icon: CalendarDays }] : []),
    ...(parkedCar ? [{ title: "Parked car", detail: `${parkedCar.location} · ${parkedCar.walk}`, color: "green" as ColorKey, Icon: Car }] : []),
    ...(chosenStop ? [{ title: chosenStop.name, detail: `Added stop · ${chosenStop.etaAdd}`, color: chosenStop.color, Icon: chosenStop.Icon }] : []),
    ...(selectedTraffic ? [{ title: selectedTraffic.name, detail: `Traffic event · ${selectedTraffic.impact}`, color: selectedTraffic.color, Icon: selectedTraffic.Icon }] : []),
    ...(tripMemory ? [{ title: tripMemory.title, detail: tripMemory.detail, color: tripMemory.color, Icon: tripMemory.Icon }] : []),
  ];

  return (
    <div className="screen-scroll">
      <ScreenTitle t={t} title="Privacy Center" subtitle="Control what Velora remembers, shares, and hides." />

      <Card t={t}>
        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <IconBadge color={privacySettings.hideHomeWork ? t.green : t.gold}>
            {privacySettings.hideHomeWork ? <ShieldCheck size={21} /> : <EyeOff size={21} />}
          </IconBadge>
          <div style={{ flex: 1 }}>
            <div style={{ color: t.text, fontWeight: 600 }}>Safe sharing</div>
            <div style={{ color: t.muted, fontSize: 13, marginTop: 4 }}>
              {privacySettings.hideHomeWork ? "Home and work are hidden from friends." : "Home and work may appear in shared context."}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
          <PrivacyToggle t={t} active={privacySettings.hideHomeWork} title="Hide Home / Work" detail="Never reveal exact home or work addresses when sharing." onClick={() => toggleSetting("hideHomeWork")} />
          <PrivacyToggle t={t} active={privacySettings.blurParking} title="Blur parking location" detail="Friends can see you arrived, not the exact parking level." onClick={() => toggleSetting("blurParking")} />
          <PrivacyToggle t={t} active={privacySettings.memoryLock} title="Lock trip memories" detail="Trip memories stay private unless you choose to share." onClick={() => toggleSetting("memoryLock")} />
        </div>
      </Card>

      <Card t={t} style={{ marginTop: 14 }}>
        <div style={{ color: t.text, fontWeight: 600, fontSize: 18 }}>ETA visibility</div>
        <div style={{ color: t.muted, fontSize: 13, marginTop: 5 }}>Choose who can see your live ETA when you share it.</div>
        <div style={{ display: "flex", gap: 8, marginTop: 14, overflowX: "auto" }}>
          {(["Private", "Friends", "Public"] as const).map((item) => (
            <button
              key={item}
              onClick={() => setEtaVisibility(item)}
              style={{
                border: `1px solid ${privacySettings.etaVisibility === item ? t.purple : t.border}`,
                background: privacySettings.etaVisibility === item ? `${t.purple}18` : t.panel2,
                color: privacySettings.etaVisibility === item ? t.purple : t.text,
                borderRadius: 999,
                padding: "9px 12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </Card>

      <Card t={t} style={{ marginTop: 14 }}>
        <div style={{ color: t.text, fontWeight: 600, fontSize: 18 }}>Guide visibility</div>
        <div style={{ color: t.muted, fontSize: 13, marginTop: 5 }}>Default visibility for newly saved City Guides.</div>
        <div style={{ display: "flex", gap: 8, marginTop: 14, overflowX: "auto" }}>
          {(["Private", "Friends", "Public"] as const).map((item) => (
            <button
              key={item}
              onClick={() => setGuidePrivacy(item)}
              style={{
                border: `1px solid ${guidePrivacy === item ? t.green : t.border}`,
                background: guidePrivacy === item ? `${t.green}18` : t.panel2,
                color: guidePrivacy === item ? t.green : t.text,
                borderRadius: 999,
                padding: "9px 12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </Card>

      <NoticeCard t={t} color={t.gold} Icon={AlertTriangle} title="Safe sharing warning" text="Velora will remove exact home, work, and parking details before public sharing." />

      <div style={{ marginTop: 22 }}>
        <ScreenTitle t={t} title="Journey History" subtitle="Recent routes, stops, parking, and memories Velora learned." />
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {historyItems.map((item) => (
          <Card key={`${item.title}-${item.detail}`} t={t}>
            <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
              <IconBadge color={color(t, item.color)}>
                <item.Icon size={21} />
              </IconBadge>
              <div style={{ flex: 1 }}>
                <div style={{ color: t.text, fontWeight: 600 }}>{item.title}</div>
                <div style={{ color: t.muted, fontSize: 13, marginTop: 4 }}>{item.detail}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

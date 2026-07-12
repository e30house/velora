import { Brain, Building2, Clock, Moon, Plus, Sparkles, ShieldCheck, SlidersHorizontal, Sun, CalendarDays, CheckCircle2, ChevronRight, User } from "lucide-react";
import { VELORA_VOICES } from "../data/voices";
import { color, formatRange } from "../lib/helpers";
import { speakVoiceSample } from "../lib/speech";
import { Card, IconBadge, ListButton, Pill, SectionLabel, Sheet } from "../components/ui";
import type { HomeWork, Plan, RoutePrefs, ThemePref, ThemeTokens, TripMemory, UnitPref, Vehicle } from "../types";

export function SettingsSheet({
  t,
  close,
  themePref,
  setThemePref,
  voiceId,
  setVoiceId,
  vehicles,
  activeVehicleId,
  setActiveVehicleId,
  unitPref,
  setUnitPref,
  homeWork,
  setHomeWork,
  goPrivacy,
  openAddVehicle,
  tripMemory,
  activePlan,
  routePrefs,
  authEmail,
  openAccount,
}: {
  t: ThemeTokens;
  close: () => void;
  themePref: ThemePref;
  setThemePref: (pref: ThemePref) => void;
  voiceId: string;
  setVoiceId: (id: string) => void;
  vehicles: Vehicle[];
  activeVehicleId: string;
  setActiveVehicleId: (id: string) => void;
  unitPref: UnitPref;
  setUnitPref: (pref: UnitPref) => void;
  homeWork: HomeWork;
  setHomeWork: React.Dispatch<React.SetStateAction<HomeWork>>;
  goPrivacy: () => void;
  openAddVehicle: () => void;
  tripMemory: TripMemory | null;
  activePlan: Plan | null;
  routePrefs: RoutePrefs;
  authEmail: string | null;
  openAccount: () => void;
}) {
  return (
    <Sheet t={t} close={close} title="Settings" subtitle="Velora adapts to you — not the other way around.">
      <SectionLabel t={t}>Account</SectionLabel>
      <div style={{ marginBottom: 16 }}>
        <ListButton
          t={t}
          color={authEmail ? t.green : t.purple}
          Icon={User}
          title={authEmail ?? "Sign in / Create account"}
          detail={authEmail ? "Synced across your devices" : "Optional — sync settings, vehicles, and saved places"}
          onClick={openAccount}
        />
      </div>

      <SectionLabel t={t}>Appearance</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
        {(
          [
            { id: "auto", label: "Auto", Icon: Clock },
            { id: "day", label: "Day", Icon: Sun },
            { id: "night", label: "Night", Icon: Moon },
          ] as const
        ).map(({ id, label, Icon }) => {
          const active = themePref === id;
          return (
            <button
              key={id}
              onClick={() => setThemePref(id)}
              style={{ border: `1px solid ${active ? `${t.purple}55` : t.border}`, background: active ? `${t.purple}14` : t.panel2, color: active ? t.purple : t.text, borderRadius: 15, padding: 11, cursor: "pointer", display: "flex", gap: 7, alignItems: "center", justifyContent: "center", fontWeight: 500, fontSize: 13 }}
            >
              <Icon size={14} />
              {label}
            </button>
          );
        })}
      </div>

      <SectionLabel t={t}>Premium Voice Engine</SectionLabel>
      <Card t={t} style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <IconBadge color={t.purple}>
            <Sparkles size={20} />
          </IconBadge>
          <div style={{ flex: 1 }}>
            <div style={{ color: t.text, fontWeight: 850 }}>Premium voices are the real product</div>
            <div style={{ color: t.muted, fontSize: 12.5, lineHeight: 1.45, marginTop: 5 }}>
              Browser voices are only a prototype fallback. Velora should use Cartesia, ElevenLabs, or OpenAI TTS for natural voices that are clear inside a car.
            </div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 11 }}>
              <Pill color={t.green}>Premium ready</Pill>
              <Pill color={t.gold}>Browser fallback</Pill>
            </div>
          </div>
        </div>
      </Card>

      <SectionLabel t={t}>Velora's voice</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        {VELORA_VOICES.map((v) => {
          const active = v.id === voiceId;
          return (
            <button
              key={v.id}
              onClick={() => {
                setVoiceId(v.id);
                speakVoiceSample(v);
              }}
              style={{ border: `1px solid ${active ? `${t.purple}55` : t.border}`, background: active ? `${t.purple}14` : t.panel2, color: t.text, borderRadius: 15, padding: 11, cursor: "pointer", textAlign: "left" }}
            >
              <div style={{ fontWeight: 600, fontSize: 13, color: active ? t.purple : t.text }}>{v.name}</div>
              <div style={{ color: t.muted, fontSize: 11.5, marginTop: 2 }}>{v.desc}</div>
              <div style={{ color: active ? t.purple : t.soft, fontSize: 10.5, marginTop: 7 }}>Premium voice brief · browser fallback sample</div>
            </button>
          );
        })}
      </div>

      <SectionLabel t={t}>Default vehicle</SectionLabel>
      <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
        {vehicles.map((v) => (
          <ListButton
            key={v.id}
            t={t}
            color={color(t, v.color)}
            Icon={v.Icon}
            title={v.name}
            detail={`${v.type} · ${v.level} · ${formatRange(v, unitPref)}`}
            onClick={() => setActiveVehicleId(v.id)}
            RightIcon={activeVehicleId === v.id ? CheckCircle2 : ChevronRight}
          />
        ))}

        <ListButton t={t} color={t.purple} Icon={Plus} title="Register a new car" detail="Add EV, gas, range, and zone status" onClick={openAddVehicle} />
      </div>

      <SectionLabel t={t}>Distance units</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        {(
          [
            { id: "mi", label: "Miles", detail: "mi / ft" },
            { id: "km", label: "Kilometers", detail: "km / m" },
          ] as const
        ).map((item) => {
          const active = unitPref === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setUnitPref(item.id)}
              style={{ border: `1px solid ${active ? `${t.purple}55` : t.border}`, background: active ? `${t.purple}14` : t.panel2, color: active ? t.purple : t.text, borderRadius: 15, padding: 12, cursor: "pointer", textAlign: "left" }}
            >
              <div style={{ fontWeight: 600, fontSize: 13 }}>{item.label}</div>
              <div style={{ color: active ? t.purple : t.muted, fontSize: 11.5, marginTop: 3 }}>{item.detail}</div>
            </button>
          );
        })}
      </div>

      <SectionLabel t={t}>Velora Memory</SectionLabel>
      <Card t={t} style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <IconBadge color={t.purple}>
            <Brain size={20} />
          </IconBadge>
          <div style={{ flex: 1 }}>
            <div style={{ color: t.text, fontWeight: 850 }}>What Velora has learned</div>
            <div style={{ color: t.muted, fontSize: 12.5, lineHeight: 1.45, marginTop: 5 }}>{tripMemory ? `You prefer ${tripMemory.title.toLowerCase()}.` : "No personal route memory saved yet."}</div>
            <div style={{ display: "grid", gap: 7, marginTop: 12 }}>
              <Pill color={routePrefs.parkingFirst ? t.green : t.soft}>
                <Building2 size={13} />
                Parking first {routePrefs.parkingFirst ? "on" : "off"}
              </Pill>
              <Pill color={routePrefs.avoidTolls ? t.gold : t.soft}>
                <SlidersHorizontal size={13} />
                Avoid tolls {routePrefs.avoidTolls ? "on" : "off"}
              </Pill>
              {activePlan && (
                <Pill color={t.purple}>
                  <CalendarDays size={13} />
                  Active plan: {activePlan.title}
                </Pill>
              )}
            </div>
          </div>
        </div>
      </Card>

      <SectionLabel t={t}>Home &amp; Work</SectionLabel>
      <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
        {(["home", "work"] as const).map((key) => (
          <input
            key={key}
            value={homeWork[key]}
            onChange={(e) => setHomeWork((hw) => ({ ...hw, [key]: e.target.value }))}
            placeholder={key === "home" ? "Home address" : "Work address"}
            style={{ width: "100%", border: `1px solid ${t.border}`, background: t.panel2, color: t.text, borderRadius: 15, padding: "12px 14px", fontSize: 13.5, outline: "none" }}
          />
        ))}
      </div>

      <ListButton t={t} color={t.green} Icon={ShieldCheck} title="Privacy & Sharing" detail="Home, Work, ETA, parking, and trip memories" onClick={goPrivacy} />
    </Sheet>
  );
}

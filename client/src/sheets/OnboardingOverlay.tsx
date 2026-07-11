import { useState } from "react";
import { CheckCircle2, ChevronRight, Lock, Plus, ShieldCheck, Users } from "lucide-react";
import { VELORA_VOICES } from "../data/voices";
import { color, formatRange } from "../lib/helpers";
import { speakVoiceSample } from "../lib/speech";
import { ListButton, NoticeCard } from "../components/ui";
import type { HomeWork, ThemeTokens, UnitPref, Vehicle } from "../types";

const STEPS = ["welcome", "vehicle", "places", "voice"] as const;

export function OnboardingOverlay({
  t,
  finish,
  vehicles,
  activeVehicleId,
  setActiveVehicleId,
  voiceId,
  setVoiceId,
  homeWork,
  setHomeWork,
  openAddVehicle,
  unitPref,
}: {
  t: ThemeTokens;
  finish: () => void;
  vehicles: Vehicle[];
  activeVehicleId: string;
  setActiveVehicleId: (id: string) => void;
  voiceId: string;
  setVoiceId: (id: string) => void;
  homeWork: HomeWork;
  setHomeWork: React.Dispatch<React.SetStateAction<HomeWork>>;
  openAddVehicle: () => void;
  unitPref: UnitPref;
}) {
  const [step, setStep] = useState(0);
  const last = step === STEPS.length - 1;

  const nextButton = (label: string) => (
    <button
      onClick={() => (last ? finish() : setStep((s) => s + 1))}
      style={{ marginTop: 22, width: "100%", border: "none", background: `linear-gradient(135deg, ${t.purple}, ${t.blue})`, color: "#0D0F16", borderRadius: 16, padding: 14, fontWeight: 600, fontSize: 14.5, cursor: "pointer" }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 80, background: t.phone, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "72px 26px 26px" }}>
        <div style={{ color: t.soft, fontSize: 11, fontWeight: 500, letterSpacing: 3, textTransform: "uppercase", fontFamily: "'IBM Plex Mono', monospace" }}>
          Velora · {step + 1} of {STEPS.length}
        </div>

        {step === 0 && (
          <div>
            <h1 style={{ margin: "14px 0 0", fontSize: 32, lineHeight: 1.1, color: t.text, letterSpacing: -1 }}>Your journeys belong to you.</h1>
            <p style={{ color: t.muted, fontSize: 14.5, lineHeight: 1.5, marginTop: 12 }}>Velora is an AI travel companion built privacy-first. Before we start, three promises:</p>
            <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
              {[
                { Icon: ShieldCheck, colorKey: "green" as const, title: "Private by default", text: "Home, work, and parking stay on your device unless you share them." },
                { Icon: Lock, colorKey: "purple" as const, title: "You control memory", text: "Velora only remembers what you ask it to remember." },
                { Icon: Users, colorKey: "blue" as const, title: "Sharing is opt-in", text: "ETAs and guides are invisible until you choose otherwise." },
              ].map(({ Icon, colorKey, title, text }) => (
                <NoticeCard key={title} t={t} color={color(t, colorKey)} Icon={Icon} title={title} text={text} />
              ))}
            </div>
            {nextButton("Get started")}
          </div>
        )}

        {step === 1 && (
          <div>
            <h1 style={{ margin: "14px 0 0", fontSize: 30, lineHeight: 1.1, color: t.text, letterSpacing: -1 }}>Which car are you driving?</h1>
            <p style={{ color: t.muted, fontSize: 14, lineHeight: 1.5, marginTop: 10 }}>Velora uses this for range, zone access, and parking fit. You can add more in Garage.</p>
            <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
              {vehicles.map((v) => (
                <ListButton
                  key={v.id}
                  t={t}
                  color={color(t, v.color)}
                  Icon={v.Icon}
                  title={`${v.name} · ${v.year}`}
                  detail={`${v.type} · ${formatRange(v, unitPref)} · ${v.zoneLabel}`}
                  onClick={() => setActiveVehicleId(v.id)}
                  RightIcon={activeVehicleId === v.id ? CheckCircle2 : ChevronRight}
                />
              ))}

              <ListButton t={t} color={t.purple} Icon={Plus} title="Register a new car" detail="Add your actual vehicle before routing" onClick={openAddVehicle} />
            </div>
            {nextButton("Continue")}
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 style={{ margin: "14px 0 0", fontSize: 30, lineHeight: 1.1, color: t.text, letterSpacing: -1 }}>Set Home and Work</h1>
            <p style={{ color: t.muted, fontSize: 14, lineHeight: 1.5, marginTop: 10 }}>For leave-by alerts and one-tap routing. Kept private — hidden from shared ETAs by default.</p>
            <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
              {(["home", "work"] as const).map((key) => (
                <input
                  key={key}
                  value={homeWork[key]}
                  onChange={(e) => setHomeWork((hw) => ({ ...hw, [key]: e.target.value }))}
                  placeholder={key === "home" ? "Home address" : "Work address"}
                  style={{ width: "100%", border: `1px solid ${t.border}`, background: t.panel, color: t.text, borderRadius: 16, padding: "14px 15px", fontSize: 14, outline: "none" }}
                />
              ))}
            </div>
            {nextButton("Continue")}
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 style={{ margin: "14px 0 0", fontSize: 30, lineHeight: 1.1, color: t.text, letterSpacing: -1 }}>Choose Velora's voice</h1>
            <p style={{ color: t.muted, fontSize: 14, lineHeight: 1.5, marginTop: 10 }}>Tap to hear each one. You can change this anytime in Settings.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 18 }}>
              {VELORA_VOICES.map((v) => {
                const active = v.id === voiceId;
                return (
                  <button
                    key={v.id}
                    onClick={() => {
                      setVoiceId(v.id);
                      speakVoiceSample(v);
                    }}
                    style={{ border: `1px solid ${active ? `${t.purple}55` : t.border}`, background: active ? `${t.purple}14` : t.panel, color: t.text, borderRadius: 16, padding: 14, cursor: "pointer", textAlign: "left" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 600, fontSize: 14.5, color: active ? t.purple : t.text }}>{v.name}</span>
                      {active && <CheckCircle2 size={14} color={t.purple} />}
                    </div>
                    <div style={{ color: t.muted, fontSize: 12, marginTop: 3 }}>{v.desc}</div>
                  </button>
                );
              })}
            </div>
            {nextButton("Start driving with Velora")}
          </div>
        )}

        <button onClick={finish} style={{ marginTop: 14, width: "100%", background: "transparent", border: "none", color: t.soft, fontSize: 12.5, cursor: "pointer" }}>
          Skip for now
        </button>
      </div>
    </div>
  );
}

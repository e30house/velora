import { useState } from "react";
import { AlertTriangle, CheckCircle2, CircleDollarSign, MapPin, Mic, ShieldCheck, TrafficCone, Wrench } from "lucide-react";
import { VELORA_VOICES } from "../data/voices";
import { speakVoiceSample } from "../lib/speech";
import { Sheet } from "../components/ui";
import type { ThemeTokens } from "../types";

export function VoiceOverlay({
  t,
  close,
  voiceId,
  setVoiceId,
}: {
  t: ThemeTokens;
  close: () => void;
  voiceId: string;
  setVoiceId: (id: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const reports = [
    { label: "Accident", Icon: AlertTriangle, color: t.red },
    { label: "Traffic", Icon: TrafficCone, color: t.gold },
    { label: "Roadwork", Icon: Wrench, color: t.gold },
    { label: "Police", Icon: ShieldCheck, color: t.blue },
    { label: "Hazard", Icon: MapPin, color: t.red },
    { label: "Price", Icon: CircleDollarSign, color: t.green },
  ];

  return (
    <Sheet t={t} close={close} title={selected ? `${selected} reported` : "What do you see?"} subtitle={selected ? "Thanks. Velora will use this to help nearby drivers." : "Tap a report type or use your voice."}>
      <div style={{ width: 74, height: 74, borderRadius: "50%", margin: "0 auto 16px", background: `${t.purple}18`, border: `1px solid ${t.purple}40`, display: "grid", placeItems: "center", color: t.purple }}>
        {selected ? <CheckCircle2 size={33} /> : <Mic size={31} />}
      </div>

      {!selected && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
          {reports.map(({ label, Icon, color }) => (
            <button
              key={label}
              onClick={() => setSelected(label)}
              style={{ border: `1px solid ${t.border}`, background: t.panel2, color: t.text, borderRadius: 16, padding: 12, cursor: "pointer", display: "flex", gap: 8, alignItems: "center", justifyContent: "center", fontWeight: 500 }}
            >
              <Icon size={16} color={color} />
              {label}
            </button>
          ))}
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <div style={{ color: t.soft, fontSize: 11, fontWeight: 500, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10, fontFamily: "'IBM Plex Mono', monospace" }}>Velora's voice</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
          {VELORA_VOICES.map((v) => {
            const active = v.id === voiceId;
            return (
              <button
                key={v.id}
                onClick={() => {
                  setVoiceId(v.id);
                  speakVoiceSample(v);
                }}
                style={{ border: `1px solid ${active ? `${t.purple}55` : t.border}`, background: active ? `${t.purple}14` : t.panel2, color: t.text, borderRadius: 16, padding: 12, cursor: "pointer", textAlign: "left" }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: active ? t.purple : t.text }}>{v.name}</span>
                  {active && <CheckCircle2 size={14} color={t.purple} />}
                </div>
                <div style={{ color: t.muted, fontSize: 12, marginTop: 3 }}>{v.desc}</div>
              </button>
            );
          })}
        </div>
        <div style={{ color: t.muted, fontSize: 11, marginTop: 8, textAlign: "center" }}>Tap a voice to hear a sample</div>
      </div>
    </Sheet>
  );
}

import { useEffect, useState } from "react";
import { Brain, CornerUpLeft, Leaf, Mountain, Navigation2, ShieldCheck, TrafficCone, X, Zap } from "lucide-react";
import { buildAIDecision, canEnter, getEta, turnDistance } from "../lib/helpers";
import { speak } from "../lib/speech";
import { VELORA_VOICES } from "../data/voices";
import { Card, NoticeCard, Pill, Sheet } from "../components/ui";
import type {
  AiDecision,
  Destination,
  DrivingMode,
  NearbyStop,
  Plan,
  RoutePrefs,
  ThemeName,
  ThemeTokens,
  TrafficEvent,
  TripMemory,
  UnitPref,
  Vehicle,
} from "../types";

interface JourneyScreenProps {
  t: ThemeTokens;
  theme: ThemeName;
  activeDestination: Destination;
  activeVehicle: Vehicle;
  openArrival: () => void;
  routePrefs: RoutePrefs;
  setRoutePrefs: React.Dispatch<React.SetStateAction<RoutePrefs>>;
  openShareEta: () => void;
  openNearbyStops: () => void;
  openSaveToGuide: () => void;
  openTraffic: () => void;
  openMemory: () => void;
  chosenStop: NearbyStop | null;
  selectedTraffic: TrafficEvent | null;
  autoDetectTraffic: () => void;
  unitPref: UnitPref;
  tripMemory: TripMemory | null;
  activePlan: Plan | null;
  mode: DrivingMode;
  setMode: (mode: DrivingMode) => void;
  voiceId: string;
}

const MODES: { label: DrivingMode; Icon: typeof Zap; color: keyof ThemeTokens }[] = [
  { label: "Express", Icon: Zap, color: "blue" },
  { label: "Eco", Icon: Leaf, color: "green" },
  { label: "Scenic", Icon: Mountain, color: "gold" },
];

export function JourneyScreen({
  t,
  theme,
  activeDestination,
  activeVehicle,
  openArrival,
  routePrefs,
  setRoutePrefs,
  openShareEta,
  openNearbyStops,
  openSaveToGuide,
  openTraffic,
  openMemory,
  chosenStop,
  selectedTraffic,
  autoDetectTraffic,
  unitPref,
  tripMemory,
  activePlan,
  mode,
  setMode,
  voiceId,
}: JourneyScreenProps) {
  const [showTools, setShowTools] = useState(false);
  const [coachOpen, setCoachOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [voiceGuidanceOn, setVoiceGuidanceOn] = useState(true);

  const selected = MODES.find((item) => item.label === mode) ?? MODES[0];
  const shownEta = getEta(activeDestination, mode, routePrefs, selectedTraffic);
  const allowed = canEnter(activeVehicle, activeDestination);
  const nextDistance = turnDistance(unitPref);
  const totalDistance = unitPref === "km" ? "12.5 km" : "7.8 mi";
  const speed = unitPref === "km" ? "25\nkm/h" : "16\nmph";
  const roadName = activeDestination.area === "Centro" ? "Gran Vía Approach" : "Braham Road";
  const turnStreet = activeDestination.area === "Centro" ? "Calle Mayor" : "Lime Kiln Road";
  const instruction = selectedTraffic ? "Traffic ahead — stay calm" : allowed ? "Stay left, then turn left" : "Do not enter — park before zone";
  const subInstruction = selectedTraffic
    ? "Velora will guide you around the slowdown."
    : allowed
      ? "Follow the highlighted lane. Use Exit 2 at the roundabout."
      : `${activeVehicle.name} may be restricted here. Velora will guide you to parking first.`;

  const driverSteps = selectedTraffic
    ? [
        "Stay in your current lane. Do not switch lanes suddenly.",
        "In the next stretch, traffic slows on the right side.",
        "Velora will move you left before the slowdown becomes tight.",
        "After the traffic clears, return to the highlighted route.",
      ]
    : allowed
      ? [
          "Stay in the left lane now. Do not drift right.",
          "Do not take the first exit. It comes too early.",
          "Take the second exit toward the highlighted road.",
          `After the exit, continue for ${unitPref === "km" ? "300 m" : "0.2 mi"} and prepare for the next left.`,
        ]
      : [
          "Do not enter the restricted zone with this vehicle.",
          "Stay on the outside approach road.",
          "Velora will route you to the garage before the zone.",
          "Park first, then continue with walking directions.",
        ];

  const aiDecision: AiDecision = buildAIDecision({
    destination: activeDestination,
    vehicle: activeVehicle,
    mode,
    prefs: routePrefs,
    trafficEvent: selectedTraffic,
    chosenStop,
    activePlan,
    tripMemory,
  });

  // Speaks each new instruction aloud with the driver's chosen Velora voice,
  // mirroring what "turn-by-turn" is supposed to feel like in a real car.
  useEffect(() => {
    if (!voiceGuidanceOn) return;
    const voiceProfile = VELORA_VOICES.find((v) => v.id === voiceId) ?? VELORA_VOICES[0];
    if (voiceProfile) speak(instruction, voiceProfile);
  }, [instruction, voiceId, voiceGuidanceOn]);

  // Simulates Velora "noticing" traffic partway into a drive, since there is
  // no live traffic feed wired up in this prototype.
  useEffect(() => {
    if (selectedTraffic) return;
    const timer = window.setTimeout(() => autoDetectTraffic(), 9000);
    return () => window.clearTimeout(timer);
  }, [activeDestination.name, selectedTraffic, autoDetectTraffic]);

  return (
    <div style={{ height: "100%", position: "relative", overflow: "hidden", background: theme === "night" ? "#DCE8EF" : "#EAF1F6" }}>
      <svg viewBox="0 0 360 740" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <rect width="360" height="740" fill={theme === "night" ? "#DCE8EF" : "#EDF4F8"} />
        <path d="M-20 120 C70 130 105 180 150 230 C220 310 290 330 390 360" stroke="#C8D5DF" strokeWidth="18" fill="none" opacity="0.75" />
        <path d="M40 520 C90 470 130 440 175 390 C220 338 260 310 340 275" stroke="#BFD0DC" strokeWidth="18" fill="none" opacity="0.72" />
        <path d="M180 760 L180 625 C180 590 165 565 145 540 C110 495 115 455 160 420 C205 385 225 350 215 302" stroke="#ABBCC8" strokeWidth="26" fill="none" strokeLinecap="round" />
        <path d="M180 760 L180 625 C180 590 165 565 145 540 C110 495 115 455 160 420 C205 385 225 350 215 302" stroke="#20B76C" strokeWidth="16" fill="none" strokeLinecap="round" />
        <path d="M180 760 L180 625 C180 590 165 565 145 540 C110 495 115 455 160 420 C205 385 225 350 215 302" stroke="#F8FAFC" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.9" />
        <path d="M184 530 C165 500 168 473 198 452" stroke="#0EA5E9" strokeWidth="38" fill="none" strokeLinecap="round" opacity="0.9" />
        <path d="M184 530 C165 500 168 473 198 452" stroke="#FFFFFF" strokeWidth="26" fill="none" strokeLinecap="round" />
        <path d="M185 530 C166 500 169 474 199 452" stroke="#0EA5E9" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M197 453 L183 445 L184 466 Z" fill="#0EA5E9" />
        <text x="22" y="605" fill="#718096" fontSize="17" fontWeight="600" transform="rotate(-10 22 605)">High Street</text>
        <text x="242" y="405" fill="#718096" fontSize="17" fontWeight="600" transform="rotate(-42 242 405)">Queen Edith Road</text>
      </svg>

      <div
        style={{
          position: "absolute",
          top: 52,
          left: 14,
          right: 14,
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 18px 40px rgba(15, 23, 42, 0.22)",
          border: "1px solid rgba(255,255,255,.35)",
        }}
      >
        <div style={{ display: "flex", minHeight: 84, background: "#101827" }}>
          <div style={{ width: 92, background: "linear-gradient(135deg,#1F7AEE,#0D63D8)", display: "grid", placeItems: "center", color: "white" }}>
            <CornerUpLeft size={54} strokeWidth={3.2} />
          </div>
          <div style={{ flex: 1, padding: "14px 16px", color: "white" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, lineHeight: 1 }}>
              <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: -2 }}>{nextDistance.split(" ")[0]}</div>
              <div style={{ fontSize: 25, fontWeight: 700, opacity: 0.88 }}>{nextDistance.split(" ")[1]}</div>
            </div>
            <div style={{ fontSize: 18, fontWeight: 650, marginTop: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{turnStreet}</div>
          </div>
        </div>
        <div style={{ background: "#101827", borderTop: "1px solid rgba(255,255,255,.12)", padding: "11px 20px", display: "flex", justifyContent: "center", gap: 20 }}>
          <div style={{ color: "white", fontSize: 33, fontWeight: 800 }}>↑</div>
          <div style={{ width: 1, background: "rgba(255,255,255,.25)" }} />
          <div style={{ color: "rgba(255,255,255,.48)", fontSize: 33, fontWeight: 800 }}>↱</div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 215,
          left: 16,
          right: 16,
          height: 232,
          borderRadius: 20,
          overflow: "hidden",
          background: "#74C878",
          border: "1px solid rgba(255,255,255,.55)",
          boxShadow: "0 18px 42px rgba(15,23,42,.18)",
        }}
      >
        <svg viewBox="0 0 330 232" style={{ width: "100%", height: "100%" }}>
          <rect width="330" height="232" fill="#78C87B" />
          <circle cx="165" cy="116" r="62" fill="#78C87B" stroke="#1F242E" strokeWidth="34" />
          <path d="M162 210 C156 170 130 150 108 130 C80 104 61 83 12 80" stroke="#1F242E" strokeWidth="34" fill="none" strokeLinecap="round" />
          <path d="M165 22 C144 62 124 84 101 101" stroke="#1F242E" strokeWidth="34" fill="none" strokeLinecap="round" />
          <path d="M284 66 C242 82 220 95 204 111" stroke="#1F242E" strokeWidth="34" fill="none" strokeLinecap="round" />
          <path d="M54 182 C92 157 111 137 124 116" stroke="#1F242E" strokeWidth="34" fill="none" strokeLinecap="round" />
          <path d="M153 210 C149 170 128 151 109 132 C82 106 63 86 15 82" stroke="#FFD21D" strokeWidth="8" fill="none" strokeLinecap="round" />
          <path d="M118 126 C105 107 110 88 126 69 C138 55 149 40 157 24" stroke="#FFD21D" strokeWidth="8" fill="none" strokeLinecap="round" />
          <path d="M158 26 L148 42 L166 38 Z" fill="#FFD21D" />
          <rect x="92" y="128" width="34" height="34" rx="4" fill="#A3A3A3" stroke="white" strokeWidth="2" />
          <text x="109" y="153" textAnchor="middle" fontSize="25" fill="white" fontWeight="800">1</text>
          <rect x="117" y="76" width="34" height="34" rx="4" fill="#3B82F6" stroke="white" strokeWidth="2" />
          <text x="134" y="101" textAnchor="middle" fontSize="25" fill="white" fontWeight="800">2</text>
          <text x="36" y="35" fill="white" fontSize="16" fontWeight="800">Use exit 2</text>
          <text x="36" y="56" fill="rgba(255,255,255,.92)" fontSize="12" fontWeight="700">Stay in the left lane now</text>
        </svg>
      </div>

      <div style={{ position: "absolute", left: 18, top: 462, width: 78, height: 78, borderRadius: "50%", background: "white", boxShadow: "0 10px 28px rgba(15,23,42,.18)", display: "grid", placeItems: "center", color: "#2563EB", fontWeight: 800, whiteSpace: "pre-line", textAlign: "center", lineHeight: 1.05, fontSize: 25 }}>
        {speed}
      </div>

      <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: 178, background: "white", color: "#111827", borderRadius: 999, padding: "9px 18px", fontSize: 20, fontWeight: 750, boxShadow: "0 10px 30px rgba(15,23,42,.16)", maxWidth: 260, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {roadName}
      </div>

      <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: 220, width: 58, height: 82 }}>
        <div style={{ width: 58, height: 58, borderRadius: "50%", background: "rgba(59,130,246,.18)", display: "grid", placeItems: "center" }}>
          <div style={{ width: 27, height: 47, borderRadius: "14px 14px 10px 10px", background: "linear-gradient(180deg,#F9FAFB,#111827)", border: "2px solid white", boxShadow: "0 8px 18px rgba(15,23,42,.28)" }} />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 10,
          right: 10,
          bottom: 94,
          background: "rgba(255,255,255,.96)",
          border: "1px solid rgba(226,232,240,.9)",
          borderRadius: 22,
          boxShadow: "0 -12px 38px rgba(15,23,42,.16)",
          padding: 12,
          color: "#111827",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={openArrival} style={{ border: "none", background: "transparent", color: "#111827", width: 46, cursor: "pointer", display: "grid", placeItems: "center", fontWeight: 800 }}>
            <X size={29} />
            <span style={{ fontSize: 10 }}>Exit</span>
          </button>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 850, letterSpacing: -0.8 }}>{shownEta} min · {totalDistance}</div>
            <div style={{ color: "#4B5563", fontSize: 15, fontWeight: 700 }}>Arrive 7:09 PM · {selected.label}</div>
          </div>
          <button onClick={() => setShowTools(!showTools)} style={{ border: "none", background: "#F3F4F6", color: "#111827", borderRadius: 16, width: 50, height: 50, cursor: "pointer", fontWeight: 900 }}>
            ⋯
          </button>
        </div>

        <div style={{ marginTop: 10, borderTop: "1px solid #E5E7EB", paddingTop: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 850 }}>{instruction}</div>
          <div style={{ color: "#6B7280", fontSize: 12, marginTop: 3 }}>{subInstruction}</div>

          <button
            onClick={() => setAiOpen(true)}
            style={{ marginTop: 10, width: "100%", border: "1px solid #DBEAFE", background: "#EFF6FF", color: "#1D4ED8", borderRadius: 15, padding: 11, fontWeight: 900, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            <span>Velora AI Score</span>
            <span>{aiDecision.score}/100 · {aiDecision.confidence}</span>
          </button>

          <button
            onClick={() => setCoachOpen(true)}
            style={{ marginTop: 10, width: "100%", border: "1px solid #FACC15", background: "linear-gradient(135deg,#FFE45C,#FFC533)", color: "#111827", borderRadius: 15, padding: 12, fontWeight: 950, letterSpacing: 0.2, cursor: "pointer", boxShadow: "0 10px 22px rgba(250,204,21,.22)" }}
          >
            DO EXACTLY THIS
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 10 }}>
          <button onClick={openTraffic} style={{ border: "1px solid #DBEAFE", background: "#EFF6FF", color: "#1D4ED8", borderRadius: 14, padding: 10, fontWeight: 800, cursor: "pointer" }}>Traffic</button>
          <button onClick={() => setRoutePrefs((c) => ({ ...c, parkingFirst: !c.parkingFirst }))} style={{ border: "1px solid #DCFCE7", background: routePrefs.parkingFirst ? "#DCFCE7" : "#F0FDF4", color: "#047857", borderRadius: 14, padding: 10, fontWeight: 800, cursor: "pointer" }}>Parking</button>
          <button onClick={openShareEta} style={{ border: "1px solid #EDE9FE", background: "#F5F3FF", color: "#6D28D9", borderRadius: 14, padding: 10, fontWeight: 800, cursor: "pointer" }}>Share</button>
        </div>

        {showTools && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
            {MODES.map(({ label, Icon, color: colorKey }) => {
              const modeColor = t[colorKey];
              return (
                <button
                  key={label}
                  onClick={() => setMode(label)}
                  style={{ border: `1px solid ${mode === label ? modeColor : "#E5E7EB"}`, background: mode === label ? `${modeColor}18` : "#FFFFFF", color: mode === label ? modeColor : "#374151", borderRadius: 14, padding: 10, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                >
                  <Icon size={14} /> {label}
                </button>
              );
            })}
            <button onClick={() => setAiOpen(true)} style={{ border: "1px solid #DBEAFE", background: "#EFF6FF", color: "#1D4ED8", borderRadius: 14, padding: 10, fontWeight: 800, cursor: "pointer" }}>AI logic</button>
            <button onClick={openNearbyStops} style={{ border: "1px solid #E5E7EB", background: "#FFFFFF", color: "#374151", borderRadius: 14, padding: 10, fontWeight: 800, cursor: "pointer" }}>Stops</button>
            <button onClick={openMemory} style={{ border: "1px solid #E5E7EB", background: "#FFFFFF", color: "#374151", borderRadius: 14, padding: 10, fontWeight: 800, cursor: "pointer" }}>Remember</button>
            <button onClick={openSaveToGuide} style={{ border: "1px solid #E5E7EB", background: "#FFFFFF", color: "#374151", borderRadius: 14, padding: 10, fontWeight: 800, cursor: "pointer" }}>Save route</button>
            <button onClick={() => setRoutePrefs((c) => ({ ...c, avoidTolls: !c.avoidTolls }))} style={{ border: "1px solid #E5E7EB", background: routePrefs.avoidTolls ? "#FEF3C7" : "#FFFFFF", color: "#92400E", borderRadius: 14, padding: 10, fontWeight: 800, cursor: "pointer" }}>Avoid tolls</button>
            <button onClick={() => setVoiceGuidanceOn((v) => !v)} style={{ border: "1px solid #E5E7EB", background: voiceGuidanceOn ? "#EDE9FE" : "#FFFFFF", color: "#6D28D9", borderRadius: 14, padding: 10, fontWeight: 800, cursor: "pointer" }}>
              Voice {voiceGuidanceOn ? "on" : "off"}
            </button>
          </div>
        )}
      </div>

      {aiOpen && <AIDecisionSheet t={t} close={() => setAiOpen(false)} decision={aiDecision} destination={activeDestination} vehicle={activeVehicle} mode={mode} selectedTraffic={selectedTraffic} />}

      {coachOpen && (
        <DriverCoachSheet
          t={t}
          close={() => setCoachOpen(false)}
          destination={activeDestination}
          instruction={instruction}
          subInstruction={subInstruction}
          steps={driverSteps}
          unitPref={unitPref}
          selectedTraffic={selectedTraffic}
          allowed={allowed}
        />
      )}
    </div>
  );
}

function AIDecisionSheet({
  t,
  close,
  decision,
  destination,
  vehicle,
  mode,
  selectedTraffic,
}: {
  t: ThemeTokens;
  close: () => void;
  decision: AiDecision;
  destination: Destination;
  vehicle: Vehicle;
  mode: DrivingMode;
  selectedTraffic: TrafficEvent | null;
}) {
  const passed = canEnter(vehicle, destination);

  return (
    <Sheet t={t} close={close} title="Velora AI Decision" subtitle="Why Velora chose this route, in plain English.">
      <Card t={t} style={{ background: `linear-gradient(135deg, ${t.panel}, ${t.panel2})` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 82,
              height: 82,
              borderRadius: "50%",
              border: `8px solid ${decision.score >= 85 ? t.green : decision.score >= 70 ? t.gold : t.red}`,
              display: "grid",
              placeItems: "center",
              color: t.text,
              fontSize: 24,
              fontWeight: 950,
              flexShrink: 0,
            }}
          >
            {decision.score}
          </div>
          <div>
            <div style={{ color: t.text, fontSize: 20, fontWeight: 900 }}>Velora Score</div>
            <div style={{ color: t.muted, fontSize: 13, lineHeight: 1.4, marginTop: 5 }}>
              {decision.confidence} confidence · {mode} route to {destination.name}
            </div>
            <div style={{ marginTop: 9 }}>
              <Pill color={passed ? t.green : t.gold}>
                <ShieldCheck size={13} />
                {passed ? "Zone passed" : "Park before zone"}
              </Pill>
            </div>
          </div>
        </div>
      </Card>

      <div style={{ color: t.soft, fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", margin: "18px 0 9px" }}>Route scores</div>

      <div style={{ display: "grid", gap: 9 }}>
        {decision.metrics.map((metric) => (
          <div key={metric.label} style={{ border: `1px solid ${t.border}`, background: t.panel2, borderRadius: 16, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: t.text, fontWeight: 850, fontSize: 13 }}>
              <span>{metric.label}</span>
              <span>{metric.value}/100</span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: `${t.soft}30`, overflow: "hidden", marginTop: 8 }}>
              <div style={{ width: `${metric.value}%`, height: "100%", borderRadius: 999, background: metric.value >= 85 ? t.green : metric.value >= 70 ? t.gold : t.red }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ color: t.soft, fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", margin: "18px 0 9px" }}>Why this?</div>

      <div style={{ display: "grid", gap: 9 }}>
        {decision.reasons.map((reason, index) => (
          <div key={reason} style={{ display: "flex", gap: 10, alignItems: "flex-start", border: `1px solid ${t.border}`, background: t.panel2, borderRadius: 16, padding: 12 }}>
            <div style={{ width: 25, height: 25, borderRadius: "50%", display: "grid", placeItems: "center", background: `${t.purple}18`, color: t.purple, fontWeight: 950, flexShrink: 0 }}>{index + 1}</div>
            <div style={{ color: t.text, fontSize: 13, lineHeight: 1.42, fontWeight: 650 }}>{reason}</div>
          </div>
        ))}
      </div>

      <NoticeCard t={t} color={decision.confidence === "High" ? t.green : t.gold} Icon={Brain} title={`${decision.confidence} confidence`} text={decision.confidenceReason} />

      {selectedTraffic && <NoticeCard t={t} color={t.red} Icon={TrafficCone} title="Traffic is being watched" text="Velora will only interrupt you if the reroute is clearly better." />}
    </Sheet>
  );
}

function DriverCoachSheet({
  t,
  close,
  destination,
  instruction,
  subInstruction,
  steps,
  unitPref,
  selectedTraffic,
  allowed,
}: {
  t: ThemeTokens;
  close: () => void;
  destination: Destination;
  instruction: string;
  subInstruction: string;
  steps: string[];
  unitPref: UnitPref;
  selectedTraffic: TrafficEvent | null;
  allowed: boolean;
}) {
  const nextRoad = destination.area === "Centro" ? "Calle Mayor" : "Lime Kiln Road";
  const exitNumber = selectedTraffic ? "Reroute" : allowed ? "Exit 2" : "Garage first";

  return (
    <Sheet t={t} close={close} title="Do Exactly This" subtitle="Velora explains the road like you have never seen it before.">
      <Card t={t} style={{ background: "#101827", borderColor: "#1F2937", color: "white" }}>
        <div style={{ color: "#FACC15", fontSize: 11, fontWeight: 950, letterSpacing: 2.2, textTransform: "uppercase" }}>Next move</div>
        <div style={{ fontSize: 24, lineHeight: 1.05, fontWeight: 950, marginTop: 9 }}>{instruction}</div>
        <div style={{ color: "rgba(255,255,255,.72)", fontSize: 13, lineHeight: 1.4, marginTop: 9 }}>{subInstruction}</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 15 }}>
          <div style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 15, padding: 11 }}>
            <div style={{ color: "rgba(255,255,255,.55)", fontSize: 11, fontWeight: 800 }}>Target</div>
            <div style={{ fontSize: 17, fontWeight: 900, marginTop: 4 }}>{exitNumber}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 15, padding: 11 }}>
            <div style={{ color: "rgba(255,255,255,.55)", fontSize: 11, fontWeight: 800 }}>Then road</div>
            <div style={{ fontSize: 17, fontWeight: 900, marginTop: 4 }}>{nextRoad}</div>
          </div>
        </div>
      </Card>

      <div style={{ color: t.soft, fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", margin: "18px 0 9px" }}>Step-by-step</div>

      <div style={{ display: "grid", gap: 10 }}>
        {steps.map((step, index) => (
          <div key={step} style={{ border: `1px solid ${index === 0 ? "#FACC15" : t.border}`, background: index === 0 ? "rgba(250,204,21,.12)" : t.panel2, borderRadius: 18, padding: 13, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ width: 31, height: 31, borderRadius: "50%", background: index === 0 ? "#FACC15" : `${t.purple}18`, color: index === 0 ? "#111827" : t.purple, display: "grid", placeItems: "center", fontWeight: 950, flexShrink: 0 }}>{index + 1}</div>
            <div>
              <div style={{ color: t.text, fontWeight: 850, lineHeight: 1.25 }}>{step}</div>
              {index === 0 && <div style={{ color: t.muted, fontSize: 12, marginTop: 5 }}>This is the only thing you need to focus on right now.</div>}
            </div>
          </div>
        ))}
      </div>

      <NoticeCard
        t={t}
        color={t.blue}
        Icon={Navigation2}
        title="Simple-driver rule"
        text={`Velora gives one instruction at a time, early enough to react, using ${unitPref === "km" ? "meters and kilometers" : "feet and miles"}.`}
      />
    </Sheet>
  );
}

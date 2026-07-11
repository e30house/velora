import { useState } from "react";
import { ChevronRight, Sparkles } from "lucide-react";
import { askVelora, type AskVeloraAnswer, type VeloraAction } from "../lib/askVelora";
import { findDestination } from "../lib/helpers";
import { Pill, Sheet } from "../components/ui";
import type { Destination, Plan, RoutePrefs, ThemeTokens, TrafficEvent, TripMemory, UnitPref, Vehicle } from "../types";

interface ChatMessage {
  role: "user" | "assistant";
  title?: string;
  text: string;
  confidence?: "High" | "Medium";
  action?: VeloraAction;
  actionLabel?: string;
  source?: "claude" | "fallback";
}

const SUGGESTIONS = ["Find easier parking", "Give me a calmer route", "Why this route?", "Plan a date night", "Check my range", "Take me to the airport"];

export function AskVeloraSheet({
  t,
  close,
  destination,
  vehicle,
  routePrefs,
  setRoutePrefs,
  selectedTraffic,
  tripMemory,
  activePlan,
  unitPref,
  openDestination,
  goJourney,
  goGarage,
  openAIScore,
}: {
  t: ThemeTokens;
  close: () => void;
  destination: Destination;
  vehicle: Vehicle;
  routePrefs: RoutePrefs;
  setRoutePrefs: React.Dispatch<React.SetStateAction<RoutePrefs>>;
  selectedTraffic: TrafficEvent | null;
  tripMemory: TripMemory | null;
  activePlan: Plan | null;
  unitPref: UnitPref;
  openDestination: (destination: Destination) => void;
  goJourney: () => void;
  goGarage: () => void;
  openAIScore: () => void;
}) {
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      title: "Ready",
      text: `I'm watching the route to ${destination.name}. Ask me what to do, why I chose it, or how to make it easier.`,
      confidence: "High",
    },
  ]);

  async function submitPrompt(promptText: string) {
    const value = promptText.trim();
    if (!value || pending) return;

    setMessages((current) => [...current, { role: "user", text: value }]);
    setInput("");
    setPending(true);

    try {
      const answer: AskVeloraAnswer = await askVelora({
        prompt: value,
        destination,
        vehicle,
        prefs: routePrefs,
        trafficEvent: selectedTraffic,
        tripMemory,
        activePlan,
        unitPref,
      });
      setMessages((current) => [...current, { role: "assistant", ...answer }]);
    } catch {
      setMessages((current) => [
        ...current,
        { role: "assistant", title: "Connection issue", text: "I couldn't reach Velora's brain just now. Check that the API server is running and try again.", confidence: "Medium" },
      ]);
    } finally {
      setPending(false);
    }
  }

  function applyAction(message: ChatMessage) {
    if (message.action === "parking") {
      setRoutePrefs((current) => ({ ...current, parkingFirst: true }));
      goJourney();
      close();
      return;
    }
    if (message.action === "scenic") {
      goJourney();
      close();
      return;
    }
    if (message.action === "date") {
      openDestination(findDestination("Luna Rooftop"));
      close();
      return;
    }
    if (message.action === "airport") {
      openDestination(findDestination("Madrid Airport"));
      close();
      return;
    }
    if (message.action === "garage") {
      goGarage();
      close();
      return;
    }
    if (message.action === "score") {
      openAIScore();
      close();
      return;
    }
    goJourney();
    close();
  }

  return (
    <Sheet t={t} close={close} title="Ask Velora" subtitle="A contextual travel assistant, not a generic chatbot.">
      <div style={{ display: "grid", gap: 10, maxHeight: 390, overflowY: "auto", paddingRight: 2 }}>
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            style={{
              marginLeft: message.role === "user" ? 34 : 0,
              marginRight: message.role === "assistant" ? 20 : 0,
              border: `1px solid ${message.role === "assistant" ? `${t.purple}40` : t.border}`,
              background: message.role === "assistant" ? `${t.purple}12` : t.panel2,
              borderRadius: message.role === "assistant" ? "18px 18px 18px 6px" : "18px 18px 6px 18px",
              padding: 12,
            }}
          >
            {message.title && <div style={{ color: t.text, fontWeight: 850, fontSize: 13 }}>{message.title}</div>}
            <div style={{ color: message.role === "assistant" ? t.text : t.muted, fontSize: 13, lineHeight: 1.45, marginTop: message.title ? 5 : 0 }}>{message.text}</div>

            {message.role === "assistant" && message.confidence && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <Pill color={message.confidence === "High" ? t.green : t.gold}>{message.confidence} confidence</Pill>
                  {message.source && (
                    <Pill color={message.source === "claude" ? t.purple : t.soft}>
                      {message.source === "claude" ? "Claude" : "Prototype logic"}
                    </Pill>
                  )}
                </div>
                {message.actionLabel && (
                  <button
                    onClick={() => applyAction(message)}
                    style={{ border: `1px solid ${t.purple}45`, background: `${t.purple}16`, color: t.purple, borderRadius: 999, padding: "7px 10px", fontSize: 11, fontWeight: 850, cursor: "pointer" }}
                  >
                    {message.actionLabel}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {pending && (
          <div style={{ marginRight: 20, border: `1px solid ${t.purple}40`, background: `${t.purple}12`, borderRadius: "18px 18px 18px 6px", padding: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={14} color={t.purple} />
            <span style={{ color: t.muted, fontSize: 13 }}>Velora is thinking…</span>
          </div>
        )}
      </div>

      <div style={{ color: t.soft, fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", margin: "18px 0 9px" }}>Try asking</div>
      <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 4 }}>
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => submitPrompt(suggestion)}
            disabled={pending}
            style={{ border: `1px solid ${t.border}`, background: t.panel2, color: t.text, borderRadius: 999, padding: "8px 11px", fontSize: 11.5, fontWeight: 750, whiteSpace: "nowrap", cursor: pending ? "default" : "pointer", opacity: pending ? 0.6 : 1 }}
          >
            {suggestion}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 14, border: `1px solid ${t.border}`, background: t.panel2, borderRadius: 18, padding: 8, display: "flex", gap: 8, alignItems: "center" }}>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") submitPrompt(input);
          }}
          placeholder="Ask Velora anything about this journey"
          style={{ flex: 1, border: "none", outline: "none", background: "transparent", color: t.text, padding: "8px 7px", fontSize: 13 }}
        />
        <button
          onClick={() => submitPrompt(input)}
          disabled={pending}
          style={{ width: 40, height: 40, borderRadius: 13, border: "none", background: t.purple, color: "white", display: "grid", placeItems: "center", cursor: pending ? "default" : "pointer", opacity: pending ? 0.6 : 1 }}
        >
          <ChevronRight size={19} />
        </button>
      </div>

      <div style={{ color: t.soft, fontSize: 10.5, lineHeight: 1.4, marginTop: 10 }}>
        Answers come from Claude when the Velora API has a key configured, and fall back to built-in logic otherwise — the badge on each answer shows which one responded.
      </div>
    </Sheet>
  );
}

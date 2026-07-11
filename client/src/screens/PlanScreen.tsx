import { useState } from "react";
import { Building2, CalendarDays, Sparkles, Timer, Wallet } from "lucide-react";
import { askVeloraIdeas } from "../data/askVeloraIdeas";
import { plannerTemplates } from "../data/plans";
import { destinations } from "../data/destinations";
import { color, findDestination, planStats } from "../lib/helpers";
import { Card, IconBadge, NoticeCard, Pill, ScreenTitle, SectionLabel } from "../components/ui";
import type { AskVeloraIdea, Destination, Plan, ThemeTokens } from "../types";

interface PlanScreenProps {
  t: ThemeTokens;
  activePlan: Plan | null;
  planStopIndex: number;
  setActivePlan: (plan: Plan) => void;
  startPlan: (plan: Plan) => void;
  openDestination: (destination: Destination) => void;
}

export function PlanScreen({ t, activePlan, planStopIndex, setActivePlan, startPlan, openDestination }: PlanScreenProps) {
  const [askAnswer, setAskAnswer] = useState<AskVeloraIdea>(askVeloraIdeas[0]!);
  const [customStops, setCustomStops] = useState<string[]>(["Fern & Copper", "Garage near Sol", "Luna Rooftop"]);
  const stats = planStats(customStops);

  function addStop(name: string) {
    if (!customStops.includes(name)) setCustomStops((current) => [...current, name]);
  }

  function removeStop(name: string) {
    setCustomStops((current) => current.filter((item) => item !== name));
  }

  function saveCustomPlan() {
    setActivePlan({
      title: "Custom trip",
      prompt: "Built with Ask Velora",
      stops: customStops,
      color: "purple",
      Icon: Sparkles,
    });
  }

  return (
    <div className="screen-scroll">
      <ScreenTitle t={t} title="Plan" subtitle="Ask Velora to build a full trip before you leave." />

      <Card t={t}>
        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <IconBadge color={t.purple}>
            <Sparkles size={21} />
          </IconBadge>
          <div>
            <div style={{ color: t.text, fontWeight: 600, fontSize: 18 }}>Ask Velora</div>
            <div style={{ color: t.muted, fontSize: 13, marginTop: 4 }}>Choose a request and Velora will suggest a route.</div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
          {askVeloraIdeas.map((idea) => {
            const Icon = idea.Icon;
            return (
              <button
                key={idea.title}
                onClick={() => setAskAnswer(idea)}
                style={{
                  border: `1px solid ${askAnswer.title === idea.title ? color(t, idea.color) : t.border}`,
                  background: askAnswer.title === idea.title ? `${color(t, idea.color)}18` : t.panel2,
                  color: t.text,
                  borderRadius: 17,
                  padding: 13,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  textAlign: "left",
                }}
              >
                <IconBadge color={color(t, idea.color)}>
                  <Icon size={20} />
                </IconBadge>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{idea.title}</div>
                  <div style={{ color: t.muted, fontSize: 12, marginTop: 4 }}>{idea.answer}</div>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => openDestination(findDestination(askAnswer.destination))}
          style={{ marginTop: 14, width: "100%", border: "none", borderRadius: 17, padding: 14, background: t.purple, color: "white", fontWeight: 600, cursor: "pointer" }}
        >
          Open Velora suggestion
        </button>
      </Card>

      <SectionLabel t={t}>Trip templates</SectionLabel>

      <div style={{ display: "grid", gap: 12 }}>
        {plannerTemplates.map((template) => {
          const Icon = template.Icon;
          const s = planStats(template.stops);

          return (
            <Card key={template.title} t={t}>
              <div style={{ display: "flex", gap: 13, alignItems: "center" }}>
                <IconBadge color={color(t, template.color)}>
                  <Icon size={21} />
                </IconBadge>

                <div style={{ flex: 1 }}>
                  <div style={{ color: t.text, fontWeight: 600, fontSize: 18 }}>{template.title}</div>
                  <div style={{ color: t.muted, fontSize: 13, marginTop: 4 }}>{template.prompt}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                <Pill color={t.blue}>
                  <Timer size={13} />
                  {s.eta} min
                </Pill>
                <Pill color={t.green}>
                  <Wallet size={13} />
                  ~€{s.cost}
                </Pill>
                <Pill color={s.hardParking ? t.gold : t.green}>
                  <Building2 size={13} />
                  {s.hardParking ? "Parking plan needed" : "Parking easy"}
                </Pill>
              </div>

              <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
                {template.stops.map((name, index) => {
                  const place = findDestination(name);
                  const StopIcon = place.Icon;
                  return (
                    <div key={name} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${t.purple}20`, color: t.purple, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 600 }}>
                        {index + 1}
                      </div>
                      <StopIcon size={16} color={color(t, place.color)} />
                      <div style={{ color: t.text, fontWeight: 500, fontSize: 13 }}>{name}</div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => startPlan(template)}
                style={{ marginTop: 14, width: "100%", border: "none", borderRadius: 16, padding: 13, background: t.purple, color: "white", fontWeight: 600, cursor: "pointer" }}
              >
                Start trip
              </button>
            </Card>
          );
        })}
      </div>

      <SectionLabel t={t}>Custom multi-stop plan</SectionLabel>

      <Card t={t}>
        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <IconBadge color={t.blue}>
            <CalendarDays size={21} />
          </IconBadge>
          <div>
            <div style={{ color: t.text, fontWeight: 600, fontSize: 18 }}>Your timeline</div>
            <div style={{ color: t.muted, fontSize: 13, marginTop: 4 }}>Add or remove stops before starting.</div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
          {customStops.map((name, index) => {
            const place = findDestination(name);
            const StopIcon = place.Icon;

            return (
              <div key={name} style={{ border: `1px solid ${t.border}`, background: t.panel2, borderRadius: 16, padding: 12, display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 25, height: 25, borderRadius: "50%", background: `${t.purple}20`, color: t.purple, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 600 }}>
                  {index + 1}
                </div>
                <StopIcon size={17} color={color(t, place.color)} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: t.text, fontWeight: 600 }}>{name}</div>
                  <div style={{ color: t.muted, fontSize: 12 }}>{place.eta} min · ~€{place.cost}</div>
                </div>
                <button
                  onClick={() => removeStop(name)}
                  style={{ border: `1px solid ${t.border}`, background: t.panel, color: t.muted, borderRadius: 10, padding: "6px 8px", cursor: "pointer" }}
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
          <Pill color={t.blue}>
            <Timer size={13} />
            {stats.eta} min total
          </Pill>
          <Pill color={t.green}>
            <Wallet size={13} />
            ~€{stats.cost}
          </Pill>
          <Pill color={stats.hardParking ? t.gold : t.green}>
            <Building2 size={13} />
            {stats.hardParking ? "Parking first suggested" : "Efficient"}
          </Pill>
        </div>

        <SectionLabel t={t}>Add a stop</SectionLabel>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {destinations
            .filter((d) => !customStops.includes(d.name))
            .slice(0, 4)
            .map((place) => (
              <button
                key={place.name}
                onClick={() => addStop(place.name)}
                style={{ border: `1px solid ${t.border}`, background: t.panel2, color: t.text, borderRadius: 14, padding: 10, cursor: "pointer", fontWeight: 600, fontSize: 12 }}
              >
                + {place.name}
              </button>
            ))}
        </div>

        <button
          onClick={() => {
            saveCustomPlan();
            startPlan({ title: "Custom trip", stops: customStops, color: "purple", Icon: Sparkles });
          }}
          style={{ marginTop: 14, width: "100%", border: "none", borderRadius: 17, padding: 14, background: t.purple, color: "white", fontWeight: 600, cursor: "pointer" }}
        >
          Start custom trip
        </button>
      </Card>

      {activePlan && (
        <NoticeCard t={t} color={t.purple} Icon={Sparkles} title={`Active plan · stop ${planStopIndex + 1} of ${activePlan.stops.length}`} text={activePlan.stops.join(" → ")} />
      )}
    </div>
  );
}

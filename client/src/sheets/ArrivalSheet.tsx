import { Building2, CalendarDays, MapPin } from "lucide-react";
import { NoticeCard, Sheet } from "../components/ui";
import type { Destination, Plan, ThemeTokens } from "../types";

export function ArrivalSheet({
  t,
  destination,
  close,
  saveParkedCar,
  activePlan,
  planStopIndex,
  continueToNextStop,
}: {
  t: ThemeTokens;
  destination: Destination;
  close: () => void;
  saveParkedCar: () => void;
  activePlan: Plan | null;
  planStopIndex: number;
  continueToNextStop: () => void;
}) {
  const hasNextStop = Boolean(activePlan && planStopIndex < activePlan.stops.length - 1);
  const nextStopName = hasNextStop && activePlan ? activePlan.stops[planStopIndex + 1] : null;

  return (
    <Sheet t={t} close={close} title={`Arriving near ${destination.name}`} subtitle="Parking and walking route ready.">
      <NoticeCard t={t} color={t.green} Icon={Building2} title="Recommended garage" text="Level 3 · Section B12 · 2 min walk" />
      <NoticeCard t={t} color={t.blue} Icon={MapPin} title="Walking entrance" text="Use the east exit. It is the shortest walk." />

      {activePlan && (
        <NoticeCard
          t={t}
          color={t.purple}
          Icon={CalendarDays}
          title={`${activePlan.title} · stop ${planStopIndex + 1} of ${activePlan.stops.length}`}
          text={nextStopName ? `Next: ${nextStopName}` : "This is the last stop on your plan."}
        />
      )}

      {hasNextStop && nextStopName && (
        <button
          onClick={continueToNextStop}
          style={{ marginTop: 16, width: "100%", border: "none", borderRadius: 17, padding: 14, background: t.purple, color: "white", fontWeight: 600, cursor: "pointer" }}
        >
          Continue to {nextStopName}
        </button>
      )}

      <button
        onClick={saveParkedCar}
        style={{
          marginTop: hasNextStop ? 10 : 16,
          width: "100%",
          border: hasNextStop ? `1px solid ${t.border}` : "none",
          background: hasNextStop ? t.panel2 : t.purple,
          color: hasNextStop ? t.text : "white",
          borderRadius: 17,
          padding: 14,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Save parked car
      </button>
    </Sheet>
  );
}

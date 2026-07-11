import { AlertTriangle, Building2, Route, ShieldCheck, Star } from "lucide-react";
import { canEnter, color } from "../lib/helpers";
import { IconBadge, MiniStat, NoticeCard, Sheet } from "../components/ui";
import type { Destination, ThemeTokens, Vehicle } from "../types";

export function DestinationSheet({
  t,
  destination,
  close,
  startRoute,
  saved,
  toggleSave,
  activeVehicle,
}: {
  t: ThemeTokens;
  destination: Destination;
  close: () => void;
  startRoute: (destination: Destination) => void;
  saved: boolean;
  toggleSave: (name: string) => void;
  activeVehicle: Vehicle;
}) {
  const destinationColor = color(t, destination.color);
  const Icon = destination.Icon;
  const allowed = canEnter(activeVehicle, destination);
  const parkingColor = destination.parking === "Easy" ? t.green : destination.parking === "Moderate" ? t.gold : t.red;

  return (
    <Sheet t={t} close={close} title={destination.name} subtitle={`${destination.type} · ${destination.area}`}>
      <div style={{ display: "flex", gap: 13, alignItems: "center", marginBottom: 14 }}>
        <IconBadge color={destinationColor}>
          <Icon size={22} />
        </IconBadge>
        <div style={{ color: t.muted, fontSize: 13, lineHeight: 1.45 }}>{destination.note}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <MiniStat t={t} label="Drive" value={`${destination.eta} min`} />
        <MiniStat t={t} label="Budget" value={`~€${destination.cost}`} />
      </div>

      <NoticeCard t={t} color={parkingColor} Icon={Building2} title={`Parking looks ${destination.parking.toLowerCase()}`} text={destination.parkingDetail} />
      <NoticeCard
        t={t}
        color={allowed ? t.green : t.gold}
        Icon={allowed ? ShieldCheck : AlertTriangle}
        title={allowed ? "Zone check passed" : "Zone restriction"}
        text={allowed ? `${activeVehicle.name} can enter this area.` : `${activeVehicle.name} may be restricted here. Park outside and walk in.`}
      />

      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <button
          onClick={() => startRoute(destination)}
          style={{ flex: 1, border: "none", borderRadius: 17, padding: 14, background: t.purple, color: "white", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          <Route size={18} />
          Start route
        </button>

        <button
          onClick={() => toggleSave(destination.name)}
          style={{ width: 54, borderRadius: 17, border: `1px solid ${saved ? t.gold : t.border}`, background: saved ? `${t.gold}18` : t.panel2, color: saved ? t.gold : t.text, cursor: "pointer", display: "grid", placeItems: "center" }}
        >
          <Star size={20} fill={saved ? t.gold : "none"} />
        </button>
      </div>
    </Sheet>
  );
}

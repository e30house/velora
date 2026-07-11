import { FileText, MapPin, Plus, ShieldCheck, Wrench, Zap, Fuel } from "lucide-react";
import { color, formatRange } from "../lib/helpers";
import { Card, IconBadge, NoticeCard, Pill, ScreenTitle } from "../components/ui";
import type { ThemeTokens, UnitPref, Vehicle } from "../types";

interface GarageScreenProps {
  t: ThemeTokens;
  vehicles: Vehicle[];
  activeVehicle: Vehicle;
  setActiveVehicleId: (id: string) => void;
  openAddVehicle: () => void;
  removeVehicle: (id: string) => void;
  unitPref: UnitPref;
}

export function GarageScreen({ t, vehicles, activeVehicle, setActiveVehicleId, openAddVehicle, removeVehicle, unitPref }: GarageScreenProps) {
  const VehicleIcon = activeVehicle.Icon;
  const vehicleColor = color(t, activeVehicle.color);

  return (
    <div className="screen-scroll">
      <ScreenTitle t={t} title="Garage" subtitle={`${activeVehicle.name} is selected for your routes.`} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        {vehicles.map((vehicle) => {
          const Icon = vehicle.Icon;
          const vColor = color(t, vehicle.color);
          const active = vehicle.id === activeVehicle.id;

          return (
            <button
              key={vehicle.id}
              onClick={() => setActiveVehicleId(vehicle.id)}
              style={{
                border: `1px solid ${active ? vColor : t.border}`,
                background: active ? `${vColor}16` : t.panel,
                color: t.text,
                borderRadius: 18,
                padding: 13,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <IconBadge color={vColor}>
                <Icon size={20} />
              </IconBadge>
              <div style={{ fontWeight: 600, marginTop: 10 }}>{vehicle.name}</div>
              <div style={{ color: t.muted, fontSize: 12, marginTop: 4 }}>
                {vehicle.year} · {vehicle.type} · {formatRange(vehicle, unitPref)}
              </div>
            </button>
          );
        })}

        <button
          onClick={openAddVehicle}
          style={{ border: `1px dashed ${t.border}`, background: t.panel, color: t.text, borderRadius: 18, padding: 13, cursor: "pointer", textAlign: "left" }}
        >
          <IconBadge color={t.purple}>
            <Plus size={20} />
          </IconBadge>
          <div style={{ fontWeight: 600, marginTop: 10 }}>Add car</div>
          <div style={{ color: t.muted, fontSize: 12, marginTop: 4 }}>Register EV or gas</div>
        </button>
      </div>

      <Card t={t}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}>
          <div>
            <div style={{ color: t.text, fontSize: 24, fontWeight: 600 }}>
              {activeVehicle.name} · {activeVehicle.year}
            </div>
            <div style={{ color: t.muted, fontSize: 13, marginTop: 6 }}>
              {activeVehicle.type} · {formatRange(activeVehicle, unitPref)} range
            </div>
          </div>
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: "50%",
              border: `8px solid ${t.border}`,
              display: "grid",
              placeItems: "center",
              color: vehicleColor,
              fontWeight: 600,
              fontSize: 18,
              boxShadow: `inset 0 0 0 7px ${vehicleColor}55`,
              flexShrink: 0,
            }}
          >
            {activeVehicle.level}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 18 }}>
          <Pill color={vehicleColor}>
            <VehicleIcon size={14} />
            {activeVehicle.type}
          </Pill>
          <Pill color={activeVehicle.compliance === "compliant" ? t.green : t.gold}>
            <ShieldCheck size={14} />
            {activeVehicle.zoneLabel}
          </Pill>
        </div>

        {vehicles.length > 1 && (
          <button
            onClick={() => removeVehicle(activeVehicle.id)}
            style={{ marginTop: 14, width: "100%", border: `1px solid ${t.border}`, background: t.panel2, color: t.red, borderRadius: 15, padding: 12, fontWeight: 600, cursor: "pointer" }}
          >
            Remove this car
          </button>
        )}
      </Card>

      <NoticeCard t={t} color={activeVehicle.compliance === "compliant" ? t.green : t.gold} Icon={MapPin} title="Zone access" text={activeVehicle.note} />
      <NoticeCard
        t={t}
        color={activeVehicle.type === "Electric" ? t.green : t.gold}
        Icon={activeVehicle.type === "Electric" ? Zap : Fuel}
        title={activeVehicle.type === "Electric" ? "Charge after 11:00 PM" : "Best time to fill"}
        text={activeVehicle.type === "Electric" ? "Electricity is usually cheaper overnight." : "Fuel prices are usually lower before weekend travel."}
      />
      <NoticeCard t={t} color={t.gold} Icon={Wrench} title="Maintenance" text={activeVehicle.type === "Electric" ? "Tire rotation due soon." : "Oil service due soon."} />
      <NoticeCard t={t} color={t.purple} Icon={FileText} title="Documents" text="Insurance active · registration renews in 42 days." />
    </div>
  );
}

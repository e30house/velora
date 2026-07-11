import { useState } from "react";
import { makeVehicle } from "../lib/helpers";
import { Sheet } from "../components/ui";
import type { ThemeTokens, Vehicle } from "../types";

export function VehicleFormSheet({
  t,
  close,
  addVehicle,
}: {
  t: ThemeTokens;
  close: () => void;
  addVehicle: (vehicle: Vehicle) => void;
}) {
  const [name, setName] = useState("");
  const [year, setYear] = useState("2024");
  const [type, setType] = useState<"Electric" | "Gas">("Electric");
  const [rangeMi, setRangeMi] = useState("280");
  const [level, setLevel] = useState("80%");

  function submit() {
    const vehicle = makeVehicle({ name, year, type, rangeMi, level });
    addVehicle(vehicle);
    close();
  }

  const inputStyle = {
    width: "100%",
    border: `1px solid ${t.border}`,
    background: t.panel2,
    color: t.text,
    borderRadius: 15,
    padding: "12px 14px",
    fontSize: 13.5,
    outline: "none",
  } as const;

  return (
    <Sheet t={t} close={close} title="Register a new car" subtitle="Velora uses this for range, parking, and low-emission checks.">
      <div style={{ display: "grid", gap: 10 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Car name, e.g. BMW 330e" style={inputStyle} />
        <input value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year" style={inputStyle} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {(["Electric", "Gas"] as const).map((item) => {
            const active = type === item;
            return (
              <button
                key={item}
                onClick={() => {
                  setType(item);
                  setRangeMi(item === "Electric" ? "280" : "340");
                  setLevel(item === "Electric" ? "80%" : "55%");
                }}
                style={{ border: `1px solid ${active ? `${t.purple}55` : t.border}`, background: active ? `${t.purple}14` : t.panel2, color: active ? t.purple : t.text, borderRadius: 15, padding: 12, cursor: "pointer", fontWeight: 600 }}
              >
                {item}
              </button>
            );
          })}
        </div>

        <input value={rangeMi} onChange={(e) => setRangeMi(e.target.value)} placeholder="Range in miles" inputMode="numeric" style={inputStyle} />
        <input value={level} onChange={(e) => setLevel(e.target.value)} placeholder="Battery or fuel level, e.g. 73%" style={inputStyle} />

        <button
          onClick={submit}
          style={{ border: "none", background: `linear-gradient(135deg, ${t.purple}, ${t.blue})`, color: "#0D0F16", borderRadius: 16, padding: 14, fontWeight: 600, cursor: "pointer" }}
        >
          Add car to Garage
        </button>
      </div>
    </Sheet>
  );
}

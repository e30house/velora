import { useState } from "react";
import { Navigation2 } from "lucide-react";
import { ListButton, Sheet } from "../components/ui";
import type { ParkedCar, ThemeTokens } from "../types";

export function ParkedCarSheet({
  t,
  parkedCar,
  close,
  clearParkedCar,
}: {
  t: ThemeTokens;
  parkedCar: ParkedCar;
  close: () => void;
  clearParkedCar: () => void;
}) {
  const [note, setNote] = useState(parkedCar.note || "");

  return (
    <Sheet t={t} close={close} title="Parked Car" subtitle="Velora saved this automatically when you parked.">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ background: t.panel, border: `1px solid ${t.border}`, borderRadius: 22, padding: 17 }}>
          <div style={{ color: t.muted, fontSize: 11, fontWeight: 600, letterSpacing: 1.2, textTransform: "uppercase" }}>Location</div>
          <div style={{ color: t.text, fontSize: 16, fontWeight: 600, marginTop: 6 }}>{parkedCar.location}</div>
        </div>
        <div style={{ background: t.panel, border: `1px solid ${t.border}`, borderRadius: 22, padding: 17 }}>
          <div style={{ color: t.muted, fontSize: 11, fontWeight: 600, letterSpacing: 1.2, textTransform: "uppercase" }}>Walk back</div>
          <div style={{ color: t.text, fontSize: 16, fontWeight: 600, marginTop: 6 }}>{parkedCar.walk}</div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note — level, section, landmark…"
          style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${t.border}`, background: t.panel2, color: t.text, borderRadius: 15, padding: "13px 14px", fontSize: 14, outline: "none" }}
        />
      </div>

      <div style={{ display: "grid", gap: 9, marginTop: 12 }}>
        <ListButton t={t} color={t.blue} Icon={Navigation2} title="Walk me to my car" detail={`${parkedCar.walk} · turn-by-turn walking`} onClick={close} />
        <button
          onClick={() => {
            clearParkedCar();
            close();
          }}
          style={{ border: `1px solid ${t.border}`, background: t.panel2, color: t.red, borderRadius: 15, padding: 12, fontWeight: 600, cursor: "pointer" }}
        >
          Clear parked location
        </button>
      </div>
    </Sheet>
  );
}

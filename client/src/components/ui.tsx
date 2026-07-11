import type { CSSProperties, ReactNode } from "react";
import { CheckCircle2, ChevronRight, X } from "lucide-react";
import type { IconType, ThemeTokens } from "../types";

export function IconBadge({ color, children }: { color: string; children: ReactNode }) {
  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 14,
        background: `${color}18`,
        border: `1px solid ${color}40`,
        display: "grid",
        placeItems: "center",
        color,
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
}

export function Pill({ children, color }: { children: ReactNode; color: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        borderRadius: 999,
        background: `${color}16`,
        color,
        border: `1px solid ${color}35`,
        fontSize: 12,
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

export function Card({
  t,
  children,
  style = {},
  onClick,
}: {
  t: ThemeTokens;
  children: ReactNode;
  style?: CSSProperties;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: t.panel,
        border: `1px solid ${t.border}`,
        borderRadius: 22,
        padding: 17,
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function SectionLabel({ t, children }: { t: ThemeTokens; children: ReactNode }) {
  return (
    <div
      style={{
        color: t.soft,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 2,
        textTransform: "uppercase",
        margin: "18px 0 9px",
      }}
    >
      {children}
    </div>
  );
}

export function PhoneStatus({ t }: { t: ThemeTokens }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 14,
        left: 24,
        right: 24,
        zIndex: 20,
        display: "flex",
        justifyContent: "space-between",
        color: t.text,
        fontSize: 12,
        fontWeight: 500,
        fontFamily: "'IBM Plex Mono', monospace",
        pointerEvents: "none",
      }}
    >
      <span>9:41</span>
      <span>••• ▯</span>
    </div>
  );
}

export function ScreenTitle({ t, title, subtitle }: { t: ThemeTokens; title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ color: t.soft, fontSize: 11, fontWeight: 500, letterSpacing: 3, textTransform: "uppercase", fontFamily: "'IBM Plex Mono', monospace" }}>
        Velora
      </div>
      <h1 style={{ margin: "8px 0 0", fontSize: 30, lineHeight: 1.08, color: t.text, letterSpacing: -1 }}>{title}</h1>
      <p style={{ margin: "8px 0 0", maxWidth: 300, color: t.muted, fontSize: 14, lineHeight: 1.4, fontWeight: 400 }}>{subtitle}</p>
    </div>
  );
}

export function NoticeCard({
  t,
  color,
  Icon,
  title,
  text,
}: {
  t: ThemeTokens;
  color: string;
  Icon: IconType;
  title: string;
  text: string;
}) {
  return (
    <Card t={t} style={{ marginTop: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
        <IconBadge color={color}>
          <Icon size={21} />
        </IconBadge>
        <div style={{ flex: 1 }}>
          <div style={{ color: t.text, fontWeight: 600 }}>{title}</div>
          <div style={{ color: t.muted, fontSize: 13, marginTop: 4 }}>{text}</div>
        </div>
      </div>
    </Card>
  );
}

export function ListButton({
  t,
  color,
  Icon,
  title,
  detail,
  onClick,
  RightIcon = ChevronRight,
}: {
  t: ThemeTokens;
  color: string;
  Icon: IconType;
  title: string;
  detail?: string;
  onClick: () => void;
  RightIcon?: IconType;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        border: `1px solid ${t.border}`,
        background: t.panel2,
        color: t.text,
        borderRadius: 17,
        padding: 13,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 12,
        textAlign: "left",
        width: "100%",
      }}
    >
      <IconBadge color={color}>
        <Icon size={20} />
      </IconBadge>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600 }}>{title}</div>
        {detail && <div style={{ color: t.muted, fontSize: 12, marginTop: 4 }}>{detail}</div>}
      </div>
      <RightIcon size={17} color={t.soft} />
    </button>
  );
}

export function Sheet({
  t,
  close,
  title,
  subtitle,
  children,
}: {
  t: ThemeTokens;
  close: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="overlay">
      <div className="overlay-backdrop" onClick={close} />
      <div className="bottom-sheet" style={{ background: t.panel, borderColor: t.border }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
          <div>
            <div style={{ color: t.text, fontSize: 22, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>{title}</div>
            {subtitle && <div style={{ color: t.muted, fontSize: 13, marginTop: 6 }}>{subtitle}</div>}
          </div>
          <button className="circle-button" onClick={close} style={{ color: t.text, background: t.panel2, borderColor: t.border }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ marginTop: 16 }}>{children}</div>
      </div>
    </div>
  );
}

export function MiniStat({ t, label, value }: { t: ThemeTokens; label: string; value: string }) {
  return (
    <Card t={t} style={{ padding: 14, background: t.panel2 }}>
      <div style={{ color: t.muted, fontSize: 12 }}>{label}</div>
      <div style={{ color: t.text, fontSize: 24, fontWeight: 600, marginTop: 4, fontFamily: "'IBM Plex Mono', monospace" }}>{value}</div>
    </Card>
  );
}

export function EmptyState({ t, Icon, title, text }: { t: ThemeTokens; Icon: IconType; title: string; text: string }) {
  return (
    <div style={{ textAlign: "center", padding: "26px 18px", border: `1px dashed ${t.border}`, borderRadius: 18 }}>
      <Icon size={22} color={t.soft} style={{ marginBottom: 8 }} />
      <div style={{ color: t.text, fontSize: 14, fontWeight: 600 }}>{title}</div>
      <div style={{ color: t.muted, fontSize: 12.5, marginTop: 5, lineHeight: 1.45 }}>{text}</div>
    </div>
  );
}

export function Toast({ t, toast }: { t: ThemeTokens; toast: string | null }) {
  if (!toast) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        bottom: 112,
        zIndex: 70,
        background: t.glass,
        border: `1px solid ${t.border}`,
        color: t.text,
        borderRadius: 99,
        padding: "9px 16px",
        fontSize: 13,
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        gap: 8,
        whiteSpace: "nowrap",
        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
      }}
    >
      <CheckCircle2 size={14} color={t.green} />
      {toast}
    </div>
  );
}

export function PrivacyToggle({
  t,
  active,
  title,
  detail,
  onClick,
}: {
  t: ThemeTokens;
  active: boolean;
  title: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        border: `1px solid ${active ? t.green : t.border}`,
        background: active ? `${t.green}14` : t.panel2,
        color: t.text,
        borderRadius: 17,
        padding: 13,
        cursor: "pointer",
        textAlign: "left",
        display: "flex",
        gap: 12,
        alignItems: "center",
      }}
    >
      <div style={{ width: 42, height: 24, borderRadius: 999, background: active ? t.green : t.border, padding: 3, flexShrink: 0 }}>
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "white",
            transform: active ? "translateX(18px)" : "translateX(0)",
            transition: "transform .2s ease",
          }}
        />
      </div>
      <div>
        <div style={{ fontWeight: 600 }}>{title}</div>
        <div style={{ color: t.muted, fontSize: 12, marginTop: 4 }}>{detail}</div>
      </div>
    </button>
  );
}

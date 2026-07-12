import { useState } from "react";
import { LogOut, Mail } from "lucide-react";
import { login, signup } from "../lib/account";
import { NoticeCard, Sheet } from "../components/ui";
import type { ThemeTokens } from "../types";

export function AccountSheet({
  t,
  close,
  authEmail,
  onSignedIn,
  onSignOut,
}: {
  t: ThemeTokens;
  close: () => void;
  authEmail: string | null;
  onSignedIn: (token: string, email: string) => void;
  onSignOut: () => void;
}) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    if (!email || !password) {
      setError("Enter an email and password.");
      return;
    }
    setPending(true);
    try {
      const result = mode === "login" ? await login(email, password) : await signup(email, password);
      onSignedIn(result.token, result.email);
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  if (authEmail) {
    return (
      <Sheet t={t} close={close} title="Account" subtitle="Your data syncs to your account automatically.">
        <NoticeCard t={t} color={t.green} Icon={Mail} title="Signed in" text={authEmail} />
        <button
          onClick={() => {
            onSignOut();
            close();
          }}
          style={{ marginTop: 16, width: "100%", border: `1px solid ${t.border}`, background: t.panel2, color: t.red, borderRadius: 15, padding: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          <LogOut size={16} />
          Sign out
        </button>
      </Sheet>
    );
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
    <Sheet t={t} close={close} title={mode === "login" ? "Sign in" : "Create account"} subtitle="Sync your settings, vehicles, and saved places across devices. Optional — Velora works fine without an account.">
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {(["login", "signup"] as const).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            style={{
              flex: 1,
              border: `1px solid ${mode === m ? `${t.purple}55` : t.border}`,
              background: mode === m ? `${t.purple}14` : t.panel2,
              color: mode === m ? t.purple : t.text,
              borderRadius: 15,
              padding: 10,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {m === "login" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" style={inputStyle} />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === "signup" ? "Password (8+ characters)" : "Password"}
          type="password"
          style={inputStyle}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
        />

        {error && <div style={{ color: t.red, fontSize: 12.5 }}>{error}</div>}

        <button
          onClick={submit}
          disabled={pending}
          style={{ border: "none", background: t.purple, color: "white", borderRadius: 16, padding: 14, fontWeight: 600, cursor: pending ? "default" : "pointer", opacity: pending ? 0.6 : 1 }}
        >
          {pending ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
        </button>
      </div>
    </Sheet>
  );
}

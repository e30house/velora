import { AlertTriangle, Share2, ShieldCheck, User } from "lucide-react";
import { friends } from "../data/social";
import { color } from "../lib/helpers";
import { ListButton, NoticeCard, Sheet } from "../components/ui";
import type { Destination, Friend, PrivacySettings, ThemeTokens } from "../types";

export function ShareEtaSheet({
  t,
  destination,
  eta,
  close,
  shareEta,
  privacySettings,
}: {
  t: ThemeTokens;
  destination: Destination;
  eta: number;
  close: () => void;
  shareEta: (friend: Friend) => void;
  privacySettings: PrivacySettings;
}) {
  return (
    <Sheet t={t} close={close} title="Share ETA" subtitle={`${eta} min to ${destination.name} · ${privacySettings.etaVisibility}`}>
      <NoticeCard
        t={t}
        color={privacySettings.hideHomeWork ? t.green : t.gold}
        Icon={privacySettings.hideHomeWork ? ShieldCheck : AlertTriangle}
        title={privacySettings.hideHomeWork ? "Safe sharing enabled" : "Check privacy settings"}
        text={privacySettings.hideHomeWork ? "Home and work locations are hidden before sharing." : "Turn on Hide Home / Work in Privacy Center for safer sharing."}
      />

      <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
        {friends.map((friend) => (
          <ListButton key={friend.id} t={t} color={color(t, friend.color)} Icon={User} title={friend.name} detail={`Send live ETA to ${friend.handle}`} onClick={() => shareEta(friend)} RightIcon={Share2} />
        ))}
      </div>
    </Sheet>
  );
}

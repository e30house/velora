import { color } from "../lib/helpers";
import { ListButton, Sheet } from "../components/ui";
import type { ColorKey, IconType, ThemeTokens } from "../types";

interface SimpleListItem {
  name?: string;
  title?: string;
  detail?: string;
  subtitle?: string;
  impact?: string;
  color: ColorKey;
  Icon: IconType;
}

export function SimpleListSheet<T extends SimpleListItem>({
  t,
  close,
  title,
  subtitle,
  items,
  onSelect,
  rightIcon,
}: {
  t: ThemeTokens;
  close: () => void;
  title: string;
  subtitle: string;
  items: T[];
  onSelect: (item: T) => void;
  rightIcon?: IconType;
}) {
  return (
    <Sheet t={t} close={close} title={title} subtitle={subtitle}>
      <div style={{ display: "grid", gap: 10 }}>
        {items.map((item) => (
          <ListButton
            key={item.name ?? item.title}
            t={t}
            color={color(t, item.color)}
            Icon={item.Icon}
            title={(item.name ?? item.title) as string}
            detail={item.detail ?? item.subtitle ?? item.impact}
            onClick={() => onSelect(item)}
            RightIcon={rightIcon}
          />
        ))}
      </div>
    </Sheet>
  );
}

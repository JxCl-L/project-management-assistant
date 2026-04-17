import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const PRESENCE_COLORS = [
  "#E45C3A", "#3A8FE4", "#3AE48F", "#E4C53A",
  "#A03AE4", "#E43A8F", "#3AE4C5", "#E4703A",
];

export function colorForUser(userId) {
  let hash = 0;
  for (const ch of userId) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff;
  return PRESENCE_COLORS[hash % PRESENCE_COLORS.length];
}

export function UserAvatar({ firstName, lastName, userId, className = "" }) {
  const initials = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
  const color = colorForUser(userId);

  return (
    <Avatar className={`h-7 w-7 text-xs ${className}`}>
      <AvatarFallback
        className="text-xs font-medium"
        style={{ backgroundColor: color, color: "#fff" }}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

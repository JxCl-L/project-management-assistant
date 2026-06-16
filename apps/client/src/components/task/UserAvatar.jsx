import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function indexForUser(userId) {
  let hash = 0;
  for (const ch of userId) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff;
  return hash % 8;
}

export function UserAvatar({ firstName, lastName, userId, className = "" }) {
  const initials = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
  const colorVar = `var(--avatar-${indexForUser(userId)})`;

  return (
    <Avatar className={`h-7 w-7 text-xs ${className}`}>
      <AvatarFallback
        className="text-xs font-medium"
        style={{ backgroundColor: colorVar, color: "#fff" }}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

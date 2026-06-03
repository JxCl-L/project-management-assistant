import { UserAvatar } from "./UserAvatar";

const MAX_VISIBLE = 4;

export function PresenceAvatarStack({ roomUsers }) {
  if (!roomUsers || roomUsers.length === 0) return null;

  const visible = roomUsers.slice(0, MAX_VISIBLE);
  const overflow = roomUsers.length - MAX_VISIBLE;

  return (
    <div className="flex items-center">
      {visible.map((u, i) => (
        <div
          key={u.userId}
          className="ring-2 ring-background rounded-full"
          style={{ marginLeft: i === 0 ? 0 : "-8px", zIndex: visible.length - i }}
          title={`${u.firstName} ${u.lastName} is viewing`}
        >
          <UserAvatar
            firstName={u.firstName}
            lastName={u.lastName}
            userId={u.userId}
          />
        </div>
      ))}
      {overflow > 0 && (
        <div
          className="h-7 w-7 rounded-full bg-muted ring-2 ring-background flex items-center justify-center text-xs text-muted-foreground font-medium"
          style={{ marginLeft: "-8px" }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}

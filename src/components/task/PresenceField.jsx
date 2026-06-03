import { UserAvatar, indexForUser } from "./UserAvatar";

export function PresenceField({ field, fieldEditors, roomUsers, children }) {
  const editorId = fieldEditors?.[field];
  const editor = editorId ? roomUsers?.find((u) => u.userId === editorId) : null;

  if (!editor) {
    return <>{children}</>;
  }

  const color = `var(--avatar-${indexForUser(editorId)})`;
  const name = `${editor.firstName} ${editor.lastName}`;

  return (
    <div className="relative">
      <div className="flex items-center gap-1.5 mb-1.5">
        <UserAvatar
          firstName={editor.firstName}
          lastName={editor.lastName}
          userId={editorId}
          className="h-5 w-5"
        />
        <span className="text-xs text-muted-foreground">
          <span style={{ color }} className="font-medium">{name}</span> is editing
        </span>
      </div>
      <div
        className="rounded-md"
        style={{ outline: `2px solid ${color}`, outlineOffset: "2px" }}
      >
        {children}
      </div>
    </div>
  );
}

import { UserAvatar } from "@/components/task/UserAvatar";

export function UserProfile({ firstName, lastName, userId }) {
  return (
    <div className="flex items-center gap-3">
      <UserAvatar
        firstName={firstName}
        lastName={lastName}
        userId={userId ?? "default"}
        className="h-9 w-9"
      />
    </div>
  );
}

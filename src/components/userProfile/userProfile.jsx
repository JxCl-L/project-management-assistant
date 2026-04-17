import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserProfile({firstName, lastName} = props) {
  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-9 w-9">
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback className="text-sm font-semibold cursor-default select-none">
            {firstName.slice(0, 1)}{lastName.slice(0, 1)}
        </AvatarFallback>
      </Avatar>
      {/* <h4 className="text-sm">Hello, {firstName}</h4> */}
    </div>
  );
}

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateTask } from "@/hooks/useUpdateTask.hook.js";
import { canPerformAction } from "@/lib/permissions";


export default function TaskPrioritySelection({
  projectId,
  taskId,
  initialPriority,
  role,
}) {
  const [currentPriority, setCurrentPriority] = useState(initialPriority);
  const [showMessage, setShowMessage] = useState(false);
  const { mutate, isSuccess, isPending, error } = useUpdateTask();

  const canEdit = canPerformAction(role, "tasks", "PATCH");

  useEffect(() => {
    if (isSuccess || error) {
      setShowMessage(true);
      const timer = setTimeout(() => setShowMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, error]);

  const handlePriorityChange = async (value) => {
    if (!value) return;
    try {
      await mutate(
        { projectId, taskData: { _id: taskId, priority: value } },
        { onSuccess: () => setCurrentPriority(value) }
      );
    } catch (error) {
      console.error("Failed to update priority:", error);
    }
  };

  return (
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Priority</span>
        {showMessage && isSuccess && <span className="text-xs text-[hsl(var(--success))] transition-opacity duration-300">✓ Updated</span>}
        {showMessage && error && <span className="text-xs text-destructive transition-opacity duration-300">✗ Failed</span>}
      </div>
      <Select value={currentPriority} onValueChange={handlePriorityChange} disabled={isPending || !canEdit}>
        <SelectTrigger className="h-10 w-full px-3 py-2 text-sm border-none shadow-none bg-muted/50 rounded-md disabled:opacity-60 disabled:cursor-not-allowed focus:ring-0 focus:ring-offset-0">
          <SelectValue placeholder="Select priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Priority Level</SelectLabel>
            <SelectItem value="low">low</SelectItem>
            <SelectItem value="normal">normal</SelectItem>
            <SelectItem value="high">high</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

    </div>
  );
}

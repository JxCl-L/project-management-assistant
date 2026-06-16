import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useUpdateTask } from "@/hooks/useUpdateTask.hook.js";
import { ChevronDown } from "lucide-react";

export default function TaskDueDateSelection({
  projectId,
  taskId,
  initialDueDate,
  role,
}) {
  const [open, setOpen] = useState(false);
  const [currentDueDate, setCurrentDueDate] = useState(initialDueDate);
  const [showMessage, setShowMessage] = useState(false);
  const { mutate, isSuccess, isPending, error } = useUpdateTask();

  const canEdit = role === "manager" || role === "editor";

  useEffect(() => {
    if (isSuccess || error) {
      setShowMessage(true);
      const timer = setTimeout(() => setShowMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, error]);

  const formatDate = (date) => {
    if (!date) return "No due date";
    return new Date(date).toLocaleDateString("en-AU", { day: "numeric", month: "numeric", year: "numeric" });
  };

  const handleDateChange = async (value) => {
    if (!value) return;
    try {
      const newDueDate = value.toISOString();
      await mutate({ projectId, taskData: { _id: taskId, dueDate: newDueDate } });
      setCurrentDueDate(newDueDate);
      setOpen(false);
    } catch (error) {
      console.error("Failed to update due date:", error);
    }
  };

  return (
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Due Date</span>
        {showMessage && isSuccess && <span className="text-xs text-[hsl(var(--success))] transition-opacity duration-300">✓ Updated</span>}
        {showMessage && error && <span className="text-xs text-destructive transition-opacity duration-300">✗ Failed</span>}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className="h-10 flex items-center justify-between w-full px-3 py-2 text-sm bg-muted/50 rounded-md disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none"
            disabled={isPending || !canEdit}
          >
            <span>{isPending ? "Updating..." : formatDate(currentDueDate)}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={currentDueDate ? new Date(currentDueDate) : undefined}
            onSelect={handleDateChange}
            disabled={isPending}
            initialFocus
          />
        </PopoverContent>
      </Popover>

    </div>
  );
}

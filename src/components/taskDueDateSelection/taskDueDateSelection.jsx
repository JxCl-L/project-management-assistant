import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Calendar } from "@/components/ui/calendar";
import { useUpdateTask } from "@/hooks/useUpdateTask.hook.js";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronDown, CheckCircle2, XCircle } from "lucide-react";

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
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, error]);

  const formatDate = (date) => {
    if (!date) return "No due date";
    const options = { day: "numeric", month: "numeric", year: "numeric" };
    return new Date(date).toLocaleDateString("en-AU", options);
  };

  const handleDateChange = async (value) => {
    if (!value) return;
    try {
      let newDueDate = value.toISOString();
      await mutate({
        projectId,
        taskData: { _id: taskId, dueDate: newDueDate },
      });
      setCurrentDueDate(newDueDate);
      setOpen(false);
    } catch (error) {
      console.error("Failed to update due date:", error);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <div className="flex-1">
          <div className="font-medium text-sm mb-2 h-5">Due Date</div>
          <Popover open={open} onOpenChange={setOpen}>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <button
                  className="h-10 flex items-center justify-between w-40 px-3 py-2 text-sm border rounded-md hover:bg-accent disabled:cursor-not-allowed"
                  disabled={isPending || !canEdit}
                >
                  <span>
                    {isPending ? "Updating..." : formatDate(currentDueDate)}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </button>
              </PopoverTrigger>
            </TooltipTrigger>
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
          <TooltipContent side="bottom">
            <p>
              {!canEdit
                ? "You don't have permission to modify this task"
                : isPending
                ? "Updating due date..."
                : "Select task due date"}
            </p>
          </TooltipContent>

          {/* success/error message */}
          {showMessage && isSuccess && (
            <Alert className="mt-2 bg-green-50 border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 text-sm">
                  Due date updated successfully!
                </AlertDescription>
              </div>
            </Alert>
          )}

          {showMessage && error && (
            <Alert className="mt-2 bg-red-50 border-red-200">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 text-sm">
                  Failed to update due date. Please try again.
                </AlertDescription>
              </div>
            </Alert>
          )}
        </div>
      </Tooltip>
    </TooltipProvider>
  );
}

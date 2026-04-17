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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useUpdateTask } from "@/hooks/useUpdateTask.hook.js";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle } from "lucide-react";

export default function TaskPrioritySelection({
  projectId,
  taskId,
  initialPriority,
  role,
}) {
  const [currentPriority, setCurrentPriority] = useState(initialPriority);
  const [showMessage, setShowMessage] = useState(false);
  const { mutate, isSuccess, isPending, error } = useUpdateTask();

  console.log("role: ", role);
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

  const handlePriorityChange = async (value) => {
    if (!value) return;

    try {
      await mutate(
        { projectId, taskData: { _id: taskId, priority: value } },
        {
          onSuccess: () => {
            setCurrentPriority(value);
          },
        }
      );
    } catch (error) {
      console.error("Failed to update priority:", error);
    }
  };

  return (
    <TooltipProvider>
      <div className="flex-1">
        <div className="font-medium text-sm mb-2 h-5">Priority</div>
        <Tooltip>
          <Select
            value={currentPriority}
            onValueChange={handlePriorityChange}
            disabled={isPending || !canEdit}
          >
            <TooltipTrigger asChild>
              <SelectTrigger className="h-10 w-40 px-3 py-2 text-sm border rounded-md hover:bg-accent disabled:opacity-100 disabled:cursor-not-allowed">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
            </TooltipTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Priority Level</SelectLabel>
                <SelectItem value="low">low</SelectItem>
                <SelectItem value="normal">normal</SelectItem>
                <SelectItem value="high">high</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <TooltipContent side="bottom">
            <p>
              {!canEdit
                ? "You don't have permission to modify this task"
                : isPending
                ? "Updating priority..."
                : "Select task priority"}
            </p>
          </TooltipContent>
        </Tooltip>

        {/* success/error message */}
        {showMessage && isSuccess && (
          <Alert className="mt-2 bg-green-50 border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 text-sm">
                Priority updated successfully!
              </AlertDescription>
            </div>
          </Alert>
        )}

        {showMessage && error && (
          <Alert className="mt-2 bg-red-50 border-red-200">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 text-sm">
                {error?.response?.status === 403
                  ? "You don't have permission to modify this task"
                  : "Failed to update priority. Please try again."}
              </AlertDescription>
            </div>
          </Alert>
        )}
      </div>
    </TooltipProvider>
  );
}

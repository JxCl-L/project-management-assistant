import { useEffect, useState } from "react";
import { useUpdateTask } from "@/hooks/useUpdateTask.hook.js";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { CheckCircle2, XCircle, Check } from "lucide-react";

export default function TaskStatusSelection({
  projectId,
  taskId,
  initialStatus,
  role,
}) {
  const [currentStatus, setCurrentStatus] = useState(initialStatus);
  const [showMessage, setShowMessage] = useState(false);
  const { mutate, isSuccess, isPending, error } = useUpdateTask();

  const canEdit = role === "manager" || role === "editor";
  const isDisabled = isPending || !canEdit;

  useEffect(() => {
    if (isSuccess || error) {
      setShowMessage(true);
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, error]);

  const handleStatusChange = async (value) => {
    if (!canEdit || isPending || value === currentStatus) return;

    try {
      await mutate(
        { projectId, taskData: { _id: taskId, status: value } },
        {
          onSuccess: () => {
            setCurrentStatus(value);
          },
        },
      );
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <div className="flex-1">
          <div className="font-medium text-sm mb-2 h-5">Status</div>

          <div
            className={`h-10 min-w-56 text-sm flex flex-col items-center
        ${isDisabled && "cursor-not-allowed"}`}
          >
            {/* Status Select Bar */}
            <TooltipTrigger asChild>
              <div
                className={`flex flex-row items-center justify-between w-full px-3 group
          ${isDisabled ? "" : "cursor-pointer"}`}
              >
                {/* Todo */}

                <div
                  className={`todo w-4 h-4 border-solid border-4 rounded-full border-red-500 bg-red-500 z-10 
                transition-all duration-200
                flex items-center justify-center
                ${
                  !isDisabled &&
                  "cursor-pointer hover:scale-150 hover:shadow-lg"
                }
                ${currentStatus === "todo" && "scale-125 shadow-lg"}`}
                  onClick={() => !isDisabled && handleStatusChange("todo")}
                >
                  <Check size={8} className="text-white" />
                </div>

                {/* Line 1 */}
                <div
                  className={`flex-1 h-1 -mx-0.5 relative overflow-hidden
            ${currentStatus === "todo" ? "bg-gray-300" : "bg-green-500"}`}
                >
                  <div
                    className="absolute inset-0 bg-green-500 w-0 
                  transition-all duration-500 ease-out
                  group-has-[.in-progress:hover]:w-full
                  group-has-[.completed:hover]:w-full
                  group-has-[.completed:hover]:delay-0
                  delay-500"
                  />
                </div>

                {/* In Progress */}
                <div
                  className={`in-progress w-4 h-4 border-solid border-4 rounded-full border-orange-500 z-10 
                transition-all duration-200
                flex items-center justify-center
                ${
                  !isDisabled &&
                  "cursor-pointer hover:scale-150 hover:shadow-lg"
                }
                ${currentStatus === "todo" ? "bg-white" : "bg-orange-500"}
                ${currentStatus === "inProgress" && "scale-125 shadow-lg"}`}
                  onClick={() =>
                    !isDisabled && handleStatusChange("inProgress")
                  }
                >
                  {currentStatus !== "todo" && (
                    <Check size={8} className="text-white" />
                  )}
                </div>

                {/* Line 2 */}
                <div
                  className={`flex-1 h-1 -mx-0.5 relative overflow-hidden
            ${currentStatus === "completed" ? "bg-green-500" : "bg-gray-300"}`}
                >
                  <div
                    className="absolute inset-0 bg-green-500 w-0 
                  transition-all duration-500 ease-out
                  group-has-[.completed:hover]:w-full
                  group-has-[.completed:hover]:delay-500
                  delay-0"
                  />
                </div>

                {/* Completed */}
                <div
                  className={`completed w-4 h-4 border-solid border-4 rounded-full border-green-500 z-10 
                transition-all duration-200
                flex items-center justify-center
                ${
                  !isDisabled &&
                  "cursor-pointer hover:scale-150 hover:shadow-lg"
                }
                ${
                  currentStatus === "completed"
                    ? "bg-green-500 scale-125 shadow-lg"
                    : "bg-white"
                }`}
                  onClick={() => !isDisabled && handleStatusChange("completed")}
                >
                  {currentStatus === "completed" && (
                    <Check size={8} className="text-white" />
                  )}
                </div>
              </div>
            </TooltipTrigger>

            {/* Labels */}
            <div className="flex flex-row items-center w-11/12 justify-between">
              <div
                className={`text-xs mt-2 w-1/3 text-left ${
                  currentStatus === "todo" ? "font-bold" : ""
                }`}
              >
                Todo
              </div>
              <div
                className={`text-xs mt-2 w-1/3 text-center whitespace-nowrap ${
                  currentStatus === "inProgress" ? "font-bold" : ""
                }`}
              >
                In Progress
              </div>
              <div
                className={`text-xs mt-2 w-1/3 text-right ${
                  currentStatus === "completed" ? "font-bold" : ""
                }`}
              >
                Completed
              </div>
            </div>
          </div>

          <TooltipContent side="bottom">
            <p>
              {!canEdit
                ? "You don't have permission to modify this task"
                : isPending
                  ? "Updating status..."
                  : "Select task status"}
            </p>
          </TooltipContent>

          {/* Success message */}
          {showMessage && isSuccess && (
            <Alert className="mt-2 bg-green-50 border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 text-sm">
                  Task status updated successfully!
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Error message */}
          {showMessage && error && (
            <Alert className="mt-2 bg-red-50 border-red-200">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 text-sm">
                  {error?.response?.status === 403
                    ? "You don't have permission to modify this task"
                    : "Failed to update status. Please try again."}
                </AlertDescription>
              </div>
            </Alert>
          )}
        </div>
      </Tooltip>
    </TooltipProvider>
  );
}

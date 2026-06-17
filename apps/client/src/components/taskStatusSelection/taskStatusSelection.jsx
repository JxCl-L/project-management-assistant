import { useEffect, useState } from "react";
import { useUpdateTask } from "@/hooks/useUpdateTask.hook.js";
import { canPerformAction } from "@/lib/permissions";
import { Check } from "lucide-react";

export default function TaskStatusSelection({
  projectId,
  taskId,
  initialStatus,
  role,
}) {
  const [currentStatus, setCurrentStatus] = useState(initialStatus);
  const [showMessage, setShowMessage] = useState(false);
  const { mutate, isSuccess, isPending, error } = useUpdateTask();

  const canEdit = canPerformAction(role, "tasks", "PATCH");
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
    <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</span>
            {showMessage && isSuccess && <span className="text-xs text-[hsl(var(--success))] transition-opacity duration-300">✓ Updated</span>}
            {showMessage && error && <span className="text-xs text-destructive transition-opacity duration-300">✗ Failed</span>}
          </div>

          <div className={`py-2 min-w-72 flex-[2] ${isDisabled ? "opacity-60 cursor-not-allowed" : ""}`}>
          <div
            className={`text-sm flex flex-col items-center ${isDisabled && "cursor-not-allowed"}`}
          >
            {/* Status Select Bar */}
              <div
                className={`flex flex-row items-center justify-between w-full group
          ${isDisabled ? "" : "cursor-pointer"}`}
              >
                {/* Todo */}

                <div
                  className={`todo w-4 h-4 border-solid border-4 rounded-full border-[hsl(var(--status-todo))] bg-[hsl(var(--status-todo))] z-10
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
            ${currentStatus === "todo" ? "bg-[hsl(var(--status-inactive-track))]" : "bg-[hsl(var(--status-active-track))]"}`}
                >
                  <div
                    className="absolute inset-0 bg-[hsl(var(--status-active-track))] w-0
                  transition-all duration-500 ease-out
                  group-has-[.in-progress:hover]:w-full
                  group-has-[.completed:hover]:w-full
                  group-has-[.completed:hover]:delay-0
                  delay-500"
                  />
                </div>

                {/* In Progress */}
                <div
                  className={`in-progress w-4 h-4 border-solid border-4 rounded-full border-[hsl(var(--status-in-progress))] z-10
                transition-all duration-200
                flex items-center justify-center
                ${
                  !isDisabled &&
                  "cursor-pointer hover:scale-150 hover:shadow-lg"
                }
                ${currentStatus === "todo" ? "bg-background" : "bg-[hsl(var(--status-in-progress))]"}
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
            ${currentStatus === "completed" ? "bg-[hsl(var(--status-active-track))]" : "bg-[hsl(var(--status-inactive-track))]"}`}
                >
                  <div
                    className="absolute inset-0 bg-[hsl(var(--status-active-track))] w-0
                  transition-all duration-500 ease-out
                  group-has-[.completed:hover]:w-full
                  group-has-[.completed:hover]:delay-500
                  delay-0"
                  />
                </div>

                {/* Completed */}
                <div
                  className={`completed w-4 h-4 border-solid border-4 rounded-full border-[hsl(var(--status-completed))] z-10
                transition-all duration-200
                flex items-center justify-center
                ${
                  !isDisabled &&
                  "cursor-pointer hover:scale-150 hover:shadow-lg"
                }
                ${
                  currentStatus === "completed"
                    ? "bg-[hsl(var(--status-completed))] scale-125 shadow-lg"
                    : "bg-background"
                }`}
                  onClick={() => !isDisabled && handleStatusChange("completed")}
                >
                  {currentStatus === "completed" && (
                    <Check size={8} className="text-white" />
                  )}
                </div>
              </div>
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
          </div>

          {/* Success message */}
    </div>
  );
}

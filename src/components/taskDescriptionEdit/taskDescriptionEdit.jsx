import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useUpdateTask } from "@/hooks/useUpdateTask.hook.js";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle } from "lucide-react";
import { PresenceField } from "@/components/task/PresenceField.jsx";

export default function TaskDescriptionEdit({
  projectId,
  taskId,
  initialDescription,
  role,
  fieldEditors,
  roomUsers,
  onFieldFocus,
  onFieldBlur,
}) {
  const [currentDescription, setCurrentDescription] =
    useState(initialDescription);
  const [lastSavedDescription, setLastSavedDescription] =
    useState(initialDescription);
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

  const handleDescriptionChange = async () => {
    if (
      // !currentDescription ||
      currentDescription === lastSavedDescription
    )
      return;

    try {
      await mutate(
        {
          projectId,
          taskData: { _id: taskId, description: currentDescription },
        },
        {
          onSuccess: () => {
            // Description updated successfully
            setLastSavedDescription(currentDescription);
          },
        }
      );
    } catch (error) {
      console.error("Failed to update description:", error);
    }
  };

  const hasChanges = currentDescription !== lastSavedDescription;

  return (
    <TooltipProvider>
      <div className="flex flex-col flex-1">
        <div className="font-medium text-sm h-5 mb-2">Description</div>
        <PresenceField field="description" fieldEditors={fieldEditors} roomUsers={roomUsers}>
          <Textarea
            placeholder="Type task description here."
            value={currentDescription}
            onChange={(e) => setCurrentDescription(e.target.value)}
            disabled={isPending || !canEdit}
            className="w-full min-h-[100px] disabled:opacity-100"
            onFocus={() => onFieldFocus?.("description")}
            onBlur={() => onFieldBlur?.("description")}
          />
        </PresenceField>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleDescriptionChange}
              disabled={isPending || !canEdit || !hasChanges}
              className="justify-end self-end mt-3 py-2 px-4 text-sm bg-sidebar-primary border border-input rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isPending ? "Updating..." : "Update description"}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            {!canEdit
              ? "You don't have permission to modify this task"
              : !hasChanges
              ? "No changes to save"
              : ""}
          </TooltipContent>
        </Tooltip>

        {/* success/error message */}
        {showMessage && isSuccess && (
          <Alert className="mt-2 bg-green-50 border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 text-sm">
                Description updated successfully!
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
                  : "Failed to update description. Please try again."}
              </AlertDescription>
            </div>
          </Alert>
        )}
      </div>
    </TooltipProvider>
  );
}

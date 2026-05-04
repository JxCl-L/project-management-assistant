import { useEffect, useRef, useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { useUpdateTask } from "@/hooks/useUpdateTask.hook.js";
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
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [currentDescription, setCurrentDescription] = useState(initialDescription);
  const [editingDescription, setEditingDescription] = useState(initialDescription);
  const textareaRef = useRef(null);
  const { mutate, isPending } = useUpdateTask();

  const canEdit = role === "manager" || role === "editor";

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // place cursor at end
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
      autoResize(textareaRef.current);
    }
  }, [isEditing]);

  const autoResize = (el) => {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const handleEditClick = () => {
    setEditingDescription(currentDescription);
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmed = editingDescription.trim();
    if (trimmed === currentDescription.trim()) {
      setIsEditing(false);
      return;
    }
    mutate(
      { projectId, taskData: { _id: taskId, description: trimmed } },
      {
        onSuccess: () => {
          setCurrentDescription(trimmed);
          setIsEditing(false);
        },
      }
    );
  };

  const handleCancel = () => {
    setEditingDescription(currentDescription);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  const isEmpty = !currentDescription?.trim();

  return (
    <div
      className="flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Section header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="font-medium text-sm">Description</span>
        {canEdit && !isEditing && (
          <button
            onClick={handleEditClick}
            className={`p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
            aria-label="Edit description"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="flex flex-col gap-2">
          <PresenceField field="description" fieldEditors={fieldEditors} roomUsers={roomUsers}>
            <textarea
              ref={textareaRef}
              value={editingDescription}
              onChange={(e) => {
                setEditingDescription(e.target.value);
                autoResize(e.target);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => onFieldFocus?.("description")}
              onBlur={() => onFieldBlur?.("description")}
              disabled={isPending}
              rows={3}
              className="w-full bg-transparent border-0 border-b-2 border-primary outline-none resize-none text-sm leading-relaxed caret-primary disabled:opacity-50 pb-1 overflow-hidden"
            />
          </PresenceField>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {navigator.platform.includes("Mac") ? "⌘" : "Ctrl"}+Enter to save
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handleSave}
                disabled={isPending}
                className="p-1 rounded text-green-500 hover:text-green-400 hover:bg-green-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Save description"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={handleCancel}
                disabled={isPending}
                className="p-1 rounded text-red-500 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Cancel edit"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={canEdit ? handleEditClick : undefined}
          className={`text-sm leading-relaxed min-h-[2.5rem] rounded-md px-1 -mx-1 transition-colors duration-150 ${
            canEdit ? "cursor-pointer hover:bg-muted/50" : ""
          } ${isEmpty ? "text-muted-foreground italic" : "text-foreground"}`}
        >
          {isEmpty ? "Add a description…" : currentDescription}
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";
import { useUpdateTask } from "@/hooks/useUpdateTask.hook.js";

export default function TaskTitleEdit({ projectId, taskId, initialTitle, role }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(initialTitle);
  const [editingTitle, setEditingTitle] = useState(initialTitle);
  const inputRef = useRef(null);
  const { mutate, isPending } = useUpdateTask();

  const canEdit = role === "manager" || role === "editor";

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEditClick = () => {
    setEditingTitle(currentTitle);
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmed = editingTitle.trim();
    if (!trimmed || trimmed === currentTitle) {
      setIsEditing(false);
      return;
    }
    mutate(
      { projectId, taskData: { _id: taskId, title: trimmed } },
      {
        onSuccess: () => {
          setCurrentTitle(trimmed);
          setIsEditing(false);
        },
      }
    );
  };

  const handleCancel = () => {
    setEditingTitle(currentTitle);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 flex-1">
        <input
          ref={inputRef}
          value={editingTitle}
          onChange={(e) => setEditingTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isPending}
          className="text-2xl font-semibold leading-none tracking-tight bg-transparent border-0 border-b-2 border-primary outline-none w-full pb-0.5 caret-primary disabled:opacity-50"
        />
        <button
          onClick={handleSave}
          disabled={isPending || !editingTitle.trim()}
          className="shrink-0 p-1 rounded text-[hsl(var(--success))] hover:text-[hsl(var(--success))] hover:bg-[hsl(var(--success-muted))] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Save title"
        >
          <Check className="h-5 w-5" />
        </button>
        <button
          onClick={handleCancel}
          disabled={isPending}
          className="shrink-0 p-1 rounded text-destructive hover:text-destructive hover:bg-destructive/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Cancel edit"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h1 className="text-2xl font-semibold leading-none tracking-tight">
        {currentTitle}
      </h1>
      {canEdit && (
        <button
          onClick={handleEditClick}
          className={`p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Edit title"
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

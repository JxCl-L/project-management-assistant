import { useState, useRef, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";
import { useUpdateProject } from "@/hooks/useUpdateProject.hook.js";
import { useToast } from "@/hooks/use-toast.js";

export function ProjectHeaderEditable({ project }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const nameInputRef = useRef(null);
  const { toast } = useToast();

  const { mutate: updateProject, isPending } = useUpdateProject();

  const canEdit = project?.permissions?.canEditProject;

  const enterEdit = () => {
    setEditName(project?.name || "");
    setEditDescription(project?.description || "");
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    const trimmedName = editName.trim();
    if (!trimmedName) {
      toast({ title: "Project name cannot be empty", variant: "destructive" });
      return;
    }
    updateProject(
      { _id: project._id, name: trimmedName, description: editDescription.trim() },
      {
        onSuccess: () => {
          toast({ title: "Project updated" });
          setIsEditing(false);
        },
        onError: (error) => {
          toast({
            title: "Update failed",
            description: error?.response?.data?.error?.message || error?.message || "Please try again",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") cancelEdit();
  };

  useEffect(() => {
    if (isEditing) nameInputRef.current?.focus();
  }, [isEditing]);

  if (isEditing) {
    return (
      <div className="flex flex-col gap-1 flex-1 mr-4">
        <input
          ref={nameInputRef}
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isPending}
          className="text-2xl font-semibold bg-transparent border-b border-border focus:border-primary outline-none w-full pb-0.5 text-foreground"
        />
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isPending}
          rows={2}
          placeholder="No description"
          className="text-sm bg-transparent border-b border-border focus:border-primary outline-none resize-none w-full text-muted-foreground placeholder:text-muted-foreground/50"
        />
        <div className="flex gap-2 mt-1">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-1 text-xs text-[hsl(var(--success))] hover:text-[hsl(var(--success))] disabled:opacity-50 transition-colors"
          >
            <Check className="h-3.5 w-3.5" />
            {isPending ? "Saving…" : "Save"}
          </button>
          <button
            onClick={cancelEdit}
            disabled={isPending}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group flex flex-col flex-1 mr-4 ${canEdit ? "cursor-default" : ""}`}
    >
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold">{project?.name || "Project"}</h1>
        {canEdit && (
          <button
            onClick={enterEdit}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
            aria-label="Edit project"
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}
      </div>
      <p className="text-muted-foreground text-sm mt-1 text-justify">
        {project?.description || "No description available"}
      </p>
    </div>
  );
}

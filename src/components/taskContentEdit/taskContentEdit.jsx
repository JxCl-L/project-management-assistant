import { useEffect, useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useFetchTaskContent } from "@/hooks/useFetchTaskContent.hook.js";
import { useUpdateTaskContent } from "@/hooks/useUpdateTaskContent.hook.js";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle2,
  XCircle,
  Bold,
  Italic,
  List,
  ListOrdered,
  Strikethrough,
  Code,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PresenceField } from "@/components/task/PresenceField.jsx";

const ToolbarButton = ({ onClick, active, disabled, children, title }) => (
  <button
    type="button"
    onMouseDown={(e) => {
      e.preventDefault();
      onClick();
    }}
    disabled={disabled}
    title={title}
    className={cn(
      "h-7 w-7 flex items-center justify-center rounded text-sm transition-colors",
      active
        ? "bg-accent text-accent-foreground"
        : "hover:bg-accent hover:text-accent-foreground text-muted-foreground",
      disabled && "opacity-40 cursor-not-allowed"
    )}
  >
    {children}
  </button>
);

const ContentSkeleton = ({ canEdit }) => (
  <div className="flex flex-col gap-2">
    <div className="font-medium text-sm h-5">Content</div>
    <div className="border rounded-md overflow-hidden">
      {canEdit && (
        <div className="flex items-center gap-0.5 px-2 py-1 border-b bg-muted/30">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-7 w-7 rounded bg-muted animate-pulse" />
          ))}
        </div>
      )}
      <div className="px-3 py-2 space-y-2">
        <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
        <div className="h-4 w-full rounded bg-muted animate-pulse" />
        <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
      </div>
    </div>
  </div>
);

// Inner component — only mounts after data is ready, so useEditor gets content immediately
function EditorWrapper({
  projectId,
  taskId,
  fetchedContent,
  rawContent,
  canEdit,
  mutate,
  isSuccess,
  isPending,
  error,
  fieldEditors,
  roomUsers,
  onFieldFocus,
  onFieldBlur,
}) {
  const [showMessage, setShowMessage] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: fetchedContent,           // data is guaranteed to exist here
    editable: canEdit && !isPending,
    onFocus: () => {
      setIsFocused(true);
      onFieldFocus?.("content");
    },
    onBlur: () => {
      setIsFocused(false);
      onFieldBlur?.("content");
      handleSave();
    },
  });

  // Sync editable state when isPending changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(canEdit && !isPending);
    }
  }, [canEdit, isPending, editor]);

  // Show success/error message
  useEffect(() => {
    if (isSuccess || error) {
      setShowMessage(true);
      const timer = setTimeout(() => setShowMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, error]);

  const handleSave = useCallback(() => {
    if (!editor || !canEdit) return;

    const json = editor.getJSON();
    const plainText = editor.getText();
    const contentString = JSON.stringify(json);

    // Don't save if unchanged
    if (contentString === rawContent) return;

    mutate({
      projectId,
      taskId,
      taskContentData: {
        content: contentString,
        plainText,
        contentType: "tiptap-json",
      },
    });
  }, [editor, canEdit, rawContent, mutate, projectId, taskId]);

  if (!editor) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="font-medium text-sm h-5">Content</div>

      <PresenceField field="content" fieldEditors={fieldEditors} roomUsers={roomUsers}>
      <div
        className={cn(
          "border rounded-md transition-colors",
          isFocused && canEdit ? "border-ring ring-1 ring-ring" : "border-input",
          !canEdit && "opacity-60"
        )}
      >
        {/* Toolbar — only show when editable */}
        {canEdit && (
          <div className="flex items-center gap-0.5 px-2 py-1 border-b bg-muted/30">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive("bold")}
              disabled={isPending}
              title="Bold"
            >
              <Bold className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive("italic")}
              disabled={isPending}
              title="Italic"
            >
              <Italic className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              active={editor.isActive("strike")}
              disabled={isPending}
              title="Strikethrough"
            >
              <Strikethrough className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              active={editor.isActive("code")}
              disabled={isPending}
              title="Inline code"
            >
              <Code className="h-3.5 w-3.5" />
            </ToolbarButton>

            <div className="w-px h-4 bg-border mx-1" />

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive("bulletList")}
              disabled={isPending}
              title="Bullet list"
            >
              <List className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive("orderedList")}
              disabled={isPending}
              title="Ordered list"
            >
              <ListOrdered className="h-3.5 w-3.5" />
            </ToolbarButton>
          </div>
        )}

        {/* Editor area */}
        <EditorContent
          editor={editor}
          className={cn(
            "prose prose-sm max-w-none px-3 py-2 min-h-[120px] text-sm focus-within:outline-none",
            "[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[100px]",
          )}
        />

        {/* Status bar */}
        {isPending && (
          <div className="px-3 py-1 text-xs text-muted-foreground border-t bg-muted/20">
            Saving...
          </div>
        )}
        {!canEdit && (
          <div className="px-3 py-1 text-xs text-muted-foreground border-t bg-muted/20">
            You don't have permission to edit this task
          </div>
        )}
      </div>
      </PresenceField>

      {/* Success message */}
      {showMessage && isSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 text-sm">
              Content saved successfully!
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Error message */}
      {showMessage && error && (
        <Alert className="bg-red-50 border-red-200">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 text-sm">
              Failed to save content. Please try again.
            </AlertDescription>
          </div>
        </Alert>
      )}
    </div>
  );
}

export default function TaskContentEdit({ projectId, taskId, role, fieldEditors, roomUsers, onFieldFocus, onFieldBlur }) {
  const { data, isLoading } = useFetchTaskContent(projectId, taskId);
  const { mutate, isSuccess, isPending, error } = useUpdateTaskContent();

  const canEdit = role === "manager" || role === "editor";

  // Show skeleton until data arrives — prevents timing issue with useEditor
  if (isLoading) return <ContentSkeleton canEdit={canEdit} />;

  // Parse fetched content safely
  const fetchedContent = (() => {
    try {
      return data?.content ? JSON.parse(data.content) : { type: "doc", content: [] };
    } catch {
      return { type: "doc", content: [] };
    }
  })();

  return (
    <EditorWrapper
      projectId={projectId}
      taskId={taskId}
      fetchedContent={fetchedContent}
      rawContent={data?.content ?? null}
      canEdit={canEdit}
      mutate={mutate}
      isSuccess={isSuccess}
      isPending={isPending}
      error={error}
      fieldEditors={fieldEditors}
      roomUsers={roomUsers}
      onFieldFocus={onFieldFocus}
      onFieldBlur={onFieldBlur}
    />
  );
}
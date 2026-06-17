import { useEffect, useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useFetchTaskContent } from "@/hooks/useFetchTaskContent.hook.js";
import { useUpdateTaskContent } from "@/hooks/useUpdateTaskContent.hook.js";
import { useRewriteTaskContent } from "@/hooks/useRewriteTaskContent.hook.js";
import { canPerformAction } from "@/lib/permissions";
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
  Sparkles,
  Check,
  Copy,
  X,
  ClipboardCheck,
  Save,
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
    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Content</div>
    <div className="rounded-md overflow-hidden bg-muted/50">
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
  const [previewMode, setPreviewMode] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [rewriteError, setRewriteError] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  const { mutate: rewrite, isPending: isRewriting } = useRewriteTaskContent();

  const editor = useEditor({
    extensions: [StarterKit],
    content: fetchedContent,
    editable: canEdit && !isPending,
    onFocus: () => {
      setIsFocused(true);
      onFieldFocus?.("content");
    },
    onBlur: () => {
      setIsFocused(false);
      onFieldBlur?.("content");
    },
    onUpdate: ({ editor: e }) => {
      if (!previewMode) {
        const contentString = JSON.stringify(e.getJSON());
        setIsDirty(contentString !== rawContent);
      }
    },
  });

  useEffect(() => {
    if (editor && !previewMode) {
      editor.setEditable(canEdit && !isPending);
    }
  }, [canEdit, isPending, editor, previewMode]);

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
    if (contentString === rawContent) return;
    mutate(
      { projectId, taskId, taskContentData: { content: contentString, plainText, contentType: "tiptap-json" } },
      { onSuccess: () => setIsDirty(false) }
    );
  }, [editor, canEdit, rawContent, mutate, projectId, taskId]);

  // --- Rewrite handlers ---

  const handleRewrite = () => {
    setRewriteError(null);
    rewrite({ projectId, taskId }, {
      onSuccess: (data) => {
        try {
          const tiptapJson = JSON.parse(data.data.rewritten.tiptapJson);
          setPreviewData({ plainText: data.data.rewritten.plainText, tiptapJson });
          editor.commands.setContent(tiptapJson);
          editor.setEditable(false);
          setPreviewMode(true);
        } catch (e) {
          setRewriteError("Received an unexpected response from the server.");
        }
      },
      onError: (err) => {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to rewrite content. Please try again.";
        setRewriteError(msg);
      },
    });
  };

  const handleApply = () => {
    if (!previewData) return;
    const contentString = JSON.stringify(previewData.tiptapJson);
    mutate(
      { projectId, taskId, taskContentData: { content: contentString, plainText: previewData.plainText, contentType: "tiptap-json" } },
      {
        onSuccess: () => {
          editor.setEditable(canEdit);
          setPreviewMode(false);
          setPreviewData(null);
        },
      }
    );
  };

  const handleDiscard = () => {
    editor.commands.setContent(fetchedContent);
    editor.setEditable(canEdit);
    setPreviewMode(false);
    setPreviewData(null);
    setRewriteError(null);
  };

  const handleCopy = async () => {
    if (!previewData) return;
    await navigator.clipboard.writeText(previewData.plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!editor) return null;

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between h-5">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Content</span>
        {canEdit && !previewMode && (
          <button
            onClick={handleRewrite}
            disabled={isRewriting || isPending || !editor.getText().trim()}
            title={!editor.getText().trim() ? "Add some content before rewriting" : "Rewrite with AI"}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
            style={{
              color: "hsl(var(--ai-accent))",
              backgroundColor: "hsl(var(--ai-accent-bg))",
              borderColor: "hsl(var(--ai-accent-border))",
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "hsl(var(--ai-accent-hover-bg))"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "hsl(var(--ai-accent-bg))"}
          >
            <Sparkles className={cn("h-3 w-3", isRewriting && "animate-pulse")} />
            {isRewriting ? "Rewriting…" : "Rewrite"}
          </button>
        )}
      </div>

      <PresenceField field="content" fieldEditors={fieldEditors} roomUsers={roomUsers}>
        <div
          className={cn(
            "rounded-md transition-colors overflow-hidden bg-muted/50",
            previewMode && "ring-1 ring-[hsl(var(--ai-accent-border))]",
            !canEdit && !previewMode && "opacity-60"
          )}
        >
          {/* Toolbar — hidden in preview mode */}
          {canEdit && !previewMode && (
            <div className="flex items-center gap-0.5 px-2 py-1 border-b bg-muted/30">
              <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} disabled={isPending} title="Bold">
                <Bold className="h-3.5 w-3.5" />
              </ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} disabled={isPending} title="Italic">
                <Italic className="h-3.5 w-3.5" />
              </ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} disabled={isPending} title="Strikethrough">
                <Strikethrough className="h-3.5 w-3.5" />
              </ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} disabled={isPending} title="Inline code">
                <Code className="h-3.5 w-3.5" />
              </ToolbarButton>
              <div className="w-px h-4 bg-border mx-1" />
              <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} disabled={isPending} title="Bullet list">
                <List className="h-3.5 w-3.5" />
              </ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} disabled={isPending} title="Ordered list">
                <ListOrdered className="h-3.5 w-3.5" />
              </ToolbarButton>
              <div className="w-px h-4 bg-border mx-1" />
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending || !isDirty}
                title={!isDirty ? "No changes to save" : "Save changes"}
                className="flex items-center gap-1 px-2 h-7 rounded text-xs font-medium text-[hsl(var(--ai-accent))] border border-[hsl(var(--ai-accent-border))] bg-[hsl(var(--ai-accent-bg))] hover:bg-[hsl(var(--ai-accent-hover-bg))] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="h-3.5 w-3.5" />
                {isPending ? "Saving…" : isDirty ? "Save" : "No changes"}
              </button>
            </div>
          )}

          {/* Preview banner */}
          {previewMode && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 border-b" style={{ borderColor: "hsl(var(--ai-accent-border))", backgroundColor: "hsl(var(--ai-accent-bg))" }}>
              <Sparkles className="h-3 w-3 shrink-0" style={{ color: "hsl(var(--ai-accent))" }} />
              <span className="text-xs" style={{ color: "hsl(var(--ai-accent))" }}>AI rewrite preview — review before applying</span>
            </div>
          )}

          <EditorContent
            editor={editor}
            className={cn(
              "prose prose-sm max-w-none px-3 py-2 min-h-[120px] text-sm focus-within:outline-none",
              "[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[100px]",
              previewMode && "bg-[hsl(var(--ai-accent-bg))]"
            )}
          />

          {isPending && (
            <div className="px-3 py-1 text-xs text-muted-foreground border-t bg-muted/20">
              Saving…
            </div>
          )}
          {!canEdit && !previewMode && (
            <div className="px-3 py-1 text-xs text-muted-foreground border-t bg-muted/20">
              You don't have permission to edit this task
            </div>
          )}
        </div>
      </PresenceField>

      {/* Rewrite error */}
      {rewriteError && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs">
          <XCircle className="h-3.5 w-3.5 shrink-0" />
          {rewriteError}
        </div>
      )}

      {/* Preview action bar */}
      {previewMode && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-muted-foreground">Apply, copy, or discard the suggestion</span>
          <div className="flex items-center gap-1">
            <button
              onClick={handleApply}
              disabled={isPending}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-[hsl(var(--success))] border border-[hsl(var(--success-border))] bg-[hsl(var(--success-muted))] hover:bg-[hsl(var(--success-muted))] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Check className="h-3.5 w-3.5" />
              Apply
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-muted-foreground border border-border hover:bg-muted hover:text-foreground transition-colors"
            >
              {copied ? <ClipboardCheck className="h-3.5 w-3.5 text-[hsl(var(--success))]" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={handleDiscard}
              disabled={isPending}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-destructive border border-destructive/30 bg-destructive/10 hover:bg-destructive/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Discard
            </button>
          </div>
        </div>
      )}

      {showMessage && isSuccess && !previewMode && (
        <Alert className="bg-[hsl(var(--success-muted))] border-[hsl(var(--success-border))]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))]" />
            <AlertDescription className="text-[hsl(var(--success))] text-sm">Content saved successfully!</AlertDescription>
          </div>
        </Alert>
      )}
      {showMessage && error && (
        <Alert className="bg-destructive/10 border-destructive/30">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive text-sm">Failed to save content. Please try again.</AlertDescription>
          </div>
        </Alert>
      )}
    </div>
  );
}

export default function TaskContentEdit({ projectId, taskId, role, fieldEditors, roomUsers, onFieldFocus, onFieldBlur }) {
  const { data, isLoading } = useFetchTaskContent(projectId, taskId);
  const { mutate, isSuccess, isPending, error } = useUpdateTaskContent();

  const canEdit = canPerformAction(role, "taskContent", "PATCH");

  if (isLoading) return <ContentSkeleton canEdit={canEdit} />;

  const fetchedContent = (() => {
    try {
      return data?.data?.content ? JSON.parse(data.data.content) : { type: "doc", content: [] };
    } catch {
      return { type: "doc", content: [] };
    }
  })();

  return (
    <EditorWrapper
      projectId={projectId}
      taskId={taskId}
      fetchedContent={fetchedContent}
      rawContent={data?.data?.content ?? null}
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

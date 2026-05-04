import { useEffect, useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useFetchTaskContent } from "@/hooks/useFetchTaskContent.hook.js";
import { useUpdateTaskContent } from "@/hooks/useUpdateTaskContent.hook.js";
import { useRewriteTaskContent } from "@/hooks/useRewriteTaskContent.hook.js";
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
      if (!previewMode) handleSave();
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
    mutate({ projectId, taskId, taskContentData: { content: contentString, plainText, contentType: "tiptap-json" } });
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
        <span className="font-medium text-sm">Content</span>
        {canEdit && !previewMode && (
          <button
            onClick={handleRewrite}
            disabled={isRewriting || isPending || !editor.getText().trim()}
            title={!editor.getText().trim() ? "Add some content before rewriting" : "Rewrite with AI"}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-violet-500/30 bg-violet-600/10 text-violet-300 text-xs hover:bg-violet-600/20 hover:border-violet-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
          >
            <Sparkles className={cn("h-3 w-3", isRewriting && "animate-pulse")} />
            {isRewriting ? "Rewriting…" : "Rewrite"}
          </button>
        )}
      </div>

      <PresenceField field="content" fieldEditors={fieldEditors} roomUsers={roomUsers}>
        <div
          className={cn(
            "border rounded-md transition-colors overflow-hidden",
            previewMode
              ? "border-violet-500/50 ring-1 ring-violet-500/25"
              : isFocused && canEdit
              ? "border-ring ring-1 ring-ring"
              : "border-input",
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
            </div>
          )}

          {/* Preview banner */}
          {previewMode && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-violet-500/30 bg-violet-500/10">
              <Sparkles className="h-3 w-3 text-violet-400 shrink-0" />
              <span className="text-xs text-violet-300">AI rewrite preview — review before applying</span>
            </div>
          )}

          <EditorContent
            editor={editor}
            className={cn(
              "prose prose-sm max-w-none px-3 py-2 min-h-[120px] text-sm focus-within:outline-none",
              "[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[100px]",
              previewMode && "bg-violet-950/10"
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
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
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
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-green-400 border border-green-500/30 bg-green-500/10 hover:bg-green-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Check className="h-3.5 w-3.5" />
              Apply
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-muted-foreground border border-border hover:bg-muted hover:text-foreground transition-colors"
            >
              {copied ? <ClipboardCheck className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={handleDiscard}
              disabled={isPending}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-red-400 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Discard
            </button>
          </div>
        </div>
      )}

      {showMessage && isSuccess && !previewMode && (
        <Alert className="bg-green-50 border-green-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 text-sm">Content saved successfully!</AlertDescription>
          </div>
        </Alert>
      )}

      {showMessage && error && (
        <Alert className="bg-red-50 border-red-200">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 text-sm">Failed to save content. Please try again.</AlertDescription>
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

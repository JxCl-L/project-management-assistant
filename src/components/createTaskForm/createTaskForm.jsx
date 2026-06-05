import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Sparkles, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { CreateTaskSchema } from "@/schema/createTask.schema.js";
import { useCreateTask } from "@/hooks/useCreateTask.hook.js";
import { useGenerateTask } from "@/hooks/useGenerateTask.hook.js";
import { useToast } from "@/hooks/use-toast.js";
import { Toaster } from "@/components/ui/toaster";
import { useParams } from "react-router";

export function CreateTaskForm({ onSuccess }) {
  const { projectId } = useParams();
  const { mutate, isError, isSuccess, isPending } = useCreateTask();
  const { mutate: generate, isPending: isGenerating } = useGenerateTask();
  const { toast } = useToast();

  const [prompt, setPrompt] = useState("");
  const [pendingGenerate, setPendingGenerate] = useState(false);
  const [generateError, setGenerateError] = useState(null);

  const form = useForm({
    resolver: zodResolver(CreateTaskSchema),
  });

  function onSubmit(values) {
    const dueDate = values.dueDate.toISOString();
    mutate({ ...values, dueDate });
    form.reset();
    if (onSuccess) onSuccess();
  }

  useEffect(() => {
    if (isSuccess) toast({ title: "New task created successfully" });
  }, [isSuccess]);

  useEffect(() => {
    if (isError) toast({ title: "Task creation failed", description: "Please try again", variant: "destructive" });
  }, [isError]);

  const hasFilledFields = () => {
    const v = form.getValues();
    return !!(v.title || v.description || v.priority || v.status || v.dueDate);
  };

  const runGenerate = () => {
    if (!prompt.trim()) return;
    setGenerateError(null);
    setPendingGenerate(false);

    generate({ projectId, prompt }, {
      onSuccess: (data) => {
        const d = data.data;
        if (d.title)       form.setValue("title", d.title,             { shouldValidate: true });
        if (d.description) form.setValue("description", d.description, { shouldValidate: true });
        if (d.priority)    form.setValue("priority", d.priority,       { shouldValidate: true });
        if (d.status)      form.setValue("status", d.status,           { shouldValidate: true });
        if (d.dueDate) {
          const parsed = new Date(d.dueDate);
          if (!isNaN(parsed)) form.setValue("dueDate", parsed, { shouldValidate: true });
        }
      },
      onError: (err) => {
        setGenerateError(
          err?.response?.data?.message || "Failed to generate task. Please try again."
        );
      },
    });
  };

  const handleGenerateClick = () => {
    if (!prompt.trim()) return;
    if (hasFilledFields()) {
      setPendingGenerate(true);
    } else {
      runGenerate();
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold tracking-tight">Create Task</h2>
      <p className="text-sm text-muted-foreground mb-4">Fill in the details below, or describe the task to generate.</p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>

          {/* Title */}
          <div className="py-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} placeholder="Title" value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Status + Priority */}
          <div className="flex flex-row justify-between py-2">
            <div className="mr-2 w-full">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="todo">Todo</SelectItem>
                          <SelectItem value="inProgress">In Progress</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="ml-2 w-full">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Due date */}
          <div className="py-2">
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          <CalendarIcon />
                          {field.value ? format(field.value, "PPP") : <span>Due date</span>}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Description */}
          <div className="py-2">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea placeholder="Task description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or describe to generate</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* AI prompt */}
          <div className="flex flex-col gap-2">
            <Textarea
              placeholder="e.g. Set up CI/CD pipeline for the staging environment…"
              value={prompt}
              onChange={(e) => { setPrompt(e.target.value); setPendingGenerate(false); setGenerateError(null); }}
              rows={2}
              className="resize-none text-sm"
            />

            {/* Overwrite warning */}
            {pendingGenerate && (
              <div className="flex items-start gap-2 px-3 py-2 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="mb-1.5">This will overwrite your filled fields.</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={runGenerate}
                      className="px-2.5 py-1 rounded border border-amber-500/40 hover:bg-amber-500/20 transition-colors"
                    >
                      Continue anyway
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingGenerate(false)}
                      className="px-2.5 py-1 rounded hover:bg-muted transition-colors text-muted-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Generate error */}
            {generateError && (
              <p className="text-xs text-destructive">{generateError}</p>
            )}

            {/* Generate button */}
            {!pendingGenerate && (
              <button
                type="button"
                onClick={handleGenerateClick}
                disabled={isGenerating || !prompt.trim()}
                className="self-end flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-violet-500/30 bg-violet-600/10 text-violet-300 text-sm hover:bg-violet-600/20 hover:border-violet-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
              >
                <Sparkles className={cn("h-3.5 w-3.5", isGenerating && "animate-pulse")} />
                {isGenerating ? "Generating…" : "✨ Generate"}
              </button>
            )}
          </div>

          {/* Submit */}
          <div className="py-2 mt-2 flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating…" : "Create Task"}
            </Button>
          </div>

        </form>
      </Form>
      <Toaster />
    </div>
  );
}

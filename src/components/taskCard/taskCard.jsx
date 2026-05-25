import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useUpdateTask } from "@/hooks/useUpdateTask.hook.js";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { RotateCcw, Check, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function TaskCard(props) {
  const { mutate, isSuccess } = useUpdateTask();
  const [progress, setProgress] = useState(false);
  const [isDeleting] = useState(false);
  const [completingStep, setCompletingStep] = useState(null); // null | 'flash' | 'collapse'
  const { projectId } = useParams();
  const navigate = useNavigate();

  const {
    title = "This is the default title",
    description = "This is the default description",
    status = "todo",
    priority = "normal",
    dueDate = new Date("2025-01-01T12:00:00.000Z"),
    id,
    permissions = {},
  } = props;

  const formattedDueDate = dueDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const fullDueDate = dueDate.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    if (status === "inProgress") setProgress(true);
  }, [status]);

  function handleProgressChange(checked) {
    setProgress(checked);
    mutate({ projectId, taskData: { _id: id, status: checked ? "inProgress" : "todo" } });
  }

  function handleTaskCompleted() {
    setCompletingStep("flash");
    setTimeout(() => setCompletingStep("collapse"), 400);
    mutate(
      { projectId, taskData: { _id: id, status: "completed" } },
      { onError: () => setCompletingStep(null) }
    );
  }

  function handleTaskReopen() {
    setProgress(false);
    mutate({ projectId, taskData: { _id: id, status: "todo" } });
  }

  function handleCardClick() {
    navigate(`/projects/${projectId}/tasks/${id}`);
  }

  return (
    <div
      className={cn(
        "w-full transition-all ease-in-out overflow-hidden",
        isDeleting || completingStep === "collapse"
          ? "duration-300 opacity-0 scale-95 max-h-0 mb-0 " +
            (isDeleting ? "-translate-x-4" : "-translate-y-2")
          : "duration-300 opacity-100 scale-100 translate-x-0 translate-y-0 max-h-[500px] mb-8"
      )}
    >
      <Card
        className={cn(
          "w-full min-w-96 cursor-pointer group transition-all duration-300",
          isDeleting
            ? "bg-red-500/10 border-red-500/30"
            : completingStep === "flash"
            ? "bg-green-500/10 border-green-500/50 shadow-[0_0_12px_2px_rgba(34,197,94,0.2)]"
            : "hover:bg-accent/50"
        )}
        onClick={handleCardClick}
      >
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className={cn("basis-2/3 text-lg font-semibold leading-6 transition-colors duration-300", completingStep === "flash" && "text-green-400")}>
            {title}
          </CardTitle>
          <div className="flex flex-wrap gap-2 justify-end items-center">
            {completingStep === "flash" && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/40 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Completed!
              </Badge>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="cursor-default">{formattedDueDate}</Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Due date: {fullDueDate}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  {priority === "normal"
                    ? <Badge className="bg-sky-800 cursor-default"   variant="outline">{priority}</Badge>
                    : priority === "high"
                    ? <Badge className="bg-red-800 cursor-default"   variant="outline">{priority}</Badge>
                    : <Badge className="bg-green-800 cursor-default" variant="outline">{priority}</Badge>
                  }
                </TooltipTrigger>
                <TooltipContent>
                  <p>Priority: {priority}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

          </div>
        </CardHeader>

        <CardContent>
          <CardDescription>{description}</CardDescription>
        </CardContent>

        <CardFooter
          className="flex justify-between"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center">
            {status === "completed" ? (
              <div className="text-muted-foreground font-bold">Task already completed</div>
            ) : (
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="in-progress"
                  className={cn(
                    "text-sm transition-colors",
                    !progress ? "text-foreground font-medium" : "text-muted-foreground"
                  )}
                >
                  Todo
                </Label>
                <Switch
                  id="in-progress"
                  checked={progress}
                  onCheckedChange={handleProgressChange}
                  disabled={!permissions.canEditTask}
                />
                <Label
                  htmlFor="in-progress"
                  className={cn(
                    "text-sm transition-colors",
                    progress ? "text-foreground font-medium" : "text-muted-foreground"
                  )}
                >
                  In Progress
                </Label>
              </div>
            )}
          </div>

          {permissions.canEditTask && (
            <div onClick={(e) => e.stopPropagation()}>
              {status === "completed" ? (
                <Button variant="outline" onClick={handleTaskReopen}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reopen Task
                </Button>
              ) : (
                <Button onClick={handleTaskCompleted}>Completed</Button>
              )}
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

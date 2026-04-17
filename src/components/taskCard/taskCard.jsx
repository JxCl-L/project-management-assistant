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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useUpdateTask } from "@/hooks/useUpdateTask.hook.js";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router";
import { RotateCcw } from "lucide-react";

export function TaskCard(props) {
  const { mutate, isSuccess } = useUpdateTask();
  const [progress, setProgress] = useState(false);
  const { projectId } = useParams();
  const navigate = useNavigate();

  const {
    title = "This is the default title",
    description = "This is the default description",
    status = "todo",
    priority = "normal",
    dueDate = new Date("2025-01-01001T12:00:00.000Z"),
    id,
    permissions = {},
  } = props;

  let formattedDueDate = dueDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  useEffect(() => {
    if (status === "inProgress") {
      setProgress(true);
    }
  }, [status]);

  // Progress change handler
  function handleProgressChange(checked) {
    // e.stopPropagation(); // e is not event but boolean, so cannot stopPropagation here
    setProgress(checked);
    let newStatus = checked ? "inProgress" : "todo";
    mutate({ projectId, taskData: { _id: id, status: newStatus } });
  }

  // Complete task handler
  function handleTaskCompleted() {
    // e.stopPropagation();
    mutate({ projectId, taskData: { _id: id, status: "completed" } });
  }

  // Reopen task handler
  function handleTaskReopen() {
    // e.stopPropagation();
    setProgress(false);
    mutate({ projectId, taskData: { _id: id, status: "todo" } });
  }

  function handleCardClick() {
    navigate(`/projects/${projectId}/tasks/${id}`);
  }

  return (
    <Card
      className="w-full mb-8 min-w-96 cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={handleCardClick}
    >
      {/* <div onClick={handleCardClick} className="cursor-pointer hover:bg-accent/50 transition-colors rounded-t-lg"> */}
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="basis-2/3 leading-8">{title}</CardTitle>
        <div className="flex flex-wrap gap-2 justify-end">
          <Badge variant="outline">{formattedDueDate}</Badge>

          {priority === "normal" && (
            <Badge className="bg-sky-800" variant="outline">
              {priority}
            </Badge>
          )}

          {priority === "high" && (
            <Badge className="bg-red-800" variant="outline">
              {priority}
            </Badge>
          )}

          {priority === "low" && (
            <Badge className="bg-green-800" variant="outline">
              {priority}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
      {/* </div> */}
      <CardFooter
        className="flex justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center">
          {status === "completed" ? (
            <div className="text-muted-foreground font-bold">
              Task already completed
            </div>
          ) : (
            <>
              {/* <Label className={`mr-4 ${progress ? 'opacity-40' : 'opacity-100'}`}>Todo</Label> */}
              <Switch
                id="in-progress"
                checked={progress}
                onCheckedChange={handleProgressChange}
                disabled={!permissions.canEditTask}
              />
              {/* <Label className={`ml-4 ${progress ? "opacity-100" : "opacity-40"}`}>In Progress</Label> */}
              <Label className="ml-4" htmlFor="in-progress">In Progress</Label>
            </>
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
  );
}

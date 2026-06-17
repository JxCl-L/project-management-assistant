import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useParams, useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import TaskDueDateSelection from "@/components/taskDueDateSelection/taskDueDateSelection.jsx";
import { useFetchTask } from "@/hooks/useFetchTask.hook.js";
import { useFetchProject } from "@/hooks/useFetchProject.hook.js";
import TaskPrioritySelection from "@/components/taskPrioritySelection/taskPrioritySelection.jsx";
import TaskStatusSelection from "@/components/taskStatusSelection/taskStatusSelection.jsx";
import TaskDescriptionEdit from "@/components/taskDescriptionEdit/taskDescriptionEdit.jsx";
import { lazy, Suspense } from "react";
const TaskContentEdit = lazy(() => import("@/components/taskContentEdit/taskContentEdit.jsx"));
import TaskTitleEdit from "@/components/taskTitleEdit/taskTitleEdit.jsx";
import { useTaskPresence } from "@/hooks/useTaskPresence.js";
import { PresenceAvatarStack } from "@/components/task/PresenceAvatarStack.jsx";
import { useDeleteTask } from "@/hooks/useDeleteTask.hook.js";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

export default function Task() {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();

  const {
    data: taskData,
    isError: isTaskError,
    isSuccess: isTaskSuccess,
    isPending: isTaskPending,
    error: taskError,
  } = useFetchTask(projectId, taskId);
  console.log(
    "Task Data:",
    taskData,
    isTaskError,
    isTaskSuccess,
    isTaskPending,
    taskError,
  );
  const {
    data: projectData,
    isError: isProjectError,
    isSuccess: isProjectSuccess,
    isPending: isProjectPending,
    error: projectError,
  } = useFetchProject(projectId);
  console.log("projectId:", projectId);
  console.log("Project Data:", projectData);
  if (projectData?.data) {
    console.log("Current Project Role:", projectData.data.curretnUserRole);
  }
  console.log("🔍 Project Query Status:", {
    isPending: isProjectPending,
    isSuccess: isProjectSuccess,
    isError: isProjectError,
    error: projectError,
    data: projectData,
  });

  const currentTask = taskData?.data[0];

  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask();

  function handleDelete() {
    deleteTask({ projectId, taskId }, {
      onSuccess: () => navigate(-1),
    });
  }

  const { roomUsers, fieldEditors, emitFieldFocus, emitFieldBlur } =
  // useTaskPresence(currentTask?._id);
  useTaskPresence(taskId, projectId);
  console.log(
    "projectId:",
    projectId,
    "taskId:",
    taskId,
    "currentTask:",
    currentTask,
  );
  console.log("👥 roomUsers:", roomUsers);

  const {
    _id,
    title = "This is the default title",
    description = "This is the default description",
    status = "todo",
    priority = "normal",
    dueDate,
    createdAt,
    createdBy,
    updatedAt = new Date(),
  } = currentTask || {};

  const creatorName = createdBy
    ? `${createdBy.firstName} ${createdBy.lastName || ""}`
    : "Unknown User";
  const creatorEmail = createdBy?.email || "Unknown Email";

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-AU", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isTaskPending) {
    return (
      <div className="flex flex-col p-8 h-full">
        <div className="text-center text-muted-foreground">Loading task...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-8 overflow-y-auto h-full">
      {/* breadcrumb */}
      <Breadcrumb className="px-8 mb-2">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/projects/${projectId}/tasks`}>Tasks</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Task</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* task info */}

      <section className="w-full mb-8 min-w-96">
        {/* task header */}

        <header className="p-8">
          <div className="flex flex-col gap-2">
            {/* Row 1: title + delete */}
            <div className="flex flex-row justify-between items-start gap-4">
              <TaskTitleEdit
                projectId={projectId}
                taskId={_id}
                initialTitle={title}
                role={projectData?.data?.currentUserRole}
              />
              {projectData?.data?.permissions?.canDeleteTask && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                      aria-label="Delete task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this task?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. The task and all its content will be permanently deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-destructive hover:bg-destructive/90 focus:ring-destructive"
                      >
                        {isDeleting ? "Deleting…" : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            {/* Row 2: avatars + creator + date */}
            <div className="flex items-center gap-3">
              <PresenceAvatarStack roomUsers={roomUsers} />
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <span>Created by <span className="text-foreground">{creatorName}</span></span>
                <span>·</span>
                <span>{formatDate(createdAt)}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-col gap-6 px-8">
          <div className="flex flex-row gap-4">
            {/* due date */}
            <TaskDueDateSelection
              projectId={projectId}
              taskId={_id}
              initialDueDate={dueDate}
              role={projectData?.data?.currentUserRole}
            />

            {/* priority */}
            <TaskPrioritySelection
              projectId={projectId}
              taskId={_id}
              initialPriority={priority}
              role={projectData?.data?.currentUserRole}
            />

            {/* status */}
            <TaskStatusSelection
              projectId={projectId}
              taskId={_id}
              initialStatus={status}
              role={projectData?.data?.currentUserRole}
            />
          </div>
          {/* description */}
          <TaskDescriptionEdit
            projectId={projectId}
            taskId={_id}
            initialDescription={description}
            role={projectData?.data?.currentUserRole}
            fieldEditors={fieldEditors}
            roomUsers={roomUsers}
            onFieldFocus={emitFieldFocus}
            onFieldBlur={emitFieldBlur}
          />
          {/* content */}
          <Suspense fallback={null}>
            <TaskContentEdit
              projectId={projectId}
              taskId={_id}
              role={projectData?.data?.currentUserRole}
              fieldEditors={fieldEditors}
              roomUsers={roomUsers}
              onFieldFocus={emitFieldFocus}
              onFieldBlur={emitFieldBlur}
            />
          </Suspense>
        </div>

        </section>
    </div>
  );
}

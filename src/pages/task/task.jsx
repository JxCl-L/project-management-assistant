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
import TaskContentEdit from "@/components/taskContentEdit/taskContentEdit.jsx";
import { useTaskPresence } from "@/hooks/useTaskPresence.js";
import { PresenceAvatarStack } from "@/components/task/PresenceAvatarStack.jsx";

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

  const { roomUsers, fieldEditors, emitFieldFocus, emitFieldBlur } =
    useTaskPresence(currentTask?._id);
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
      <div className="flex flex-col basis-11/12 p-8">
        <div className="text-center">Loading task...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col basis-11/12 p-8">
      {/* breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              onClick={(e) => {
                e.preventDefault();
                navigate(-1); // Go back to the previous page
              }}
              href={`/projects/${projectId}/tasks`}
            >
              All Tasks
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Task</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* task info */}

      <section className="w-full mb-8 min-w-96">
        {/* task header: read only */}

        <header className="p-8">
          <div className="flex flex-row justify-between items-center gap-4">
            <h1 className="text-2xl font-semibold leading-none tracking-tight">
              {title}
            </h1>
            <div className="flex items-center gap-3">
              <PresenceAvatarStack roomUsers={roomUsers} />
              <div className="flex items-center gap-1 text-sm text-center text-gray-400">
                <span>
                  Created by <span className="text-gray-100">{creatorName}</span>
                </span>
                <span>•</span>
                <span>{formatDate(createdAt)}</span>
              </div>
            </div>
          </div>
        </header>

        {/* editable fields */}

        {/* {projectData?.data?.currentUserRole === "viewer" ? 
        <div className="flex flex-row gap-4 px-8">
          <div>
            {description ? description : "No description provided"}
          </div>
          <Badge className="bg-sky-800" variant="outline" >
            Due Date: {dueDate ? formatDate(dueDate) : "No due date"}
          </Badge>
          <Badge>
            Priority: {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </Badge>
          <Badge>
            Status: {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
          
        </div>
        : */}

        <div className="flex flex-col gap-4 px-8">
          <div className="flex flex-row gap-4 h-20">
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
          <TaskContentEdit
            projectId={projectId}
            taskId={_id}
            role={projectData?.data?.currentUserRole}
            fieldEditors={fieldEditors}
            roomUsers={roomUsers}
            onFieldFocus={emitFieldFocus}
            onFieldBlur={emitFieldBlur}
          />
        </div>

        {/* } */}
      </section>
    </div>
  );
}

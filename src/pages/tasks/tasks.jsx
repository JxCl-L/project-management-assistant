import { FilterBar } from "@/components/filterBar/filterBar.jsx";
import { TaskCard } from "@/components/taskCard/taskCard.jsx";
import { TasksCounter } from "@/components/tasksCounter/tasksCounter.jsx";
import { TaskSidebar } from "@/components/taskSidebar/taskSidebar.jsx";
import { useFetchTasks } from "@/hooks/useFetchTasks.hook.js";
import { useFetchProjects } from "@/hooks/useFetchProjects.hook.js";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams, useParams } from "react-router";
import Cookies from "js-cookie";
import { ProjectSidebar } from "@/components/projectSidebar/projectSidebar.jsx";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { CreateTaskDialog } from "@/components/createTaskDialog/createTaskDialog.jsx";
import { TaskPagination } from "@/components/taskPagination/taskPagination.jsx";
import { AiPanel } from "@/components/aiPanel/aiPanel.jsx";
import { Sparkles } from "lucide-react";

function DisplaySkeleton() {
  return (
    <div className="flex items-center space-x-4 mb-12 w-full">
      <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
      <div className="space-y-2 flex-1 min-w-0">
        <Skeleton className="h-4 w-full max-w-[500px]" />
        <Skeleton className="h-4 w-4/5 max-w-[400px]" />
      </div>
    </div>
  );
}

function todaysDate() {
  const today = new Date();
  const options = {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  return today.toLocaleDateString("en-GB", options);
}

export default function Tasks() {
  const { projectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [aiPanelEverOpened, setAiPanelEverOpened] = useState(false);

  let queryLimit = searchParams.get("limit") ?? 5;
  let queryPage = searchParams.get("page") ?? 1;
  let queryOrder = searchParams.get("order") ?? "asc";
  let queryStatus = searchParams.get("status") ?? "todo,inProgress";

  const { data: projectsData } = useFetchProjects({ sortBy: "createdAt", order: "asc" });
  const project = projectsData?.data?.data?.find((p) => p._id === projectId);

  const { data, isError, isSuccess, isPending, error } = useFetchTasks({
    projectId: projectId,
    order: queryOrder,
    limit: parseInt(queryLimit),
    page: parseInt(queryPage),
    status: queryStatus,
  });

  const defaultSidebarOpen = Cookies.get("sidebar_state") !== "false";

  return (
    <SidebarProvider defaultOpen={defaultSidebarOpen}>
      <ProjectSidebar />
      <SidebarInset>
        {/* Main Content */}
        <main className="flex flex-col p-8 overflow-y-auto h-full">
          {/* Project Header */}
          <header className="mb-4 flex flex-row justify-between min-w-96">
            <SidebarTrigger className="md:hidden self-start mt-1 mr-2" />
            <div className="flex flex-col">
              <h1 className="text-2xl font-semibold mb-2">
                {project?.name || "Project"}
              </h1>
              <p className="text-muted-foreground text-sm">
                {project?.description || "No description available"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsAiPanelOpen((v) => !v);
                  setAiPanelEverOpened(true);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-all duration-150 ${
                  isAiPanelOpen
                    ? "bg-violet-600/20 border-violet-500/40 text-violet-300"
                    : "border-border text-foreground hover:bg-muted"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                AI
              </button>
              {project?.permissions?.canCreateTask && (
                <CreateTaskDialog
                  onClick={() => setIsCreateTaskDialogOpen(true)}
                  open={isCreateTaskDialogOpen}
                  onOpenChange={setIsCreateTaskDialogOpen}
                />
              )}
            </div>
          </header>

          {/* Tasks Section */}
          <div className="flex flex-col w-full items-center pt-4">
            <div className="w-11/12 flex flex-col items-center">
              {/* tasks counters */}
              {data && data.data && (
                <div className="flex flex-row justify-between mb-8 w-full min-w-96">
                  <TasksCounter
                    count={data ? data.pagination.meta.todoTasks : 0}
                    type="todo"
                  />
                  <TasksCounter
                    count={data ? data.pagination.meta.inProgressTasks : 0}
                    type="inProgress"
                  />
                  <TasksCounter
                    count={data ? data.pagination.meta.completedTasks : 0}
                    type="completed"
                  />
                </div>
              )}

              {/* filter bar */}
              {data && data.data && (
                <FilterBar paginationData={data.pagination} />
              )}

              {/* display skeletons while loading */}
              {!data &&
                [...Array(queryLimit)].map((_entry, index) => (
                  <DisplaySkeleton key={`${index}skel`} />
                ))}

              {/* display no tasks found if data is empty */}
              {data && data.data.length == 0 && (
                <div className="flex flex-col items-center justify-center w-full h-full">
                  <h2 className="text-muted-foreground text-lg">
                    No tasks found
                  </h2>
                </div>
              )}

              {/* display tasks when data is available */}
              {data &&
                data.data.length > 0 &&
                data.data.map((task) => (
                  <TaskCard
                    key={task._id}
                    title={task.title}
                    description={task.description}
                    status={task.status}
                    priority={task.priority}
                    dueDate={new Date(task.dueDate)}
                    id={task._id}
                    permissions={project?.permissions || {}}
                  />
                ))}

              {/* pagination */}
              {data && data.data.length > 0 && (
                <TaskPagination paginationData={data.pagination} />
              )}
            </div>
          </div>
        </main>
      </SidebarInset>

      {aiPanelEverOpened && (
        <AiPanel
          isOpen={isAiPanelOpen}
          onClose={() => setIsAiPanelOpen(false)}
          projectId={projectId}
          projectName={project?.name}
        />
      )}
    </SidebarProvider>
  );
}

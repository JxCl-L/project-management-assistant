import { FilterBar } from "@/components/filterBar/filterBar.jsx";
import { TaskCard } from "@/components/taskCard/taskCard.jsx";
import { TasksProgressBar } from "@/components/tasksCounter/tasksCounter.jsx";
import { ProjectHeaderEditable } from "@/components/projectHeaderEditable/projectHeaderEditable.jsx";
import { Toaster } from "@/components/ui/toaster";
import { TaskSidebar } from "@/components/taskSidebar/taskSidebar.jsx";
import { useFetchTasks } from "@/hooks/useFetchTasks.hook.js";
import { useFetchProjects } from "@/hooks/useFetchProjects.hook.js";
import { useState, lazy, Suspense, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams, useParams } from "react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CreateTaskDialog } from "@/components/createTaskDialog/createTaskDialog.jsx";
import { TaskPagination } from "@/components/taskPagination/taskPagination.jsx";
const AiPanel = lazy(() => import("@/components/aiPanel/aiPanel.jsx").then(m => ({ default: m.AiPanel })));
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

  // Prefetch AI panel chunk once tasks have loaded so first click is instant
  useEffect(() => {
    if (data) import("@/components/aiPanel/aiPanel.jsx");
  }, [!!data]);

  return (
    <>
      {/* Main Content */}
      <main className="flex flex-col p-8 overflow-y-auto h-full">
          <div className="w-11/12 mx-auto">

            {/* Top bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Tasks</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsAiPanelOpen((v) => !v);
                    setAiPanelEverOpened(true);
                  }}
                  className={`flex items-center gap-1.5 px-4 h-10 rounded-md border text-sm font-medium transition-all duration-150 ${
                    isAiPanelOpen
                      ? "border-[hsl(var(--ai-accent-border))] text-[hsl(var(--ai-accent))] bg-[hsl(var(--ai-accent-bg))]"
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
            </div>

            {/* Project Header */}
            <header className="mb-6">
              <ProjectHeaderEditable project={project} />
            </header>

            {/* Progress bar */}
            {data && data.data && (
              <TasksProgressBar
                todo={data.pagination.meta.todoTasks}
                inProgress={data.pagination.meta.inProgressTasks}
                completed={data.pagination.meta.completedTasks}
              />
            )}

            {/* Filter bar */}
            {data && data.data && (
              <FilterBar paginationData={data.pagination} />
            )}

            {/* Skeletons while loading */}
            {!data &&
              [...Array(queryLimit)].map((_entry, index) => (
                <DisplaySkeleton key={`${index}skel`} />
              ))}

            {/* Empty state */}
            {data && data.data.length === 0 && (
              <div className="flex justify-center mt-16">
                <h2 className="text-muted-foreground text-lg">No tasks found</h2>
              </div>
            )}

            {/* Task cards */}
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

            {/* Pagination */}
            {data && data.data.length > 0 && (
              <TaskPagination paginationData={data.pagination} />
            )}

          </div>
      </main>

      <Toaster />
      {aiPanelEverOpened && (
        <Suspense fallback={null}>
          <AiPanel
            isOpen={isAiPanelOpen}
            onClose={() => setIsAiPanelOpen(false)}
            projectId={projectId}
            projectName={project?.name}
          />
        </Suspense>
      )}
    </>
  );
}

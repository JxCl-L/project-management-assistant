import { FilterBar } from "@/components/filterBar/filterBar.jsx";
import { TaskCard } from "@/components/taskCard/taskCard.jsx";
import { TasksCounter } from "@/components/tasksCounter/tasksCounter.jsx";
import { TaskSidebar } from "@/components/taskSidebar/taskSidebar.jsx";
import { useFetchTasks } from "@/hooks/useFetchTasks.hook.js";
import { useState, useContext, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TasksContext } from "@/context/tasks.context.jsx";
import { ProjectsContext } from "@/context/projects.context.jsx";
import { useSearchParams, useParams } from "react-router";
import { ProjectSidebar } from "@/components/projectSidebar/projectSidebar.jsx";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
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
  const [searchParams, setSearchParams] = useSearchParams(); // searchParams object: represents the query parameters in the URL
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [aiPanelEverOpened, setAiPanelEverOpened] = useState(false);

  let queryLimit = searchParams.get("limit") ?? 5;
  let queryPage = searchParams.get("page") ?? 1;
  let queryOrder = searchParams.get("order") ?? "asc";
  let queryStatus = searchParams.get("status") ?? "todo,inProgress";

  // // first check if query params exist, else default values
  // const [order, setOrder] = useState(queryOrder ?? "asc");
  // const [limit, setLimit] = useState(queryLimit ?? 5);
  // const [page, setPage] = useState(queryPage ?? 1);
  const { tasks, setTasks } = useContext(TasksContext); // get tasks and setTasks from context
  const { currentProject, setCurrentProject } = useContext(ProjectsContext);

  const { data, isError, isSuccess, isPending, error } = useFetchTasks({
    projectId: projectId,
    order: queryOrder,
    limit: parseInt(queryLimit),
    page: parseInt(queryPage),
    status: queryStatus,
  });

  useEffect(() => {
    console.log(
      "🔄 Current project in Tasks component:",
      currentProject?.name,
      currentProject?._id,
      currentProject?.permissions
    );
  }, [currentProject]);

  useEffect(() => {
    console.log("📦 Data received in Tasks component:", data);
    console.log("📦 Current tasks before update:", tasks);

    if (data) {
      console.log("🔄 Updating tasks...");
      console.log("🆚 Are they the same?", tasks === data);
      setTasks(data);
    }
  }, [data, setTasks, tasks]); // Add tasks to see current value

  useEffect(() => {
    console.log("📦 Tasks in context updated:", tasks);
    console.log("📊 Has data?", !!tasks?.data);
  }, [tasks]);

  console.log("📊 Tasks component render state:", {
    data: data,
    hasData: !!data,
    isPending,
    isError,
    currentProjectId: currentProject?._id,
    currentProjectName: currentProject?.name,
    dataTasksCount: data?.data?.length,
  });

  // Filter tasks to exclude completed ones
  const activeTasks =
    data?.data?.filter((task) => task.status !== "completed") || [];

  return (
    <SidebarProvider>
      <div className="flex flex-row w-full h-screen overflow-hidden">
        {/* Sidebar toggle */}
        {/* <SidebarTrigger className="absolute top-4 left-4 z-50" /> */}

        {/* Project Sidebar */}
        <aside className="flex h-full basis-1/4 flex-shrink-0">
          <ProjectSidebar />
        </aside>

        {/* Main Content */}
        <main className="flex flex-col p-8 basis-3/4 overflow-y-auto">
          {/* Project Header */}
          <header className="mb-4 flex flex-row justify-between min-w-96">
            <div className="flex flex-col">
              <h1 className="text-2xl font-semibold mb-2">
                {currentProject?.name || "Project"}
              </h1>
              <p className="text-muted-foreground text-sm">
                {currentProject?.description || "No description available"}
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
              {currentProject?.permissions?.canCreateTask && (
                <CreateTaskDialog
                  onClick={() => setIsCreateTaskDialogOpen(true)}
                  open={isCreateTaskDialogOpen}
                  onOpenChange={setIsCreateTaskDialogOpen}
                />
              )}
            </div>
          </header>

          {/* Tasks Section */}
          <div className="flex flex-col w-full items-center pt-4 min-w-96">
            {/* Date & Create Task Button */}
            {/* <div className="flex flex-row justify-between items-center w-full gap-min-4 mb-8">
              <h1 className="text-white font-bold text-xl">
                Tasks as on: {todaysDate()}
              </h1>
              <CreateTaskDialog
                onClick={() => setIsCreateTaskDialogOpen(true)}
                open={isCreateTaskDialogOpen}
                onOpenChange={setIsCreateTaskDialogOpen}
              />
            </div> */}
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

              {/* task card list */}

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
                // data.data.map((task) => (
                data.data.map((task) => (
                  <TaskCard
                    key={task._id}
                    title={task.title}
                    description={task.description}
                    status={task.status}
                    priority={task.priority}
                    dueDate={new Date(task.dueDate)}
                    id={task._id}
                    permissions={currentProject?.permissions || {}}
                  />
                ))}

              {/* pagination */}
              {data && data.data.length > 0 && (
                <TaskPagination paginationData={data.pagination} />
              )}
            </div>
          </div>
        </main>
        {/* <section className="flex basis-1/3">
          <TaskSidebar />
        </section> */}
      </div>

      {aiPanelEverOpened && (
        <AiPanel
          isOpen={isAiPanelOpen}
          onClose={() => setIsAiPanelOpen(false)}
          projectId={projectId}
          projectName={currentProject?.name}
        />
      )}
    </SidebarProvider>
  );
}

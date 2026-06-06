import { ProjectSidebar } from "@/components/projectSidebar/projectSidebar.jsx";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useFetchDashboard } from "@/hooks/useFetchDashboard.hook.js";
import { useFetchCalendar } from "@/hooks/useFetchCalendar.hook.js";
import { useNavigate } from "react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { AlertCircle, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import Cookies from "js-cookie";
import { useState, useMemo, useRef } from "react";

const PRIORITY_COLORS = {
  high: "text-red-500",
  medium: "text-yellow-500",
  low: "text-muted-foreground",
};

const STATUS_DOT = {
  todo:       "hsl(var(--status-todo))",
  inProgress: "hsl(var(--status-in-progress))",
  completed:  "hsl(var(--status-completed))",
};

const STATUS_BG = {
  todo:       "hsl(var(--status-todo) / 0.25)",
  inProgress: "hsl(var(--status-in-progress) / 0.25)",
  completed:  "hsl(var(--status-completed) / 0.25)",
};

const CALENDAR_DAY_BG = "hsla(25, 95%, 55%, 0.25)";
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function CalendarView({ onNavigate }) {
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [animKey, setAnimKey] = useState(0);
  const [slideDir, setSlideDir] = useState(null); // "left" | "right"
  const animating = useRef(false);

  const from    = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const to      = `${year}-${String(month + 1).padStart(2, "0")}-${lastDay}`;

  const { data, isPending } = useFetchCalendar({ from, to });
  const tasks = data?.data?.tasks ?? [];

  const byDate = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      const d = new Date(t.dueDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [tasks]);

  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const grid = [];
    for (let i = 0; i < 42; i++) {
      const dayNum = i - startOffset + 1;
      if (dayNum < 1 || dayNum > lastDay) {
        grid.push(null);
      } else {
        const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
        grid.push({ dayNum, key, tasks: byDate[key] ?? [] });
      }
    }
    return grid;
  }, [year, month, lastDay, byDate]);

  const navigate = (dir) => {
    if (animating.current) return;
    animating.current = true;
    setSlideDir(dir);
    setAnimKey((k) => k + 1);
    if (dir === "left") {
      setMonth((m) => { if (m === 0) { setYear((y) => y - 1); return 11; } return m - 1; });
    } else {
      setMonth((m) => { if (m === 11) { setYear((y) => y + 1); return 0; } return m + 1; });
    }
    setTimeout(() => { animating.current = false; }, 300);
  };

  const prevMonth = () => navigate("left");
  const nextMonth = () => navigate("right");

  const dragStart = useRef(null);

  const onMouseDown = (e) => { dragStart.current = e.clientX; };
  const onMouseUp = (e) => {
    if (dragStart.current === null) return;
    const delta = e.clientX - dragStart.current;
    dragStart.current = null;
    if (Math.abs(delta) < 40) return;
    if (delta < 0) nextMonth(); else prevMonth();
  };
  const onMouseLeave = () => { dragStart.current = null; };

  const monthLabel = new Date(year, month).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <TooltipProvider delayDuration={100}>
      <div
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        className="select-none cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-foreground">Calendar</h2>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-1 rounded hover:bg-muted transition-colors">
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            </button>
            <span className="text-xs font-medium text-foreground w-32 text-center">{monthLabel}</span>
            <button onClick={nextMonth} className="p-1 rounded hover:bg-muted transition-colors">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {DAY_LABELS.map((d) => (
            <p key={d} className="text-xs text-muted-foreground text-center py-1">{d}</p>
          ))}
        </div>

        <style>{`
          @keyframes slide-in-left { from { opacity: 0; transform: translateX(-24px); } to { opacity: 1; transform: translateX(0); } }
          @keyframes slide-in-right { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: translateX(0); } }
          .cal-slide-left { animation: slide-in-left 0.25s ease both; }
          .cal-slide-right { animation: slide-in-right 0.25s ease both; }
        `}</style>

        {isPending ? (
          <div className="grid grid-cols-7 gap-1">
            {[...Array(35)].map((_, i) => <Skeleton key={i} className="h-9 rounded-md" />)}
          </div>
        ) : (
          <div
            key={animKey}
            className={`grid grid-cols-7 gap-1 ${slideDir === "left" ? "cal-slide-left" : slideDir === "right" ? "cal-slide-right" : ""}`}
          >
            {cells.map((cell, i) => {
              if (!cell) return <div key={i} />;
              const isToday = cell.key === todayKey;
              const hasTasks = cell.tasks.length > 0;

              const cellEl = (
                <div
                  key={cell.key}
                  className={`flex items-center justify-center h-9 rounded-md text-xs transition-colors
                    ${isToday ? "ring-1 ring-foreground/40" : ""}
                    ${hasTasks ? "cursor-pointer hover:opacity-75" : "text-muted-foreground"}
                  `}
                  style={hasTasks ? { backgroundColor: CALENDAR_DAY_BG } : {}}
                >
                  <span className={`font-medium ${hasTasks ? "text-foreground" : ""} ${isToday ? "underline underline-offset-2" : ""}`}>
                    {cell.dayNum}
                  </span>
                </div>
              );

              if (!hasTasks) return cellEl;

              return (
                <Tooltip key={cell.key}>
                  <TooltipTrigger asChild>{cellEl}</TooltipTrigger>
                  <TooltipContent side="top" className="p-2 max-w-xs flex flex-col gap-1.5">
                    {cell.tasks.map((t) => (
                      <button
                        key={t._id}
                        onClick={() => onNavigate(t.projectId, t._id)}
                        className="flex flex-col gap-1 p-2 rounded-md text-left hover:opacity-80 transition-opacity w-full"
                        style={{ backgroundColor: STATUS_BG[t.status] ?? STATUS_BG.todo }}
                      >
                        <p className="text-xs font-medium leading-snug">{t.title}</p>
                        <p className="text-xs text-muted-foreground">{t.projectName}</p>
                      </button>
                    ))}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

function MiniTaskCard({ task, onNavigate }) {
  return (
    <button
      onClick={() => onNavigate(task.projectId, task._id)}
      className="group flex flex-col gap-1.5 p-3 rounded-lg border border-border bg-card hover:border-foreground/30 hover:shadow-sm transition-all duration-150 text-left w-full"
    >
      <p className="text-sm font-medium leading-snug line-clamp-2">{task.title}</p>
      <p className="text-xs text-muted-foreground truncate">{task.projectName}</p>
      <div className="flex items-center gap-2 mt-0.5">
        <span
          className="text-xs px-1.5 py-0.5 rounded-sm font-medium"
          style={{
            backgroundColor: STATUS_DOT[task.status] + "22",
            color: STATUS_DOT[task.status],
          }}
        >
          {task.status === "inProgress" ? "In Progress" : task.status === "todo" ? "Todo" : "Completed"}
        </span>
        <span className={`text-xs font-medium ${PRIORITY_COLORS[task.priority] ?? "text-muted-foreground"}`}>
          {task.priority}
        </span>
        <span className="text-xs text-muted-foreground ml-auto">
          {new Date(task.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
        </span>
      </div>
    </button>
  );
}

function TaskList({ title, tasks, onNavigate, maxHeight = 320 }) {
  if (!tasks || tasks.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
        {title}
        <span className="text-xs text-muted-foreground font-normal">({tasks.length})</span>
      </h2>
      <div className="relative rounded-lg border border-border overflow-hidden" style={{ maxHeight }}>
        <div
          className="overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{
            maxHeight,
            maskImage: "linear-gradient(to bottom, transparent 0%, black 40px, black calc(100% - 40px), transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 40px, black calc(100% - 40px), transparent 100%)",
          }}
        >
          <div className="flex flex-col divide-y divide-border">
            {tasks.map((task) => (
              <button
                key={task._id}
                onClick={() => onNavigate(task.projectId, task._id)}
                className="flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <p className="text-sm font-medium truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.projectName}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <span className={`text-xs font-medium ${PRIORITY_COLORS[task.priority] ?? "text-muted-foreground"}`}>
                    {task.priority}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(task.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskSummaryChart({ taskCounts, onNavigate }) {
  const entries = Object.entries(taskCounts);
  if (entries.length === 0) return null;

  const maxTotal = Math.max(...entries.map(([, c]) => c.total));

  const segments = [
    { key: "todo",       status: "todo",       color: "hsl(var(--status-todo))",        label: "Todo" },
    { key: "inProgress", status: "inProgress",  color: "hsl(var(--status-in-progress))", label: "In Progress" },
    { key: "completed",  status: "completed",   color: "hsl(var(--status-completed))",   label: "Completed" },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-foreground flex items-center gap-2">
          Summary
        </h2>
        <div className="flex gap-4">
          {segments.map(({ key, color, label }) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {entries.map(([projectId, counts]) => (
          <div key={projectId} className="flex items-center gap-3">
            <p className="text-xs text-muted-foreground w-28 shrink-0 truncate pl-3" title={counts.projectName}>{counts.projectName}</p>
            <div className="flex flex-1 h-4 items-center bg-muted rounded-full gap-0.5 px-0.5">
              {(() => {
                const visible = segments.filter(({ key }) => counts[key] > 0);
                return visible.map(({ key, status, color }, i) => {
                  const isFirst = i === 0;
                  const isLast = i === visible.length - 1;
                  const radius = isFirst && isLast ? "rounded-full" : isFirst ? "rounded-l-full" : isLast ? "rounded-r-full" : "rounded-none";
                  return (
                    <button
                      key={key}
                      title={`${counts[key]} ${key}`}
                      onClick={() => onNavigate(projectId, status)}
                      className={`h-2.5 hover:h-4 transition-all duration-150 cursor-pointer ${radius}`}
                      style={{ width: `${(counts[key] / maxTotal) * 100}%`, backgroundColor: color }}
                    />
                  );
                });
              })()}
            </div>
            <p className="text-xs text-muted-foreground w-6 shrink-0">{counts.total}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 rounded-md" />)}
    </div>
  );
}

export default function Projects() {
  const navigate = useNavigate();
  const defaultSidebarOpen = Cookies.get("sidebar_state") !== "false";
  const { data: dashboardData, isPending } = useFetchDashboard();

  const taskCounts = dashboardData?.data?.taskCounts ?? {};
  const overdueTasks = dashboardData?.data?.overdueTasks ?? [];
  const nextDueTasks = dashboardData?.data?.nextDueTasks ?? [];

  return (
    <SidebarProvider defaultOpen={defaultSidebarOpen}>
      <section className="flex flex-row w-full h-screen overflow-hidden">

        {/* Sidebar */}
        <section className="flex h-full basis-1/4 flex-shrink-0">
          <ProjectSidebar collapsible="none" />
        </section>

        {/* Main Content */}
        <section className="flex flex-col p-8 basis-3/4 overflow-y-auto min-w-96">

          {isPending && <DashboardSkeleton />}

          {!isPending && (
            <>
              <TaskSummaryChart
                taskCounts={taskCounts}
                onNavigate={(projectId, status) => navigate(`/projects/${projectId}/tasks?status=${status}`)}
              />
              {/* Calendar + Coming Up side by side */}
              <div className="flex gap-6 mb-8 items-stretch">
                <div className="w-1/2 flex flex-col">
                  <CalendarView
                    onNavigate={(projectId, taskId) => navigate(`/projects/${projectId}/tasks/${taskId}`)}
                  />
                </div>
                <div className="w-1/2 flex flex-col min-h-0">
                  {nextDueTasks.length > 0 && (
                    <div className="flex flex-col h-full">
                      <h2 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2 flex-shrink-0">
                        Coming Up
                        <span className="text-xs text-muted-foreground font-normal">({nextDueTasks.length})</span>
                      </h2>
                      <div className="relative flex-1 min-h-0">
                        <div className="absolute inset-0 overflow-y-auto flex flex-col gap-2 pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
                          style={{ maskImage: "linear-gradient(to bottom, transparent 0%, black 48px, black calc(100% - 48px), transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 48px, black calc(100% - 48px), transparent 100%)" }}
                        >
                          <div className="h-3 flex-shrink-0" />
                          {nextDueTasks.map((task) => (
                            <MiniTaskCard
                              key={task._id}
                              task={task}
                              onNavigate={(projectId, taskId) => navigate(`/projects/${projectId}/tasks/${taskId}`)}
                            />
                          ))}
                          <div className="h-3 flex-shrink-0" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <TaskList
                title="Overdue"
                tasks={overdueTasks}
                onNavigate={(projectId, taskId) => navigate(`/projects/${projectId}/tasks/${taskId}`)}
              />
            </>
          )}

        </section>
      </section>
    </SidebarProvider>
  );
}

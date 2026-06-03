export function TasksProgressBar({ todo = 0, inProgress = 0, completed = 0 }) {
  const total = todo + inProgress + completed;
  const completedPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const todoPct = total > 0 ? (todo / total) * 100 : 0;
  const inProgressPct = total > 0 ? (inProgress / total) * 100 : 0;
  const completedPctBar = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="w-full mb-6">
      {/* header */}
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-sm font-medium text-foreground">Progress</span>
        <span className="text-sm text-muted-foreground">
          {completed}/{total} completed
          <span className="ml-1 font-medium text-foreground">({completedPct}%)</span>
        </span>
      </div>

      {/* segmented bar */}
      <div className="flex w-full h-2.5 rounded-full overflow-hidden bg-muted gap-0.5">
        {todo > 0 && (
          <div
            className="rounded-l-full transition-all duration-500"
            style={{ width: `${todoPct}%`, backgroundColor: "hsl(var(--status-todo))" }}
          />
        )}
        {inProgress > 0 && (
          <div
            className="transition-all duration-500"
            style={{ width: `${inProgressPct}%`, backgroundColor: "hsl(var(--status-in-progress))" }}
          />
        )}
        {completed > 0 && (
          <div
            className="rounded-r-full transition-all duration-500"
            style={{ width: `${completedPctBar}%`, backgroundColor: "hsl(var(--status-completed))" }}
          />
        )}
      </div>

      {/* legend */}
      <div className="flex gap-5 mt-2.5">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "hsl(var(--status-todo))" }} />
          <span className="text-xs text-muted-foreground">{todo} Todo</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "hsl(var(--status-in-progress))" }} />
          <span className="text-xs text-muted-foreground">{inProgress} In Progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "hsl(var(--status-completed))" }} />
          <span className="text-xs text-muted-foreground">{completed} Completed</span>
        </div>
      </div>
    </div>
  );
}

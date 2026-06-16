import { useFetchProjects } from "@/hooks/useFetchProjects.hook.js";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "react-router";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils.js";
import { Logout } from "@/components/logout/logout.jsx";
import { CreateProjectDialog } from "@/components/createProjectDialog/createProjectDialog.jsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Users, Trash2, Sun, Moon, Palette, Plus } from "lucide-react";
import { EditProjectDialog } from "@/components/editProjectDialog/editProjectDialog.jsx";
import { ManageMembersDialog } from "@/components/manageMembersDialog/manageMembersDialog.jsx";
import { UserProfile } from "@/components/userProfile/userProfile.jsx";

const THEMES = [
  { key: "light", label: "Light", icon: Sun },
  { key: "dark", label: "Dark", icon: Moon },
  { key: "solarized-light", label: "Solarized", icon: Palette },
];

function applyTheme(theme) {
  const root = document.documentElement;
  root.classList.remove("dark", "solarized-light");
  if (theme === "dark") root.classList.add("dark");
  else if (theme === "solarized-light") root.classList.add("solarized-light");
  localStorage.setItem("theme", theme);
}

export function ProjectSidebar({ collapsible = "offcanvas" }) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;

  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem("theme") ?? "dark");

  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  const [editProjectDialogOpen, setEditProjectDialogOpen] = useState(false);
  const [manageMembersDialogOpen, setManageMembersDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const { data, isError, isPending, error } = useFetchProjects({
    sortBy: "createdAt",
    order: "asc",
  });

  const projects = data?.data?.data ?? [];

  const selectProject = (project) => {
    navigate(`/projects/${project._id}/tasks`);
  };

  const handleEditProject = (project, e) => {
    e.stopPropagation();
    setSelectedProject(project);
    setEditProjectDialogOpen(true);
  };

  const handleManageMembers = (project, e) => {
    e.stopPropagation();
    setSelectedProject(project);
    setManageMembersDialogOpen(true);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "manager":
        return "bg-[hsl(var(--role-manager-bg))] text-[hsl(var(--role-manager-text))]";
      case "editor":
        return "bg-[hsl(var(--role-editor-bg))] text-[hsl(var(--role-editor-text))]";
      case "viewer":
        return "bg-[hsl(var(--role-viewer-bg))] text-[hsl(var(--role-viewer-text))]";
      default:
        return "bg-[hsl(var(--role-viewer-bg))] text-[hsl(var(--role-viewer-text))]";
    }
  };


  return (
    <>
      <Sidebar
          collapsible={collapsible}
          className="flex flex-col h-full bg-sidebar-background text-sidebar-foreground border-r border-sidebar-border"
        >
          <SidebarHeader className="p-4 border-b border-sidebar-border flex-shrink-0">
            <div className="flex items-center justify-between">
              <h1 className="font-semibold text-xl">Projects</h1>
              <div className="flex items-center gap-1">
                <CreateProjectDialog
                  trigger={
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">New project</span>
                    </Button>
                  }
                />
                <SidebarTrigger />
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="flex-1 overflow-y-auto px-2 py-2 min-h-0">
            {isPending ? (
              <div className="flex flex-col gap-2 px-3 py-2">
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8 rounded-md" />)}
              </div>
            ) : isError ? (
              <div className="px-3 py-2 flex flex-col gap-2">
                <p className="text-xs text-muted-foreground">Failed to load projects.</p>
                <Button size="sm" variant="outline" onClick={() => window.location.reload()}>Retry</Button>
              </div>
            ) : projects.length === 0 ? (
              <p className="text-muted-foreground text-sm px-3 py-2">No projects found.</p>
            ) : (
              projects.map((project) => {
                const permissions = project.permissions || {};
                const userRole = project.userRole || "viewer";
                const isActive = projectId === project._id;

                return (
                  <div
                    key={project._id}
                    className={cn(
                      // Named group prevents hover leaking from any ancestor with class="group"
                      "group/item relative flex items-center w-full pr-1 py-1.5 rounded-md cursor-pointer transition-colors duration-150",
                      // Left accent bar space: pl-3 normally, content shifts right on active via the bar
                      "pl-3",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    {/* Active indicator bar — absolutely positioned, never shifts layout */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-foreground/60" />
                    )}

                    {/* Project name — gets full row width at rest; on hover the absolutely-positioned
                        badge + button overlay the right edge so layout never shifts */}
                    <button
                      onClick={() => selectProject(project)}
                      className="flex-1 text-left text-sm truncate min-w-0 pr-2"
                      style={{ fontWeight: isActive ? 600 : 400 }}
                    >
                      {project.name}
                    </button>

                    {/* Role badge + actions — absolutely positioned on the right, only appear on hover.
                        They overlay the title rather than squeezing it, so title width is always full. */}
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity duration-150 bg-sidebar-accent rounded-md pl-2">
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap",
                          getRoleBadgeColor(userRole)
                        )}
                      >
                        {userRole}
                      </span>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 flex-shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Project actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {permissions.canEditProject && (
                          <DropdownMenuItem onClick={(e) => handleEditProject(project, e)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Project
                          </DropdownMenuItem>
                        )}
                        {permissions.canViewMembers && (
                          <DropdownMenuItem onClick={(e) => handleManageMembers(project, e)}>
                            <Users className="mr-2 h-4 w-4" />
                            {permissions.canEditMembers ? "Manage Members" : "View Members"}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    </div>
                  </div>
                );
              })
            )}
          </SidebarContent>

          <SidebarFooter className=" flex flex-row justify-between border-t border-sidebar-border p-4 bg-sidebar-accent/20 flex-shrink-0">
            <UserProfile
              firstName={user?.firstName}
              lastName={user?.lastName}
              email={user?.email}
              userId={user?._id}
            />
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    {(() => {
                      const Icon = THEMES.find(t => t.key === currentTheme)?.icon ?? Palette;
                      return <Icon className="h-4 w-4" />;
                    })()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {THEMES.map(({ key, label, icon: Icon }) => (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => setCurrentTheme(key)}
                      className={cn("flex items-center gap-2", currentTheme === key && "font-semibold")}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                      {currentTheme === key && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Logout />
            </div>
          </SidebarFooter>
        </Sidebar>


      <EditProjectDialog
        project={selectedProject}
        open={editProjectDialogOpen}
        onOpenChange={setEditProjectDialogOpen}
      />
      <ManageMembersDialog
        project={selectedProject}
        open={manageMembersDialogOpen}
        onOpenChange={setManageMembersDialogOpen}
        readOnly={selectedProject?.permissions?.canEditMembers ? false : true}
      />
    </>
  );
}

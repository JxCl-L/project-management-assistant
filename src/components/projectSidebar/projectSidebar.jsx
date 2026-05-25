import { useFetchProjects } from "@/hooks/useFetchProjects.hook.js";
import { useNavigate, useParams } from "react-router";
import { useState } from "react";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  useSidebar,
  SidebarGroup,
  SidebarHeader,
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
import { MoreVertical, Pencil, Users, Trash2 } from "lucide-react";
import { EditProjectDialog } from "@/components/editProjectDialog/editProjectDialog.jsx";
import { ManageMembersDialog } from "@/components/manageMembersDialog/manageMembersDialog.jsx";
import { UserProfile } from "@/components/userProfile/userProfile.jsx";

export function ProjectSidebar() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;

  const { open, toggleSidebar } = useSidebar();
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
        return "bg-blue-500/20 text-blue-300";
      case "editor":
        return "bg-green-500/20 text-green-300";
      case "viewer":
        return "bg-gray-500/20 text-gray-300";
      default:
        return "bg-gray-500/20 text-gray-300";
    }
  };

  if (isPending) {
    return <div>Loading projects...</div>;
  }

  if (isError) {
    return (
      <div className="ml-2 my-2">
        Error loading projects: {error.message}
        <Button className="mt-2" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <>
      <Sidebar
          collapsible="offcanvas"
          className="flex flex-col h-full bg-sidebar-background text-sidebar-foreground border-r border-sidebar-border"
        >
          <SidebarHeader className=" text-xl p-4 border-b border-sidebar-border flex-shrink-0">
            <h1 className="font-semibold">Projects</h1>
            <p className="text-muted-foreground text-sm mb-2">
              Manage your projects by selecting from the list
            </p>
            <CreateProjectDialog />
          </SidebarHeader>

          <SidebarContent className="flex-1 overflow-y-auto  px-2 py-4 min-h-0">
            {projects.length === 0 ? (
              <p className="text-muted-foreground text-sm px-2">
                No projects found.
              </p>
            ) : (
              projects.map((project) => {
                const permissions = project.permissions || {};
                const userRole = project.userRole || "viewer";
                return (
                  <div
                    key={project._id}
                    className={cn(
                      "group relative flex w-full pl-4 pr-1 py-1 rounded-md transition-colors duration-150",
                      projectId === project._id
                        ? "bg-sidebar-primary text-sidebar-primary-foreground font-bold"
                        : "bg-sidebar-background text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <button
                      onClick={() => selectProject(project)}
                      variant="ghost"
                      className="flex-1 text-left"
                    >
                      <p className="font-medium">{project.name}</p>
                      <Badge
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          getRoleBadgeColor(userRole)
                        )}
                        variant="secondary"
                      >
                        {userRole}
                      </Badge>
                    </button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity",
                            projectId === project._id && "opacity-100"
                          )}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-48">
                        {permissions.canEditProject && (
                          <DropdownMenuItem
                            onClick={(e) => handleEditProject(project, e)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Project
                          </DropdownMenuItem>
                        )}
                        {permissions.canViewMembers && (
                          <DropdownMenuItem
                            onClick={(e) => handleManageMembers(project, e)}
                          >
                            <Users className="mr-2 h-4 w-4" />
                            {permissions.canEditMembers
                              ? "Manage Members"
                              : "View Members"}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
            />
            <Logout />
          </SidebarFooter>
        </Sidebar>

      {/* Edge toggle tab */}
      <button
        onClick={toggleSidebar}
        style={{ left: open ? "calc(var(--sidebar-width) - 1px)" : "0" }}
        className="fixed top-1/2 -translate-y-1/2 z-50 h-10 w-5 hidden md:flex items-center justify-center rounded-r-md bg-sidebar border-y border-r border-sidebar-border shadow-sm hover:bg-sidebar-accent transition-[left] duration-200 ease-linear"
        aria-label="Toggle sidebar"
      >
        {open ? (
          <ChevronLeft className="h-3 w-3 text-sidebar-foreground" />
        ) : (
          <ChevronRight className="h-3 w-3 text-sidebar-foreground" />
        )}
      </button>

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

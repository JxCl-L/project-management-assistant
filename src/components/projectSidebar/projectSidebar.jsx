import { ProjectsContext } from "@/context/projects.context.jsx";
import { useFetchProjects } from "@/hooks/useFetchProjects.hook.js";
import { useNavigate, useSearchParams, useParams } from "react-router";
import { useMemo, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
  console.log("🌍 Environment check:", {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    mode: import.meta.env.MODE,
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const { projectId } = useParams();
  const navigate = useNavigate();
  const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;

  const { projects, setProjects, currentProject, setCurrentProject } =
    useContext(ProjectsContext);

  const [editProjectDialogOpen, setEditProjectDialogOpen] = useState(false);
  const [manageMembersDialogOpen, setManageMembersDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  let querySortBy = searchParams.get("sortBy") ?? "createdAt";
  let queryOrder = searchParams.get("order") ?? "asc";
  let querySearch = searchParams.get("search") ?? "";
  let queryStatus = searchParams.get("status") ?? "todo,inProgress";

  const { data, isError, isSuccess, isPending, error, fetchStatus } =
    useFetchProjects({
      sortBy: querySortBy,
      order: queryOrder,
      search: querySearch,
      status: queryStatus,
    });

  // update projects in context when data fetched
  useEffect(() => {
    console.log("🔄 useEffect triggered with projects data:", data);
    if (data?.data?.data) {
      setProjects(data.data.data);
    }
    console.log("✅ Projects set in context:", data?.data?.data);
    // console.log("📊 Current projects in context:", projects);
    // projects = [] while data.data.data has values.
    // why: setProjects is asynchronous.
    // When you call setProjects(data.data),
    // the projects state doesn't update immediately in that same render.
    // It will update in the next render.
    // So when you log projects right after setProjects,
    // you're seeing the old value (empty array []),
    // not the new value.
  }, [data, setProjects]);

  const selectProject = (project) => {
    console.log("Selecting project:", project.name, "Role:", project.userRole);
    setCurrentProject(project);
    navigate(`/projects/${project._id}/tasks`);
  };

  // Sync currentProject with URL param projectId
  useEffect(() => {
    if (projects.length > 0 && projectId) {
      const matched = projects.find((p) => p._id === projectId);
      if (matched) {
        setCurrentProject(matched);
        console.log(
          "🎯 Current project set:",
          matched.name,
          "Role:",
          matched.userRole
        );
      }
    }
  }, [projects, projectId, setCurrentProject]);

  console.log("📊 fetchProjects component state:", {
    fetchStatus,
    isPending,
    isError,
    hasData: !!data,
    projectsInContext: projects,
    currentProjectInContext: currentProject?.name,
    currentRole: currentProject?.userRole,
    error: error?.message,
  });

  // handlers for dropdown menu actions
  const handleEditProject = (project, e) => {
    e.stopPropagation();
    console.log("✏️ Edit project:", project.name);
    setSelectedProject(project);
    setEditProjectDialogOpen(true);
  };

  const handleManageMembers = (project, e) => {
    e.stopPropagation();
    console.log("👥 Manage members for project:", project.name);
    setSelectedProject(project);
    setManageMembersDialogOpen(true);
  };

  // helper to get role badge colors
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
        <Button className="mt-2" onClick={() => setSearchParams({})}>Retry</Button>
      </div>
    );
  }

  console.log("✅ Projects fetched:", projects);
  // const projectList = Array.isArray(projects.data) ? projects.data : [];
  // console.log("📋 project to array as projectList:", projectList);

  return (
    <>
      <div className="flex flex-col items-center h-full">
        {/* <h1 className="text-white font-bold text-2xl mb-8 w-full">Projects</h1>
      <ScrollArea className="h-[500px] w-full">
        <div className="p-2 space-y-1">
          {projects.length === 0 ? (
            <p>No projects found.</p>
          ) : (
            projects.map((project) => (
              <Card
                key={project._id}
                variant="ghost"
                className={cn(
                  "w-full justify-start hover:bg-gray-700 radius-0 rounded-none",
                  currentProject._id === project._id ? 
                  "bg-zinc-600 text-white font-bold" 
                  : 
                  "text-gray-200"

                )}
                onClick={() => selectProject(project)}
              >
                {project.name}
              </Card>
            ))
          )}
        </div>
      </ScrollArea> */}
        <Sidebar
          collapsible="none"
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
            {/* <div className="flex-1 overflow-y-scroll px-2 py-4"> */}

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
                    )} // group: hover to show dropdown menu
                  >
                    {/* project name and role badge */}
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

                    {/* dropdown menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity",
                            projectId === project._id && "opacity-100"
                          )}
                          onClick={(e) => e.stopPropagation()} // prevent triggering parent onClick: select project
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

                        {/* <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={(e) => handleDeleteProject(project, e)}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Project
                    </DropdownMenuItem> */}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })
            )}
          </SidebarContent>
          {/* </div> */}
          <SidebarFooter className=" flex flex-row justify-between border-t border-sidebar-border p-4 bg-sidebar-accent/20 flex-shrink-0">
            <UserProfile
              firstName={user?.firstName}
              lastName={user?.lastName}
              email={user?.email}
            />
            <Logout />
          </SidebarFooter>
        </Sidebar>
      </div>
      {/* Edit Project Dialog */}
      <EditProjectDialog
        project={selectedProject}
        open={editProjectDialogOpen}
        onOpenChange={setEditProjectDialogOpen}
      />
      {/* Manage Members Dialog */}
      <ManageMembersDialog
        project={selectedProject}
        open={manageMembersDialogOpen}
        onOpenChange={setManageMembersDialogOpen}
        readOnly={selectedProject?.permissions?.canEditMembers ? false : true}
      />
    </>
  );
}

import { ProjectSidebar } from "@/components/projectSidebar/projectSidebar.jsx";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CreateProjectDialog } from "@/components/createProjectDialog/createProjectDialog.jsx";


export default function Projects() {

  return (
    <SidebarProvider>
      <section className="flex flex-row w-full h-screen overflow-hidden">

        {/* Sidebar section */}
        <section className="flex h-full basis-1/4 flex-shrink-0">
          <ProjectSidebar collapsible="none" />
        </section>

        {/* Main Content */}
        <section className="flex p-4 basis-3/4  overflow-y-auto place-items-center min-w-96">
          <div className="flex flex-col w-full p-4 place-items-center">
            <h2 className="text-xl font-medium text-center">
              Select a project to view tasks
            </h2>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Or create a new project to start managing tasks
            </p>
            {/* <Button variant="default" className="mt-4">Create New Project</Button> */}
            <div className="[&_button]:bg-foreground [&_button]:text-background mt-4">
              <CreateProjectDialog />
            </div>
            
          </div>
        </section>
      </section>
    </SidebarProvider>
  );
}

import { Outlet } from "react-router";
import Cookies from "js-cookie";
import { ProjectSidebar } from "@/components/projectSidebar/projectSidebar.jsx";
import { SidebarProvider, SidebarInset, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

function ClosedSidebarTrigger() {
  const { open, isMobile } = useSidebar();
  if (!isMobile && open) return null;
  return <SidebarTrigger className="fixed top-4 left-4 z-30" />;
}

export default function AppLayout() {
  const defaultOpen = Cookies.get("sidebar_state") !== "false";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <ProjectSidebar />
      <SidebarInset className="h-screen overflow-hidden">
        <ClosedSidebarTrigger />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}

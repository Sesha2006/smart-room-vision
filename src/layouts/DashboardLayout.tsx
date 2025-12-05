import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { cn } from "@/lib/utils";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "SmartRoom Dashboard", subtitle: "Welcome back, Admin" },
  "/rooms": { title: "Room Management", subtitle: "Monitor and control all rooms" },
  "/devices": { title: "Hardware Connectivity", subtitle: "Manage your IoT devices" },
  "/notifications": { title: "Notifications", subtitle: "System alerts and updates" },
  "/analytics": { title: "Analytics", subtitle: "Insights and reports" },
  "/history": { title: "Activity History", subtitle: "Track all system events" },
  "/settings": { title: "Settings", subtitle: "Configure your preferences" },
};

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  const currentPage = pageTitles[location.pathname] || pageTitles["/"];

  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300",
        "lg:ml-[260px]"
      )}>
        {/* Topbar */}
        <Topbar 
          title={currentPage.title}
          subtitle={currentPage.subtitle}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Page Content */}
        <main className="px-4 lg:px-8 pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

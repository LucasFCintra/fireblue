import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { cn } from "@/lib/utils";

export default function Layout() {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <div 
        className={cn(
          "flex flex-col flex-1 w-full transition-all duration-300 ease-in-out",
          sidebarOpen ? "md:ml-64" : "md:ml-16"
        )}
      >
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

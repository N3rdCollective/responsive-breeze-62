
import React from 'react';
import { Outlet } from 'react-router-dom';
import { StaffAuthProvider } from '@/hooks/useStaffAuth';
import StaffSidebar from '@/components/staff/StaffSidebar';
import StaffRouteProtection from '@/components/staff/StaffRouteProtection';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const StaffLayout: React.FC = () => {
  return (
    <StaffAuthProvider>
      <StaffRouteProtection>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-background text-foreground">
            <StaffSidebar />
            <main className="flex-1 flex flex-col overflow-hidden min-w-0">
              <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
                <SidebarTrigger className="lg:hidden" />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="hidden sm:inline">Staff Panel</span>
                </div>
              </div>
              <div className="flex-grow p-3 sm:p-4 md:p-6 overflow-auto">
                <div className="max-w-full">
                  <Outlet />
                </div>
              </div>
            </main>
          </div>
        </SidebarProvider>
      </StaffRouteProtection>
    </StaffAuthProvider>
  );
};

export default StaffLayout;

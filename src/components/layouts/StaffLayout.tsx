
import React from 'react';
import { Outlet } from 'react-router-dom';
import { StaffAuthProvider } from '@/hooks/useStaffAuth';
import StaffSidebar from '@/components/staff/StaffSidebar';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const StaffLayout: React.FC = () => {
  return (
    <StaffAuthProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background text-foreground">
          <StaffSidebar />
          <main className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b">
              <SidebarTrigger className="md:hidden" />
            </div>
            <div className="flex-grow p-4 md:p-6 overflow-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </StaffAuthProvider>
  );
};

export default StaffLayout;

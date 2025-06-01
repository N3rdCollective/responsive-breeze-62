
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { 
  LayoutDashboard, 
  Newspaper, 
  Video, 
  Radio, 
  Users, 
  ShieldCheck, 
  MessageSquare,
  LogOut,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const mainNavigationItems = [
  { title: 'Dashboard', href: '/staff/panel', icon: LayoutDashboard },
  { title: 'Featured Videos', href: '/staff/panel?tab=videos', icon: Video },
  { title: 'News', href: '/staff/news/editor', icon: Newspaper },
  { title: 'Shows', href: '/staff/shows', icon: Radio },
  { title: 'Users', href: '/staff/users', icon: Users },
  { title: 'Forum', href: '/staff/forum', icon: MessageSquare },
  { title: 'Moderation', href: '/staff/moderation', icon: ShieldCheck },
];

const StaffSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { staffName, handleLogout, userRole } = useStaffAuth();

  const onLogout = async () => {
    await handleLogout();
    navigate('/staff/login');
  };

  return (
    <Sidebar className="border-r bg-background w-64 lg:w-72">
      <SidebarHeader className="p-3 sm:p-4 border-b">
        <Link to="/staff/panel" className="text-lg sm:text-xl font-semibold text-primary truncate">
          Staff Panel
        </Link>
        {staffName && (
          <div className="text-xs text-muted-foreground mt-1 truncate">
            <span className="hidden sm:inline">Logged in as </span>
            <span className="font-medium">{staffName}</span>
            <span className="ml-1 px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[10px] uppercase tracking-wider">
              {userRole}
            </span>
          </div>
        )}
      </SidebarHeader>
      
      <SidebarContent className="flex-grow px-2 sm:px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground px-2 py-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainNavigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className={`w-full ${location.pathname === item.href ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
                  >
                    <Link to={item.href} className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors">
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="mt-4">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  className="w-full hover:bg-muted"
                >
                  <button 
                    onClick={() => window.open('/', '_blank')}
                    className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors w-full text-left"
                  >
                    <ArrowLeft className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Back to Website</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-3 sm:p-4 border-t">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onLogout} 
          className="w-full justify-start"
        >
          <LogOut className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default StaffSidebar;

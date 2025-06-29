
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
import { useAuth } from "@/hooks/useAuth";
import { 
  LayoutDashboard, 
  Newspaper, 
  Video, 
  Radio, 
  Users, 
  ShieldCheck, 
  MessageSquare,
  LogOut,
  ArrowLeft,
  BarChart3,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const mainNavigationItems = [
  { title: 'Dashboard', href: '/staff/panel', icon: LayoutDashboard },
  { title: 'Analytics', href: '/staff/analytics', icon: BarChart3 },
  { title: 'News', href: '/staff/news', icon: Newspaper },
  { title: 'Featured Videos', href: '/staff/videos', icon: Video },
  { title: 'Shows', href: '/staff/shows', icon: Radio },
  { title: 'Users', href: '/staff/users', icon: Users },
  { title: 'Sponsors', href: '/staff/sponsors', icon: Star },
  { title: 'Forum', href: '/staff/forum', icon: MessageSquare },
  { title: 'Moderation', href: '/staff/moderation', icon: ShieldCheck },
];

const StaffSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, staffRole, logout } = useAuth();

  const staffName = user?.user_metadata?.display_name || user?.user_metadata?.first_name || user?.email || 'Staff Member';

  const onLogout = async () => {
    await logout();
    navigate('/staff/login');
  };

  // Helper function to check if a navigation item is active
  const isItemActive = (href: string) => {
    return location.pathname === href;
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
              {staffRole}
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
                    className={`w-full ${isItemActive(item.href) ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
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
                    onClick={() => navigate('/')}
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

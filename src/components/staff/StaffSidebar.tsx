
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
} from "@/components/ui/sidebar"; // Assuming these are correct exports from your setup
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { 
  LayoutDashboard, 
  Newspaper, 
  Home, 
  Radio, 
  Users, 
  ShieldCheck, 
  MessageSquare,
  LogOut,
  Settings // Added Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button'; // For logout button styling

const mainNavigationItems = [
  { title: 'Dashboard', href: '/staff/panel', icon: LayoutDashboard },
  { title: 'Homepage', href: '/staff/home', icon: Home },
  { title: 'News', href: '/staff/news/editor', icon: Newspaper }, // Link to news editor or a future news list
  { title: 'Shows', href: '/staff/shows', icon: Radio },
  { title: 'Users', href: '/staff/users', icon: Users },
  { title: 'Forum', href: '/staff/forum', icon: MessageSquare },
  { title: 'Moderation', href: '/staff/moderation', icon: ShieldCheck },
  // { title: 'Settings', href: '/staff/settings', icon: Settings }, // Example, if you have a settings page
];

const StaffSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { staffName, handleLogout, userRole } = useStaffAuth();

  const onLogout = async () => {
    await handleLogout();
    navigate('/staff/login'); // Redirect to login after logout
  };

  return (
    <Sidebar className="border-r bg-background">
      <SidebarHeader className="p-4">
        <Link to="/staff/panel" className="text-xl font-semibold text-primary">
          Staff Panel
        </Link>
        {staffName && <p className="text-xs text-muted-foreground mt-1">Logged in as {staffName} ({userRole})</p>}
      </SidebarHeader>
      <SidebarContent className="flex-grow">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavigationItems.map((item) => (
                <SidebarMenuItem key={item.title} className={location.pathname === item.href ? 'bg-muted' : ''}>
                  <SidebarMenuButton asChild>
                    <Link to={item.href} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <Button variant="outline" size="sm" onClick={onLogout} className="w-full">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default StaffSidebar;

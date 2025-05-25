import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  // DialogTrigger, // Not explicitly used for programmatic open
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  ArrowLeft, 
  Radio, 
  Edit, 
  Trash2,
  Clock,
  Calendar,
  Users,
  Search
} from "lucide-react";
import TitleUpdater from "@/components/TitleUpdater";

interface Show {
  id: string;
  title: string;
  description: string;
  host_name: string;
  time_slot: string;
  day_of_week: string;
  duration: number; // in minutes
  status: 'active' | 'inactive' | 'scheduled';
  created_at: string;
}

const StaffShowsManager = () => {
  const navigate = useNavigate();
  const { userRole, isLoading: authLoading } = useStaffAuth();
  const { toast } = useToast();
  
  const [shows, setShows] = useState<Show[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingShow, setEditingShow] = useState<Show | null>(null);
  const [formData, setFormData] = useState<Omit<Show, 'id' | 'created_at'>>({
    title: '',
    description: '',
    host_name: '',
    time_slot: '12:00',
    day_of_week: 'Monday',
    duration: 60,
    status: 'active'
  });

  useEffect(() => {
    const mockShowsData: Show[] = [
      { id: '1', title: 'Morning Drive Time', description: 'Start your day with the best music and news.', host_name: 'DJ Sarah', time_slot: '07:00', day_of_week: 'Monday', duration: 180, status: 'active', created_at: new Date().toISOString() },
      { id: '2', title: 'Evening Chill Zone', description: 'Unwind with smooth tunes.', host_name: 'MC Alex', time_slot: '19:00', day_of_week: 'Wednesday', duration: 120, status: 'active', created_at: new Date().toISOString() },
      { id: '3', title: 'Weekend Rock Block', description: 'Rock anthems all weekend.', host_name: 'Rocky Rhodes', time_slot: '14:00', day_of_week: 'Saturday', duration: 240, status: 'scheduled', created_at: new Date().toISOString() },
    ];
    setTimeout(() => {
      setShows(mockShowsData);
      setIsLoading(false);
    }, 500);
  }, []);

  const filteredShows = shows.filter(show =>
    show.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    show.host_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (field: keyof typeof formData, value: string | number | 'active' | 'inactive' | 'scheduled') => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateShow = () => {
    setEditingShow(null);
    setFormData({
      title: '', description: '', host_name: '',
      time_slot: '12:00', day_of_week: 'Monday', duration: 60, status: 'active'
    });
    setIsDialogOpen(true);
  };

  const handleEditShow = (show: Show) => {
    setEditingShow(show);
    setFormData({
      title: show.title,
      description: show.description,
      host_name: show.host_name,
      time_slot: show.time_slot,
      day_of_week: show.day_of_week,
      duration: show.duration,
      status: show.status
    });
    setIsDialogOpen(true);
  };

  const handleSaveShow = () => {
    if (!formData.title || !formData.host_name || !formData.time_slot || !formData.day_of_week) {
      toast({ title: "Validation Error", description: "Please fill in all required fields: Title, Host, Day, and Time.", variant: "destructive" });
      return;
    }

    if (editingShow) {
      setShows(prevShows => prevShows.map(s => s.id === editingShow.id ? { ...s, ...formData, id: editingShow.id, created_at: editingShow.created_at } : s));
      toast({ title: "Success", description: "Show updated successfully." });
    } else {
      const newShow: Show = { ...formData, id: Date.now().toString(), created_at: new Date().toISOString() };
      setShows(prevShows => [newShow, ...prevShows]);
      toast({ title: "Success", description: "Show created successfully." });
    }
    setIsDialogOpen(false);
  };

  const handleDeleteShow = (showId: string) => {
    setShows(prevShows => prevShows.filter(s => s.id !== showId));
    toast({ title: "Success", description: "Show deleted." });
  };

  const getStatusBadge = (status: Show['status']) => {
    const variants = {
      active: { variant: 'default' as const, text: 'Active' },
      inactive: { variant: 'secondary' as const, text: 'Inactive' },
      scheduled: { variant: 'outline' as const, text: 'Scheduled' }
    };
    const config = variants[status as keyof typeof variants] || variants.active;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-128px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!userRole || !['admin', 'staff', 'super_admin'].includes(userRole)) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
          <p className="mb-6">You do not have permission to manage shows.</p>
          <Button onClick={() => navigate('/')}>Go to Homepage</Button>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-128px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="ml-4 text-muted-foreground">Loading shows...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <TitleUpdater title="Manage Shows - Staff Panel" />
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => navigate('/staff/panel')}>
                    <ArrowLeft className="h-4 w-4 mr-1.5" />
                    Back to Staff Panel
                </Button>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Radio className="h-7 w-7 text-primary" /> Show Management
                    </h1>
                    <p className="text-sm text-muted-foreground">Manage radio shows, schedules, and programming.</p>
                </div>
            </div>
            <Button onClick={handleCreateShow}>
              <Plus className="h-4 w-4 mr-2" />
              New Show
            </Button>
          </div>

          <Card>
            <CardHeader>
                <CardTitle>Show List & Schedule</CardTitle>
                <div className="mt-2 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search shows by title or host..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full sm:w-1/2 lg:w-1/3"
                    />
                </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Show Title</TableHead>
                      <TableHead>Host</TableHead>
                      <TableHead>Day</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredShows.length > 0 ? filteredShows.map((show) => (
                      <TableRow key={show.id}>
                        <TableCell className="font-medium">
                            {show.title}
                            <p className="text-xs text-muted-foreground line-clamp-1">{show.description}</p>
                        </TableCell>
                        <TableCell>{show.host_name}</TableCell>
                        <TableCell>{show.day_of_week}</TableCell>
                        <TableCell>{show.time_slot}</TableCell>
                        <TableCell>{formatDuration(show.duration)}</TableCell>
                        <TableCell>{getStatusBadge(show.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEditShow(show)} className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteShow(show.id)} className="h-8 w-8 text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No shows found matching your criteria.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingShow ? 'Edit Show' : 'Create New Show'}</DialogTitle>
                <DialogDescription>
                  {editingShow ? 'Update the details for this show.' : 'Add a new show to the radio schedule.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Show Title *</Label>
                    <Input id="title" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} placeholder="Enter show title" />
                  </div>
                  <div>
                    <Label htmlFor="host_name">Host Name *</Label>
                    <Input id="host_name" value={formData.host_name} onChange={(e) => handleInputChange('host_name', e.target.value)} placeholder="Enter host name" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="Briefly describe the show" rows={3}/>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="day_of_week">Day *</Label>
                    <Select value={formData.day_of_week} onValueChange={(value) => handleInputChange('day_of_week', value)}>
                      <SelectTrigger><SelectValue placeholder="Select day" /></SelectTrigger>
                      <SelectContent>
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                          <SelectItem key={day} value={day}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="time_slot">Time *</Label>
                    <Input id="time_slot" type="time" value={formData.time_slot} onChange={(e) => handleInputChange('time_slot', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (min)</Label>
                    <Input id="duration" type="number" value={formData.duration} onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)} min="15" step="15" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: 'active' | 'inactive' | 'scheduled') => handleInputChange('status', value)}>
                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveShow}>{editingShow ? 'Save Changes' : 'Create Show'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default StaffShowsManager;


import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface PendingStaffMember {
  id: string;
  email: string;
  status: 'invited' | 'approved' | 'rejected';
  invited_at: string;
  approved_at?: string | null;
  rejected_at?: string | null;
}

interface PendingStaffTableProps {
  onStaffUpdate: () => void;
  currentUserRole: string;
}

const PendingStaffTable = ({ onStaffUpdate, currentUserRole }: PendingStaffTableProps) => {
  const [pendingStaff, setPendingStaff] = useState<PendingStaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPendingStaff = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("pending_staff")
        .select("*")
        .order("invited_at", { ascending: false });

      if (error) throw error;
      setPendingStaff(data || []);
    } catch (error) {
      console.error("Error fetching pending staff:", error);
      toast({
        title: "Error",
        description: "Failed to load pending staff members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingStaff();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('pending_staff_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'pending_staff' 
      }, () => {
        fetchPendingStaff();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleApproveReject = async (pendingId: string, approved: boolean) => {
    try {
      setProcessingId(pendingId);
      
      const response = await supabase.functions.invoke('approve-staff', {
        body: { 
          pendingId,
          approved,
          currentUserRole 
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      toast({
        title: approved ? "Staff Approved" : "Staff Rejected",
        description: response.data.message,
      });
      
      fetchPendingStaff();
      onStaffUpdate();
    } catch (error: any) {
      console.error("Error processing staff:", error);
      toast({
        title: "Error",
        description: `Failed to ${approved ? 'approve' : 'reject'} staff: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const canManageStaff = currentUserRole === "admin" || currentUserRole === "super_admin";

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Pending Staff</h3>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (pendingStaff.length === 0) {
    return (
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Pending Staff</h3>
        <p className="text-sm text-gray-500">No pending staff invitations</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Pending Staff</h3>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Invited On</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingStaff.map((staff) => (
              <TableRow key={staff.id}>
                <TableCell>{staff.email}</TableCell>
                <TableCell>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    staff.status === 'approved' ? 'bg-green-100 text-green-800' : 
                    staff.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {staff.status.charAt(0).toUpperCase() + staff.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell>{format(new Date(staff.invited_at), 'MMM d, yyyy')}</TableCell>
                <TableCell>
                  {staff.status === 'invited' && canManageStaff ? (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                        onClick={() => handleApproveReject(staff.id, true)}
                        disabled={processingId === staff.id}
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                        onClick={() => handleApproveReject(staff.id, false)}
                        disabled={processingId === staff.id}
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">
                      {staff.status === 'approved' ? 'Approved' : 
                       staff.status === 'rejected' ? 'Rejected' : 
                       'Awaiting approval'}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PendingStaffTable;

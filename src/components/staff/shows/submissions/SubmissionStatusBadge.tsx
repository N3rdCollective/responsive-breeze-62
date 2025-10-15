import { SubmissionStatus } from "../types";
import { Badge } from "@/components/ui/badge";

interface SubmissionStatusBadgeProps {
  status: SubmissionStatus;
}

export const SubmissionStatusBadge = ({ status }: SubmissionStatusBadgeProps) => {
  const getStatusConfig = (status: SubmissionStatus) => {
    switch (status) {
      case 'pending':
        return { label: 'Pending', variant: 'secondary' as const, color: 'bg-yellow-500' };
      case 'approved':
        return { label: 'Approved', variant: 'default' as const, color: 'bg-green-500' };
      case 'rejected':
        return { label: 'Rejected', variant: 'destructive' as const, color: 'bg-red-500' };
      case 'needs_revision':
        return { label: 'Needs Revision', variant: 'outline' as const, color: 'bg-blue-500' };
      default:
        return { label: status, variant: 'outline' as const, color: 'bg-gray-500' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant} className="gap-1">
      <span className={`w-2 h-2 rounded-full ${config.color}`} />
      {config.label}
    </Badge>
  );
};

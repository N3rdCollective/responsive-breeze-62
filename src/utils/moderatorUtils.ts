
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    return `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
    case 'resolved':
      return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
    case 'rejected':
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
  }
};

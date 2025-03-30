
// Color mappings for different action types
export const activityColors: Record<string, string> = {
  "create": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  "update": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  "delete": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  "login": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  "logout": "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400",
  "approve": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  "reject": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  "view": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
};

export const getActionColor = (actionType: string): string => {
  const baseType = actionType.split('_')[0].toLowerCase();
  return activityColors[baseType] || "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400";
};

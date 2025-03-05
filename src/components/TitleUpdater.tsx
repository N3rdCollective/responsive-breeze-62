
import { useEffect } from "react";
import { useSystemSettings } from "@/hooks/useSystemSettings";

/**
 * Component that updates the document title based on system settings
 * This component doesn't render anything visible
 */
const TitleUpdater = () => {
  const { settings, isLoading, refreshSettings } = useSystemSettings();

  useEffect(() => {
    // Only update title when we have valid settings
    // Don't change the title during loading states to avoid flashing
    if (settings?.site_title) {
      console.log("Setting document title to:", settings.site_title);
      document.title = settings.site_title;
    } else if (!isLoading) {
      // Only try refreshing if we're not already loading
      console.log("No site_title found in settings, trying to refresh");
      refreshSettings();
    }
  }, [settings, isLoading, refreshSettings]);

  // Don't render anything
  return null;
};

export default TitleUpdater;

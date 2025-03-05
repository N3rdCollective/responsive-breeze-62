
import { useEffect } from "react";
import { useSystemSettings } from "@/hooks/useSystemSettings";

/**
 * Component that updates the document title based on system settings
 * This component doesn't render anything visible
 */
const TitleUpdater = () => {
  const { settings, isLoading, refreshSettings } = useSystemSettings();

  useEffect(() => {
    // Initial fetch if settings aren't loaded
    if (!settings && !isLoading) {
      console.log("No settings found, triggering refresh");
      refreshSettings();
      return;
    }

    // Update the title when settings are loaded
    if (settings?.site_title) {
      console.log("Setting document title to:", settings.site_title);
      document.title = settings.site_title;
    } else if (!isLoading) {
      // Only try refreshing if we're not already loading
      console.log("No site_title found in settings, trying to refresh");
      refreshSettings();
    }
  }, [settings, isLoading, refreshSettings]);

  return null;
};

export default TitleUpdater;

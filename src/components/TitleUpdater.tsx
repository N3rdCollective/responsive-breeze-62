
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

    // Set default title while loading
    if (isLoading) {
      console.log("Settings loading, setting temporary title");
      document.title = "Loading...";
      return;
    }

    // Update the title when settings are loaded
    if (settings?.site_title) {
      console.log("Setting document title to:", settings.site_title);
      document.title = settings.site_title;
    } else {
      // Fallback title if settings aren't available
      console.log("No site_title found in settings, using fallback");
      document.title = "Radio Station";
      
      // Try refreshing settings if they weren't loaded properly
      refreshSettings();
    }
  }, [settings, isLoading, refreshSettings]);

  return null;
};

export default TitleUpdater;

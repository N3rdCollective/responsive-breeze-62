
import { useEffect } from "react";
import { useSystemSettings } from "@/hooks/useSystemSettings";

/**
 * Component that updates the document title based on system settings
 * This component doesn't render anything visible
 */
const TitleUpdater = () => {
  const { settings, isLoading, refreshSettings } = useSystemSettings();

  useEffect(() => {
    // Set default title while loading
    if (isLoading) {
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

  // This component doesn't render anything visible
  return null;
};

export default TitleUpdater;

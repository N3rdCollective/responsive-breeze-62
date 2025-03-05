
import { useEffect } from "react";
import { useSystemSettings } from "@/hooks/useSystemSettings";

/**
 * Component that updates the document title based on system settings
 * This component doesn't render anything visible
 */
const TitleUpdater = () => {
  const { settings, isLoading } = useSystemSettings();

  useEffect(() => {
    // Set default title while loading
    if (isLoading) {
      document.title = "Loading...";
      return;
    }

    // Update the title when settings are loaded
    if (settings?.site_title) {
      document.title = settings.site_title;
    } else {
      // Fallback title if settings aren't available
      document.title = "Radio Station";
    }
  }, [settings, isLoading]);

  // This component doesn't render anything visible
  return null;
};

export default TitleUpdater;

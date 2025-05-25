
import { useEffect } from "react";
import { useSystemSettings } from "@/hooks/useSystemSettings";

interface TitleUpdaterProps {
  title?: string;
}

/**
 * Component that updates the document title.
 * It uses the provided 'title' prop if available,
 * otherwise falls back to system settings.
 */
const TitleUpdater = ({ title: propTitle }: TitleUpdaterProps) => {
  const { settings, isLoading, refreshSettings } = useSystemSettings();

  useEffect(() => {
    if (propTitle) {
      document.title = propTitle;
    } else if (settings?.site_title) {
      console.log("Setting document title to system setting:", settings.site_title);
      document.title = settings.site_title;
    } else if (!isLoading && !settings?.site_title) {
      // Only try refreshing if we're not already loading and site_title is missing
      console.log("No site_title found in settings or prop, trying to refresh system settings");
      refreshSettings();
    }
  }, [propTitle, settings, isLoading, refreshSettings]);

  // Don't render anything
  return null;
};

export default TitleUpdater;


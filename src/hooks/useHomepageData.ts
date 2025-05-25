
import { useFetchHomeSettings, HomeSettings } from './homepage/useFetchHomeSettings';
import { useFetchHomepageContent, HomepageContentData, defaultHomepageContentData as originalDefaultHomepageContent } from './homepage/useFetchHomepageContent';
import { useFetchFeaturedVideos } from './homepage/useFetchFeaturedVideos';
import { useFetchShowFeaturedArtistFlag } from './homepage/useFetchShowFeaturedArtistFlag';
import { VideoData, defaultSettings as originalDefaultSettings } from "@/components/staff/home/context/HomeSettingsContext";

// Re-export types and defaults that might be used elsewhere, ensuring consistency with previous exports.
export type { HomeSettings, HomepageContentData, VideoData };
export const defaultSettings: HomeSettings = originalDefaultSettings;
export const defaultHomepageContentData: HomepageContentData = originalDefaultHomepageContent;


interface UseHomepageDataReturn {
  settings: HomeSettings;
  homepageContent: HomepageContentData;
  featuredVideos: VideoData[];
  isLoading: boolean;
  showFeaturedArtist: boolean;
}

export const useHomepageData = (): UseHomepageDataReturn => {
  const { settings, isLoading: isLoadingSettings } = useFetchHomeSettings();
  const { homepageContent, isLoading: isLoadingContent } = useFetchHomepageContent();
  const { featuredVideos, isLoading: isLoadingVideos } = useFetchFeaturedVideos();
  const { showFeaturedArtist, isLoading: isLoadingShowArtistFlag } = useFetchShowFeaturedArtistFlag();

  const isLoading = isLoadingSettings || isLoadingContent || isLoadingVideos || isLoadingShowArtistFlag;

  return {
    settings,
    homepageContent,
    featuredVideos,
    isLoading,
    showFeaturedArtist,
  };
};

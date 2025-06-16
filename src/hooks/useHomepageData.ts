
import { useFetchHomeSettings } from './homepage/useFetchHomeSettings';
import { useFetchHomepageContent } from './homepage/useFetchHomepageContent';
import { useFeaturedVideos } from './useFeaturedVideos';
import { useFetchShowFeaturedArtistFlag } from './homepage/useFetchShowFeaturedArtistFlag';

export const useHomepageData = () => {
  const { settings, isLoading: isLoadingSettings } = useFetchHomeSettings();
  const { homepageContent, isLoading: isLoadingContent } = useFetchHomepageContent();
  const { featuredVideos, isLoading: isLoadingVideos } = useFeaturedVideos();
  const { showFeaturedArtist, isLoading: isLoadingShowArtistFlag } = useFetchShowFeaturedArtistFlag();

  const isLoading = isLoadingSettings || isLoadingContent || isLoadingVideos || isLoadingShowArtistFlag;

  console.log('🏠 Homepage Data:', {
    featuredVideos: featuredVideos.length,
    isLoading,
    settings: settings?.show_hero,
    homepageContent: homepageContent?.hero_title
  });

  return {
    settings,
    homepageContent,
    featuredVideos,
    isLoading,
    showFeaturedArtist,
  };
};

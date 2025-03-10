
import { useState, useEffect, useRef } from "react";
import { METADATA_URL } from "@/constants/stream";
import { StreamMetadata } from "@/types/player";

const DEFAULT_ARTWORK = "/lovable-uploads/12fe363a-3bad-45f9-8212-66621f85b9ac.png";

export const useStreamMetadata = () => {
  const [metadata, setMetadata] = useState<StreamMetadata>({ 
    title: "Rappin' Lounge Radio",
    artwork: DEFAULT_ARTWORK
  });
  const metadataIntervalRef = useRef<number>();

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await fetch(METADATA_URL);
        if (response.ok) {
          const data = await response.json();
          if (data.data) {
            setMetadata({
              title: data.data.title || "Rappin' Lounge Radio",
              artist: data.data.artist,
              artwork: data.data.artwork_urls?.large || 
                       data.data.artwork_urls?.standard || 
                       DEFAULT_ARTWORK
            });
            console.log("New metadata:", data.data);
          }
        }
      } catch (error) {
        console.error("Error fetching metadata:", error);
      }
    };

    fetchMetadata();
    metadataIntervalRef.current = window.setInterval(fetchMetadata, 30000);

    return () => {
      if (metadataIntervalRef.current) {
        clearInterval(metadataIntervalRef.current);
      }
    };
  }, []);

  const showMobileNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notification = new Notification('Now Playing: Rappin\' Lounge Radio', {
          body: `${metadata.title}${metadata.artist ? ` - ${metadata.artist}` : ''}`,
          icon: metadata.artwork || DEFAULT_ARTWORK
        });
        
        setTimeout(() => notification.close(), 5000);
      } catch (error) {
        console.error('Failed to show notification:', error);
      }
    }
  };

  return {
    metadata,
    showMobileNotification
  };
};

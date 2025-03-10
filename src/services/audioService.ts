
import { STREAM_URL, BACKUP_STREAM_URL } from "@/constants/stream";

// Global singleton state
let audioInstance: HTMLAudioElement | null = null;
let listeners: Array<() => void> = [];
let globalIsPlaying = false;
let isUsingBackupStream = false;

/**
 * Notify all listeners about state changes
 */
const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

/**
 * Register a listener function to be called when audio state changes
 */
export const registerListener = (callback: () => void) => {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter(l => l !== callback);
  };
};

/**
 * Get the current playing state
 */
export const getIsPlaying = () => globalIsPlaying;

/**
 * Get whether we're using the backup stream
 */
export const getIsUsingBackupStream = () => isUsingBackupStream;

/**
 * Set volume on the audio instance
 */
export const setVolume = (volumeLevel: number) => {
  if (audioInstance) {
    audioInstance.volume = volumeLevel / 100;
  }
};

/**
 * Stop audio playback and cleanup
 */
export const stopPlayback = () => {
  if (audioInstance) {
    audioInstance.pause();
    audioInstance.src = "";
    audioInstance = null;
  }
  globalIsPlaying = false;
  notifyListeners();
};

/**
 * Start playback with the current stream
 * @returns Promise that resolves with success status
 */
export const startPlayback = async (volume: number): Promise<boolean> => {
  // Create a new audio element and load the stream
  const currentStreamUrl = isUsingBackupStream ? BACKUP_STREAM_URL : STREAM_URL;
  audioInstance = new Audio(currentStreamUrl);
  
  // Apply volume settings
  audioInstance.volume = volume / 100;
  
  try {
    // Start playing
    await audioInstance.play();
    globalIsPlaying = true;
    notifyListeners();
    return true;
  } catch (error) {
    console.error("Playback failed:", error);
    
    if (!isUsingBackupStream) {
      // Try the backup stream if main stream failed
      isUsingBackupStream = true;
      console.log("Trying backup stream:", BACKUP_STREAM_URL);
      
      // Create a new audio element with the backup stream
      audioInstance = new Audio(BACKUP_STREAM_URL);
      audioInstance.volume = volume / 100;
      
      try {
        // Play the backup stream
        await audioInstance.play();
        globalIsPlaying = true;
        notifyListeners();
        return true;
      } catch (backupError) {
        console.error("Backup stream playback failed:", backupError);
        stopPlayback(); // This already calls notifyListeners
        return false;
      }
    } else {
      stopPlayback(); // This already calls notifyListeners
      return false;
    }
  }
};

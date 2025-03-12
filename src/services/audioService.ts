
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
  console.log("AudioService: Notifying listeners, isPlaying =", globalIsPlaying);
  listeners.forEach(listener => listener());
};

/**
 * Register a listener function to be called when audio state changes
 */
export const registerListener = (callback: () => void) => {
  listeners.push(callback);
  console.log("AudioService: Registered listener, total listeners:", listeners.length);
  return () => {
    listeners = listeners.filter(l => l !== callback);
    console.log("AudioService: Unregistered listener, remaining listeners:", listeners.length);
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
    console.log("AudioService: Setting volume to", volumeLevel);
    audioInstance.volume = volumeLevel / 100;
  }
};

/**
 * Stop audio playback and cleanup
 */
export const stopPlayback = () => {
  console.log("AudioService: Stopping playback");
  if (audioInstance) {
    audioInstance.pause();
    audioInstance.src = "";
    // Remove all event listeners
    audioInstance.onplay = null;
    audioInstance.onpause = null;
    audioInstance.onerror = null;
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
  console.log("AudioService: Starting playback, volume:", volume, "using backup:", isUsingBackupStream);
  
  // Stop any existing playback first to prevent multiple instances
  if (audioInstance) {
    stopPlayback();
  }
  
  // Create a new audio element and load the stream
  const currentStreamUrl = isUsingBackupStream ? BACKUP_STREAM_URL : STREAM_URL;
  console.log("AudioService: Using stream URL:", currentStreamUrl);
  
  audioInstance = new Audio(currentStreamUrl);
  
  // Apply volume settings
  audioInstance.volume = volume / 100;
  
  try {
    // Start playing
    console.log("AudioService: Attempting to play stream");
    await audioInstance.play();
    globalIsPlaying = true;
    console.log("AudioService: Playback started successfully");
    notifyListeners();
    return true;
  } catch (error) {
    console.error("Playback failed:", error);
    
    if (!isUsingBackupStream) {
      // Try the backup stream if main stream failed
      isUsingBackupStream = true;
      console.log("Trying backup stream:", BACKUP_STREAM_URL);
      
      // Create a new audio element with the backup stream
      if (audioInstance) {
        audioInstance.pause();
        audioInstance.src = "";
      }
      
      audioInstance = new Audio(BACKUP_STREAM_URL);
      audioInstance.volume = volume / 100;
      
      try {
        // Play the backup stream
        console.log("AudioService: Attempting to play backup stream");
        await audioInstance.play();
        globalIsPlaying = true;
        console.log("AudioService: Backup stream playback started successfully");
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

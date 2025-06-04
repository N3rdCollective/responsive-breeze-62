
import { STREAM_URL, BACKUP_STREAM_URL } from "@/constants/stream";

// Global singleton state
let audioInstance: HTMLAudioElement | null = null;
let backupAudioInstance: HTMLAudioElement | null = null;
let listeners: Array<() => void> = [];
let globalIsPlaying = false;
let isUsingBackupStream = false;
let isInitialized = false;

/**
 * Initialize audio instances on first load
 */
const initializeAudio = () => {
  if (isInitialized) return;
  
  console.log("AudioService: Initializing audio instances");
  
  // Pre-create main audio instance
  audioInstance = new Audio();
  audioInstance.preload = 'none'; // Don't auto-load data
  audioInstance.src = STREAM_URL;
  
  // Pre-create backup audio instance
  backupAudioInstance = new Audio();
  backupAudioInstance.preload = 'none';
  backupAudioInstance.src = BACKUP_STREAM_URL;
  
  isInitialized = true;
};

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
  // Initialize on first listener registration
  if (!isInitialized) {
    initializeAudio();
  }
  
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
  const currentAudio = isUsingBackupStream ? backupAudioInstance : audioInstance;
  if (currentAudio) {
    console.log("AudioService: Setting volume to", volumeLevel);
    currentAudio.volume = volumeLevel / 100;
  }
};

/**
 * Stop audio playback
 */
export const stopPlayback = () => {
  console.log("AudioService: Stopping playback");
  
  if (audioInstance && !audioInstance.paused) {
    audioInstance.pause();
  }
  if (backupAudioInstance && !backupAudioInstance.paused) {
    backupAudioInstance.pause();
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
  
  // Ensure audio instances are initialized
  if (!isInitialized) {
    initializeAudio();
  }
  
  // Stop any existing playback first
  stopPlayback();
  
  const currentAudio = isUsingBackupStream ? backupAudioInstance : audioInstance;
  
  if (!currentAudio) {
    console.error("AudioService: No audio instance available");
    return false;
  }
  
  // Apply volume settings
  currentAudio.volume = volume / 100;
  
  try {
    // Start playing
    console.log("AudioService: Attempting to play stream");
    await currentAudio.play();
    globalIsPlaying = true;
    console.log("AudioService: Playback started successfully");
    notifyListeners();
    return true;
  } catch (error) {
    console.error("Playback failed:", error);
    
    if (!isUsingBackupStream) {
      // Try the backup stream if main stream failed
      isUsingBackupStream = true;
      console.log("Trying backup stream");
      
      if (!backupAudioInstance) {
        console.error("AudioService: No backup audio instance available");
        return false;
      }
      
      // Apply volume settings to backup
      backupAudioInstance.volume = volume / 100;
      
      try {
        // Play the backup stream
        console.log("AudioService: Attempting to play backup stream");
        await backupAudioInstance.play();
        globalIsPlaying = true;
        console.log("AudioService: Backup stream playback started successfully");
        notifyListeners();
        return true;
      } catch (backupError) {
        console.error("Backup stream playback failed:", backupError);
        globalIsPlaying = false;
        notifyListeners();
        return false;
      }
    } else {
      globalIsPlaying = false;
      notifyListeners();
      return false;
    }
  }
};

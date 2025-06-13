
export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
  screenSize: string;
}

export const detectDevice = (): DeviceInfo => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Device type detection
  const isMobile = /mobile|android|iphone|ipod|blackberry|iemobile|opera mini/.test(userAgent);
  const isTablet = /tablet|ipad/.test(userAgent);
  
  let deviceType: 'mobile' | 'tablet' | 'desktop';
  if (isMobile && !isTablet) {
    deviceType = 'mobile';
  } else if (isTablet) {
    deviceType = 'tablet';
  } else {
    deviceType = 'desktop';
  }
  
  // Browser detection
  let browser = 'unknown';
  if (userAgent.includes('chrome')) browser = 'chrome';
  else if (userAgent.includes('firefox')) browser = 'firefox';
  else if (userAgent.includes('safari')) browser = 'safari';
  else if (userAgent.includes('edge')) browser = 'edge';
  else if (userAgent.includes('opera')) browser = 'opera';
  
  // OS detection
  let os = 'unknown';
  if (userAgent.includes('windows')) os = 'windows';
  else if (userAgent.includes('mac os')) os = 'macos';
  else if (userAgent.includes('linux')) os = 'linux';
  else if (userAgent.includes('android')) os = 'android';
  else if (userAgent.includes('ios')) os = 'ios';
  
  // Screen size classification
  const width = window.screen.width;
  let screenSize = 'unknown';
  if (width < 768) screenSize = 'small';
  else if (width < 1024) screenSize = 'medium';
  else screenSize = 'large';
  
  return {
    type: deviceType,
    browser,
    os,
    screenSize
  };
};

export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const getOrCreateSessionId = (): string => {
  const storageKey = 'analytics_session_id';
  const sessionTimeout = 30 * 60 * 1000; // 30 minutes
  
  const stored = localStorage.getItem(storageKey);
  const timestampKey = 'analytics_session_timestamp';
  const lastTimestamp = localStorage.getItem(timestampKey);
  
  if (stored && lastTimestamp) {
    const timeDiff = Date.now() - parseInt(lastTimestamp);
    if (timeDiff < sessionTimeout) {
      // Update timestamp to extend session
      localStorage.setItem(timestampKey, Date.now().toString());
      return stored;
    }
  }
  
  // Create new session
  const newSessionId = generateSessionId();
  localStorage.setItem(storageKey, newSessionId);
  localStorage.setItem(timestampKey, Date.now().toString());
  return newSessionId;
};

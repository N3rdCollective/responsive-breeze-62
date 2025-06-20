
interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
  screenSize: string;
}

export const detectDevice = (): DeviceInfo => {
  const userAgent = navigator.userAgent.toLowerCase();
  const screenWidth = window.screen.width;
  
  // Detect device type
  let type: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    type = 'mobile';
  } else if (/tablet|ipad|android/i.test(userAgent) && screenWidth >= 768) {
    type = 'tablet';
  }

  // Detect browser
  let browser = 'unknown';
  if (userAgent.includes('chrome')) browser = 'chrome';
  else if (userAgent.includes('firefox')) browser = 'firefox';
  else if (userAgent.includes('safari')) browser = 'safari';
  else if (userAgent.includes('edge')) browser = 'edge';
  else if (userAgent.includes('opera')) browser = 'opera';

  // Detect OS
  let os = 'unknown';
  if (userAgent.includes('windows')) os = 'windows';
  else if (userAgent.includes('mac')) os = 'macos';
  else if (userAgent.includes('linux')) os = 'linux';
  else if (userAgent.includes('android')) os = 'android';
  else if (userAgent.includes('ios') || userAgent.includes('iphone') || userAgent.includes('ipad')) os = 'ios';

  // Screen size category
  let screenSize = 'large';
  if (screenWidth < 768) screenSize = 'small';
  else if (screenWidth < 1024) screenSize = 'medium';

  return {
    type,
    browser,
    os,
    screenSize
  };
};

export const getOrCreateSessionId = (): string => {
  const sessionKey = 'analytics_session_id';
  const timestampKey = 'analytics_session_timestamp';
  const sessionDuration = 30 * 60 * 1000; // 30 minutes

  const existingSessionId = localStorage.getItem(sessionKey);
  const existingTimestamp = localStorage.getItem(timestampKey);

  // Check if session is still valid (within 30 minutes)
  if (existingSessionId && existingTimestamp) {
    const lastActivity = parseInt(existingTimestamp);
    const now = Date.now();
    
    if (now - lastActivity < sessionDuration) {
      // Update timestamp and return existing session
      localStorage.setItem(timestampKey, now.toString());
      return existingSessionId;
    }
  }

  // Create new session
  const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem(sessionKey, newSessionId);
  localStorage.setItem(timestampKey, Date.now().toString());
  
  return newSessionId;
};

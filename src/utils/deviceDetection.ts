interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
  screenSize: string;
}

export const detectDevice = (): DeviceInfo => {
  const userAgent = navigator.userAgent.toLowerCase();
  const screenWidth = window.screen.width;
  
  console.log('Device detection - User Agent:', userAgent);
  console.log('Device detection - Screen Width:', screenWidth);
  
  // Detect device type - check tablets first, then mobile, then default to desktop
  let type: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  
  // iPad detection (iPads often report as desktop in user agent)
  if (/ipad/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    type = 'tablet';
  }
  // Android tablets (android + larger screen)
  else if (/android/.test(userAgent) && screenWidth >= 768) {
    type = 'tablet';
  }
  // General tablet patterns
  else if (/tablet|kindle|playbook|silk/.test(userAgent)) {
    type = 'tablet';
  }
  // Mobile phones (including iPhone, Android phones, etc.)
  else if (/mobile|iphone|ipod|android.*mobile|blackberry|iemobile|opera mini|windows phone/.test(userAgent)) {
    type = 'mobile';
  }
  // Small screen devices should be considered mobile regardless of user agent
  else if (screenWidth < 768) {
    type = 'mobile';
  }

  console.log('Device detection - Detected type:', type);

  // Detect browser
  let browser = 'unknown';
  if (userAgent.includes('edg')) browser = 'edge';
  else if (userAgent.includes('chrome')) browser = 'chrome';
  else if (userAgent.includes('firefox')) browser = 'firefox';
  else if (userAgent.includes('safari')) browser = 'safari';
  else if (userAgent.includes('opera')) browser = 'opera';

  // Detect OS
  let os = 'unknown';
  if (userAgent.includes('windows')) os = 'windows';
  else if (userAgent.includes('mac') || userAgent.includes('iphone') || userAgent.includes('ipad')) os = 'ios';
  else if (userAgent.includes('linux')) os = 'linux';
  else if (userAgent.includes('android')) os = 'android';

  // Screen size category
  let screenSize = 'large';
  if (screenWidth < 768) screenSize = 'small';
  else if (screenWidth < 1024) screenSize = 'medium';

  const deviceInfo = {
    type,
    browser,
    os,
    screenSize
  };

  console.log('Device detection - Final result:', deviceInfo);

  return deviceInfo;
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

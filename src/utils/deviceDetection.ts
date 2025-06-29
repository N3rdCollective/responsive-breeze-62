
interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
  screenSize: string;
}

export const detectDevice = (): DeviceInfo => {
  const userAgent = navigator.userAgent.toLowerCase();
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const hasTouch = navigator.maxTouchPoints > 0;
  
  console.log('Device detection - User Agent:', userAgent);
  console.log('Device detection - Screen Width:', screenWidth);
  console.log('Device detection - Screen Height:', screenHeight);
  console.log('Device detection - Has Touch:', hasTouch);
  console.log('Device detection - Platform:', navigator.platform);
  
  // Detect device type with improved logic
  let type: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  
  // iPad detection (iPads often report as desktop in user agent)
  if (/ipad/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    type = 'tablet';
    console.log('Device detection - iPad detected');
  }
  // iPhone detection (more comprehensive patterns)
  else if (/iphone/.test(userAgent) || 
           (userAgent.includes('safari') && userAgent.includes('mobile') && userAgent.includes('webkit')) ||
           (navigator.platform === 'iPhone' || navigator.platform.startsWith('iPhone'))) {
    type = 'mobile';
    console.log('Device detection - iPhone detected');
  }
  // Android tablets (android + larger screen)
  else if (/android/.test(userAgent) && screenWidth >= 768 && !/mobile/.test(userAgent)) {
    type = 'tablet';
    console.log('Device detection - Android tablet detected');
  }
  // Android mobile (android + mobile keyword or smaller screen)
  else if (/android/.test(userAgent) && (/mobile/.test(userAgent) || screenWidth < 768)) {
    type = 'mobile';
    console.log('Device detection - Android mobile detected');
  }
  // General tablet patterns
  else if (/tablet|kindle|playbook|silk/.test(userAgent)) {
    type = 'tablet';
    console.log('Device detection - General tablet detected');
  }
  // Mobile phones (comprehensive patterns)
  else if (/mobile|phone|ipod|blackberry|iemobile|opera mini|windows phone|webos/.test(userAgent)) {
    type = 'mobile';
    console.log('Device detection - General mobile detected');
  }
  // iOS devices fallback - if OS is iOS and has touch, it's likely mobile/tablet
  else if ((userAgent.includes('mac') || userAgent.includes('ios')) && hasTouch) {
    // Use screen size to distinguish between mobile and tablet for iOS
    if (screenWidth < 768 || screenHeight < 768) {
      type = 'mobile';
      console.log('Device detection - iOS mobile detected via touch + screen size');
    } else {
      type = 'tablet';
      console.log('Device detection - iOS tablet detected via touch + screen size');
    }
  }
  // Small screen devices should be considered mobile regardless of user agent
  else if (screenWidth < 768) {
    type = 'mobile';
    console.log('Device detection - Small screen mobile detected');
  }
  // Touch-enabled devices with medium screens might be tablets
  else if (hasTouch && screenWidth >= 768 && screenWidth < 1200) {
    type = 'tablet';
    console.log('Device detection - Touch tablet detected');
  }

  console.log('Device detection - Final detected type:', type);

  // Detect browser
  let browser = 'unknown';
  if (userAgent.includes('edg')) browser = 'edge';
  else if (userAgent.includes('chrome')) browser = 'chrome';
  else if (userAgent.includes('firefox')) browser = 'firefox';
  else if (userAgent.includes('safari') && !userAgent.includes('chrome')) browser = 'safari';
  else if (userAgent.includes('opera')) browser = 'opera';

  // Detect OS with improved iOS detection
  let os = 'unknown';
  if (userAgent.includes('windows')) os = 'windows';
  else if (userAgent.includes('iphone') || userAgent.includes('ipad') || 
           (userAgent.includes('mac') && hasTouch) ||
           userAgent.includes('ios')) os = 'ios';
  else if (userAgent.includes('mac')) os = 'macos';
  else if (userAgent.includes('android')) os = 'android';
  else if (userAgent.includes('linux')) os = 'linux';

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

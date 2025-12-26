// deviceFingerprint.js - Generate browser fingerprint for device binding
/**
 * Generate a canvas fingerprint (unique per GPU/driver combo)
 */
function getCanvasFingerprint() {
 try {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillStyle = '#f60';
  ctx.fillRect(125, 1, 62, 20);
  ctx.fillStyle = '#069';
  ctx.fillText('uChat Security Check', 2, 15);
  return canvas.toDataURL();
 } catch (e) {
  return 'canvas_unavailable';
 }
}

/**
 * Get list of installed fonts (partially - privacy-limited)
 */
function getInstalledFonts() {
 const baseFonts = ['monospace', 'sans-serif', 'serif'];
 const testFonts = [
  'Arial', 'Verdana', 'Times New Roman', 'Courier New',
  'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS',
  'Trebuchet MS', 'Impact'
 ];
 const canvas = document.createElement('canvas');
 const ctx = canvas.getContext('2d');
 const detected = [];
 baseFonts.forEach(baseFont => {
  const baseWidth = {};
  const baseHeight = {};
  testFonts.forEach(testFont => {
   ctx.font = `72px ${testFont}, ${baseFont}`;
   const metrics = ctx.measureText('mmmmmmmmmmlli');
   const signature = `${metrics.width}_${metrics.actualBoundingBoxAscent}`;
   if (!baseWidth[baseFont]) {
    ctx.font = `72px ${baseFont}`;
    const baseMetrics = ctx.measureText('mmmmmmmmmmlli');
    baseWidth[baseFont] = baseMetrics.width;
    baseHeight[baseFont] = baseMetrics.actualBoundingBoxAscent;
   }
   if (metrics.width !== baseWidth[baseFont] ||
    metrics.actualBoundingBoxAscent !== baseHeight[baseFont]) {
    if (!detected.includes(testFont)) {
     detected.push(testFont);
    }
   }
  });
 });
 return detected.sort().join(',');
}

/**
 * Generate complete device fingerprint
 */
export function generateDeviceFingerprint() {
 const fingerprint = {
  userAgent: navigator.userAgent,
  language: navigator.language,
  platform: navigator.platform,
  screenResolution: `${window.screen.width}x${window.screen.height}`,
  colorDepth: window.screen.colorDepth,
  pixelRatio: window.devicePixelRatio,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  timezoneOffset: new Date().getTimezoneOffset(),
  hardwareConcurrency: navigator.hardwareConcurrency || 0,
  deviceMemory: navigator.deviceMemory || 0,
  canvasFingerprint: getCanvasFingerprint(),
  fonts: getInstalledFonts(),
  maxTouchPoints: navigator.maxTouchPoints || 0,
  plugins: Array.from(navigator.plugins || []).map(p => p.name).sort().join(','),
 };
 return JSON.stringify(fingerprint);
}

/**
 * Generate device ID - SERVER will track this, not localStorage
 */
export function getDeviceId() {
 // Generate new UUID each time - server will match via fingerprint
 return crypto.randomUUID();
}

/**
 * Get complete device identity to send to backend
 */
export function getDeviceIdentity() {
 return {
  deviceId: getDeviceId(),
  deviceFingerprint: generateDeviceFingerprint()
 };
}
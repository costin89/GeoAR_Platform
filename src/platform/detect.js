/**
 * Erkennt die grobe Plattform (iOS/Android/Desktop) und den Browser anhand
 * des User-Agent- und Plattform-Strings. Wird von den Permission-Modulen
 * genutzt, um plattformspezifische Abfrage-Reihenfolgen zu wählen.
 */

/**
 * Liefert eine Plattform-Kennung für das aktuelle Gerät.
 * @returns {"ios"|"android"|"desktop"|"unknown"} Erkannte Plattform.
 */
export function detectPlatform() {
  const ua = navigator.userAgent || "";
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
  if (isIOS) return "ios";
  if (/Android/.test(ua)) return "android";
  if (/Windows|Macintosh|Linux/.test(ua)) return "desktop";
  return "unknown";
}

/**
 * Prüft, ob der Browser Safari ist (inkl. mobile Safari auf iOS).
 * @returns {boolean} true, wenn Safari erkannt wurde.
 */
export function isSafari() {
  const ua = navigator.userAgent || "";
  return /^((?!chrome|android|crios|fxios|edgios).)*safari/i.test(ua);
}

/**
 * Liefert eine kompakte, menschenlesbare Zusammenfassung der Plattform.
 * @returns {{platform: string, browser: string, userAgent: string}}
 *   Plattform-ID, grober Browsername und roher User-Agent-String.
 */
export function getPlatformInfo() {
  return {
    platform: detectPlatform(),
    browser: isSafari() ? "safari" : "other",
    userAgent: navigator.userAgent || "",
  };
}

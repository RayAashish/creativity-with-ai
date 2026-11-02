import { Capacitor } from '@capacitor/core';

export const PRODUCTION_API_ORIGIN = 'https://readm-three.vercel.app';

/**
 * Returns the fully qualified API URL based on the current runtime platform.
 * In native Android/Capacitor apps, requests are directed to the live production
 * server (https://readm-three.vercel.app), whereas in web development/production,
 * relative paths are used.
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // Check if running inside native Android/iOS app or Capacitor WebView
  const isNative =
    Capacitor.isNativePlatform() ||
    (typeof window !== 'undefined' &&
      (window.location.protocol === 'capacitor:' ||
        (window.location.hostname === 'localhost' &&
          window.location.port !== '5180' &&
          window.location.port !== '3050')));

  if (isNative) {
    return `${PRODUCTION_API_ORIGIN}${cleanPath}`;
  }

  return cleanPath;
}

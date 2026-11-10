import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

export function isAndroidNative(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
}

export async function configureNativeStatusBar(theme: 'light' | 'dark' | 'sepia') {
  if (!Capacitor.isNativePlatform()) return;

  try {
    // Crucial: ensure webview does NOT draw under status bar so system icons don't block the UI
    await StatusBar.setOverlaysWebView({ overlay: false });

    if (theme === 'dark') {
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#18181b' });
    } else if (theme === 'sepia') {
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#f4ebd0' });
    } else {
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#ffffff' });
    }
  } catch (err) {
    console.warn('Failed to configure native status bar:', err);
  }
}

export function registerAndroidBackButton(onBack: () => boolean) {
  if (!Capacitor.isNativePlatform()) return () => {};

  const handle = CapApp.addListener('backButton', () => {
    const wasHandled = onBack();
    if (!wasHandled) {
      CapApp.exitApp();
    }
  });

  return () => {
    handle.then((sub) => sub.remove()).catch(() => {});
  };
}

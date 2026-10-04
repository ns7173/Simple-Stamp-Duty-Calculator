import React, { createContext, useContext, useState, useEffect } from 'react';

export type DesignTheme = 'auto' | 'material' | 'fluent';
export type DetectedPlatform = 'android' | 'windows' | 'ios' | 'mac' | 'other';
export type ScreenOrientation = 'portrait' | 'landscape';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PlatformContextType {
  designTheme: DesignTheme;
  activeDesignSystem: 'material' | 'fluent';
  setDesignTheme: (theme: DesignTheme) => void;
  detectedPlatform: DetectedPlatform;
  orientation: ScreenOrientation;
  isInstallable: boolean;
  promptInstall: () => Promise<boolean>;
  isStandalone: boolean;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Saved design preference
  const [designTheme, setDesignThemeState] = useState<DesignTheme>(() => {
    const saved = localStorage.getItem('app_design_theme') as DesignTheme;
    if (saved === 'material' || saved === 'fluent' || saved === 'auto') return saved;
    return 'auto';
  });

  // Detect platform
  const [detectedPlatform, setDetectedPlatform] = useState<DetectedPlatform>('windows');
  const [orientation, setOrientation] = useState<ScreenOrientation>('portrait');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect OS from userAgent
    const ua = navigator.userAgent.toLowerCase();
    if (/android/i.test(ua)) {
      setDetectedPlatform('android');
    } else if (/windows|win32|win64/i.test(ua)) {
      setDetectedPlatform('windows');
    } else if (/iphone|ipad|ipod/i.test(ua)) {
      setDetectedPlatform('ios');
    } else if (/macintosh|mac os x/i.test(ua)) {
      setDetectedPlatform('mac');
    } else {
      setDetectedPlatform('other');
    }

    // Check if standalone PWA
    const checkStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in navigator && (navigator as unknown as { standalone: boolean }).standalone === true);
    setIsStandalone(checkStandalone);

    // Orientation detection
    const updateOrientation = () => {
      if (window.innerWidth > window.innerHeight) {
        setOrientation('landscape');
      } else {
        setOrientation('portrait');
      }
    };
    updateOrientation();
    window.addEventListener('resize', updateOrientation);

    // PWA Install prompt listener
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const setDesignTheme = (theme: DesignTheme) => {
    setDesignThemeState(theme);
    localStorage.setItem('app_design_theme', theme);
  };

  // Resolved active design system
  const activeDesignSystem: 'material' | 'fluent' =
    designTheme === 'auto'
      ? detectedPlatform === 'android'
        ? 'material'
        : 'fluent'
      : designTheme;

  const promptInstall = async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <PlatformContext.Provider
      value={{
        designTheme,
        activeDesignSystem,
        setDesignTheme,
        detectedPlatform,
        orientation,
        isInstallable,
        promptInstall,
        isStandalone,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = (): PlatformContextType => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
};

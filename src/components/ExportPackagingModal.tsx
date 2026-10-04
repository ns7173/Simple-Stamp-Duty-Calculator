import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  Laptop,
  Check,
  Copy,
  X,
  ExternalLink,
  Shield,
  Layers,
  Palette,
  Terminal,
} from 'lucide-react';
import { usePlatform, DesignTheme } from '../context/PlatformContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportPackagingModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    detectedPlatform,
    designTheme,
    setDesignTheme,
    activeDesignSystem,
    isInstallable,
    promptInstall,
    isStandalone,
  } = usePlatform();

  const [activeTab, setActiveTab] = useState<'android' | 'windows' | 'design'>('android');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const handleInstallApp = async () => {
    const success = await promptInstall();
    if (success) {
      alert('Installation initiated! The app is now adding to your device.');
    } else {
      alert(
        detectedPlatform === 'android'
          ? 'On Android Chrome: Tap the 3 dots (⋮) in the top-right corner, then tap "Add to Home screen" or "Install App".'
          : 'On Windows Edge/Chrome: Click the install icon (⊕) in the browser address bar, or click Menu > Apps > Install this site as an app.'
      );
    }
  };

  // Capacitor config generator for Android APK
  const capacitorConfig = JSON.stringify(
    {
      appId: 'com.stampduty.calculator',
      appName: 'Stamp Duty Calculator',
      webDir: 'dist',
      bundledWebRuntime: false,
      plugins: {
        SplashScreen: {
          launchShowDuration: 1500,
          backgroundColor: '#4338ca',
        },
      },
      android: {
        minSdkVersion: 31, // Android 12
        targetSdkVersion: 35, // Android 15
        allowMixedContent: false,
        captureInput: true,
        webContentsDebuggingEnabled: false,
      },
    },
    null,
    2
  );

  const androidManifestSnippet = `<!-- AndroidManifest.xml (Android 12, 13, 14, 15 Compatible) -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.stampduty.calculator">
    
    <!-- Permissions for Android Runtime Handling -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="29" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.READ_CONTACTS" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Stamp Duty Calculator"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|screenSize|screenLayout"
            android:screenOrientation="unspecified">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

  const windowsPackageSnippet = `// Windows Desktop EXE / MSI Builder via Electron or PWABuilder
// 1. One-click packaging using PWABuilder CLI:
npx @pwabuilder/cli package --platform windows --output ./windows-installer

// 2. Or build standalone Windows EXE with Electron:
npm install -D electron electron-builder
npx electron-builder --win nsis`;

  const downloadCapacitorConfig = () => {
    const blob = new Blob([capacitorConfig], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'capacitor.config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>Android APK & Windows EXE Packaging Hub</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                1-click install, offline runtimes, Material 3 / Fluent Design & build kits
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Install Banner */}
        <div className="p-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {detectedPlatform === 'android' ? (
              <Smartphone className="w-6 h-6 text-emerald-400" />
            ) : (
              <Laptop className="w-6 h-6 text-sky-400" />
            )}
            <div>
              <span className="font-extrabold text-sm block">
                {isStandalone
                  ? 'App is currently installed and running in Standalone mode!'
                  : detectedPlatform === 'android'
                  ? 'Install directly on your Android phone as a native WebAPK'
                  : 'Install directly on your Windows PC as a Desktop App'}
              </span>
              <span className="text-xs text-indigo-200">
                Works 100% offline with zero dependencies on internet connection.
              </span>
            </div>
          </div>

          {!isStandalone && (
            <button
              type="button"
              onClick={handleInstallApp}
              className="px-4 py-2 text-xs font-extrabold rounded-xl bg-white text-indigo-950 hover:bg-indigo-50 shadow-md cursor-pointer transition-all"
            >
              {detectedPlatform === 'android' ? 'Install Android App' : 'Install Windows App'}
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 sm:px-5 bg-slate-100/50 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={() => setActiveTab('android')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'android'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android APK Build Kit</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('windows')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'windows'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Windows EXE / MSI Kit</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('design')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'design'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Design Style (Material / Fluent)</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'android' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200">
                <strong>Android Backward & Forward Compatibility:</strong>
                <p className="mt-1">
                  Built to run smoothly without crashes on Android 12 (API 31), Android 13 (API 33), Android 14 (API 34), and Android 15 (API 35). Supports both Portrait & Landscape auto-rotation.
                </p>
              </div>

              {/* Step 1: Capacitor Config */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    1. Capacitor / Android Configuration (`capacitor.config.json`)
                  </span>
                  <button
                    type="button"
                    onClick={downloadCapacitorConfig}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    Download JSON
                  </button>
                </div>
                <div className="relative rounded-xl overflow-hidden bg-slate-950 text-slate-200 p-3 font-mono text-[11px]">
                  <pre>{capacitorConfig}</pre>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(capacitorConfig, 'cap')}
                    className="absolute top-2 right-2 p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                  >
                    {copiedSnippet === 'cap' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Step 2: Build Command */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  2. 1-Command to Build Signed APK
                </span>
                <div className="relative rounded-xl overflow-hidden bg-slate-950 text-emerald-400 p-3 font-mono text-[11px]">
                  <pre>
{`# Initialize Android project & build APK:
npm run build
npx @capacitor/cli add android
npx @capacitor/cli run android --target

# Or build standalone WebAPK via PWABuilder:
npx @pwabuilder/cli package --platform android`}
                  </pre>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        'npm run build\nnpx @capacitor/cli add android\nnpx @capacitor/cli run android',
                        'cmd_android'
                      )
                    }
                    className="absolute top-2 right-2 p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                  >
                    {copiedSnippet === 'cmd_android' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Step 3: Permissions Manifest */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  3. AndroidManifest.xml (Runtime Permissions)
                </span>
                <div className="relative rounded-xl overflow-hidden bg-slate-950 text-slate-300 p-3 font-mono text-[10px] max-h-48 overflow-y-auto">
                  <pre>{androidManifestSnippet}</pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'windows' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 text-sky-950 dark:text-sky-200">
                <strong>Windows Desktop (10 & 11) Native Experience:</strong>
                <p className="mt-1">
                  Supports resizable desktop windows, multi-monitor scaling, offline caching, and native Windows taskbar pinning.
                </p>
              </div>

              {/* Windows Commands */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Windows Installer (.exe / .msi) Generation Commands
                </span>
                <div className="relative rounded-xl overflow-hidden bg-slate-950 text-sky-300 p-3 font-mono text-[11px]">
                  <pre>{windowsPackageSnippet}</pre>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(windowsPackageSnippet, 'win_cmd')}
                    className="absolute top-2 right-2 p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                  >
                    {copiedSnippet === 'win_cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <span>Windows Offline Execution Guarantee</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-xs">
                  The application is fully pre-cached by the service worker. Once launched or installed via Windows Edge/Chrome PWA or Electron, it will launch instantly without any internet access required.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'design' && (
            <div className="space-y-4 text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                Choose Design Language System:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Auto */}
                <button
                  type="button"
                  onClick={() => setDesignTheme('auto')}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                    designTheme === 'auto'
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="font-bold block">Auto-Detect</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                    Material on Android, Fluent on Windows.
                  </span>
                </button>

                {/* Material Design 3 */}
                <button
                  type="button"
                  onClick={() => setDesignTheme('material')}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                    designTheme === 'material'
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="font-bold block">Material Design 3</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                    Android 12–15 tokens, rounded pill cards, ripple accents.
                  </span>
                </button>

                {/* Fluent Design */}
                <button
                  type="button"
                  onClick={() => setDesignTheme('fluent')}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                    designTheme === 'fluent'
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="font-bold block">Fluent Design</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                    Windows 11 Acrylic frosted glass, compact desktop density.
                  </span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs">
                Active System: <strong className="text-indigo-600 dark:text-indigo-400 uppercase">{activeDesignSystem}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

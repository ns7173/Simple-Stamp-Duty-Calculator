import React from 'react';
import {
  Landmark,
  Ruler,
  Sun,
  Moon,
  Languages,
  FolderArchive,
  ShieldCheck,
  Smartphone,
  Laptop,
} from 'lucide-react';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { usePlatform } from '../context/PlatformContext';

interface Props {
  onOpenUnitConverter: () => void;
  onOpenOfflineBackup: () => void;
  onOpenPermissions: () => void;
  onOpenPackaging: () => void;
}

export const Header: React.FC<Props> = ({
  onOpenUnitConverter,
  onOpenOfflineBackup,
  onOpenPermissions,
  onOpenPackaging,
}) => {
  const { language, toggleLanguage, theme, toggleTheme, t } = useThemeLanguage();
  const { detectedPlatform, activeDesignSystem, isInstallable, promptInstall } = usePlatform();

  return (
    <header
      className={`sticky top-0 z-30 transition-all ${
        activeDesignSystem === 'fluent'
          ? 'bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs'
          : 'bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Brand & Title */}
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 bg-gradient-to-tr from-indigo-700 to-blue-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0 ${
                activeDesignSystem === 'material' ? 'rounded-2xl' : 'rounded-xl'
              }`}
            >
              <Landmark className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg lg:text-xl text-slate-900 dark:text-white tracking-tight leading-snug">
                  {t('appTitle')}
                </h1>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                  {t('appTagline')}
                </span>
                <span
                  className="hidden md:inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 cursor-pointer"
                  onClick={onOpenPackaging}
                  title="Cross-platform Android & Windows compatibility ready"
                >
                  {detectedPlatform === 'android' ? (
                    <Smartphone className="w-3 h-3" />
                  ) : (
                    <Laptop className="w-3 h-3" />
                  )}
                  <span>{detectedPlatform.toUpperCase()} READY</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {t('appSubtitle')}
              </p>
            </div>
          </div>

          {/* Action Tools: Offline Backup + Permissions + Packaging + Unit Converter + Language + Dark Mode */}
          <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2 shrink-0">
            {/* Direct PWA Install prompt button if available */}
            {isInstallable && (
              <button
                type="button"
                onClick={promptInstall}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all cursor-pointer animate-pulse"
                title="Install as Native App on Android or Windows PC"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Install App</span>
              </button>
            )}

            {/* Offline Backup & Vault */}
            <button
              type="button"
              onClick={onOpenOfflineBackup}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 shadow-xs transition-all cursor-pointer"
              title="Offline Backup, Restore & Vault"
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Offline Backup</span>
            </button>

            {/* Permissions & Diagnostics */}
            <button
              type="button"
              onClick={onOpenPermissions}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition-all cursor-pointer"
              title="Android & Device Permissions"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden md:inline">Permissions</span>
            </button>

            {/* Packaging Hub (APK / Windows EXE) */}
            <button
              type="button"
              onClick={onOpenPackaging}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition-all cursor-pointer"
              title="Android APK & Windows EXE Export Hub"
            >
              {detectedPlatform === 'android' ? (
                <Smartphone className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <Laptop className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              )}
              <span className="hidden lg:inline">APK / EXE Hub</span>
            </button>

            {/* Unit Converter Modal Button */}
            <button
              type="button"
              onClick={onOpenUnitConverter}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition-all cursor-pointer"
              title="Unit Converter"
            >
              <Ruler className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden xl:inline">{t('unitConverter')}</span>
            </button>

            {/* Language Toggle (Hindi / English) */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition-all cursor-pointer"
              title={language === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
            >
              <Languages className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{language === 'hi' ? 'EN' : 'हिंदी'}</span>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition-all cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

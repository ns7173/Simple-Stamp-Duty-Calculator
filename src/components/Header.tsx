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
  Bookmark,
} from 'lucide-react';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { usePlatform } from '../context/PlatformContext';

interface Props {
  onOpenUnitConverter: () => void;
  onOpenOfflineBackup: () => void;
  onOpenPermissions: () => void;
  onOpenPackaging?: () => void;
  onOpenSavedCalculations?: () => void;
  savedCalculationsCount?: number;
}

export const Header: React.FC<Props> = ({
  onOpenUnitConverter,
  onOpenOfflineBackup,
  onOpenPermissions,
  onOpenSavedCalculations,
  savedCalculationsCount = 0,
}) => {
  const { language, toggleLanguage, theme, toggleTheme, t } = useThemeLanguage();
  const { activeDesignSystem, isInstallable, promptInstall } = usePlatform();

  return (
    <header
      className={`sticky top-0 z-30 transition-all ${
        activeDesignSystem === 'fluent'
          ? 'bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs'
          : 'bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-2 sm:py-2.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 sm:gap-3">
          {/* Brand & Title */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-tr from-indigo-700 to-blue-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0 ${
                activeDesignSystem === 'material' ? 'rounded-2xl' : 'rounded-xl'
              }`}
            >
              <Landmark className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-extrabold text-sm sm:text-lg lg:text-xl text-slate-900 dark:text-white tracking-tight leading-snug">
                {t('appTitle')}
              </h1>
            </div>
          </div>

          {/* Action Tools: Offline Backup + Permissions + Packaging + Unit Converter + Language + Dark Mode */}
          <div className="flex flex-wrap items-center justify-end gap-1 sm:gap-1.5 shrink-0">
            {/* Direct PWA Install prompt button if available */}
            {isInstallable && (
              <button
                type="button"
                onClick={promptInstall}
                className="inline-flex items-center gap-1 px-2 py-1.5 sm:px-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all cursor-pointer animate-pulse"
                title="Install as Native App on Android or Windows PC"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Install</span>
              </button>
            )}

            {/* Saved Calculations (सहेजी गई गणनाएं) */}
            {onOpenSavedCalculations && (
              <button
                type="button"
                onClick={onOpenSavedCalculations}
                className="inline-flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-semibold rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/60 shadow-xs transition-all cursor-pointer"
                title="Saved Calculations / सहेजी गई गणनाएं"
              >
                <Bookmark className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="hidden sm:inline">Saved Deals</span>
                {savedCalculationsCount > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-600 text-white font-mono">
                    {savedCalculationsCount}
                  </span>
                )}
              </button>
            )}

            {/* Offline Backup & Vault */}
            <button
              type="button"
              onClick={onOpenOfflineBackup}
              className="inline-flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-semibold rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 shadow-xs transition-all cursor-pointer"
              title="Offline Backup, Restore & Vault"
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Backup</span>
            </button>

            {/* Permissions & Diagnostics */}
            <button
              type="button"
              onClick={onOpenPermissions}
              className="inline-flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition-all cursor-pointer"
              title="Android & Device Permissions"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden md:inline">Permissions</span>
            </button>

            {/* Unit Converter Modal Button */}
            <button
              type="button"
              onClick={onOpenUnitConverter}
              className="inline-flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition-all cursor-pointer"
              title="Unit Converter"
            >
              <Ruler className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden xl:inline">{t('unitConverter')}</span>
            </button>

            {/* Language Toggle (Hindi / English) */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1 px-2 py-1.5 sm:px-2.5 sm:py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition-all cursor-pointer"
              title={language === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
            >
              <Languages className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{language === 'hi' ? 'EN' : 'हिंदी'}</span>
            </button>

            {/* Eye-Comfort Dark / Light Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer shadow-xs ${
                theme === 'dark'
                  ? 'border-amber-500/40 bg-slate-800 text-amber-300 hover:bg-slate-700'
                  : 'border-indigo-200 bg-indigo-50/80 text-indigo-900 hover:bg-indigo-100'
              }`}
              title={theme === 'dark' ? 'Switch to Eye-Comfort Light Mode (दिन के लिए लाइट मोड)' : 'Switch to Eye-Comfort Dark Mode (आंखों के आराम हेतु डार्क मोड)'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-[11px] font-bold">लाइट</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="text-[11px] font-bold">डार्क</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

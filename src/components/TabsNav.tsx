import React from 'react';
import { MapPin, Building2, Building, FileText } from 'lucide-react';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

export type ActiveTab = 'plot' | 'building' | 'flat' | 'lease';

interface Props {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const TabsNav: React.FC<Props> = ({ activeTab, onTabChange }) => {
  const { t } = useThemeLanguage();

  const tabs: {
    id: ActiveTab;
    number: string;
    label: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: 'plot',
      number: '1',
      label: t('tabPlot'),
      subtitle: t('tabPlotSub'),
      icon: MapPin,
    },
    {
      id: 'building',
      number: '2',
      label: t('tabBuilding'),
      subtitle: t('tabBuildingSub'),
      icon: Building2,
    },
    {
      id: 'flat',
      number: '3',
      label: t('tabFlat'),
      subtitle: t('tabFlatSub'),
      icon: Building,
    },
    {
      id: 'lease',
      number: '4',
      label: t('tabLease'),
      subtitle: t('tabLeaseSub'),
      icon: FileText,
    },
  ];

  return (
    <div className="bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl transition-all cursor-pointer text-left ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-indigo-950 dark:text-indigo-200 shadow-md border border-indigo-100 dark:border-indigo-900/60 ring-2 ring-indigo-500/10'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/50'
              }`}
            >
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      isActive
                        ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Tab {tab.number}
                  </span>
                  <span className="font-bold text-xs sm:text-sm truncate">
                    {tab.label}
                  </span>
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {tab.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

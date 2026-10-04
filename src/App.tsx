/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  PlotState,
  BuildingState,
  ValuationResult,
} from './types/calculator';
import { Header } from './components/Header';
import { TabsNav, ActiveTab } from './components/TabsNav';
import { PlotCalculator } from './components/PlotCalculator';
import { BuildingCalculator } from './components/BuildingCalculator';
import { FlatCalculator } from './components/FlatCalculator';
import { LeaseCalculator } from './components/LeaseCalculator';
import { UnitConverterModal } from './components/UnitConverterModal';
import { PrintChallanModal } from './components/PrintChallanModal';
import { OfflineBackupModal } from './components/OfflineBackupModal';
import { PermissionsModal } from './components/PermissionsModal';
import { ExportPackagingModal } from './components/ExportPackagingModal';
import { ThemeLanguageProvider, useThemeLanguage } from './context/ThemeLanguageContext';
import { PlatformProvider, usePlatform } from './context/PlatformContext';
import {
  AppBackupPayload,
  saveWorkingSession,
  loadWorkingSession,
} from './utils/offlineBackup';

const initialPlotState: PlotState = {
  landArea: '',
  landAreaUnit: 'sqft',
  guidelineRate: '',
  guidelineRateUnit: 'sqmt',
  considerationValue: '',
  considerationMode: 'direct',
  considerationRate: '',
  considerationRateUnit: 'sqft',
  stampDutyBase: 'higher',
  stampDutyRate: '',
  registrationFeeBase: 'higher',
  registrationFeeRate: '',
  additionalCessPercent: 0,
  fixedCharges: 0,
};

const initialBuildingState: BuildingState = {
  buildingType: 'residential',
  landArea: '',
  landAreaUnit: 'sqft',
  landGuidelineRate: '',
  landGuidelineRateUnit: 'sqmt',
  constructionMode: 'complete',
  completeConstructedArea: '',
  completeConstructionUnit: 'sqft',
  floors: [
    { id: '1', name: 'Ground Floor', area: '', rate: '' },
  ],
  floorAreaUnit: 'sqft',
  defaultConstructionRate: '',
  defaultConstructionRateUnit: 'sqft',
  considerationValue: '',
  considerationMode: 'direct',
  stampDutyBase: 'higher',
  stampDutyRate: '',
  registrationFeeBase: 'higher',
  registrationFeeRate: '',
  additionalCessPercent: 0,
  fixedCharges: 0,
};

function MainApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('plot');
  const { t } = useThemeLanguage();
  const { activeDesignSystem, detectedPlatform } = usePlatform();

  // Isolated states for Plot and Building tabs
  const [plotState, setPlotState] = useState<PlotState>(initialPlotState);
  const [buildingState, setBuildingState] = useState<BuildingState>(initialBuildingState);

  // Modals
  const [isUnitConverterOpen, setIsUnitConverterOpen] = useState(false);
  const [isOfflineBackupOpen, setIsOfflineBackupOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [isPackagingOpen, setIsPackagingOpen] = useState(false);

  const [printChallanData, setPrintChallanData] = useState<{
    isOpen: boolean;
    result: ValuationResult | null;
    title: string;
  }>({
    isOpen: false,
    result: null,
    title: '',
  });

  // Restore working session on startup if available
  useEffect(() => {
    const cached = loadWorkingSession();
    if (cached && cached.data) {
      if (cached.data.plotState) setPlotState(cached.data.plotState);
      if (cached.data.buildingState) setBuildingState(cached.data.buildingState);
      if (
        cached.data.activeTab &&
        ['plot', 'building', 'flat', 'lease'].includes(cached.data.activeTab)
      ) {
        setActiveTab(cached.data.activeTab as ActiveTab);
      }
    }
  }, []);

  // Auto-save working session
  useEffect(() => {
    const payload: AppBackupPayload = {
      version: '2.0.0',
      app: 'Stamp Duty Calculator',
      exportDate: new Date().toISOString(),
      timestamp: Date.now(),
      platform: detectedPlatform,
      data: {
        plotState,
        buildingState,
        activeTab,
      },
    };
    saveWorkingSession(payload);
  }, [plotState, buildingState, activeTab, detectedPlatform]);

  const handleOpenPrintModal = (result: ValuationResult, title: string) => {
    setPrintChallanData({
      isOpen: true,
      result,
      title,
    });
  };

  const handleRestoreBackup = (payload: AppBackupPayload) => {
    if (payload.data.plotState) setPlotState(payload.data.plotState);
    if (payload.data.buildingState) setBuildingState(payload.data.buildingState);
    if (
      payload.data.activeTab &&
      ['plot', 'building', 'flat', 'lease'].includes(payload.data.activeTab)
    ) {
      setActiveTab(payload.data.activeTab as ActiveTab);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col antialiased transition-colors duration-200 ${
        activeDesignSystem === 'fluent'
          ? 'bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100'
          : 'bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100'
      }`}
    >
      {/* Top Header with Offline Backup, Permissions, Packaging & Quick Tools */}
      <Header
        onOpenUnitConverter={() => setIsUnitConverterOpen(true)}
        onOpenOfflineBackup={() => setIsOfflineBackupOpen(true)}
        onOpenPermissions={() => setIsPermissionsOpen(true)}
        onOpenPackaging={() => setIsPackagingOpen(true)}
      />

      {/* Main Container - Optimized for Mobile (Portrait + Landscape) & PC (Resizable Windows) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-5 space-y-4 sm:space-y-6">
        {/* Navigation Tabs (Strictly 4 Tabs as requested) */}
        <TabsNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab 1: Plot */}
        {activeTab === 'plot' && (
          <PlotCalculator
            state={plotState}
            onChange={setPlotState}
            onReset={() => setPlotState(initialPlotState)}
            onOpenPrintModal={handleOpenPrintModal}
          />
        )}

        {/* Tab 2: Building */}
        {activeTab === 'building' && (
          <BuildingCalculator
            state={buildingState}
            onChange={setBuildingState}
            onReset={() => setBuildingState(initialBuildingState)}
            onOpenPrintModal={handleOpenPrintModal}
          />
        )}

        {/* Tab 3: Flat */}
        {activeTab === 'flat' && <FlatCalculator />}

        {/* Tab 4: Lease */}
        {activeTab === 'lease' && <LeaseCalculator />}
      </main>

      {/* Cross-platform Footer */}
      <footer className="bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 py-4 text-center text-xs border-t border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{t('footerText')}</span>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
              Offline Storage Active
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
              {activeDesignSystem.toUpperCase()} DESIGN
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <UnitConverterModal
        isOpen={isUnitConverterOpen}
        onClose={() => setIsUnitConverterOpen(false)}
      />

      <PrintChallanModal
        isOpen={printChallanData.isOpen}
        onClose={() =>
          setPrintChallanData({ isOpen: false, result: null, title: '' })
        }
        result={printChallanData.result}
        tabTitle={printChallanData.title}
      />

      <OfflineBackupModal
        isOpen={isOfflineBackupOpen}
        onClose={() => setIsOfflineBackupOpen(false)}
        currentData={{
          plotState,
          buildingState,
          activeTab,
        }}
        onRestore={handleRestoreBackup}
      />

      <PermissionsModal
        isOpen={isPermissionsOpen}
        onClose={() => setIsPermissionsOpen(false)}
      />

      <ExportPackagingModal
        isOpen={isPackagingOpen}
        onClose={() => setIsPackagingOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <PlatformProvider>
      <ThemeLanguageProvider>
        <MainApp />
      </ThemeLanguageProvider>
    </PlatformProvider>
  );
}

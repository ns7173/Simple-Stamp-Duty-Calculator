/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ValuationResult } from './types/calculator';
import { Header } from './components/Header';
import { TabsNav, ActiveTab } from './components/TabsNav';
import { PlotCalculator, initialPlotState, PlotState } from './tabs/plot';
import { BuildingCalculator, initialBuildingState, BuildingState } from './tabs/building';
import { FlatCalculator } from './tabs/flat';
import { LeaseCalculator } from './tabs/lease';
import { UnitConverterModal } from './components/UnitConverterModal';
import { PrintChallanModal } from './components/PrintChallanModal';
import { OfflineBackupModal } from './components/OfflineBackupModal';
import { PermissionsModal } from './components/PermissionsModal';
import { SavedCalculationsModal } from './components/SavedCalculationsModal';
import { ThemeLanguageProvider, useThemeLanguage } from './context/ThemeLanguageContext';
import { PlatformProvider, usePlatform } from './context/PlatformContext';
import {
  AppBackupPayload,
  saveWorkingSession,
  loadWorkingSession,
} from './utils/offlineBackup';
import { getSavedCalculations } from './utils/savedCalculations';

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
  const [isSavedCalculationsOpen, setIsSavedCalculationsOpen] = useState(false);
  const [savedCalculationsCount, setSavedCalculationsCount] = useState(0);

  const [printChallanData, setPrintChallanData] = useState<{
    isOpen: boolean;
    result: ValuationResult | null;
    title: string;
    tab: ActiveTab;
    currentState: any;
  }>({
    isOpen: false,
    result: null,
    title: '',
    tab: 'plot',
    currentState: null,
  });

  const refreshSavedCount = () => {
    setSavedCalculationsCount(getSavedCalculations().length);
  };

  useEffect(() => {
    refreshSavedCount();
  }, [isSavedCalculationsOpen, printChallanData.isOpen]);

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

  const handleOpenPrintModal = (
    result: ValuationResult,
    title: string,
    tab: ActiveTab = 'plot',
    state: any = null
  ) => {
    setPrintChallanData({
      isOpen: true,
      result,
      title,
      tab,
      currentState: state || (tab === 'plot' ? plotState : buildingState),
    });
  };

  const handleEditCalculation = (tab: ActiveTab, savedState: any) => {
    setActiveTab(tab);
    if (savedState) {
      if (tab === 'plot') {
        setPlotState(savedState);
      } else if (tab === 'building') {
        setBuildingState(savedState);
      }
    }
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
      {/* Top Header with Offline Backup, Permissions & Quick Tools */}
      <Header
        onOpenUnitConverter={() => setIsUnitConverterOpen(true)}
        onOpenOfflineBackup={() => setIsOfflineBackupOpen(true)}
        onOpenPermissions={() => setIsPermissionsOpen(true)}
        onOpenSavedCalculations={() => setIsSavedCalculationsOpen(true)}
        savedCalculationsCount={savedCalculationsCount}
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
        {activeTab === 'flat' && (
          <FlatCalculator onOpenPrintModal={handleOpenPrintModal} />
        )}

        {/* Tab 4: Lease */}
        {activeTab === 'lease' && (
          <LeaseCalculator onOpenPrintModal={handleOpenPrintModal} />
        )}
      </main>

      {/* Modals */}
      <UnitConverterModal
        isOpen={isUnitConverterOpen}
        onClose={() => setIsUnitConverterOpen(false)}
      />

      <PrintChallanModal
        isOpen={printChallanData.isOpen}
        onClose={() =>
          setPrintChallanData({
            isOpen: false,
            result: null,
            title: '',
            tab: 'plot',
            currentState: null,
          })
        }
        result={printChallanData.result}
        tabTitle={printChallanData.title}
        tab={printChallanData.tab}
        currentState={printChallanData.currentState}
        onOpenSavedModal={() => setIsSavedCalculationsOpen(true)}
      />

      <SavedCalculationsModal
        isOpen={isSavedCalculationsOpen}
        onClose={() => setIsSavedCalculationsOpen(false)}
        onViewCalculation={(result, tabTitle, tab, state) => {
          setIsSavedCalculationsOpen(false);
          setPrintChallanData({
            isOpen: true,
            result,
            title: tabTitle,
            tab,
            currentState: state,
          });
        }}
        onEditCalculation={handleEditCalculation}
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

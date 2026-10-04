import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  Upload,
  FolderArchive,
  Trash2,
  X,
  Check,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  AppBackupPayload,
  SavedAssessment,
  downloadOfflineBackup,
  readBackupFile,
  saveToLocalVault,
  getLocalVaultAssessments,
  deleteFromLocalVault,
} from '../utils/offlineBackup';
import { PlotState, BuildingState } from '../types/calculator';
import { FlatFormState } from './FlatCalculator';
import { LeaseInputs } from './LeaseCalculator';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentData: {
    plotState: PlotState;
    buildingState: BuildingState;
    flatState?: FlatFormState;
    leaseState?: LeaseInputs;
    activeTab: string;
  };
  onRestore: (payload: AppBackupPayload) => void;
}

export const OfflineBackupModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentData,
  onRestore,
}) => {
  const [assessments, setAssessments] = useState<SavedAssessment[]>([]);
  const [newAssessmentName, setNewAssessmentName] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'vault' | 'file'>('vault');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshVault = () => {
    setAssessments(getLocalVaultAssessments());
  };

  useEffect(() => {
    if (isOpen) {
      refreshVault();
      setStatusMessage('');
      setNewAssessmentName(`Assessment - ${new Date().toLocaleDateString()}`);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentPayload: AppBackupPayload = {
    version: '2.0.0',
    app: 'Stamp Duty & Registration Fees Calculator',
    exportDate: new Date().toISOString(),
    timestamp: Date.now(),
    platform: navigator.userAgent,
    data: {
      plotState: currentData.plotState,
      buildingState: currentData.buildingState,
      flatState: currentData.flatState,
      leaseState: currentData.leaseState,
      activeTab: currentData.activeTab,
    },
  };

  // Export to JSON file
  const handleExportFile = () => {
    const filename = `stamp-duty-assessment-${currentData.activeTab}-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    downloadOfflineBackup(currentPayload, filename);
    setStatusMessage('✅ Offline backup file (.json) downloaded successfully!');
  };

  // Import from JSON file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const payload = await readBackupFile(file);
      onRestore(payload);
      setStatusMessage(`✅ Restored backup from "${file.name}" successfully!`);
      setTimeout(() => onClose(), 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setStatusMessage(`⚠️ ${message}`);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Save to Local Vault
  const handleSaveToVault = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssessmentName.trim()) return;

    saveToLocalVault(
      newAssessmentName.trim(),
      currentData.activeTab.toUpperCase(),
      currentPayload
    );
    refreshVault();
    setStatusMessage(`✅ Saved "${newAssessmentName.trim()}" to offline vault!`);
    setNewAssessmentName(`Assessment - ${new Date().toLocaleDateString()}`);
  };

  // Load from Local Vault
  const handleLoadFromVault = (record: SavedAssessment) => {
    onRestore(record.payload);
    setStatusMessage(`✅ Loaded "${record.name}" into calculator!`);
    setTimeout(() => onClose(), 1200);
  };

  // Delete from Vault
  const handleDeleteFromVault = (id: string, name: string) => {
    if (confirm(`Delete "${name}" from offline vault?`)) {
      deleteFromLocalVault(id);
      refreshVault();
      setStatusMessage(`Deleted "${name}".`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>Offline Backup & Vault</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  100% Offline
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Backup, restore & manage your valuation assessments on Android & Windows
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

        {/* Sub-tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 sm:px-5 bg-slate-100/50 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={() => setActiveSubTab('vault')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeSubTab === 'vault'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Local Saved Vault ({assessments.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('file')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeSubTab === 'file'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            JSON File Backup / Restore
          </button>
        </div>

        {/* Status Alert */}
        {statusMessage && (
          <div className="mx-4 sm:mx-5 mt-4 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-900 dark:text-indigo-200">
            {statusMessage}
          </div>
        )}

        {/* Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {activeSubTab === 'vault' ? (
            <div className="space-y-4">
              {/* Save current assessment form */}
              <form
                onSubmit={handleSaveToVault}
                className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/50 space-y-2.5"
              >
                <label className="text-xs font-bold text-indigo-950 dark:text-indigo-300 uppercase tracking-wider block">
                  Save Current Calculation to Vault
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAssessmentName}
                    onChange={(e) => setNewAssessmentName(e.target.value)}
                    placeholder="Enter assessment name (e.g. Civil Lines Plot - Sharma)"
                    className="flex-1 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-xs transition-colors shrink-0"
                  >
                    Save
                  </button>
                </div>
              </form>

              {/* List of saved assessments */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Saved Offline Assessments
                </span>

                {assessments.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    No saved assessments yet. Use the box above to save one.
                  </div>
                ) : (
                  assessments.map((record) => (
                    <div
                      key={record.id}
                      className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {record.name}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 shrink-0">
                            {record.tab}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {record.savedAt}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleLoadFromVault(record)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors cursor-pointer"
                        >
                          <span>Load</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFromVault(record.id, record.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                          title="Delete from vault"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* File Import / Export Tab */
            <div className="space-y-4">
              {/* Export Box */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                  <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>1. Export Complete Backup File (.json)</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Downloads all tabs, formulas, calculations, and inputs as an encrypted JSON backup file. Can be kept in phone storage or PC drive.
                </p>
                <button
                  type="button"
                  onClick={handleExportFile}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Backup (.json)</span>
                </button>
              </div>

              {/* Import Box */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                  <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>2. Restore from Backup File (.json)</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select previously downloaded .json backup file to restore all calculations completely offline.
                </p>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer shadow-xs transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Select & Restore File</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

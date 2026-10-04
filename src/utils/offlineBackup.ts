/**
 * Offline Backup and Vault Storage Engine
 * Works 100% offline on both Android mobile and Windows PC
 */

import { PlotState, BuildingState } from '../types/calculator';
import { FlatFormState } from '../components/FlatCalculator';
import { LeaseInputs } from '../components/LeaseCalculator';

export interface AppBackupPayload {
  version: string;
  app: string;
  exportDate: string;
  timestamp: number;
  platform: string;
  notes?: string;
  data: {
    plotState?: PlotState;
    buildingState?: BuildingState;
    flatState?: FlatFormState;
    leaseState?: LeaseInputs;
    activeTab?: string;
  };
}

export interface SavedAssessment {
  id: string;
  name: string;
  tab: string;
  savedAt: string;
  timestamp: number;
  totalPayableFormatted?: string;
  payload: AppBackupPayload;
}

const VAULT_STORAGE_KEY = 'stamp_duty_vault_assessments';
const AUTO_BACKUP_KEY = 'stamp_duty_auto_backup';

/**
 * Downloads a complete JSON offline backup file
 */
export function downloadOfflineBackup(payload: AppBackupPayload, filename?: string): void {
  const safeFilename =
    filename ||
    `stamp-duty-backup-${new Date().toISOString().slice(0, 10)}.json`;
  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = safeFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Reads and parses an uploaded JSON backup file
 */
export function readBackupFile(file: File): Promise<AppBackupPayload> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text) as AppBackupPayload;
        if (!parsed || !parsed.data) {
          throw new Error('Invalid backup file format: Missing data block');
        }
        resolve(parsed);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown parsing error';
        reject(new Error(`Failed to parse backup file: ${message}`));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Saves an assessment to Local Vault in browser / mobile storage
 */
export function saveToLocalVault(
  name: string,
  tab: string,
  payload: AppBackupPayload,
  totalPayableFormatted?: string
): SavedAssessment {
  const list = getLocalVaultAssessments();
  const newRecord: SavedAssessment = {
    id: `asm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim() || `Assessment ${new Date().toLocaleDateString()}`,
    tab,
    savedAt: new Date().toLocaleString(),
    timestamp: Date.now(),
    totalPayableFormatted,
    payload,
  };

  list.unshift(newRecord);
  try {
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
  return newRecord;
}

/**
 * Retrieves all saved assessments from Local Vault
 */
export function getLocalVaultAssessments(): SavedAssessment[] {
  try {
    const raw = localStorage.getItem(VAULT_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedAssessment[];
  } catch {
    return [];
  }
}

/**
 * Deletes an assessment from Local Vault
 */
export function deleteFromLocalVault(id: string): void {
  const list = getLocalVaultAssessments().filter((item) => item.id !== id);
  try {
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to update localStorage:', e);
  }
}

/**
 * Auto-saves working state into localStorage so page refresh or offline app restart retains data
 */
export function saveWorkingSession(payload: AppBackupPayload): void {
  try {
    localStorage.setItem(AUTO_BACKUP_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('Auto backup failed to write to storage:', e);
  }
}

/**
 * Restores working session if available
 */
export function loadWorkingSession(): AppBackupPayload | null {
  try {
    const raw = localStorage.getItem(AUTO_BACKUP_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppBackupPayload;
  } catch {
    return null;
  }
}

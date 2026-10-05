import { ValuationResult, ActiveTab } from '../types/calculator';

export interface SavedCalculationItem {
  id: string;
  name: string;
  clientNote?: string;
  tab: ActiveTab;
  tabTitle: string;
  savedAt: string;
  timestamp: number;
  result: ValuationResult;
  inputState: any;
  totalPayable: number;
}

const STORAGE_KEY = 'stamp_duty_saved_calculations_v2';

/**
 * Get all saved calculations from localStorage
 */
export function getSavedCalculations(): SavedCalculationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load saved calculations from localStorage:', err);
    return [];
  }
}

/**
 * Save a new calculation to localStorage
 */
export function saveCalculationToStorage(params: {
  name: string;
  clientNote?: string;
  tab: ActiveTab;
  tabTitle: string;
  result: ValuationResult;
  inputState: any;
}): SavedCalculationItem {
  const currentList = getSavedCalculations();
  const newItem: SavedCalculationItem = {
    id: `calc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: params.name.trim() || `${params.tabTitle} Calculation`,
    clientNote: params.clientNote?.trim() || '',
    tab: params.tab,
    tabTitle: params.tabTitle,
    savedAt: new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    timestamp: Date.now(),
    result: params.result,
    inputState: params.inputState,
    totalPayable: params.result.grandTotalCharges,
  };

  const updatedList = [newItem, ...currentList];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  } catch (err) {
    console.error('Failed to save calculation to localStorage:', err);
  }

  return newItem;
}

/**
 * Update an existing calculation's name or note
 */
export function updateCalculationInStorage(
  id: string,
  name: string,
  clientNote?: string
): boolean {
  const currentList = getSavedCalculations();
  const index = currentList.findIndex((item) => item.id === id);
  if (index === -1) return false;

  currentList[index].name = name.trim() || currentList[index].name;
  if (clientNote !== undefined) {
    currentList[index].clientNote = clientNote.trim();
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentList));
    return true;
  } catch (err) {
    console.error('Failed to update calculation in localStorage:', err);
    return false;
  }
}

/**
 * Delete a calculation from localStorage by ID
 */
export function deleteCalculationFromStorage(id: string): boolean {
  const currentList = getSavedCalculations();
  const filtered = currentList.filter((item) => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (err) {
    console.error('Failed to delete calculation from localStorage:', err);
    return false;
  }
}

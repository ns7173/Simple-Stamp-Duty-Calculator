import React, { useState, useEffect } from 'react';
import {
  X,
  Bookmark,
  Trash2,
  Edit3,
  Eye,
  Calendar,
  Building2,
  MapPin,
  Building,
  FileText,
  Search,
  CheckCircle2,
} from 'lucide-react';
import {
  SavedCalculationItem,
  getSavedCalculations,
  deleteCalculationFromStorage,
  updateCalculationInStorage,
} from '../utils/savedCalculations';
import { formatINR } from '../utils/units';
import { ActiveTab, ValuationResult } from '../types/calculator';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onViewCalculation: (result: ValuationResult, tabTitle: string, tab: ActiveTab, state: any) => void;
  onEditCalculation: (tab: ActiveTab, state: any) => void;
}

export const SavedCalculationsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onViewCalculation,
  onEditCalculation,
}) => {
  const [list, setList] = useState<SavedCalculationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editNote, setEditNote] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const loadData = () => {
    setList(getSavedCalculations());
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setEditingId(null);
      setNotification(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`क्या आप सहेजी गई गणना "${name}" को हटाना (Delete) चाहते हैं?`)) {
      deleteCalculationFromStorage(id);
      loadData();
      showNotification(`"${name}" को हटा दिया गया है।`);
    }
  };

  const handleStartEditName = (item: SavedCalculationItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditNote(item.clientNote || '');
  };

  const handleSaveEditName = (id: string) => {
    if (!editName.trim()) return;
    updateCalculationInStorage(id, editName.trim(), editNote.trim());
    setEditingId(null);
    loadData();
    showNotification('गणना का नाम सफलतापूर्वक अपडेट किया गया।');
  };

  const handleEditInCalculator = (item: SavedCalculationItem) => {
    onEditCalculation(item.tab, item.inputState);
    onClose();
  };

  const handleViewChallan = (item: SavedCalculationItem) => {
    onViewCalculation(item.result, item.tabTitle, item.tab, item.inputState);
  };

  const getTabIcon = (tab: ActiveTab) => {
    switch (tab) {
      case 'plot':
        return <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'building':
        return <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'flat':
        return <Building className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'lease':
        return <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      default:
        return <Bookmark className="w-4 h-4 text-slate-500" />;
    }
  };

  const filteredList = list.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.tabTitle.toLowerCase().includes(q) ||
      (item.clientNote && item.clientNote.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                <span>Saved Calculations (सहेजी गई गणनाएं)</span>
                <span className="text-xs bg-indigo-800/80 px-2 py-0.5 rounded-full font-mono">
                  {list.length}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                लोकल स्टोरेज में सहेजी गई गणनाएं देखें, एडिट करें या डिलीट करें
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Notification Bar */}
        <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700/80 shrink-0 space-y-2">
          {notification && (
            <div className="flex items-center gap-2 text-xs font-semibold px-3 py-2 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 rounded-lg">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{notification}</span>
            </div>
          )}

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="नाम या प्रॉपर्टी के प्रकार से खोजें..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {list.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <Bookmark className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                कोई सहेजी गई गणना नहीं मिली
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                प्रिंट चालान (Print Challan) में <strong>"Save As (सहेजें)"</strong> बटन दबाकर किसी भी प्लॉट, भवन, फ्लैट या लीज की गणना को भविष्य के लिए सुरक्षित कर सकते हैं।
              </p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              कोई मेल खाने वाली गणना नहीं मिली।
            </div>
          ) : (
            filteredList.map((item) => {
              const isEditing = editingId === item.id;
              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 sm:p-4 shadow-xs transition-all hover:border-indigo-300 dark:hover:border-indigo-600"
                >
                  {isEditing ? (
                    <div className="space-y-2 mb-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="गणना का नाम"
                        className="w-full px-3 py-1.5 text-xs sm:text-sm border border-indigo-400 rounded-lg outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                      <input
                        type="text"
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                        placeholder="पार्टी/क्लाइंट नोट (वैकल्पिक)"
                        className="w-full px-3 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded-lg outline-none bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleSaveEditName(item.id)}
                          className="px-3 py-1 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 cursor-pointer"
                        >
                          सुरक्षित करें (Save)
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
                        >
                          रद्द करें
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                            {getTabIcon(item.tab)}
                            <span>{item.tabTitle}</span>
                          </span>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {item.name}
                          </h4>
                          <button
                            type="button"
                            onClick={() => handleStartEditName(item)}
                            className="p-1 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                            title="नाम बदलें (Rename)"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {item.clientNote && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 italic">
                            नोट: {item.clientNote}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {item.savedAt}
                          </span>
                        </div>
                      </div>

                      {/* Total Amount Badge */}
                      <div className="text-left sm:text-right shrink-0">
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          कुल देय शुल्क
                        </div>
                        <div className="font-mono font-extrabold text-base text-indigo-700 dark:text-indigo-300">
                          {formatINR(item.totalPayable)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions Row: View | Edit | Delete */}
                  <div className="flex items-center justify-end gap-1.5 pt-2.5 border-t border-slate-100 dark:border-slate-700/60">
                    <button
                      type="button"
                      onClick={() => handleViewChallan(item)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
                      title="चालान व विवरण देखें"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>देखें (View)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEditInCalculator(item)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors cursor-pointer"
                      title="कैलकुलेटर में लोड करके इनपुट बदलें"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>एडिट करें (Edit)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.name)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="हटाएं"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>हटाएं (Delete)</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

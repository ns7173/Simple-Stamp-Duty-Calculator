import React, { useState } from 'react';
import { ValuationResult, ActiveTab } from '../types/calculator';
import {
  X,
  Printer,
  FileDown,
  Share2,
  BookmarkPlus,
  Check,
  BookmarkCheck,
  MessageCircle,
  Copy,
} from 'lucide-react';
import { saveCalculationToStorage } from '../utils/savedCalculations';
import { PlotPrintSheet, getPlotSummaryText } from '../tabs/plot';
import { BuildingPrintSheet, getBuildingSummaryText } from '../tabs/building';
import { FlatPrintSheet, getFlatSummaryText } from '../tabs/flat';
import { LeasePrintSheet, getLeaseSummaryText } from '../tabs/lease';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  result: ValuationResult | null;
  tabTitle: string;
  tab?: ActiveTab;
  currentState?: any;
  onOpenSavedModal?: () => void;
}

export const PrintChallanModal: React.FC<Props> = ({
  isOpen,
  onClose,
  result,
  tabTitle,
  tab = 'plot',
  currentState = null,
  onOpenSavedModal,
}) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [clientNote, setClientNote] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  if (!isOpen || !result) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const getSummaryText = () => {
    switch (tab) {
      case 'lease':
        return getLeaseSummaryText(result, currentState);
      case 'building':
        return getBuildingSummaryText(result, tabTitle, currentDate);
      case 'flat':
        return getFlatSummaryText(result, tabTitle, currentDate);
      case 'plot':
      default:
        return getPlotSummaryText(result, tabTitle, currentDate);
    }
  };

  // Option 1: Native Print Page
  const handlePrint = () => {
    window.print();
  };

  // Option 2: Save as PDF
  const handleSaveAsPdf = () => {
    const originalTitle = document.title;
    document.title = `${tabTitle.replace(/\s+/g, '_')}_Challan_${new Date().toISOString().slice(0, 10)}`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
    showToast('💡 प्रिंट विंडो में Destination में "Save as PDF" चुनें।');
  };

  // Option 3: Share (Native Share or WhatsApp / Copy fallback)
  const handleShare = async () => {
    const shareText = getSummaryText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${tabTitle} Stamp Duty Challan`,
          text: shareText,
        });
        showToast('सफलतापूर्वक शेयर किया गया!');
        return;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Native share failed, falling back to copy:', err);
        }
      }
    }

    // Fallback: Copy to clipboard & offer WhatsApp link
    try {
      await navigator.clipboard.writeText(shareText);
      showToast('चालान विवरण क्लिपबोर्ड पर कॉपी हो गया! आप इसे कहीं भी पेस्ट कर सकते हैं।');
    } catch {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  // Direct WhatsApp Share
  const handleWhatsAppShare = () => {
    const shareText = getSummaryText();
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  // Option 4: Save to Local Storage ("Save As...")
  const handleOpenSaveDialog = () => {
    setSaveName(`${tabTitle} - ${new Date().toLocaleDateString('en-IN')}`);
    setClientNote('');
    setShowSaveDialog(true);
    setIsSavedSuccess(false);
  };

  const handleConfirmSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveName.trim()) return;

    saveCalculationToStorage({
      name: saveName.trim(),
      clientNote: clientNote.trim(),
      tab,
      tabTitle,
      result,
      inputState: currentState,
    });

    setIsSavedSuccess(true);
    showToast(`✅ गणना "${saveName.trim()}" लोकल स्टोरेज में सहेज ली गई है!`);
    setTimeout(() => setShowSaveDialog(false), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full border border-slate-300 shadow-2xl overflow-hidden my-2 sm:my-6 print:m-0 print:border-none print:shadow-none print:max-w-none">
        {/* Modal Top Bar - hidden when printing */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-400 shrink-0" />
            <h3 className="font-bold text-sm sm:text-base">Valuation & Fee Estimate Challan</h3>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* Save as PDF */}
            <button
              type="button"
              onClick={handleSaveAsPdf}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Save as PDF document"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Save as PDF</span>
            </button>

            {/* Print Page */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Print Page"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Print</span>
            </button>

            {/* Share */}
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Share estimate via WhatsApp / Apps"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Share</span>
            </button>

            {/* Save to Local Storage ("Save As...") */}
            <button
              type="button"
              onClick={handleOpenSaveDialog}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Save to Local Storage to edit or view later"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>Save As</span>
            </button>

            {/* View Saved List link if callback provided */}
            {onOpenSavedModal && (
              <button
                type="button"
                onClick={onOpenSavedModal}
                className="inline-flex items-center gap-1 px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                title="View All Saved Calculations"
              >
                <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Saved</span>
              </button>
            )}

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast / Notification Bar */}
        {toastMessage && (
          <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-2 text-xs font-semibold text-indigo-900 flex items-center justify-between print:hidden">
            <span>{toastMessage}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:underline cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp पर भेजें</span>
              </button>
            </div>
          </div>
        )}

        {/* Save to Local Storage Dialog (Inline Form) */}
        {showSaveDialog && (
          <div className="bg-amber-50/90 border-b border-amber-200 p-4 print:hidden animate-in fade-in duration-150">
            <form onSubmit={handleConfirmSave} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-900">
                  <BookmarkPlus className="w-4 h-4 text-amber-700" />
                  <span>Save Calculation to Local Storage (लोकल स्टोरेज में सहेजें)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSaveDialog(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Calculation Name / नाम <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. राम नगर प्लॉट डील"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Client / Property Note (वैकल्पिक)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. क्रेता: शर्मा जी, खसरा नं. 14"
                    value={clientNote}
                    onChange={(e) => setClientNote(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-600">
                  सहेजने के बाद आप इसे कभी भी <strong>देख सकते हैं, एडिट कर सकते हैं या डिलीट कर सकते हैं</strong>।
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSaveDialog(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-amber-100 rounded-lg cursor-pointer"
                  >
                    रद्द करें
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 px-4 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-xs cursor-pointer"
                  >
                    {isSavedSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>सहेजा गया!</span>
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="w-3.5 h-3.5" />
                        <span>सुरक्षित करें (Save)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Printable Formal Sheet Content */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-900" id="printable-challan">
          {tab === 'lease' && (
            <LeasePrintSheet
              result={result}
              currentState={currentState}
              currentDate={currentDate}
            />
          )}
          {tab === 'building' && (
            <BuildingPrintSheet
              result={result}
              tabTitle={tabTitle}
              currentDate={currentDate}
            />
          )}
          {tab === 'flat' && (
            <FlatPrintSheet
              result={result}
              tabTitle={tabTitle}
              currentDate={currentDate}
            />
          )}
          {tab === 'plot' && (
            <PlotPrintSheet
              result={result}
              tabTitle={tabTitle}
              currentDate={currentDate}
            />
          )}
        </div>
      </div>
    </div>
  );
};

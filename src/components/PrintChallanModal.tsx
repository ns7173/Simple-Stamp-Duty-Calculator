import React, { useState } from 'react';
import { ValuationResult, ActiveTab } from '../types/calculator';
import { formatINR, numberToIndianWords } from '../utils/units';
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
    const scanningLine = result.scanningFee && result.scanningFee > 0 ? `3. *Scanning Fee (स्कैनिंग शुल्क):* लगभग / Approx ${formatINR(result.scanningFee)}\n` : '';
    const advocateLine = result.advocateFee && result.advocateFee > 0 ? `4. *Advocate Fees (अधिवक्ता शुल्क):* ${formatINR(result.advocateFee)}\n` : '';
    return `📄 *Stamp Duty & Registration Fee Estimate*
*Category:* ${tabTitle}
*Date:* ${currentDate}

*Total Govt Guideline Value:* ${formatINR(result.totalGovtValue)}
*Sale Consideration Value:* ${formatINR(result.considerationValue)}
──────────────────────
1. *Stamp Duty (${result.stampDutyRate}%):* ${formatINR(result.stampDutyAmount)}
2. *Registration Fee (${result.registrationFeeRate}%):* ${formatINR(result.registrationFeeAmount)}
${scanningLine}${advocateLine}──────────────────────
*TOTAL ESTIMATED PAYABLE:* ${formatINR(result.grandTotalCharges)}
*In Words:* ${numberToIndianWords(result.grandTotalCharges)}`;
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
          {/* Header */}
          <div className="text-center border-b-2 border-slate-800 pb-5">
            <h1 className="text-lg sm:text-xl font-extrabold uppercase tracking-tight text-slate-950">
              Stamp Duty & Registration Fee Estimate Statement
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Prepared for {tabTitle} Valuation Assessment • Date: {currentDate}
            </p>
          </div>

          {/* Property Valuation Details */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
              1. Property Valuation Assessment
            </h2>
            <div className="overflow-x-auto -mx-1 sm:mx-0">
              <table className="w-full text-xs text-left border border-slate-200 min-w-[280px]">
                <tbody>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 font-medium bg-slate-50 w-1/2">
                    Property Category:
                  </td>
                  <td className="p-2.5 font-bold text-slate-900">{tabTitle}</td>
                </tr>
                {result.landAreaOriginal > 0 && (
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 font-medium bg-slate-50">
                      Land Area & Guideline Rate:
                    </td>
                    <td className="p-2.5">
                      {result.landAreaOriginal} {result.landAreaUnit} (= {Number(result.landAreaInRateUnit.toFixed(4))} {result.landRateUnit}) @ {formatINR(result.landGuidelineRate)}/{result.landRateUnit}
                    </td>
                  </tr>
                )}
                {result.landGovtValueNet > 0 && (
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 font-medium bg-slate-50">
                      Land Government Value:
                    </td>
                    <td className="p-2.5 font-mono font-bold">
                      {formatINR(result.landGovtValueNet)}
                      {result.landDiscountAmount > 0 && (
                        <span className="text-emerald-700 ml-2 font-normal text-[11px]">
                          (Discount Applied: -{formatINR(result.landDiscountAmount)})
                        </span>
                      )}
                    </td>
                  </tr>
                )}
                {result.hasConstruction && (
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 font-medium bg-slate-50">
                      Constructed Area & Guideline Rate:
                    </td>
                    <td className="p-2.5">
                      {result.constructionAreaOriginal} {result.constructionAreaUnit} @ {formatINR(result.constructionGuidelineRate)}/{result.constructionRateUnit}
                    </td>
                  </tr>
                )}
                {result.hasConstruction && (
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 font-medium bg-slate-50">
                      Construction Government Value:
                    </td>
                    <td className="p-2.5 font-mono font-bold">
                      {formatINR(result.constructionGovtValueNet)}
                      {result.constructionConcessionAmount > 0 && (
                        <span className="text-emerald-700 ml-2 font-normal text-[11px]">
                          (Concession Applied: -{formatINR(result.constructionConcessionAmount)})
                        </span>
                      )}
                    </td>
                  </tr>
                )}
                <tr className="border-b border-slate-200 bg-slate-100/60 font-semibold">
                  <td className="p-2.5">Total Government Guideline Value:</td>
                  <td className="p-2.5 font-mono font-bold text-indigo-950">
                    {formatINR(result.totalGovtValue)}
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 font-medium bg-slate-50">
                    Sale Deed Consideration Value:
                  </td>
                  <td className="p-2.5 font-mono font-bold">
                    {formatINR(result.considerationValue)}
                  </td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>

          {/* Duty & Fees Schedule */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
              2. Payable Government Dues & Stamp Schedule
            </h2>
            <div className="overflow-x-auto -mx-1 sm:mx-0">
              <table className="w-full text-xs text-left border border-slate-200 min-w-[280px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                    <th className="p-2.5">Head of Account / Fee</th>
                    <th className="p-2.5">Rate (%)</th>
                    <th className="p-2.5 text-right">Amount (Rs.)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2.5 font-bold">1. Stamp Duty</td>
                    <td className="p-2.5 font-mono">{result.stampDutyRate}%</td>
                    <td className="p-2.5 text-right font-mono font-bold">
                      {formatINR(result.stampDutyAmount)}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">2. Registration Fees</td>
                    <td className="p-2.5 font-mono">{result.registrationFeeRate}%</td>
                    <td className="p-2.5 text-right font-mono font-bold">
                      {formatINR(result.registrationFeeAmount)}
                    </td>
                  </tr>
                  {result.scanningFee !== undefined && result.scanningFee > 0 && (
                    <tr>
                      <td className="p-2.5 font-bold">
                        3. Scanning Charges (स्कैनिंग शुल्क): लगभग / Approx Rs.
                      </td>
                      <td className="p-2.5 font-mono text-slate-500">लगभग / Approx</td>
                      <td className="p-2.5 text-right font-mono font-bold">
                        लगभग {formatINR(result.scanningFee)}
                      </td>
                    </tr>
                  )}
                  {result.advocateFee !== undefined && result.advocateFee > 0 && (
                    <tr>
                      <td className="p-2.5 font-bold">4. Advocate / Documentation Fees (अधिवक्ता शुल्क)</td>
                      <td className="p-2.5 font-mono text-slate-500"></td>
                      <td className="p-2.5 text-right font-mono font-bold">
                        {formatINR(result.advocateFee)}
                      </td>
                    </tr>
                  )}
                  <tr className="bg-slate-900 text-white font-bold text-sm">
                    <td className="p-3" colSpan={2}>
                      TOTAL ESTIMATED PAYABLE (STAMP + REGISTRATION + CHARGES)
                    </td>
                    <td className="p-3 text-right font-mono font-extrabold text-base">
                      {formatINR(result.grandTotalCharges)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Amount in words */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <span className="font-bold text-slate-700">Amount in Words / शब्दों में राशि: </span>
            <span className="font-semibold italic text-slate-900">
              {numberToIndianWords(result.grandTotalCharges)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

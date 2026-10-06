import React, { useState } from 'react';
import { ValuationResult, ActiveTab } from '../types/calculator';
import { formatINR, numberToIndianWords, numberToHindiWords } from '../utils/units';
import { saveCalculationToStorage } from '../utils/savedCalculations';
import {
  Calculator,
  Receipt,
  Printer,
  Copy,
  Check,
  FileSpreadsheet,
  ScanLine,
  Scale,
  FileDown,
  BookmarkPlus,
  Share2,
  X,
  Sparkles,
} from 'lucide-react';

export interface OverviewItem {
  label: string;
  value: string | number;
  isBold?: boolean;
  isHighlight?: boolean;
}

interface Props {
  title: string;
  tab?: ActiveTab;
  result: ValuationResult;
  currentState?: any;
  onOpenPrintModal?: (result: ValuationResult, title: string, tab: ActiveTab, state: any) => void;
  scanningFee?: number | '';
  onChangeScanningFee?: (val: number | '') => void;
  advocateFee?: number | '';
  onChangeAdvocateFee?: (val: number | '') => void;
  overviewTitle?: string;
  overviewItems?: OverviewItem[];
  breakdownTitle?: string;
  showAdditionalCharges?: boolean;
}

export const CalculationSummaryCard: React.FC<Props> = ({
  title,
  tab = 'plot',
  result,
  currentState = null,
  onOpenPrintModal,
  scanningFee: scanningFeeProp,
  onChangeScanningFee,
  advocateFee: advocateFeeProp,
  onChangeAdvocateFee,
  overviewTitle = 'Valuation Components Overview',
  overviewItems,
  breakdownTitle = 'Calculation Breakdown & Formula Steps',
  showAdditionalCharges = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState(`${title} - ${new Date().toLocaleDateString('en-IN')}`);
  const [clientNote, setClientNote] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Internal state fallback if not controlled from parent
  const [localScanningFee, setLocalScanningFee] = useState<number | ''>(scanningFeeProp ?? '');
  const [localAdvocateFee, setLocalAdvocateFee] = useState<number | ''>(advocateFeeProp ?? 10000);

  const currentScanningFee = scanningFeeProp !== undefined ? scanningFeeProp : localScanningFee;
  const currentAdvocateFee = advocateFeeProp !== undefined ? advocateFeeProp : localAdvocateFee;

  const handleScanningChange = (val: number | '') => {
    setLocalScanningFee(val);
    onChangeScanningFee?.(val);
  };

  const handleAdvocateChange = (val: number | '') => {
    setLocalAdvocateFee(val);
    onChangeAdvocateFee?.(val);
  };

  const scanningNum = showAdditionalCharges && typeof currentScanningFee === 'number' ? currentScanningFee : 0;
  const advocateNum = showAdditionalCharges && typeof currentAdvocateFee === 'number' ? currentAdvocateFee : 0;

  // Total amount includes Stamp Duty + Reg Fee + Scanning Fee + Advocate Fees
  const totalPayable = result.stampDutyAmount + result.registrationFeeAmount + scanningNum + advocateNum;

  const finalResult: ValuationResult = {
    ...result,
    scanningFee: scanningNum,
    advocateFee: advocateNum,
    grandTotalCharges: totalPayable,
  };

  const getSummaryText = () => {
    if (tab === 'lease') {
      const tenureStr = currentState?.tenureYears ? `${currentState.tenureYears}` : '.....';
      const incRateStr =
        currentState?.hasEscalation &&
        currentState?.escalationPercent !== '' &&
        currentState?.escalationPercent !== undefined
          ? `${currentState.escalationPercent}`
          : '.....';
      const incYearStr =
        currentState?.hasEscalation && currentState?.escalationYears
          ? `${currentState.escalationYears}`
          : '........';
      const rentNum = currentState?.startingRent
        ? currentState.rentFrequency === 'monthly'
          ? currentState.startingRent
          : Math.round(currentState.startingRent / 12)
        : 0;
      const rentStr = rentNum > 0 ? rentNum.toLocaleString('en-IN') : '......';
      const stampDutyStr = result.stampDutyAmount > 0 ? result.stampDutyAmount.toLocaleString('en-IN') : '.............';
      const regFeeStr = result.registrationFeeAmount > 0 ? result.registrationFeeAmount.toLocaleString('en-IN') : '.............';
      const scanningStr = scanningNum > 0 ? scanningNum.toLocaleString('en-IN') : '.............';
      const advocateStr = advocateNum > 0 ? advocateNum.toLocaleString('en-IN') : '10,000';
      const totalStr = totalPayable > 0 ? totalPayable.toLocaleString('en-IN') : '.................';
      const wordsEn = totalPayable > 0 ? numberToIndianWords(totalPayable) : '........................ Rupees Only';
      const wordsHi = totalPayable > 0 ? numberToHindiWords(totalPayable) : '................ रुपये मात्र';

      return `Lease / Rent Agreement (पट्टा विलेख) -
Stamp Duty & Registration Fees Summary*
Lease Tenure ${tenureStr} years
Increment Rate ${incRateStr} %
every ${incYearStr} year
Rent Rs. ${rentStr} Per Month
….......…............….............................................
Stamp Duty: Rs. ${stampDutyStr}
Registration Fees: Rs. ${regFeeStr}
Scanning Charges: Rs. ${scanningStr} (Approx)
Advocate Fees: Rs. ${advocateStr}
.......…............…..................................................
TOTAL ESTIMATED PAYABLE:* Rs. ${totalStr}
(${wordsEn} / ${wordsHi})`.trim();
    }

    return `📄 *${title} - Stamp Duty & Registration Summary*
Total Value / Assessment Base: ${formatINR(result.totalGovtValue)}
Consideration / Transaction Value: ${formatINR(result.considerationValue)}
──────────────────────
1. Stamp Duty: ${formatINR(result.stampDutyAmount)}
2. Registration Fee: ${formatINR(result.registrationFeeAmount)}
${scanningNum > 0 ? `3. Scanning Fee (स्कैनिंग शुल्क): लगभग / Approx ${formatINR(scanningNum)}\n` : ''}${advocateNum > 0 ? `4. Advocate Fees (अधिवक्ता शुल्क): ${formatINR(advocateNum)}\n` : ''}──────────────────────
*TOTAL ESTIMATED PAYABLE:* ${formatINR(totalPayable)}
(${numberToIndianWords(totalPayable)})
    `.trim();
  };

  // Option 1: Copy
  const handleCopySummary = async () => {
    const text = getSummaryText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setToastMsg('चालान सारांश क्लिपबोर्ड पर कॉपी हो गया!');
      setTimeout(() => {
        setCopied(false);
        setToastMsg(null);
      }, 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  // Option 2: Save PDF
  const handleSaveAsPdf = () => {
    const originalTitle = document.title;
    document.title = `${title.replace(/\s+/g, '_')}_Challan_${new Date().toISOString().slice(0, 10)}`;
    if (onOpenPrintModal) {
      onOpenPrintModal(finalResult, title, tab, currentState);
      setToastMsg('💡 प्रिंट विंडो में "Save as PDF" चुनें।');
      setTimeout(() => setToastMsg(null), 4000);
    } else {
      window.print();
      setTimeout(() => {
        document.title = originalTitle;
      }, 1000);
    }
  };

  // Option 3: Save to LocalStorage
  const handleConfirmSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveName.trim()) return;

    saveCalculationToStorage({
      name: saveName.trim(),
      clientNote: clientNote.trim(),
      tab,
      tabTitle: title,
      result: finalResult,
      inputState: currentState,
    });

    setSavedSuccess(true);
    setShowSaveDialog(false);
    setToastMsg('आकलन सफलतापूर्वक सुरक्षित (Save) किया गया!');
    window.dispatchEvent(new Event('storage'));
    setTimeout(() => {
      setSavedSuccess(false);
      setToastMsg(null);
    }, 3000);
  };

  // Option 4: Share
  const handleShare = async () => {
    const text = getSummaryText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title} Estimate`,
          text: text,
        });
        setToastMsg('सफलतापूर्वक शेयर किया गया!');
        setTimeout(() => setToastMsg(null), 2500);
        return;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Share error:', err);
        }
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setToastMsg('विवरण कॉपी हो गया! WhatsApp खुल रहा है...');
    } catch {}
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Option 5: Print
  const handlePrint = () => {
    if (onOpenPrintModal) {
      onOpenPrintModal(finalResult, title, tab, currentState);
    } else {
      window.print();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden transition-all">
      {/* Top Dark Slate Banner: Unified Header & Actions across all tabs */}
      <div className="bg-slate-900 text-white p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-400 shrink-0" />
            <h3 className="font-bold text-base text-white tracking-tight">{title} Summary</h3>
          </div>

          {/* Universal 5 Action Buttons: Copy, Save PDF, Save, Share, Print */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* 1. Copy (कॉपी) */}
            <button
              type="button"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Copy formatted summary to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>कॉपी हुआ</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>कॉपी</span>
                </>
              )}
            </button>

            {/* 2. Save PDF (सेव PDF) */}
            <button
              type="button"
              onClick={handleSaveAsPdf}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-600/80 hover:bg-rose-600 text-white transition-colors cursor-pointer shadow-xs"
              title="Save / Download as PDF"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>सेव PDF</span>
            </button>

            {/* 3. Save (सेव) */}
            <button
              type="button"
              onClick={() => {
                setSaveName(`${title} - ${new Date().toLocaleDateString('en-IN')}`);
                setShowSaveDialog(!showSaveDialog);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-colors cursor-pointer shadow-xs"
              title="Save calculation to local storage"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-amber-200" />
                  <span>सहेजा गया</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>सेव</span>
                </>
              )}
            </button>

            {/* 4. Share (शेयर) */}
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shadow-xs"
              title="Share estimate via WhatsApp or Apps"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>शेयर</span>
            </button>

            {/* 5. Print (प्रिंट) */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer shadow-xs"
              title="Print Formal Assessment Challan"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रिंट</span>
            </button>
          </div>
        </div>

        {/* Inline Toast Notification */}
        {toastMsg && (
          <div className="mt-3 py-1 px-3 bg-indigo-800/80 text-indigo-100 rounded-lg text-xs font-medium flex items-center justify-between animate-in fade-in">
            <span>{toastMsg}</span>
            <button
              type="button"
              onClick={() => setToastMsg(null)}
              className="text-indigo-300 hover:text-white ml-2 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Inline Save to LocalStorage Dialog */}
        {showSaveDialog && (
          <div className="mt-3 p-3.5 bg-slate-800/95 border border-slate-700 rounded-xl text-xs space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between font-bold text-amber-400">
              <span className="flex items-center gap-1.5">
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>Save to Saved Calculations (आकलन सुरक्षित करें)</span>
              </span>
              <button
                type="button"
                onClick={() => setShowSaveDialog(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <form onSubmit={handleConfirmSave} className="space-y-2">
              <div>
                <label className="text-[11px] text-slate-300 block mb-0.5">
                  Calculation Name / शीर्षक:
                </label>
                <input
                  type="text"
                  required
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-300 block mb-0.5">
                  Client / Case Note (Optional):
                </label>
                <input
                  type="text"
                  placeholder="उदा. खसरा नं. 14/2, पक्षकार नाम"
                  value={clientNote}
                  onChange={(e) => setClientNote(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowSaveDialog(false)}
                  className="px-2.5 py-1 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 text-xs cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded bg-amber-600 text-white font-bold hover:bg-amber-500 text-xs cursor-pointer"
                >
                  सुरक्षित करें (Save)
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Total Amount to Pay Banner */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <span className="text-xs text-indigo-300 font-semibold uppercase tracking-wider block">
            Total Amount to Pay / कुल देय राशि
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {formatINR(totalPayable)}
          </div>
          <div className="text-xs text-indigo-200/90 italic mt-1">
            {totalPayable > 0 ? numberToIndianWords(totalPayable) : 'दरें एवं विवरण दर्ज करने पर गणना प्रदर्शित होगी'}
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Section 1: Valuation / Component Overview */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2.5 flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-slate-200">
            <FileSpreadsheet className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{overviewTitle}</span>
          </div>

          <div className="p-3.5 space-y-2.5 text-xs bg-white dark:bg-slate-900">
            {overviewItems && overviewItems.length > 0 ? (
              overviewItems.map((item, index) => (
                <div
                  key={index}
                  className={`flex justify-between items-center ${
                    item.isHighlight
                      ? 'pt-2 border-t border-slate-100 dark:border-slate-800 font-bold text-slate-900 dark:text-white'
                      : item.isBold
                      ? 'font-bold text-slate-900 dark:text-white'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{item.label}</span>
                  <span
                    className={
                      item.isHighlight
                        ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                        : item.isBold
                        ? 'font-bold text-slate-900 dark:text-white'
                        : 'font-semibold text-slate-900 dark:text-white'
                    }
                  >
                    {item.value}
                  </span>
                </div>
              ))
            ) : (
              <>
                <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                  <span>Land Government Value:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatINR(result.landGovtValueNet)}
                  </span>
                </div>

                {result.hasConstruction && (
                  <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                    <span>Construction Government Value:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatINR(result.constructionGovtValueNet)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800 font-bold text-slate-900 dark:text-white">
                  <span>Total Government Value:</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {formatINR(result.totalGovtValue)}
                  </span>
                </div>

                <div className="flex justify-between items-center font-bold text-slate-900 dark:text-white">
                  <span>Consideration Value:</span>
                  <span>{formatINR(result.considerationValue)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Section 2: Calculation Breakdown & Formula Steps */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2.5 flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-slate-200">
            <Calculator className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{breakdownTitle}</span>
          </div>

          <div className="p-3.5 space-y-3 text-xs bg-white dark:bg-slate-900">
            {/* Stamp Duty */}
            <div className="p-3 rounded-lg bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40">
              <div className="flex justify-between items-center">
                <span className="font-bold text-blue-900 dark:text-blue-200">
                  Stamp Duty ({result.stampDutyRate}%)
                </span>
                <span className="font-extrabold text-blue-950 dark:text-blue-100 text-sm">
                  {formatINR(result.stampDutyAmount)}
                </span>
              </div>
              <div className="text-[11px] text-blue-700 dark:text-blue-300 mt-1">
                {formatINR(result.stampDutyApplicableBase)} × {result.stampDutyRate}%
              </div>
              <div className="text-[10px] text-blue-600/80 dark:text-blue-400 italic">
                Base: {result.stampDutyBaseFormula}
              </div>
            </div>

            {/* Registration Fee */}
            <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
              <div className="flex justify-between items-center">
                <span className="font-bold text-emerald-900 dark:text-emerald-200">
                  Registration Fee ({result.registrationFeeRate}%)
                </span>
                <span className="font-extrabold text-emerald-950 dark:text-emerald-100 text-sm">
                  {formatINR(result.registrationFeeAmount)}
                </span>
              </div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-1">
                {formatINR(result.registrationFeeApplicableBase)} × {result.registrationFeeRate}%
              </div>
              <div className="text-[10px] text-emerald-600/80 dark:text-emerald-400 italic">
                Base: {result.registrationFeeBaseFormula}
              </div>
            </div>

            {/* Additional Charges: Scanning Fee & Advocate Fees */}
            {showAdditionalCharges && (
              <>
                {/* Scanning Fee Input Box */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                      <ScanLine className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Scanning Fee (स्कैनिंग शुल्क): लगभग / Approx Rs.</span>
                    </label>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold px-2 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700/60">
                      लगभग / Approx
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap select-none">
                      लगभग / Approx ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0 (स्कैनिंग राशि)"
                      value={currentScanningFee === '' ? '' : currentScanningFee}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                        handleScanningChange(val);
                      }}
                      className="w-full pl-32 pr-3 py-2 text-xs sm:text-sm font-semibold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Advocate Fees Input Box (By default Rs. 10,000, Editable) */}
                <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5 text-xs">
                      <Scale className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Advocate Fees / अधिवक्ता शुल्क (Rs.)</span>
                    </label>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200/80 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                      Default: ₹10,000
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-amber-600 dark:text-amber-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="10000"
                      value={currentAdvocateFee === '' ? '' : currentAdvocateFee}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                        handleAdvocateChange(val);
                      }}
                      className="w-full pl-7 pr-3 py-2 text-xs sm:text-sm font-semibold rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <p className="text-[10px] text-amber-800/80 dark:text-amber-400 mt-1 italic">
                    * यह शुल्क संपादन योग्य (editable) है, आप अपनी इच्छानुसार कोई भी राशि दर्ज कर सकते हैं।
                  </p>
                </div>
              </>
            )}

            {/* Total */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800 font-extrabold text-sm text-slate-900 dark:text-white">
              <div>
                <span>Total Payable:</span>
                <span className="block text-[10px] text-slate-500 font-normal">
                  {showAdditionalCharges ? '(Stamp + Reg + Scanning + Advocate)' : '(Stamp Duty + Registration Fee)'}
                </span>
              </div>
              <span className="text-indigo-600 dark:text-indigo-400 text-base font-mono">
                {formatINR(totalPayable)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

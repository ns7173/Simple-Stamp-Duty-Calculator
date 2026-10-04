import React, { useState } from 'react';
import { ValuationResult } from '../types/calculator';
import { formatINR, numberToIndianWords } from '../utils/units';
import {
  Calculator,
  Receipt,
  Printer,
  Copy,
  Check,
  FileSpreadsheet,
} from 'lucide-react';

interface Props {
  title: string;
  result: ValuationResult;
  onOpenPrintModal?: () => void;
}

export const CalculationSummaryCard: React.FC<Props> = ({
  title,
  result,
  onOpenPrintModal,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopySummary = () => {
    const text = `
${title} - Stamp Duty & Registration Fees
Total Government Value: ${formatINR(result.totalGovtValue)}
Consideration Value: ${formatINR(result.considerationValue)}
---------------------------------------------
Stamp Duty (${result.stampDutyRate}% on ${result.stampDutyBaseFormula}): ${formatINR(result.stampDutyAmount)}
Registration Fee (${result.registrationFeeRate}% on ${result.registrationFeeBaseFormula}): ${formatINR(result.registrationFeeAmount)}
---------------------------------------------
TOTAL PAYABLE: ${formatINR(result.grandTotalCharges)}
(${numberToIndianWords(result.grandTotalCharges)})
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden">
      {/* Top Banner: Total to Pay */}
      <div className="bg-slate-900 text-white p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base text-white">{title} Summary</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {onOpenPrintModal && (
              <button
                type="button"
                onClick={onOpenPrintModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800">
          <span className="text-xs text-indigo-300 font-semibold uppercase tracking-wider block">
            Total Amount to Pay
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {formatINR(result.grandTotalCharges)}
          </div>
          <div className="text-xs text-indigo-200/90 italic mt-1">
            {numberToIndianWords(result.grandTotalCharges)}
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Section 1: Valuation Components Overview */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2.5 flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-slate-200">
            <FileSpreadsheet className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Valuation Components Overview</span>
          </div>

          <div className="p-3.5 space-y-2.5 text-xs bg-white dark:bg-slate-900">
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
          </div>
        </div>

        {/* Section 2: Calculation Breakdown & Formula Steps */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2.5 flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-slate-200">
            <Calculator className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Calculation Breakdown & Formula Steps</span>
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

            {/* Total */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800 font-extrabold text-sm text-slate-900 dark:text-white">
              <span>Total Payable:</span>
              <span className="text-indigo-600 dark:text-indigo-400">
                {formatINR(result.grandTotalCharges)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

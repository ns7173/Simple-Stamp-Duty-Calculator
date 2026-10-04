import React from 'react';
import { ValuationResult } from '../types/calculator';
import { formatINR, numberToIndianWords } from '../utils/units';
import { X, Printer, Landmark, CheckCircle, FileText } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  result: ValuationResult | null;
  tabTitle: string;
}

export const PrintChallanModal: React.FC<Props> = ({
  isOpen,
  onClose,
  result,
  tabTitle,
}) => {
  if (!isOpen || !result) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full border border-slate-300 shadow-2xl overflow-hidden my-8 print:m-0 print:border-none print:shadow-none print:max-w-none">
        {/* Modal Top Bar - hidden when printing */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base">Valuation & Fee Estimate Challan</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Page</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Formal Sheet Content */}
        <div className="p-8 space-y-6 text-slate-900" id="printable-challan">
          {/* Official Letterhead Header */}
          <div className="text-center border-b-2 border-slate-800 pb-5">
            <div className="flex items-center justify-center gap-2 text-indigo-900 mb-1">
              <Landmark className="w-6 h-6" />
              <span className="font-bold tracking-widest text-xs uppercase">
                Department of Registration and Stamps
              </span>
            </div>
            <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-950">
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
            <table className="w-full text-xs text-left border border-slate-200">
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

          {/* Duty & Fees Schedule */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
              2. Payable Government Dues & Stamp Schedule
            </h2>
            <table className="w-full text-xs text-left border border-slate-200">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                  <th className="p-2.5">Head of Account / Fee</th>
                  <th className="p-2.5">Calculation Base Chosen</th>
                  <th className="p-2.5">Rate (%)</th>
                  <th className="p-2.5 text-right">Amount (Rs.)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2.5 font-bold">1. Stamp Duty</td>
                  <td className="p-2.5">{result.stampDutyBaseFormula}</td>
                  <td className="p-2.5 font-mono">{result.stampDutyRate}%</td>
                  <td className="p-2.5 text-right font-mono font-bold">
                    {formatINR(result.stampDutyAmount)}
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">2. Registration Fees</td>
                  <td className="p-2.5">{result.registrationFeeBaseFormula}</td>
                  <td className="p-2.5 font-mono">{result.registrationFeeRate}%</td>
                  <td className="p-2.5 text-right font-mono font-bold">
                    {formatINR(result.registrationFeeAmount)}
                  </td>
                </tr>
                <tr className="bg-slate-900 text-white font-bold text-sm">
                  <td className="p-3" colSpan={3}>
                    TOTAL ESTIMATED GOVERNMENT PAYABLE (STAMP + REGISTRATION)
                  </td>
                  <td className="p-3 text-right font-mono font-extrabold text-base">
                    {formatINR(result.grandTotalCharges)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Amount in words */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <span className="font-bold text-slate-700">Amount in Words / शब्दों में राशि: </span>
            <span className="font-semibold italic text-slate-900">
              {numberToIndianWords(result.grandTotalCharges)}
            </span>
          </div>

          {/* Signatures & Declarations */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-xs text-slate-600 border-t border-slate-200">
            <div>
              <p className="font-bold text-slate-800">Assessed By / Advocate / Deed Writer:</p>
              <div className="mt-10 border-t border-slate-400 w-44 pt-1 text-[11px]">
                Authorized Signature & Seal
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-800">Verified by Purchaser / Lessee:</p>
              <div className="mt-10 border-t border-slate-400 w-44 ml-auto pt-1 text-[11px]">
                Signature
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

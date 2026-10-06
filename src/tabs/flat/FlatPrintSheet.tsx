import React from 'react';
import { ValuationResult } from '../../types/calculator';
import { formatINR, numberToIndianWords } from '../../utils/units';

interface Props {
  result: ValuationResult;
  tabTitle: string;
  currentDate: string;
}

export const FlatPrintSheet: React.FC<Props> = ({
  result,
  tabTitle,
  currentDate,
}) => {
  return (
    <div className="space-y-6 text-slate-900">
      {/* Header */}
      <div className="text-center border-b-2 border-slate-800 pb-5">
        <h1 className="text-lg sm:text-xl font-extrabold uppercase tracking-tight text-slate-950">
          Flat / Multi-Storey Unit Valuation Statement (प्रकोष्ठ मूल्यांकन विवरण)
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Prepared for {tabTitle} • Date: {currentDate}
        </p>
      </div>

      {/* Property Valuation Details */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
          1. Flat Valuation Assessment (प्रकोष्ठ/फ्लैट मूल्यांकन)
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
              {result.constructionAreaOriginal > 0 && (
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 font-medium bg-slate-50">
                    बिल्टअप एरिया (Built-up Area):
                  </td>
                  <td className="p-2.5 font-semibold">
                    {result.constructionAreaOriginal} {result.constructionAreaUnit}
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
          2. Payable Government Dues &amp; Stamp Schedule
        </h2>
        <div className="overflow-x-auto -mx-1 sm:mx-0">
          <table className="w-full text-xs text-left border border-slate-200 min-w-[280px]">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                <th className="p-2.5">Head of Account / Fee</th>
                <th className="p-2.5 text-right">Amount (Rs.)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-2.5 font-bold">1. Stamp Duty</td>
                <td className="p-2.5 text-right font-mono font-bold">
                  {formatINR(result.stampDutyAmount)}
                </td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">2. Registration Fees</td>
                <td className="p-2.5 text-right font-mono font-bold">
                  {formatINR(result.registrationFeeAmount)}
                </td>
              </tr>
              {result.scanningFee !== undefined && result.scanningFee > 0 && (
                <tr>
                  <td className="p-2.5 font-bold">
                    3. Scanning Charges (स्कैनिंग शुल्क): लगभग / Approx Rs.
                  </td>
                  <td className="p-2.5 text-right font-mono font-bold">
                    लगभग {formatINR(result.scanningFee)}
                  </td>
                </tr>
              )}
              {result.advocateFee !== undefined && result.advocateFee > 0 && (
                <tr>
                  <td className="p-2.5 font-bold">4. Advocate / Documentation Fees (अधिवक्ता शुल्क)</td>
                  <td className="p-2.5 text-right font-mono font-bold">
                    {formatINR(result.advocateFee)}
                  </td>
                </tr>
              )}
              <tr className="bg-slate-900 text-white font-bold text-sm">
                <td className="p-3">
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
  );
};

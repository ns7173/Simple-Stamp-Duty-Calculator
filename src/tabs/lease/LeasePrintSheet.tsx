import React from 'react';
import { ValuationResult } from '../../types/calculator';
import { numberToIndianWords, numberToHindiWords } from '../../utils/units';

interface Props {
  result: ValuationResult;
  currentState: any;
  currentDate: string;
}

export const LeasePrintSheet: React.FC<Props> = ({
  result,
  currentState,
  currentDate,
}) => {
  return (
    <div className="space-y-4 max-w-xl mx-auto font-sans">
      {/* Header */}
      <div className="text-center pb-1">
        <h1 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
          Lease / Rent Agreement (पट्टा विलेख) -<br />
          <span>Stamp Duty &amp; Registration Fees Summary*</span>
        </h1>
        <p className="text-[11px] text-slate-500 mt-1">Date: {currentDate}</p>
      </div>

      {/* Lease Parameters */}
      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-2 text-xs sm:text-sm">
        <div className="flex justify-between items-center py-0.5">
          <span className="text-slate-700 font-medium">Lease Tenure</span>
          <span className="font-bold text-slate-900">
            {currentState?.tenureYears ? `${currentState.tenureYears} years` : '..... years'}
          </span>
        </div>
        <div className="flex justify-between items-center py-0.5">
          <span className="text-slate-700 font-medium">Increment Rate</span>
          <span className="font-bold text-slate-900">
            {currentState?.hasEscalation &&
            currentState?.escalationPercent !== '' &&
            currentState?.escalationPercent !== undefined
              ? `${currentState.escalationPercent} %`
              : '..... %'}
          </span>
        </div>
        <div className="flex justify-between items-center py-0.5">
          <span className="text-slate-700 font-medium">Increment In</span>
          <span className="font-bold text-slate-900">
            {currentState?.hasEscalation && currentState?.escalationYears
              ? `every ${currentState.escalationYears} year`
              : 'every ........ year'}
          </span>
        </div>
        <div className="flex justify-between items-center py-0.5">
          <span className="text-slate-700 font-medium">Rent</span>
          <span className="font-bold text-slate-900 font-mono">
            Rs.{' '}
            {currentState?.startingRent
              ? (currentState.rentFrequency === 'monthly'
                  ? currentState.startingRent
                  : Math.round(currentState.startingRent / 12)
                ).toLocaleString('en-IN')
              : '......'}{' '}
            Per Month
          </span>
        </div>
      </div>

      {/* Dotted Divider */}
      <div className="text-center text-slate-400 font-mono text-xs select-none tracking-widest overflow-hidden">
        ….......…............….............................................
      </div>

      {/* Duty & Fees Schedule */}
      <div className="space-y-2 text-xs sm:text-sm px-1">
        <div className="flex justify-between items-center py-1">
          <span className="font-bold text-slate-800">Stamp Duty:</span>
          <span className="font-mono font-bold text-slate-950">
            Rs. {result.stampDutyAmount > 0 ? result.stampDutyAmount.toLocaleString('en-IN') : '.............'}
          </span>
        </div>
        <div className="flex justify-between items-center py-1">
          <span className="font-bold text-slate-800">Registration Fees:</span>
          <span className="font-mono font-bold text-slate-950">
            Rs. {result.registrationFeeAmount > 0 ? result.registrationFeeAmount.toLocaleString('en-IN') : '.............'}
          </span>
        </div>
        <div className="flex justify-between items-center py-1">
          <span className="font-bold text-slate-800">Scanning Charges:</span>
          <span className="font-mono font-bold text-slate-950">
            Rs. {result.scanningFee !== undefined && result.scanningFee > 0 ? result.scanningFee.toLocaleString('en-IN') : '.............'} (Approx)
          </span>
        </div>
        <div className="flex justify-between items-center py-1">
          <span className="font-bold text-slate-800">Advocate Fees:</span>
          <span className="font-mono font-bold text-slate-950">
            Rs. {result.advocateFee !== undefined && result.advocateFee > 0 ? result.advocateFee.toLocaleString('en-IN') : '10,000'}
          </span>
        </div>
      </div>

      {/* Dotted Divider */}
      <div className="text-center text-slate-400 font-mono text-xs select-none tracking-widest overflow-hidden">
        .......…............…..................................................
      </div>

      {/* Total Payable Box */}
      <div className="p-4 rounded-xl bg-slate-900 text-white shadow-xs">
        <div className="flex justify-between items-center">
          <span className="font-extrabold text-xs sm:text-sm tracking-wide">
            TOTAL ESTIMATED PAYABLE:*
          </span>
          <span className="font-extrabold font-mono text-base sm:text-lg">
            Rs. {result.grandTotalCharges > 0 ? result.grandTotalCharges.toLocaleString('en-IN') : '.................'}
          </span>
        </div>
        <div className="text-[11px] sm:text-xs text-indigo-200 mt-1 italic text-right">
          ({result.grandTotalCharges > 0 ? numberToIndianWords(result.grandTotalCharges) : '........................ Rupees Only'} / {result.grandTotalCharges > 0 ? numberToHindiWords(result.grandTotalCharges) : '................ रुपये मात्र'})
        </div>
      </div>
    </div>
  );
};

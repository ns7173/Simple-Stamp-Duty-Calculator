import React, { useState, useMemo } from 'react';
import {
  LeaseInputs,
  calculateLease,
  computeLeaseEndDate,
  BLANK_LEASE_INPUTS,
} from './leaseCalculation';
export type { LeaseInputs };
import { formatINR, numberToIndianWords } from '../../utils/units';
import { ValuationResult, ActiveTab } from '../../types/calculator';
import { CalculationSummaryCard } from '../../components/CalculationSummaryCard';
import {
  FileText,
  Calendar,
  RotateCcw,
  Sparkles,
  Calculator,
  Info,
  Layers,
  TrendingUp,
} from 'lucide-react';

interface Props {
  onOpenPrintModal?: (result: ValuationResult, title: string, tab: ActiveTab, state: any) => void;
}

export const LeaseCalculator: React.FC<Props> = ({ onOpenPrintModal }) => {
  // All data is blank until user feeds the data
  const [inputs, setInputs] = useState<LeaseInputs>(BLANK_LEASE_INPUTS);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const updateField = <K extends keyof LeaseInputs>(key: K, value: LeaseInputs[K]) => {
    setInputs((prev) => {
      const next = { ...prev, [key]: value };
      const rawTenure = key === 'tenureYears' ? value : next.tenureYears;
      const tenureNum = typeof rawTenure === 'number' ? rawTenure : 0;
      const startStr = key === 'leaseStartDate' ? (value as string) : next.leaseStartDate;
      if (tenureNum > 0 && startStr) {
        next.leaseEndDate = computeLeaseEndDate(startStr, tenureNum);
      }
      return next;
    });
  };

  const calculatedEndDate = useMemo(() => {
    const tenureNum = typeof inputs.tenureYears === 'number' ? inputs.tenureYears : 0;
    if (tenureNum > 0 && inputs.leaseStartDate) {
      return computeLeaseEndDate(inputs.leaseStartDate, tenureNum);
    }
    return inputs.leaseEndDate || '';
  }, [inputs.leaseStartDate, inputs.tenureYears, inputs.leaseEndDate]);

  const result = useMemo(() => {
    return calculateLease({
      ...inputs,
      leaseEndDate: calculatedEndDate || inputs.leaseEndDate,
    });
  }, [inputs, calculatedEndDate]);

  const leaseValuationResult: ValuationResult = useMemo(() => {
    const scanningFeeNum = typeof inputs.scanningFee === 'number' ? inputs.scanningFee : 0;
    const advocateFeeNum = typeof inputs.advocateFee === 'number' ? inputs.advocateFee : (inputs.advocateFee === '' ? 0 : 10000);
    const grandTotal = result.total_payable + scanningFeeNum + advocateFeeNum;

    return {
      landAreaOriginal: 0,
      landAreaUnit: 'sqft',
      landAreaInRateUnit: 0,
      landGuidelineRate: 0,
      landRateUnit: 'sqmt',
      landGovtValueRaw: 0,
      landDiscountAmount: 0,
      landGovtValueNet: 0,
      hasConstruction: false,
      constructionAreaOriginal: 0,
      constructionAreaUnit: 'sqft',
      constructionGuidelineRate: 0,
      constructionRateUnit: 'sqft',
      constructionGovtValueRaw: 0,
      constructionConcessionAmount: 0,
      constructionGovtValueNet: 0,
      extrasGovtValue: 0,
      totalGovtValue: result.avg_annual_rent,
      considerationValue:
        typeof inputs.startingRent === 'number' && typeof inputs.tenureYears === 'number'
          ? (inputs.rentFrequency === 'monthly'
              ? inputs.startingRent * 12 * inputs.tenureYears
              : inputs.startingRent * inputs.tenureYears)
          : result.avg_annual_rent,
      stampDutyBaseType: 'govt',
      stampDutyApplicableBase: result.avg_annual_rent_with_maint || result.avg_annual_rent,
      stampDutyBaseFormula: result.formula_plain || result.applicable_slab,
      registrationFeeBaseType: 'govt',
      registrationFeeApplicableBase: result.avg_annual_rent_with_maint || result.avg_annual_rent,
      registrationFeeBaseFormula: result.formula_plain || result.applicable_slab,
      stampDutyRate: result.duration_years && result.duration_years <= 5 ? 2 : 5,
      stampDutyAmount: result.stamp_duty,
      registrationFeeRate: result.duration_years && result.duration_years <= 5 ? 0.75 : 1.25,
      registrationFeeAmount: result.registration_fee,
      cessRate: 0,
      cessAmount: 0,
      fixedCharges: 0,
      scanningFee: scanningFeeNum,
      advocateFee: advocateFeeNum,
      grandTotalCharges: grandTotal,
    };
  }, [result, inputs.scanningFee, inputs.advocateFee]);

  const hasEnteredData = typeof inputs.tenureYears === 'number' && inputs.tenureYears > 0 && typeof inputs.startingRent === 'number' && inputs.startingRent > 0;

  const handleCopySummary = () => {
    const text = `
Lease Deed Stamp Duty & Registration Fee
Lease Tenure: ${inputs.tenureYears ? `${inputs.tenureYears} Years` : 'Not specified'}
Start Date: ${inputs.leaseStartDate || 'N/A'} | End Date: ${calculatedEndDate || 'N/A'}
Average Annual Rent: ${formatINR(result.avg_annual_rent)}
Maintenance Charges: ${result.maintenance_per_year > 0 ? `${formatINR(result.maintenance_per_year)}/year` : 'Nil'}
One-time Premium: ${formatINR(result.premium)}
-----------------------------------------------
Stamp Duty: ${formatINR(result.stamp_duty)}
Registration Fee: ${formatINR(result.registration_fee)}
TOTAL PAYABLE: ${formatINR(result.total_payable)}
(${result.total_payable > 0 ? numberToIndianWords(result.total_payable) : 'Rs. Zero'})
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const loadSample = () => {
    const today = new Date().toISOString().split('T')[0];
    const tenure = 5;
    setInputs({
      tenureYears: tenure,
      leaseStartDate: today,
      leaseEndDate: computeLeaseEndDate(today, tenure),
      startingRent: 10000,
      rentFrequency: 'monthly',
      hasEscalation: true,
      escalationYears: 1,
      escalationPercent: 7,
      maintenanceAmount: 1000,
      maintenanceFrequency: 'monthly',
      premium: 50000,
      optionFor1to5Years: 'rent_maint',
      rounding: true,
    });
  };

  const resetAll = () => {
    setInputs(BLANK_LEASE_INPUTS);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-indigo-50/70 dark:bg-indigo-950/30 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/60">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 text-white rounded-lg">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Lease Deed (Rent Agreement & Commercial Leases)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Calculate Stamp Duty & Registration Fees based on Lease Tenure (1 to 99 Years)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadSample}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Load Sample (5 Yrs, 7% Hike)</span>
          </button>
          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Reset Lease Tab"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Lease Dates & Duration */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>1. Lease Dates & Duration</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Lease Tenure */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Lease Tenure (Years)
                </label>
                {/* Full Width Tenure Input Box */}
                <div className="flex rounded-xl overflow-hidden shadow-xs border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500 bg-white dark:bg-slate-800 transition-all">
                  <input
                    type="number"
                    min="1"
                    max="99"
                    step="1"
                    placeholder="e.g. 1 to 99"
                    value={inputs.tenureYears}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : Math.max(1, Math.min(99, parseInt(e.target.value) || 1));
                      updateField('tenureYears', val);
                    }}
                    className="w-full px-3.5 py-2.5 sm:py-3 text-base sm:text-lg bg-transparent text-slate-900 dark:text-white outline-none font-bold placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
                {/* Tenure Unit Below Input Box */}
                <div className="flex items-center justify-between gap-2 mt-1.5 px-0.5">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    अवधि इकाई (Tenure Unit):
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                    वर्ष (Years)
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Insert tenure (1 to 99 years)
                </span>
              </div>

              {/* Lease Start Date */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Lease Start Date
                </label>
                <input
                  type="date"
                  value={inputs.leaseStartDate}
                  onChange={(e) => updateField('leaseStartDate', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-semibold cursor-pointer"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Insert agreement start date
                </span>
              </div>

              {/* Lease End Date (Automatically Calculated) */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Lease End Date (Calculated)
                </label>
                <div className="flex rounded-xl overflow-hidden shadow-xs border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80">
                  <input
                    type="date"
                    readOnly
                    value={calculatedEndDate}
                    placeholder="YYYY-MM-DD"
                    className="w-full px-3 py-2 text-sm bg-transparent text-slate-700 dark:text-slate-200 font-semibold cursor-not-allowed outline-none"
                  />
                </div>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1 block font-medium">
                  {calculatedEndDate ? 'Auto-calculated from Start & Tenure' : 'Awaiting start date & tenure'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Rent & Escalation */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>2. Rent & Escalation</span>
              </h3>
            </div>

            <div className="space-y-4">
              {/* Rent Amount (Monthly as default) */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Rent Amount
                </label>
                {/* Full Width Rent Input Box with Rs. prefix */}
                <div className="flex items-stretch rounded-xl overflow-hidden shadow-xs border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500 bg-white dark:bg-slate-800 transition-all">
                  <div className="bg-slate-100 dark:bg-slate-700/90 text-slate-700 dark:text-slate-200 px-3.5 py-2.5 sm:py-3 text-sm sm:text-base font-bold flex items-center shrink-0 border-r border-slate-200 dark:border-slate-700 select-none">
                    Rs.
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Enter rent amount"
                    value={inputs.startingRent}
                    onChange={(e) =>
                      updateField(
                        'startingRent',
                        e.target.value === '' ? '' : parseFloat(e.target.value) || 0
                      )
                    }
                    className="flex-1 min-w-0 px-3.5 py-2.5 sm:py-3 text-base sm:text-lg bg-transparent text-slate-900 dark:text-white outline-none font-bold placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
                {/* Rent Cycle (Month / Year) Below Input Box */}
                <div className="flex items-center justify-between gap-2 mt-1.5 px-0.5">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    किराया चक्र (Rent Cycle):
                  </span>
                  <select
                    value={inputs.rentFrequency}
                    onChange={(e) => updateField('rentFrequency', e.target.value as 'monthly' | 'annual')}
                    className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold py-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 outline-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-all unit-select-btn"
                  >
                    <option value="monthly">प्रति माह (Per Month)</option>
                    <option value="annual">प्रति वर्ष (Per Year)</option>
                  </select>
                </div>
                {typeof inputs.startingRent === 'number' && inputs.startingRent > 0 && (
                  <div className="text-[11px] text-indigo-700 dark:text-indigo-400 font-medium italic mt-1 px-1">
                    In words / शब्दों में: {numberToIndianWords(inputs.startingRent)} ({inputs.rentFrequency === 'monthly' ? 'per month' : 'per year'})
                  </div>
                )}
              </div>

              {/* Simple Rent Escalation */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Rent Escalation</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={inputs.hasEscalation}
                      onChange={(e) => updateField('hasEscalation', e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span>Apply Escalation</span>
                  </label>
                </div>

                {inputs.hasEscalation ? (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                        Increase Every
                      </label>
                      <div className="flex rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700">
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={inputs.escalationYears}
                          onChange={(e) =>
                            updateField(
                              'escalationYears',
                              e.target.value === '' ? '' : parseInt(e.target.value) || 1
                            )
                          }
                          placeholder="e.g. 1"
                          className="w-full px-3 py-2 text-sm text-slate-900 dark:text-white outline-none font-bold"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-1 mt-1 text-[11px] text-slate-500">
                        <span>अवधि:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">वर्ष (Years)</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                        Hike Percentage (%)
                      </label>
                      <div className="flex rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="any"
                          value={inputs.escalationPercent}
                          onChange={(e) =>
                            updateField(
                              'escalationPercent',
                              e.target.value === '' ? '' : parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="e.g. 7 or 10"
                          className="flex-1 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white outline-none font-semibold"
                        />
                        <span className="bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300 px-2.5 py-1.5 text-xs font-semibold flex items-center">
                          %
                        </span>
                      </div>
                    </div>

                    <div className="col-span-1 sm:col-span-2 text-[11px] text-indigo-700 dark:text-indigo-400 font-medium">
                      Rent will increase by {inputs.escalationPercent || 0}% every {inputs.escalationYears || 1} year(s).
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Fixed rent throughout the entire lease period (no increase).
                  </p>
                )}
              </div>
            </div>

            {/* Average Annual Rent Display */}
            {hasEnteredData && (
              <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/50 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-semibold">
                    Computed Average Annual Rent
                  </span>
                  <span className="text-xs text-indigo-950 dark:text-indigo-300">
                    Averaged over {result.duration_years} year(s)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-indigo-900 dark:text-indigo-200 block">
                    {formatINR(result.avg_annual_rent)}
                  </span>
                  {result.avg_annual_rent > 0 && (
                    <span className="text-[10px] text-indigo-800 dark:text-indigo-300 italic block">
                      In words / शब्दों में: {numberToIndianWords(result.avg_annual_rent)}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Maintenance & Premium (Optional) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                3. Maintenance & Premium (Optional)
              </h3>
              <span className="text-[11px] text-slate-500">Security deposit excluded</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Maintenance Charges (Could be Monthly or Yearly) */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Maintenance Charges (Optional)
                </label>
                {/* Full Width Maintenance Input Box with Rs. prefix */}
                <div className="flex items-stretch rounded-xl overflow-hidden shadow-xs border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500 bg-white dark:bg-slate-800 transition-all">
                  <div className="bg-slate-100 dark:bg-slate-700/90 text-slate-700 dark:text-slate-200 px-3.5 py-2.5 sm:py-3 text-sm sm:text-base font-bold flex items-center shrink-0 border-r border-slate-200 dark:border-slate-700 select-none">
                    Rs.
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="e.g. 1,000 or 12,000"
                    value={inputs.maintenanceAmount}
                    onChange={(e) =>
                      updateField(
                        'maintenanceAmount',
                        e.target.value === '' ? '' : parseFloat(e.target.value) || 0
                      )
                    }
                    className="flex-1 min-w-0 px-3.5 py-2.5 sm:py-3 text-base sm:text-lg bg-transparent text-slate-900 dark:text-white outline-none font-bold placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
                {/* Maintenance Cycle (Month / Year) Below Input Box */}
                <div className="flex items-center justify-between gap-2 mt-1.5 px-0.5">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    रखरखाव चक्र (Cycle):
                  </span>
                  <select
                    value={inputs.maintenanceFrequency}
                    onChange={(e) => updateField('maintenanceFrequency', e.target.value as 'monthly' | 'annual')}
                    className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold py-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 outline-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-all unit-select-btn"
                  >
                    <option value="monthly">प्रति माह (Per Month)</option>
                    <option value="annual">प्रति वर्ष (Per Year)</option>
                  </select>
                </div>
                {typeof inputs.maintenanceAmount === 'number' && inputs.maintenanceAmount > 0 && (
                  <div className="text-[11px] text-indigo-700 dark:text-indigo-400 font-medium italic mt-1 px-1">
                    In words / शब्दों में: {numberToIndianWords(inputs.maintenanceAmount)} ({inputs.maintenanceFrequency === 'monthly' ? `per month = Rs. ${(inputs.maintenanceAmount * 12).toLocaleString('en-IN')}/year` : 'per year'})
                  </div>
                )}
              </div>

              {/* One-time Premium */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  One-Time Premium / Advance (Optional)
                </label>
                <div className="flex items-stretch rounded-xl overflow-hidden shadow-xs border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500 bg-white dark:bg-slate-800 transition-all">
                  <div className="bg-slate-100 dark:bg-slate-700/90 text-slate-700 dark:text-slate-200 px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-bold flex items-center shrink-0 border-r border-slate-200 dark:border-slate-700 select-none">
                    Rs.
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="e.g. 50,000"
                    value={inputs.premium}
                    onChange={(e) =>
                      updateField(
                        'premium',
                        e.target.value === '' ? '' : parseFloat(e.target.value) || 0
                      )
                    }
                    className="flex-1 min-w-0 px-3 sm:px-3.5 py-2 sm:py-2.5 text-sm sm:text-base bg-transparent text-slate-900 dark:text-white outline-none font-semibold placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
                {typeof inputs.premium === 'number' && inputs.premium > 0 && (
                  <div className="text-[11px] text-indigo-700 dark:text-indigo-400 font-medium italic mt-1 px-1">
                    In words / शब्दों में: {numberToIndianWords(inputs.premium)}
                  </div>
                )}
              </div>
            </div>

            {/* Note about refundable security deposit */}
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2">
              <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <span>
                <strong>Note:</strong> Refundable security deposits are legally exempted from stamp duty calculation as per rules.
              </span>
            </div>

            {/* Option A vs Option B for 1 to 5 years (when premium entered) */}
            {result.duration_years <= 5 && typeof inputs.premium === 'number' && inputs.premium > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                  1 to 5 Years Calculation Choice
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => updateField('optionFor1to5Years', 'rent_maint')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      inputs.optionFor1to5Years === 'rent_maint'
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span className="font-bold block">Option A (Standard)</span>
                    <span className="text-[11px] text-slate-500">
                      2% of Average Rent + Maintenance
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateField('optionFor1to5Years', 'premium')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      inputs.optionFor1to5Years === 'premium'
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span className="font-bold block">Option B (Premium Base)</span>
                    <span className="text-[11px] text-slate-500">
                      5% of One-Time Premium ({formatINR(inputs.premium)})
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Unified Output Dues & Summary */}
        <div className="lg:col-span-5 space-y-4">
          <CalculationSummaryCard
            title="Lease / Rent Agreement (पट्टा विलेख)"
            tab="lease"
            result={leaseValuationResult}
            currentState={inputs}
            onOpenPrintModal={(res, titleName, tabName, stateObj) => onOpenPrintModal?.(res, titleName, tabName, stateObj)}
            scanningFee={inputs.scanningFee}
            onChangeScanningFee={(val) => updateField('scanningFee', val)}
            advocateFee={inputs.advocateFee}
            onChangeAdvocateFee={(val) => updateField('advocateFee', val)}
            overviewTitle="पट्टा / किरायानामा सारांश (Lease Overview)"
            overviewItems={[
              {
                label: 'Lease Tenure / पट्टा अवधि:',
                value: inputs.tenureYears ? `${inputs.tenureYears} Years` : '—',
              },
              {
                label: 'Agreement Period / अनुबंध अवधि:',
                value:
                  inputs.leaseStartDate && calculatedEndDate
                    ? `${inputs.leaseStartDate} to ${calculatedEndDate}`
                    : '—',
              },
              {
                label: 'Starting Rent / शुरुआती किराया:',
                value:
                  typeof inputs.startingRent === 'number' && inputs.startingRent > 0
                    ? `${formatINR(inputs.startingRent)} / ${inputs.rentFrequency === 'monthly' ? 'माह' : 'वर्ष'}`
                    : '—',
              },
              {
                label: 'Average Annual Rent (औसत वार्षिक किराया):',
                value: formatINR(result.avg_annual_rent),
                isBold: true,
                isHighlight: true,
              },
              ...(result.maintenance_per_year > 0
                ? [
                    {
                      label: 'Maintenance Charges / रख-रखाव शुल्क:',
                      value: `${formatINR(result.maintenance_per_year)}/वर्ष`,
                    },
                  ]
                : []),
              ...(result.premium > 0
                ? [
                    {
                      label: 'One-Time Premium / अग्रिम राशि:',
                      value: formatINR(result.premium),
                    },
                  ]
                : []),
            ]}
          />
        </div>
      </div>
    </div>
  );
};

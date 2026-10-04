import React, { useState, useMemo } from 'react';
import {
  LeaseInputs,
  calculateLease,
  computeLeaseEndDate,
} from '../utils/leaseCalculator';
export type { LeaseInputs };
import { formatINR, numberToIndianWords } from '../utils/units';
import {
  FileText,
  Calendar,
  RotateCcw,
  Sparkles,
  Copy,
  Check,
  Receipt,
  Calculator,
  Info,
  Layers,
  TrendingUp,
} from 'lucide-react';

const BLANK_LEASE_INPUTS: LeaseInputs = {
  tenureYears: '',
  leaseStartDate: '',
  leaseEndDate: '',
  startingRent: '',
  rentFrequency: 'monthly', // Set Monthly as default
  hasEscalation: false,
  escalationYears: 1,
  escalationPercent: '',
  maintenanceAmount: '',
  maintenanceFrequency: 'monthly', // Can be monthly or annual
  premium: '',
  optionFor1to5Years: 'rent_maint',
  rounding: true,
};

export const LeaseCalculator: React.FC = () => {
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
              Tab 4: Lease Deed (Rent Agreement & Commercial Leases)
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
                <div className="flex rounded-xl overflow-hidden shadow-xs border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500">
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
                    className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-semibold"
                  />
                  <div className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2 text-xs font-semibold flex items-center">
                    Years
                  </div>
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
                <div className="flex rounded-xl overflow-hidden shadow-xs border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500">
                  <div className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-2 text-sm font-semibold flex items-center">
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
                    className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-semibold"
                  />
                  {/* Monthly selected by default */}
                  <select
                    value={inputs.rentFrequency}
                    onChange={(e) => updateField('rentFrequency', e.target.value as 'monthly' | 'annual')}
                    className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs px-3 py-2 border-l border-slate-300 dark:border-slate-600 outline-none cursor-pointer font-semibold"
                  >
                    <option value="monthly">per Month</option>
                    <option value="annual">per Year</option>
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
                          className="flex-1 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white outline-none font-semibold"
                        />
                        <span className="bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300 px-2.5 py-1.5 text-xs font-medium flex items-center">
                          Year(s)
                        </span>
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
                <div className="flex rounded-xl overflow-hidden shadow-xs border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500">
                  <div className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-2 text-sm font-semibold flex items-center">
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
                    className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-semibold"
                  />
                  {/* Select Monthly or Yearly */}
                  <select
                    value={inputs.maintenanceFrequency}
                    onChange={(e) => updateField('maintenanceFrequency', e.target.value as 'monthly' | 'annual')}
                    className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs px-2.5 py-2 border-l border-slate-300 dark:border-slate-600 outline-none cursor-pointer font-semibold"
                  >
                    <option value="monthly">per Month</option>
                    <option value="annual">per Year</option>
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
                <div className="flex rounded-xl overflow-hidden shadow-xs border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500">
                  <div className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-2 text-sm font-semibold flex items-center">
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
                    className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-semibold"
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

        {/* Right Column: Simple Clean Output Summary */}
        <div className="lg:col-span-5 space-y-4">
          {/* Top Banner Card: Total Payable */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base text-white">Total Payable Dues</h3>
              </div>

              {hasEnteredData && (
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  {copiedSummary ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Summary</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800">
              <span className="text-xs text-indigo-300 font-semibold uppercase tracking-wider block">
                Total Amount to Pay
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {formatINR(result.total_payable)}
              </div>
              <div className="text-xs text-indigo-200/90 italic mt-1">
                {result.total_payable > 0
                  ? numberToIndianWords(result.total_payable)
                  : 'Enter Lease Tenure and Rent Amount to calculate'}
              </div>
            </div>

            {/* Sub-breakdown: Stamp Duty & Registration Fee */}
            <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-800/80">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-xs text-slate-400 block font-semibold">
                  Stamp Duty
                </span>
                <span className="text-lg font-bold text-white block mt-1">
                  {formatINR(result.stamp_duty)}
                </span>
                {result.stamp_duty > 0 && (
                  <span className="text-[10px] text-slate-400 italic block mt-0.5">
                    {numberToIndianWords(result.stamp_duty)}
                  </span>
                )}
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-xs text-slate-400 block font-semibold">
                  Registration Fee
                </span>
                <span className="text-lg font-bold text-white block mt-1">
                  {formatINR(result.registration_fee)}
                </span>
                {result.registration_fee > 0 && (
                  <span className="text-[10px] text-slate-400 italic block mt-0.5">
                    {numberToIndianWords(result.registration_fee)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Simple Overview Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Calculator className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Lease Summary Overview</span>
            </div>

            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
              <span>Lease Tenure:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {inputs.tenureYears ? `${inputs.tenureYears} Years` : '—'}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
              <span>Agreement Period:</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {inputs.leaseStartDate && calculatedEndDate
                  ? `${inputs.leaseStartDate} to ${calculatedEndDate}`
                  : '—'}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
              <span>Average Annual Rent:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatINR(result.avg_annual_rent)}
              </span>
            </div>

            {result.maintenance_per_year > 0 && (
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                <span>Maintenance Charges:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatINR(result.maintenance_per_year)}/yr
                  {inputs.maintenanceFrequency === 'monthly' && typeof inputs.maintenanceAmount === 'number' && (
                    <span className="text-[11px] text-slate-500 font-normal ml-1">
                      ({formatINR(inputs.maintenanceAmount)}/mo)
                    </span>
                  )}
                </span>
              </div>
            )}

            {result.premium > 0 && (
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                <span>One-Time Premium:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatINR(result.premium)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800 font-extrabold text-sm text-slate-900 dark:text-white">
              <span>Total Payable:</span>
              <span className="text-indigo-600 dark:text-indigo-400">
                {formatINR(result.total_payable)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

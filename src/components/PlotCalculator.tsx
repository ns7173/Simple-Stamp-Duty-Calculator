import React, { useMemo } from 'react';
import { PlotState, ValuationResult, AreaUnit, RateUnit } from '../types/calculator';
import {
  AREA_UNITS_CONFIG,
  RATE_UNITS_CONFIG,
  convertArea,
  formatINR,
  formatINRShort,
  numberToIndianWords,
} from '../utils/units';
import { ValuationBaseSelector } from './ValuationBaseSelector';
import { RateInputBox } from './RateInputBox';
import { CalculationSummaryCard } from './CalculationSummaryCard';
import { MapPin, RotateCcw, Sparkles, AlertCircle, ArrowRightLeft } from 'lucide-react';

interface Props {
  state: PlotState;
  onChange: (newState: PlotState) => void;
  onReset: () => void;
  onOpenPrintModal: (result: ValuationResult, title: string) => void;
}

export const PlotCalculator: React.FC<Props> = ({
  state,
  onChange,
  onReset,
  onOpenPrintModal,
}) => {
  // Update helpers
  const updateField = <K extends keyof PlotState>(key: K, value: PlotState[K]) => {
    onChange({ ...state, [key]: value });
  };

  // Convert Land Area to Guideline Rate unit for accurate calculation
  const areaNumber = typeof state.landArea === 'number' ? state.landArea : 0;
  const rateNumber = typeof state.guidelineRate === 'number' ? state.guidelineRate : 0;

  const areaInRateUnit = useMemo(() => {
    return convertArea(areaNumber, state.landAreaUnit, state.guidelineRateUnit);
  }, [areaNumber, state.landAreaUnit, state.guidelineRateUnit]);

  // Land Government Value = Area × Rate
  const landGovtValue = useMemo(() => {
    return areaInRateUnit * rateNumber;
  }, [areaInRateUnit, rateNumber]);

  // Consideration calculation
  const considerationNumber = useMemo(() => {
    if (state.considerationMode === 'direct') {
      return typeof state.considerationValue === 'number' ? state.considerationValue : 0;
    } else {
      const cRate = typeof state.considerationRate === 'number' ? state.considerationRate : 0;
      const cArea = convertArea(areaNumber, state.landAreaUnit, state.considerationRateUnit);
      return cArea * cRate;
    }
  }, [state.considerationMode, state.considerationValue, state.considerationRate, state.considerationRateUnit, areaNumber, state.landAreaUnit]);

  // Overall result
  const result: ValuationResult = useMemo(() => {
    const higherVal = Math.max(landGovtValue, considerationNumber);

    // Stamp duty base
    let stampDutyApplicableBase = higherVal;
    let stampDutyBaseFormula = 'Higher of Both';
    if (state.stampDutyBase === 'govt') {
      stampDutyApplicableBase = landGovtValue;
      stampDutyBaseFormula = `Government Value (${formatINR(landGovtValue)})`;
    } else if (state.stampDutyBase === 'consideration') {
      stampDutyApplicableBase = considerationNumber;
      stampDutyBaseFormula = `Consideration (${formatINR(considerationNumber)})`;
    }

    // Reg fee base
    let registrationFeeApplicableBase = higherVal;
    let registrationFeeBaseFormula = 'Higher of Both';
    if (state.registrationFeeBase === 'govt') {
      registrationFeeApplicableBase = landGovtValue;
      registrationFeeBaseFormula = `Government Value (${formatINR(landGovtValue)})`;
    } else if (state.registrationFeeBase === 'consideration') {
      registrationFeeApplicableBase = considerationNumber;
      registrationFeeBaseFormula = `Consideration (${formatINR(considerationNumber)})`;
    }

    const stampDutyRateNum = typeof state.stampDutyRate === 'number' ? state.stampDutyRate : 0;
    const registrationFeeRateNum = typeof state.registrationFeeRate === 'number' ? state.registrationFeeRate : 0;

    const stampDutyAmount = (stampDutyApplicableBase * stampDutyRateNum) / 100;
    const registrationFeeAmount = (registrationFeeApplicableBase * registrationFeeRateNum) / 100;
    const grandTotal = stampDutyAmount + registrationFeeAmount;

    return {
      landAreaOriginal: areaNumber,
      landAreaUnit: state.landAreaUnit,
      landAreaInRateUnit: areaInRateUnit,
      landGuidelineRate: rateNumber,
      landRateUnit: state.guidelineRateUnit,
      landGovtValueRaw: landGovtValue,
      landDiscountAmount: 0,
      landGovtValueNet: landGovtValue,
      hasConstruction: false,
      constructionAreaOriginal: 0,
      constructionAreaUnit: 'sqft',
      constructionGuidelineRate: 0,
      constructionRateUnit: 'sqft',
      constructionGovtValueRaw: 0,
      constructionConcessionAmount: 0,
      constructionGovtValueNet: 0,
      extrasGovtValue: 0,
      totalGovtValue: landGovtValue,
      considerationValue: considerationNumber,
      stampDutyBaseType: state.stampDutyBase,
      stampDutyApplicableBase,
      stampDutyBaseFormula,
      registrationFeeBaseType: state.registrationFeeBase,
      registrationFeeApplicableBase,
      registrationFeeBaseFormula,
      stampDutyRate: stampDutyRateNum,
      stampDutyAmount,
      registrationFeeRate: registrationFeeRateNum,
      registrationFeeAmount,
      cessRate: 0,
      cessAmount: 0,
      fixedCharges: 0,
      grandTotalCharges: grandTotal,
    };
  }, [
    landGovtValue,
    considerationNumber,
    state.stampDutyBase,
    state.stampDutyRate,
    state.registrationFeeBase,
    state.registrationFeeRate,
    state.additionalCessPercent,
    state.fixedCharges,
    areaNumber,
    state.landAreaUnit,
    areaInRateUnit,
    rateNumber,
    state.guidelineRateUnit,
  ]);

  const loadPlotSample = () => {
    onChange({
      ...state,
      landArea: 1500,
      landAreaUnit: 'sqft',
      guidelineRate: 18000,
      guidelineRateUnit: 'sqmt',
      considerationValue: 3000000,
      considerationMode: 'direct',
      stampDutyRate: 6,
      registrationFeeRate: 1,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-indigo-50/70 dark:bg-indigo-950/30 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/60">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 text-white rounded-lg">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Tab 1: Open Plot Valuation & Duty
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Government Land Valuation = Land Area × Circle Rate
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadPlotSample}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Load Sample Data</span>
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Reset this tab"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Tab</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Inputs Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Land Area & Govt Guideline Rate */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                1. Land Area & Circle Rate
              </h3>
            </div>

            {/* Land Area Input with Multi-unit selector */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Land Area
                </label>
                <span className="text-[11px] text-slate-500">
                  Select: sq.ft, sq.mt, Hectare, Acre, or Dismil
                </span>
              </div>
              <div className="flex rounded-xl overflow-hidden shadow-xs border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500">
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Enter land area (e.g. 1500)"
                  value={state.landArea}
                  onChange={(e) =>
                    updateField(
                      'landArea',
                      e.target.value === '' ? '' : parseFloat(e.target.value) || 0
                    )
                  }
                  className="flex-1 px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
                <select
                  value={state.landAreaUnit}
                  onChange={(e) => updateField('landAreaUnit', e.target.value as AreaUnit)}
                  className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium px-3 py-2.5 border-l border-slate-300 dark:border-slate-600 outline-none cursor-pointer"
                >
                  {AREA_UNITS_CONFIG.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Govt Guideline Rate Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Government Guideline Rate (Circle Rate)
                </label>
                <span className="text-[11px] text-slate-500">
                  Sub-Registrar Jantri / Circle Rate
                </span>
              </div>
              <div className="flex rounded-xl overflow-hidden shadow-xs border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500">
                <div className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-2.5 text-sm font-semibold flex items-center">
                  Rs.
                </div>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 18000"
                  value={state.guidelineRate}
                  onChange={(e) =>
                    updateField(
                      'guidelineRate',
                      e.target.value === '' ? '' : parseFloat(e.target.value) || 0
                    )
                  }
                  className="flex-1 px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
                <select
                  value={state.guidelineRateUnit}
                  onChange={(e) => updateField('guidelineRateUnit', e.target.value as RateUnit)}
                  className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium px-3 py-2.5 border-l border-slate-300 dark:border-slate-600 outline-none cursor-pointer"
                >
                  {RATE_UNITS_CONFIG.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              {typeof state.guidelineRate === 'number' && state.guidelineRate > 0 && (
                <div className="text-[11px] text-indigo-700 dark:text-indigo-400 font-medium italic mt-1 px-1">
                  In words / शब्दों में: {numberToIndianWords(state.guidelineRate)}
                </div>
              )}
            </div>

            {/* Unit Matching & Calculated Land Value Box */}
            <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Area Converted to Rate Unit:</span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  {areaNumber} {state.landAreaUnit} ={' '}
                  <strong className="text-blue-900 dark:text-blue-200">
                    {Number(areaInRateUnit.toFixed(4))} {state.guidelineRateUnit}
                  </strong>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">
                  Government Land Value
                </span>
                <span className="text-lg font-extrabold text-blue-900 dark:text-blue-200">
                  {formatINR(landGovtValue)}
                </span>
                {landGovtValue > 0 && (
                  <div className="text-[10px] text-blue-800 dark:text-blue-300 italic">
                    In words / शब्दों में: {numberToIndianWords(landGovtValue)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Consideration Value */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                2. Consideration Value (Sale Deed Price)
              </h3>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => updateField('considerationMode', 'direct')}
                  className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                    state.considerationMode === 'direct'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Direct (Rs.)
                </button>
                <button
                  type="button"
                  onClick={() => updateField('considerationMode', 'calculated')}
                  className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                    state.considerationMode === 'calculated'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Per Rate
                </button>
              </div>
            </div>

            {state.considerationMode === 'direct' ? (
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                  Total Consideration Value (Rs.)
                </label>
                <div className="flex rounded-xl overflow-hidden shadow-xs border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500">
                  <div className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3.5 py-2.5 text-sm font-semibold flex items-center">
                    Rs.
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Enter total sale deed amount (e.g. 25,00,000)"
                    value={state.considerationValue}
                    onChange={(e) =>
                      updateField(
                        'considerationValue',
                        e.target.value === '' ? '' : parseFloat(e.target.value) || 0
                      )
                    }
                    className="flex-1 px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-semibold"
                  />
                  {considerationNumber > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-800/80 px-3 py-2.5 text-xs text-slate-500 border-l border-slate-200 dark:border-slate-700 flex items-center">
                      {formatINRShort(considerationNumber)}
                    </div>
                  )}
                </div>
                {typeof state.considerationValue === 'number' && state.considerationValue > 0 && (
                  <div className="text-[11px] text-indigo-700 dark:text-indigo-400 font-medium italic mt-1 px-1">
                    In words / शब्दों में: {numberToIndianWords(state.considerationValue)}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Agreed Transaction Rate for Consideration
                </label>
                <div className="flex rounded-xl overflow-hidden shadow-xs border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500">
                  <div className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3.5 py-2.5 text-sm font-semibold flex items-center">
                    Rs.
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Agreed rate per unit"
                    value={state.considerationRate}
                    onChange={(e) =>
                      updateField(
                        'considerationRate',
                        e.target.value === '' ? '' : parseFloat(e.target.value) || 0
                      )
                    }
                    className="flex-1 px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                  <select
                    value={state.considerationRateUnit}
                    onChange={(e) =>
                      updateField('considerationRateUnit', e.target.value as 'sqft' | 'sqmt')
                    }
                    className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium px-3 py-2.5 border-l border-slate-300 dark:border-slate-600 outline-none cursor-pointer"
                  >
                    <option value="sqft">Rs. per sq.ft</option>
                    <option value="sqmt">Rs. per sq.mt</option>
                  </select>
                </div>
                {typeof state.considerationRate === 'number' && state.considerationRate > 0 && (
                  <div className="text-[11px] text-indigo-700 dark:text-indigo-400 font-medium italic mt-1 px-1">
                    In words / शब्दों में: {numberToIndianWords(state.considerationRate)}
                  </div>
                )}

                <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg flex items-center justify-between">
                  <div>
                    <span>Calculated Consideration Value:</span>
                    {considerationNumber > 0 && (
                      <span className="block text-[11px] text-indigo-700 dark:text-indigo-400 italic">
                        In words / शब्दों में: {numberToIndianWords(considerationNumber)}
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {formatINR(considerationNumber)}
                  </span>
                </div>
              </div>
            )}

            {/* Comparison pill */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs border border-slate-200 dark:border-slate-700/60">
              <span className="text-slate-600 dark:text-slate-400">
                Government Value vs Consideration:
              </span>
              <div className="text-right">
                {landGovtValue > considerationNumber ? (
                  <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Government Value is Higher (+{formatINR(landGovtValue - considerationNumber)})
                  </span>
                ) : considerationNumber > landGovtValue ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    Consideration is Higher (+{formatINR(considerationNumber - landGovtValue)})
                  </span>
                ) : (
                  <span className="text-slate-500 font-medium">Both are equal</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Stamp Duty & Registration Fees */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                3. Stamp Duty & Registration Fees
              </h3>
            </div>

            {/* Stamp Duty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <RateInputBox
                label="Stamp Duty Rate (%)"
                value={state.stampDutyRate}
                onChange={(val) => updateField('stampDutyRate', val)}
              />

              <ValuationBaseSelector
                label="Stamp Duty Base"
                selectedBase={state.stampDutyBase}
                onChange={(b) => updateField('stampDutyBase', b)}
                govtValue={landGovtValue}
                considerationValue={considerationNumber}
                ratePercent={typeof state.stampDutyRate === 'number' ? state.stampDutyRate : 0}
              />
            </div>

            {/* Registration Fee */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <RateInputBox
                label="Registration Fee Rate (%)"
                value={state.registrationFeeRate}
                onChange={(val) => updateField('registrationFeeRate', val)}
              />

              <ValuationBaseSelector
                label="Registration Fee Base"
                selectedBase={state.registrationFeeBase}
                onChange={(b) => updateField('registrationFeeBase', b)}
                govtValue={landGovtValue}
                considerationValue={considerationNumber}
                ratePercent={typeof state.registrationFeeRate === 'number' ? state.registrationFeeRate : 0}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Output Statement Card */}
        <div className="lg:col-span-5 space-y-4">
          <CalculationSummaryCard
            title="Open Plot"
            result={result}
            onOpenPrintModal={() => onOpenPrintModal(result, 'Open Plot')}
          />
        </div>
      </div>
    </div>
  );
};

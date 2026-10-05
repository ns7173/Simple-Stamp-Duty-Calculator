import React, { useState, useMemo } from 'react';
import {
  convertArea,
  formatINR,
  numberToIndianWords,
} from '../utils/units';
import { CalculationBase, ValuationResult, ActiveTab } from '../types/calculator';
import { CalculationSummaryCard } from './CalculationSummaryCard';
import {
  Building2,
  Calculator,
  RotateCcw,
  Sparkles,
  Percent,
  ChevronDown,
  AlertCircle,
  Layers,
  Info,
  Receipt,
} from 'lucide-react';

export type FloorType = 'ground' | 'basement_first' | 'second_plus' | 'custom';
export type DiscountApplyOn = 'construction_only' | 'guideline_only' | 'both';

export interface FlatFormState {
  floorType: FloorType;
  customDiscountPercent: number | '';
  discountApplyOn: DiscountApplyOn;
  guidelineRate: number | '';
  guidelineRateUnit: 'sqft' | 'sqmt';
  constructionRate: number | '';
  constructionRateUnit: 'sqft' | 'sqmt';
  builtUpArea: number | '';
  builtUpAreaUnit: 'sqft' | 'sqmt';
  considerationValue: number | '';
  stampDutyBase: CalculationBase;
  stampDutyRate: number | '';
  registrationFeeBase: CalculationBase;
  registrationFeeRate: number | '';
  scanningFee?: number | '';
  advocateFee?: number | '';
}

const BLANK_FLAT_STATE: FlatFormState = {
  floorType: 'ground',
  customDiscountPercent: '',
  discountApplyOn: 'construction_only', // शासन के वर्तमान नियमानुसार केवल उपबंध निर्माण दर में छूट
  guidelineRate: '',
  guidelineRateUnit: 'sqft',
  constructionRate: '',
  constructionRateUnit: 'sqft',
  builtUpArea: '',
  builtUpAreaUnit: 'sqft',
  considerationValue: '',
  stampDutyBase: 'higher',
  stampDutyRate: '',
  registrationFeeBase: 'higher',
  registrationFeeRate: '',
  scanningFee: '',
  advocateFee: 10000,
};

interface Props {
  state?: FlatFormState;
  onChange?: (newState: FlatFormState) => void;
  onOpenPrintModal?: (result: ValuationResult, title: string, tab?: ActiveTab, state?: any) => void;
}

export const FlatCalculator: React.FC<Props> = ({
  state: externalState,
  onChange: externalOnChange,
  onOpenPrintModal,
}) => {
  const [internalState, setInternalState] = useState<FlatFormState>(BLANK_FLAT_STATE);
  const state = externalState || internalState;
  const [copiedSummary, setCopiedSummary] = useState(false);

  const updateField = <K extends keyof FlatFormState>(key: K, value: FlatFormState[K]) => {
    if (externalOnChange) {
      externalOnChange({ ...state, [key]: value });
    } else {
      setInternalState((prev) => ({ ...prev, [key]: value }));
    }
  };

  // Determine floor discount percentage based on rules:
  // (क) भूतल: 0% छूट (100% दर)
  // (ख) तलघर एवं प्रथम मंजिल: 10% छूट
  // (ग) द्वितीय एवं अन्य मंजिल: 20% छूट
  const discountPercent = useMemo(() => {
    if (state.floorType === 'ground') return 0;
    if (state.floorType === 'basement_first') return 10;
    if (state.floorType === 'second_plus') return 20;
    if (state.floorType === 'custom') {
      return typeof state.customDiscountPercent === 'number' ? state.customDiscountPercent : 0;
    }
    return 0;
  }, [state.floorType, state.customDiscountPercent]);

  // Numerical inputs
  const rawGuidelineRate = typeof state.guidelineRate === 'number' ? state.guidelineRate : 0;
  const rawConstructionRate = typeof state.constructionRate === 'number' ? state.constructionRate : 0;
  const rawBuiltUpArea = typeof state.builtUpArea === 'number' ? state.builtUpArea : 0;
  const considerationNumber = typeof state.considerationValue === 'number' ? state.considerationValue : 0;
  const stampDutyRateNum = typeof state.stampDutyRate === 'number' ? state.stampDutyRate : 0;
  const regFeeRateNum = typeof state.registrationFeeRate === 'number' ? state.registrationFeeRate : 0;

  // Effective Rates after Floor Discount
  const isGuidelineDiscounted = state.discountApplyOn === 'guideline_only' || state.discountApplyOn === 'both';
  const isConstructionDiscounted = state.discountApplyOn === 'construction_only' || state.discountApplyOn === 'both';

  const effectiveGuidelineRate = useMemo(() => {
    if (isGuidelineDiscounted && discountPercent > 0) {
      return rawGuidelineRate * (1 - discountPercent / 100);
    }
    return rawGuidelineRate;
  }, [rawGuidelineRate, isGuidelineDiscounted, discountPercent]);

  const effectiveConstructionRate = useMemo(() => {
    if (isConstructionDiscounted && discountPercent > 0) {
      return rawConstructionRate * (1 - discountPercent / 100);
    }
    return rawConstructionRate;
  }, [rawConstructionRate, isConstructionDiscounted, discountPercent]);

  // Component Values:
  // सूत्र: (कलेक्टर गाइडलाइन दर × बिल्टअप एरिया) + (उपबंध निर्माण दर × बिल्टअप एरिया) = बाजार मूल्य
  const guidelineAreaInRateUnit = useMemo(() => {
    return convertArea(rawBuiltUpArea, state.builtUpAreaUnit, state.guidelineRateUnit);
  }, [rawBuiltUpArea, state.builtUpAreaUnit, state.guidelineRateUnit]);

  const constructionAreaInRateUnit = useMemo(() => {
    return convertArea(rawBuiltUpArea, state.builtUpAreaUnit, state.constructionRateUnit);
  }, [rawBuiltUpArea, state.builtUpAreaUnit, state.constructionRateUnit]);

  const guidelineComponentValue = useMemo(() => {
    return guidelineAreaInRateUnit * effectiveGuidelineRate;
  }, [guidelineAreaInRateUnit, effectiveGuidelineRate]);

  const constructionComponentValue = useMemo(() => {
    return constructionAreaInRateUnit * effectiveConstructionRate;
  }, [constructionAreaInRateUnit, effectiveConstructionRate]);

  // Total Government Guideline / Market Value
  const totalMarketGovtValue = useMemo(() => {
    return guidelineComponentValue + constructionComponentValue;
  }, [guidelineComponentValue, constructionComponentValue]);

  // Comparison Values
  const higherValue = useMemo(() => {
    return Math.max(totalMarketGovtValue, considerationNumber);
  }, [totalMarketGovtValue, considerationNumber]);

  // Dynamic Comparison Indicator text
  const higherIndicator = useMemo(() => {
    if (totalMarketGovtValue > considerationNumber) {
      return ' (Govt Value is Higher)';
    } else if (considerationNumber > totalMarketGovtValue) {
      return ' (Consideration is Higher)';
    } else {
      return ' (Both are equal)';
    }
  }, [totalMarketGovtValue, considerationNumber]);

  // Calculation Bases per dropdown selectors
  const stampDutyApplicableBase = useMemo(() => {
    if (state.stampDutyBase === 'govt') return totalMarketGovtValue;
    if (state.stampDutyBase === 'consideration') return considerationNumber;
    return higherValue;
  }, [state.stampDutyBase, totalMarketGovtValue, considerationNumber, higherValue]);

  const registrationFeeApplicableBase = useMemo(() => {
    if (state.registrationFeeBase === 'govt') return totalMarketGovtValue;
    if (state.registrationFeeBase === 'consideration') return considerationNumber;
    return higherValue;
  }, [state.registrationFeeBase, totalMarketGovtValue, considerationNumber, higherValue]);

  // Stamp Duty & Registration Fees
  const stampDutyAmount = useMemo(() => {
    return Math.round((stampDutyApplicableBase * stampDutyRateNum) / 100);
  }, [stampDutyApplicableBase, stampDutyRateNum]);

  const registrationFeeAmount = useMemo(() => {
    return Math.round((registrationFeeApplicableBase * regFeeRateNum) / 100);
  }, [registrationFeeApplicableBase, regFeeRateNum]);

  const totalPayable = useMemo(() => {
    return stampDutyAmount + registrationFeeAmount;
  }, [stampDutyAmount, registrationFeeAmount]);

  const hasEnteredData = rawBuiltUpArea > 0 && (rawGuidelineRate > 0 || rawConstructionRate > 0 || considerationNumber > 0);

  const handleCopySummary = () => {
    const floorLabel =
      state.floorType === 'ground'
        ? 'भूतल (Ground Floor - 0% छूट)'
        : state.floorType === 'basement_first'
        ? 'तलघर / प्रथम मंजिल (Basement/1st Floor - 10% छूट)'
        : state.floorType === 'second_plus'
        ? 'द्वितीय एवं अन्य मंजिल (2nd & Upper Floors - 20% छूट)'
        : `कस्टम (${discountPercent}% छूट)`;

    const text = `
बहुमंजिला भवन / प्रकोष्ठ (Flat) मूल्यांकन सारांश
तलवार स्थिति: ${floorLabel}
बिल्टअप एरिया: ${rawBuiltUpArea} ${state.builtUpAreaUnit}
कलेक्टर गाइडलाइन दर: ${formatINR(effectiveGuidelineRate)}/${state.guidelineRateUnit} (मूल्य: ${formatINR(guidelineComponentValue)})
उपबंध निर्माण दर: ${formatINR(effectiveConstructionRate)}/${state.constructionRateUnit} (मूल्य: ${formatINR(constructionComponentValue)})
कुल शासकीय गाइडलाइन मूल्य: ${formatINR(totalMarketGovtValue)}
विक्रय मूल्य (Consideration Value): ${formatINR(considerationNumber)}
--------------------------------------------------
मुद्रांक शुल्क आधार: ${state.stampDutyBase === 'higher' ? 'Higher of Both' : state.stampDutyBase === 'govt' ? 'Govt Value' : 'Consideration'} (${formatINR(stampDutyApplicableBase)})
मुद्रांक शुल्क (Stamp Duty @ ${state.stampDutyRate || 0}%): ${formatINR(stampDutyAmount)}
पंजीयन शुल्क आधार: ${state.registrationFeeBase === 'higher' ? 'Higher of Both' : state.registrationFeeBase === 'govt' ? 'Govt Value' : 'Consideration'} (${formatINR(registrationFeeApplicableBase)})
पंजीयन शुल्क (Registration Fee @ ${state.registrationFeeRate || 0}%): ${formatINR(registrationFeeAmount)}
कुल देय शुल्क (TOTAL PAYABLE): ${formatINR(totalPayable)}
(${totalPayable > 0 ? numberToIndianWords(totalPayable) : 'Rs. Zero'})
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const loadSample = () => {
    const sampleState: FlatFormState = {
      floorType: 'basement_first', // प्रथम मंजिल (10% छूट)
      customDiscountPercent: '',
      discountApplyOn: 'construction_only',
      guidelineRate: 2500,
      guidelineRateUnit: 'sqft',
      constructionRate: 1500,
      constructionRateUnit: 'sqft',
      builtUpArea: 1000,
      builtUpAreaUnit: 'sqft',
      considerationValue: 4200000,
      stampDutyBase: 'higher',
      stampDutyRate: 6,
      registrationFeeBase: 'higher',
      registrationFeeRate: 1,
    };
    if (externalOnChange) {
      externalOnChange(sampleState);
    } else {
      setInternalState(sampleState);
    }
  };

  const resetAll = () => {
    if (externalOnChange) {
      externalOnChange(BLANK_FLAT_STATE);
    } else {
      setInternalState(BLANK_FLAT_STATE);
    }
  };

  const valuationResult: ValuationResult = useMemo(() => {
    const scanningFeeNum = typeof state.scanningFee === 'number' ? state.scanningFee : 0;
    const advocateFeeNum = typeof state.advocateFee === 'number' ? state.advocateFee : (state.advocateFee === '' ? 0 : 10000);
    const grandTotal = totalPayable + scanningFeeNum + advocateFeeNum;

    return {
      landAreaOriginal: 0,
      landAreaUnit: 'sqft',
      landAreaInRateUnit: 0,
      landGuidelineRate: typeof state.guidelineRate === 'number' ? state.guidelineRate : 0,
      landRateUnit: state.guidelineRateUnit,
      landGovtValueRaw: guidelineComponentValue,
      landDiscountAmount: 0,
      landGovtValueNet: guidelineComponentValue,
      hasConstruction: true,
      constructionAreaOriginal: rawBuiltUpArea,
      constructionAreaUnit: state.builtUpAreaUnit,
      constructionGuidelineRate: typeof state.constructionRate === 'number' ? state.constructionRate : 0,
      constructionRateUnit: state.constructionRateUnit,
      constructionGovtValueRaw: constructionComponentValue,
      constructionConcessionAmount: 0,
      constructionGovtValueNet: constructionComponentValue,
      extrasGovtValue: 0,
      totalGovtValue: totalMarketGovtValue,
      considerationValue: considerationNumber,
      stampDutyBaseType: state.stampDutyBase,
      stampDutyApplicableBase,
      stampDutyBaseFormula: state.stampDutyBase === 'higher' ? 'Higher of Both' : state.stampDutyBase === 'govt' ? 'Govt Value' : 'Consideration',
      registrationFeeBaseType: state.registrationFeeBase,
      registrationFeeApplicableBase,
      registrationFeeBaseFormula: state.registrationFeeBase === 'higher' ? 'Higher of Both' : state.registrationFeeBase === 'govt' ? 'Govt Value' : 'Consideration',
      stampDutyRate: typeof state.stampDutyRate === 'number' ? state.stampDutyRate : 0,
      stampDutyAmount,
      registrationFeeRate: typeof state.registrationFeeRate === 'number' ? state.registrationFeeRate : 0,
      registrationFeeAmount,
      cessRate: 0,
      cessAmount: 0,
      fixedCharges: 0,
      scanningFee: scanningFeeNum,
      advocateFee: advocateFeeNum,
      grandTotalCharges: grandTotal,
    };
  }, [
    state.guidelineRate,
    state.guidelineRateUnit,
    guidelineComponentValue,
    rawBuiltUpArea,
    state.builtUpAreaUnit,
    state.constructionRate,
    state.constructionRateUnit,
    constructionComponentValue,
    totalMarketGovtValue,
    considerationNumber,
    state.stampDutyBase,
    stampDutyApplicableBase,
    state.registrationFeeBase,
    registrationFeeApplicableBase,
    state.stampDutyRate,
    stampDutyAmount,
    state.registrationFeeRate,
    registrationFeeAmount,
    totalPayable,
    state.scanningFee,
    state.advocateFee,
  ]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-indigo-50/70 dark:bg-indigo-950/30 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/60">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 text-white rounded-lg">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Tab 3: Flat (बहुमंजिला भवन या कमर्शियल कॉम्प्लेक्स - प्रकोष्ठ स्वामित्व)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              बिल्टअप एरिया आधार: (कलेक्टर गाइडलाइन दर × एरिया) + (उपबंध निर्माण दर × एरिया) = बाजार मूल्य
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
            <span>Load Sample (1000 sqft Flat)</span>
          </button>
          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Reset Flat Tab"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: All Inputs */}
        <div className="lg:col-span-7 space-y-5">
          {/* Section 1: तलवार छूट का नियम (Floor Selection & Discount Rules) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>1. तल / मंजिल वार छूट का नियम (Floor Discount)</span>
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                {discountPercent}% छूट लागू
              </span>
            </div>

            {/* Floor Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => updateField('floorType', 'ground')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  state.floorType === 'ground'
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>(क) भूतल</span>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">0% छूट</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Ground Floor (100% दर)
                </div>
              </button>

              <button
                type="button"
                onClick={() => updateField('floorType', 'basement_first')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  state.floorType === 'basement_first'
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>(ख) तलघर / प्रथम</span>
                  <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">10% छूट</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Basement & 1st Floor
                </div>
              </button>

              <button
                type="button"
                onClick={() => updateField('floorType', 'second_plus')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  state.floorType === 'second_plus'
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>(ग) द्वितीय व अन्य</span>
                  <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">20% छूट</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  2nd & Upper Floors
                </div>
              </button>
            </div>

            {/* Note & Future proof selector: Apply discount on construction rate only (Current rule) vs guideline rate vs both */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  <strong>टीप:</strong> वर्तमान में शासन द्वारा सिर्फ <u>उपबंध निर्माण दर</u> में छूट प्रदान की जा रही है। भविष्य के नियमों हेतु आप छूट का आधार चुन सकते हैं:
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                  छूट लागू करने का आधार:
                </span>
                <select
                  value={state.discountApplyOn}
                  onChange={(e) => updateField('discountApplyOn', e.target.value as DiscountApplyOn)}
                  className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1 text-xs outline-none cursor-pointer font-medium"
                >
                  <option value="construction_only">उपबंध निर्माण दर में छूट (वर्तमान शासन नियम)</option>
                  <option value="guideline_only">कलेक्टर गाइडलाइन दर में छूट</option>
                  <option value="both">दोनों (गाइडलाइन एवं निर्माण दर) में छूट</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: एरिया एवं दरें (Rates & Built-up Area) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-indigo-600" />
                <span>2. दरें एवं बिल्टअप एरिया (Rates & Area)</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* कलेक्टर गाइडलाइन दर इनपुट बॉक्स with unit of Per Sqft or per Sqmt (in Rupees) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    कलेक्टर गाइडलाइन दर
                  </label>
                  {isGuidelineDiscounted && discountPercent > 0 && (
                    <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                      -{discountPercent}% छूट
                    </span>
                  )}
                </div>
                <div className="flex items-stretch rounded-xl overflow-hidden shadow-xs border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500 bg-white dark:bg-slate-800 transition-all">
                  <div className="bg-slate-100 dark:bg-slate-700/90 text-slate-700 dark:text-slate-200 px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-bold flex items-center shrink-0 border-r border-slate-200 dark:border-slate-700 select-none">
                    Rs.
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="गाइडलाइन दर दर्ज करें"
                    value={state.guidelineRate}
                    onChange={(e) =>
                      updateField(
                        'guidelineRate',
                        e.target.value === '' ? '' : parseFloat(e.target.value) || 0
                      )
                    }
                    className="flex-1 min-w-0 px-3 sm:px-3.5 py-2 sm:py-2.5 text-sm sm:text-base bg-transparent text-slate-900 dark:text-white outline-none font-semibold placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                  <select
                    value={state.guidelineRateUnit}
                    onChange={(e) => updateField('guidelineRateUnit', e.target.value as 'sqft' | 'sqmt')}
                    className="bg-slate-100 dark:bg-slate-700/90 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold px-2.5 sm:px-3 py-2 sm:py-2.5 border-l border-slate-300 dark:border-slate-600 outline-none cursor-pointer shrink-0 max-w-[130px] sm:max-w-none hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors unit-select-btn"
                  >
                    <option value="sqft">/ Sq.ft</option>
                    <option value="sqmt">/ Sq.mt</option>
                  </select>
                </div>
                {typeof state.guidelineRate === 'number' && state.guidelineRate > 0 && (
                  <div className="text-[11px] text-indigo-700 dark:text-indigo-400 font-medium italic mt-1 px-1">
                    In words / शब्दों में: {numberToIndianWords(state.guidelineRate)} / {state.guidelineRateUnit === 'sqft' ? 'Sq.ft' : 'Sq.mt'}
                    {isGuidelineDiscounted && discountPercent > 0 && (
                      <span className="text-slate-500 not-italic block font-normal text-[10px] mt-0.5">
                        छूट उपरांत प्रभावी दर: {formatINR(effectiveGuidelineRate)}/{state.guidelineRateUnit === 'sqft' ? 'Sq.ft' : 'Sq.mt'}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* उपबंध निर्माण दर इनपुट बॉक्स with unit of Per Sqft or per Sqmt (in Rupees) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    उपबंध निर्माण दर
                  </label>
                  {isConstructionDiscounted && discountPercent > 0 && (
                    <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                      -{discountPercent}% छूट
                    </span>
                  )}
                </div>
                <div className="flex items-stretch rounded-xl overflow-hidden shadow-xs border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500 bg-white dark:bg-slate-800 transition-all">
                  <div className="bg-slate-100 dark:bg-slate-700/90 text-slate-700 dark:text-slate-200 px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-bold flex items-center shrink-0 border-r border-slate-200 dark:border-slate-700 select-none">
                    Rs.
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="निर्माण दर दर्ज करें"
                    value={state.constructionRate}
                    onChange={(e) =>
                      updateField(
                        'constructionRate',
                        e.target.value === '' ? '' : parseFloat(e.target.value) || 0
                      )
                    }
                    className="flex-1 min-w-0 px-3 sm:px-3.5 py-2 sm:py-2.5 text-sm sm:text-base bg-transparent text-slate-900 dark:text-white outline-none font-semibold placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                  <select
                    value={state.constructionRateUnit}
                    onChange={(e) => updateField('constructionRateUnit', e.target.value as 'sqft' | 'sqmt')}
                    className="bg-slate-100 dark:bg-slate-700/90 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold px-2.5 sm:px-3 py-2 sm:py-2.5 border-l border-slate-300 dark:border-slate-600 outline-none cursor-pointer shrink-0 max-w-[130px] sm:max-w-none hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors unit-select-btn"
                  >
                    <option value="sqft">/ Sq.ft</option>
                    <option value="sqmt">/ Sq.mt</option>
                  </select>
                </div>
                {typeof state.constructionRate === 'number' && state.constructionRate > 0 && (
                  <div className="text-[11px] text-indigo-700 dark:text-indigo-400 font-medium italic mt-1 px-1">
                    In words / शब्दों में: {numberToIndianWords(state.constructionRate)} / {state.constructionRateUnit === 'sqft' ? 'Sq.ft' : 'Sq.mt'}
                    {isConstructionDiscounted && discountPercent > 0 && (
                      <span className="text-slate-500 not-italic block font-normal text-[10px] mt-0.5">
                        छूट उपरांत प्रभावी दर: {formatINR(effectiveConstructionRate)}/{state.constructionRateUnit === 'sqft' ? 'Sq.ft' : 'Sq.mt'}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* बिल्टअप एरिया इनपुट बॉक्स (with Per Sqft or per Sqmt) */}
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  बिल्टअप एरिया (Built-up Area)
                </label>
                <div className="flex items-stretch rounded-xl overflow-hidden shadow-xs border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500 bg-white dark:bg-slate-800 transition-all">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="बिल्टअप एरिया दर्ज करें (जैसे: 1000)"
                    value={state.builtUpArea}
                    onChange={(e) =>
                      updateField(
                        'builtUpArea',
                        e.target.value === '' ? '' : parseFloat(e.target.value) || 0
                      )
                    }
                    className="flex-1 min-w-0 px-3 sm:px-3.5 py-2 sm:py-2.5 text-sm sm:text-base bg-transparent text-slate-900 dark:text-white outline-none font-semibold placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                  <select
                    value={state.builtUpAreaUnit}
                    onChange={(e) => updateField('builtUpAreaUnit', e.target.value as 'sqft' | 'sqmt')}
                    className="bg-slate-100 dark:bg-slate-700/90 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold px-2.5 sm:px-3 py-2 sm:py-2.5 border-l border-slate-300 dark:border-slate-600 outline-none cursor-pointer shrink-0 max-w-[130px] sm:max-w-none hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors unit-select-btn"
                  >
                    <option value="sqft">Sq.ft</option>
                    <option value="sqmt">Sq.mt</option>
                  </select>
                </div>
                {typeof state.builtUpArea === 'number' && state.builtUpArea > 0 && (
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    {state.builtUpArea} {state.builtUpAreaUnit === 'sqft' ? 'वर्गफीट' : 'वर्गमीटर'} = {state.builtUpAreaUnit === 'sqft' ? `${(state.builtUpArea / 10.7639).toFixed(2)} वर्गमीटर` : `${(state.builtUpArea * 10.7639).toFixed(2)} वर्गफीट`}
                  </span>
                )}
              </div>
            </div>

            {/* Live Formula Preview Box */}
            {hasEnteredData && (
              <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/50 space-y-1.5 text-xs">
                <span className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider block">
                  सूत्र गणना: (गाइडलाइन दर × एरिया) + (निर्माण दर × एरिया) = शासकीय बाजार मूल्य
                </span>
                <div className="flex flex-wrap items-center justify-between gap-2 text-slate-700 dark:text-slate-300 pt-1">
                  <span>गाइडलाइन भाग: <strong>{formatINR(guidelineComponentValue)}</strong></span>
                  <span>+ निर्माण भाग: <strong>{formatINR(constructionComponentValue)}</strong></span>
                  <span className="font-extrabold text-indigo-900 dark:text-indigo-200 text-sm">
                    = कुल बाजार मूल्य: {formatINR(totalMarketGovtValue)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Consideration Value एवं शुल्क (Consideration, Stamp Duty & Registration Fee) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-indigo-600" />
                <span>3. विक्रय मूल्य एवं शुल्क दरें (Consideration & Fees)</span>
              </h3>
            </div>

            <div className="space-y-4">
              {/* Consideration Value (Sale Deed Price) का इनपुट बॉक्स (in Rupees) */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Consideration Value / विक्रय मूल्य (in Rupees)
                </label>
                <div className="flex items-stretch rounded-xl overflow-hidden shadow-xs border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500 bg-white dark:bg-slate-800 transition-all">
                  <div className="bg-slate-100 dark:bg-slate-700/90 text-slate-700 dark:text-slate-200 px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-bold flex items-center shrink-0 border-r border-slate-200 dark:border-slate-700 select-none">
                    Rs.
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="दस्तावेज में उल्लेखित विक्रय मूल्य दर्ज करें"
                    value={state.considerationValue}
                    onChange={(e) =>
                      updateField(
                        'considerationValue',
                        e.target.value === '' ? '' : parseFloat(e.target.value) || 0
                      )
                    }
                    className="flex-1 min-w-0 px-3 sm:px-3.5 py-2 sm:py-2.5 text-sm sm:text-base bg-transparent text-slate-900 dark:text-white outline-none font-semibold placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
                {typeof state.considerationValue === 'number' && state.considerationValue > 0 && (
                  <div className="text-[11px] text-indigo-700 dark:text-indigo-400 font-medium italic mt-1 px-1">
                    In words / शब्दों में: {numberToIndianWords(state.considerationValue)}
                  </div>
                )}
              </div>

              {/* Dynamic Comparison Indicator Pill between Govt Guideline Value & Consideration Value */}
              {hasEnteredData && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">
                    Govt Value vs Consideration:
                  </span>
                  <div className="text-right">
                    {totalMarketGovtValue > considerationNumber ? (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Government Guideline Value is Higher (+{formatINR(totalMarketGovtValue - considerationNumber)})
                      </span>
                    ) : considerationNumber > totalMarketGovtValue ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        Consideration Value is Higher (+{formatINR(considerationNumber - totalMarketGovtValue)})
                      </span>
                    ) : (
                      <span className="text-slate-500 font-medium">Both values are equal</span>
                    )}
                  </div>
                </div>
              )}

              {/* Stamp Duty Section with Calculation Base Selector Dropdown */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                  {/* Stamp Duty Rate (%) */}
                  <div className="sm:col-span-4">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                      मुद्रांक शुल्क (Stamp Duty %)
                    </label>
                    <div className="flex rounded-xl overflow-hidden shadow-xs border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="any"
                        placeholder="e.g. 5 या 6"
                        value={state.stampDutyRate}
                        onChange={(e) =>
                          updateField(
                            'stampDutyRate',
                            e.target.value === '' ? '' : parseFloat(e.target.value) || 0
                          )
                        }
                        className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-semibold"
                      />
                      <div className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2 text-xs font-semibold flex items-center">
                        <Percent className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Stamp Duty Calculation Base Selector Dropdown */}
                  <div className="sm:col-span-8">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                      Stamp Duty Calculation Base
                    </label>
                    <div className="relative rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:ring-2 focus-within:ring-indigo-500">
                      <select
                        value={state.stampDutyBase}
                        onChange={(e) => updateField('stampDutyBase', e.target.value as CalculationBase)}
                        className="w-full appearance-none px-3 py-2 pr-9 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white bg-transparent outline-none cursor-pointer"
                      >
                        <option value="higher">
                          Higher of Both ({formatINR(higherValue)}{hasEnteredData ? higherIndicator : ''})
                        </option>
                        <option value="govt">
                          Government Guideline Value ({formatINR(totalMarketGovtValue)})
                        </option>
                        <option value="consideration">
                          Consideration Value ({formatINR(considerationNumber)})
                        </option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Base Value: <strong className="text-indigo-600 dark:text-indigo-400">{formatINR(stampDutyApplicableBase)}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Registration Fee Section with Calculation Base Selector Dropdown */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                  {/* Registration Fee Rate (%) */}
                  <div className="sm:col-span-4">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                      पंजीयन शुल्क (Registration Fee %)
                    </label>
                    <div className="flex rounded-xl overflow-hidden shadow-xs border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="any"
                        placeholder="e.g. 1 या 2"
                        value={state.registrationFeeRate}
                        onChange={(e) =>
                          updateField(
                            'registrationFeeRate',
                            e.target.value === '' ? '' : parseFloat(e.target.value) || 0
                          )
                        }
                        className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-semibold"
                      />
                      <div className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2 text-xs font-semibold flex items-center">
                        <Percent className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Registration Fees Calculation Base Selector Dropdown */}
                  <div className="sm:col-span-8">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                      Registration Fees Calculation Base
                    </label>
                    <div className="relative rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:ring-2 focus-within:ring-indigo-500">
                      <select
                        value={state.registrationFeeBase}
                        onChange={(e) => updateField('registrationFeeBase', e.target.value as CalculationBase)}
                        className="w-full appearance-none px-3 py-2 pr-9 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white bg-transparent outline-none cursor-pointer"
                      >
                        <option value="higher">
                          Higher of Both ({formatINR(higherValue)}{hasEnteredData ? higherIndicator : ''})
                        </option>
                        <option value="govt">
                          Government Guideline Value ({formatINR(totalMarketGovtValue)})
                        </option>
                        <option value="consideration">
                          Consideration Value ({formatINR(considerationNumber)})
                        </option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Base Value: <strong className="text-indigo-600 dark:text-indigo-400">{formatINR(registrationFeeApplicableBase)}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Unified Output Dues & Summary */}
        <div className="lg:col-span-5 space-y-4">
          <CalculationSummaryCard
            title="Flat / Apartment (प्रकोष्ठ)"
            tab="flat"
            result={valuationResult}
            currentState={state}
            onOpenPrintModal={(res, titleName, tabName, stateObj) => onOpenPrintModal?.(res, titleName, tabName, stateObj)}
            scanningFee={state.scanningFee}
            onChangeScanningFee={(val) => updateField('scanningFee', val)}
            advocateFee={state.advocateFee}
            onChangeAdvocateFee={(val) => updateField('advocateFee', val)}
            overviewTitle="प्रकोष्ठ मूल्यांकन घटक विवरण (Valuation Overview)"
            overviewItems={[
              {
                label: 'तल स्थिति एवं छूट:',
                value:
                  state.floorType === 'ground'
                    ? 'भूतल (0% छूट)'
                    : state.floorType === 'basement_first'
                    ? 'तलघर / प्रथम मंजिल (10% छूट)'
                    : state.floorType === 'second_plus'
                    ? 'द्वितीय व अन्य मंजिल (20% छूट)'
                    : `कस्टम (${discountPercent}% छूट)`,
              },
              {
                label: 'बिल्टअप एरिया:',
                value: rawBuiltUpArea > 0 ? `${rawBuiltUpArea} ${state.builtUpAreaUnit}` : '—',
              },
              {
                label: 'गाइडलाइन दर भाग मूल्य:',
                value: formatINR(guidelineComponentValue),
              },
              {
                label: 'उपबंध निर्माण दर भाग मूल्य:',
                value: formatINR(constructionComponentValue),
              },
              {
                label: 'कुल शासकीय गाइडलाइन मूल्य:',
                value: formatINR(totalMarketGovtValue),
                isBold: true,
                isHighlight: true,
              },
              {
                label: 'विक्रय मूल्य (Consideration Value):',
                value: formatINR(considerationNumber),
                isBold: true,
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

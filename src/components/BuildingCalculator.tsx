import React, { useMemo } from 'react';
import {
  BuildingState,
  ValuationResult,
  AreaUnit,
  RateUnit,
  FloorItem,
} from '../types/calculator';
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
import {
  Building2,
  Plus,
  Trash2,
  Sparkles,
  RotateCcw,
  Layers,
} from 'lucide-react';

interface Props {
  state: BuildingState;
  onChange: (newState: BuildingState) => void;
  onReset: () => void;
  onOpenPrintModal: (result: ValuationResult, title: string) => void;
}

export const BuildingCalculator: React.FC<Props> = ({
  state,
  onChange,
  onReset,
  onOpenPrintModal,
}) => {
  const updateField = <K extends keyof BuildingState>(key: K, value: BuildingState[K]) => {
    onChange({ ...state, [key]: value });
  };

  // Land Part
  const landAreaNumber = typeof state.landArea === 'number' ? state.landArea : 0;
  const landRateNumber = typeof state.landGuidelineRate === 'number' ? state.landGuidelineRate : 0;

  const landAreaInRateUnit = useMemo(() => {
    return convertArea(landAreaNumber, state.landAreaUnit, state.landGuidelineRateUnit);
  }, [landAreaNumber, state.landAreaUnit, state.landGuidelineRateUnit]);

  // Land Government Value = Area × Rate
  const landGovtValue = useMemo(() => {
    return landAreaInRateUnit * landRateNumber;
  }, [landAreaInRateUnit, landRateNumber]);

  // Construction Part: Complete vs Floor-wise (Option-wise)
  const defaultConstructionRateNum =
    typeof state.defaultConstructionRate === 'number' ? state.defaultConstructionRate : 0;

  const constructionData = useMemo(() => {
    if (state.constructionMode === 'complete') {
      const area = typeof state.completeConstructedArea === 'number' ? state.completeConstructedArea : 0;
      const rate = typeof state.defaultConstructionRate === 'number' ? state.defaultConstructionRate : 0;
      const areaInRateUnit = convertArea(area, state.completeConstructionUnit, state.defaultConstructionRateUnit);
      const val = areaInRateUnit * rate;
      return {
        totalArea: area,
        areaUnit: state.completeConstructionUnit,
        rate,
        rateUnit: state.defaultConstructionRateUnit,
        totalGovtConstructionValue: val,
        floorsDetail: [{ name: 'Complete Building', area, rate, value: val }],
      };
    } else {
      let totalArea = 0;
      let totalVal = 0;
      const details: { name: string; area: number; rate: number; value: number }[] = [];

      state.floors.forEach((fl) => {
        const floorArea = typeof fl.area === 'number' ? fl.area : 0;
        const floorRate = typeof fl.rate === 'number' ? fl.rate : 0;
        const flVal = floorArea * floorRate;

        totalArea += floorArea;
        totalVal += flVal;
        details.push({
          name: fl.name,
          area: floorArea,
          rate: floorRate,
          value: flVal,
        });
      });

      return {
        totalArea,
        areaUnit: state.floorAreaUnit,
        rate: 0,
        rateUnit: state.floorAreaUnit,
        totalGovtConstructionValue: totalVal,
        floorsDetail: details,
      };
    }
  }, [
    state.constructionMode,
    state.completeConstructedArea,
    state.completeConstructionUnit,
    state.defaultConstructionRate,
    state.defaultConstructionRateUnit,
    state.floors,
    state.floorAreaUnit,
  ]);

  // Total Government Value of building = Land Value + Construction Value
  const totalGovtValue = landGovtValue + constructionData.totalGovtConstructionValue;

  const considerationNumber =
    typeof state.considerationValue === 'number' ? state.considerationValue : 0;

  // Valuation Result
  const result: ValuationResult = useMemo(() => {
    const higherVal = Math.max(totalGovtValue, considerationNumber);

    // Stamp duty base
    let stampDutyApplicableBase = higherVal;
    let stampDutyBaseFormula = 'Higher of Both';
    if (state.stampDutyBase === 'govt') {
      stampDutyApplicableBase = totalGovtValue;
      stampDutyBaseFormula = `Government Value (${formatINR(totalGovtValue)})`;
    } else if (state.stampDutyBase === 'consideration') {
      stampDutyApplicableBase = considerationNumber;
      stampDutyBaseFormula = `Consideration (${formatINR(considerationNumber)})`;
    }

    // Reg fee base
    let registrationFeeApplicableBase = higherVal;
    let registrationFeeBaseFormula = 'Higher of Both';
    if (state.registrationFeeBase === 'govt') {
      registrationFeeApplicableBase = totalGovtValue;
      registrationFeeBaseFormula = `Government Value (${formatINR(totalGovtValue)})`;
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
      landAreaOriginal: landAreaNumber,
      landAreaUnit: state.landAreaUnit,
      landAreaInRateUnit,
      landGuidelineRate: landRateNumber,
      landRateUnit: state.landGuidelineRateUnit,
      landGovtValueRaw: landGovtValue,
      landDiscountAmount: 0,
      landGovtValueNet: landGovtValue,
      hasConstruction: true,
      constructionAreaOriginal: constructionData.totalArea,
      constructionAreaUnit: constructionData.areaUnit,
      constructionGuidelineRate: constructionData.rate,
      constructionRateUnit: constructionData.rateUnit,
      constructionGovtValueRaw: constructionData.totalGovtConstructionValue,
      constructionConcessionAmount: 0,
      constructionGovtValueNet: constructionData.totalGovtConstructionValue,
      floorwiseBreakdown: constructionData.floorsDetail,
      extrasGovtValue: 0,
      totalGovtValue,
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
    totalGovtValue,
    considerationNumber,
    state.stampDutyBase,
    state.stampDutyRate,
    state.registrationFeeBase,
    state.registrationFeeRate,
    landAreaNumber,
    state.landAreaUnit,
    landAreaInRateUnit,
    landRateNumber,
    state.landGuidelineRateUnit,
    landGovtValue,
    constructionData,
  ]);

  const addFloor = () => {
    const floorIndex = state.floors.length + 1;
    const names = ['Ground Floor', 'First Floor', 'Second Floor', 'Third Floor', 'Fourth Floor', 'Basement', 'Mezzanine'];
    const defaultName = floorIndex <= names.length ? names[floorIndex - 1] : `Floor ${floorIndex}`;
    const newFloor: FloorItem = {
      id: Date.now().toString(),
      name: defaultName,
      area: '',
      rate: '',
    };
    updateField('floors', [...state.floors, newFloor]);
  };

  const removeFloor = (id: string) => {
    if (state.floors.length <= 1) return;
    updateField(
      'floors',
      state.floors.filter((f) => f.id !== id)
    );
  };

  const updateFloor = (id: string, updates: Partial<FloorItem>) => {
    updateField(
      'floors',
      state.floors.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const loadSampleBuilding = () => {
    onChange({
      ...state,
      landArea: 1200,
      landAreaUnit: 'sqft',
      landGuidelineRate: 20000,
      landGuidelineRateUnit: 'sqmt',
      constructionMode: 'floorwise',
      floorAreaUnit: 'sqft',
      defaultConstructionRate: 1400,
      defaultConstructionRateUnit: 'sqft',
      floors: [
        { id: '1', name: 'Ground Floor', area: 850, rate: 1600 },
        { id: '2', name: 'First Floor', area: 750, rate: 1400 },
      ],
      considerationValue: 5500000,
      stampDutyRate: 6,
      registrationFeeRate: 1,
    });
  };

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
              Tab 2: Land with Building (Construction + Land)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Total Government Value = Land Value + Construction Value
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadSampleBuilding}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Load Sample House</span>
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
        {/* Left Inputs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Land Valuation Component */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                1. Land Component & Circle Rate
              </h3>
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded">
                Land Value: {formatINRShort(landGovtValue)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Land Area */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Land Area
                </label>
                <div className="flex rounded-xl overflow-hidden shadow-xs border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="e.g. 1200"
                    value={state.landArea}
                    onChange={(e) =>
                      updateField(
                        'landArea',
                        e.target.value === '' ? '' : parseFloat(e.target.value) || 0
                      )
                    }
                    className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-semibold"
                  />
                  <select
                    value={state.landAreaUnit}
                    onChange={(e) => updateField('landAreaUnit', e.target.value as AreaUnit)}
                    className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs px-2.5 py-2 border-l border-slate-300 dark:border-slate-600 outline-none cursor-pointer"
                  >
                    {AREA_UNITS_CONFIG.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.short}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Land Circle Rate */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Land Guideline Rate
                </label>
                <div className="flex rounded-xl overflow-hidden shadow-xs border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500">
                  <div className="bg-slate-100 dark:bg-slate-700 text-slate-600 px-2.5 py-2 text-sm font-semibold">
                    Rs.
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Rate"
                    value={state.landGuidelineRate}
                    onChange={(e) =>
                      updateField(
                        'landGuidelineRate',
                        e.target.value === '' ? '' : parseFloat(e.target.value) || 0
                      )
                    }
                    className="flex-1 px-2.5 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-semibold"
                  />
                  <select
                    value={state.landGuidelineRateUnit}
                    onChange={(e) => updateField('landGuidelineRateUnit', e.target.value as RateUnit)}
                    className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs px-2 py-2 border-l border-slate-300 dark:border-slate-600 outline-none cursor-pointer"
                  >
                    {RATE_UNITS_CONFIG.map((ru) => (
                      <option key={ru.id} value={ru.id}>
                        {ru.perLabel}
                      </option>
                    ))}
                  </select>
                </div>
                {typeof state.landGuidelineRate === 'number' && state.landGuidelineRate > 0 && (
                  <div className="text-[11px] text-indigo-700 dark:text-indigo-400 font-medium italic mt-1 px-1">
                    In words / शब्दों में: {numberToIndianWords(state.landGuidelineRate)}
                  </div>
                )}
              </div>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg flex flex-wrap items-center justify-between gap-1">
              <span>
                Area converted: {Number(landAreaInRateUnit.toFixed(3))} {state.landGuidelineRateUnit} × {formatINR(landRateNumber)}
              </span>
              <div className="text-right">
                <span className="font-bold text-slate-900 dark:text-white block">
                  Land Value = {formatINR(landGovtValue)}
                </span>
                {landGovtValue > 0 && (
                  <span className="text-[10px] text-blue-800 dark:text-blue-300 italic block">
                    In words / शब्दों में: {numberToIndianWords(landGovtValue)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Construction Valuation Component (Option-wise) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                2. Construction Valuation
              </h3>
            </div>

            {/* Option Selection: Complete Area vs Floor-Wise */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                Choose Construction Valuation Option
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateField('constructionMode', 'complete')}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    state.constructionMode === 'complete'
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${state.constructionMode === 'complete' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs block">
                      Option 1: Complete Area
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Single guideline rate for entire building
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => updateField('constructionMode', 'floorwise')}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    state.constructionMode === 'floorwise'
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${state.constructionMode === 'floorwise' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs block">
                      Option 2: Floor-Wise
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Separate guideline rate for each floor
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Option 1: Complete Construction Area */}
            {state.constructionMode === 'complete' ? (
              <div className="space-y-3.5 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Complete Constructed Area */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                      Complete Constructed Area
                    </label>
                    <div className="flex rounded-xl overflow-hidden shadow-xs border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="e.g. 1400"
                        value={state.completeConstructedArea}
                        onChange={(e) =>
                          updateField(
                            'completeConstructedArea',
                            e.target.value === '' ? '' : parseFloat(e.target.value) || 0
                          )
                        }
                        className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-semibold"
                      />
                      <select
                        value={state.completeConstructionUnit}
                        onChange={(e) =>
                          updateField('completeConstructionUnit', e.target.value as 'sqft' | 'sqmt')
                        }
                        className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs px-3 py-2 border-l border-slate-300 dark:border-slate-600 outline-none cursor-pointer"
                      >
                        <option value="sqft">sq.ft</option>
                        <option value="sqmt">sq.mt</option>
                      </select>
                    </div>
                  </div>

                  {/* Single Construction Guideline Rate */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                      Construction Guideline Rate
                    </label>
                    <div className="flex rounded-xl overflow-hidden shadow-xs border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500">
                      <div className="bg-slate-100 dark:bg-slate-700 text-slate-600 px-3 py-2 text-sm font-semibold">
                        Rs.
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="e.g. 1400"
                        value={state.defaultConstructionRate}
                        onChange={(e) =>
                          updateField(
                            'defaultConstructionRate',
                            e.target.value === '' ? '' : parseFloat(e.target.value) || 0
                          )
                        }
                        className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-semibold"
                      />
                      <select
                        value={state.defaultConstructionRateUnit}
                        onChange={(e) =>
                          updateField('defaultConstructionRateUnit', e.target.value as 'sqft' | 'sqmt')
                        }
                        className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs px-3 py-2 border-l border-slate-300 dark:border-slate-600 outline-none cursor-pointer"
                      >
                        <option value="sqft">Rs. per sq.ft</option>
                        <option value="sqmt">Rs. per sq.mt</option>
                      </select>
                    </div>
                    {typeof state.defaultConstructionRate === 'number' && state.defaultConstructionRate > 0 && (
                      <div className="text-[11px] text-indigo-700 dark:text-indigo-400 font-medium italic mt-1 px-1">
                        In words / शब्दों में: {numberToIndianWords(state.defaultConstructionRate)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Option 2: Floor-Wise (Different rate per floor) */
              <div className="space-y-3 pt-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Floor Unit:
                    </span>
                    <select
                      value={state.floorAreaUnit}
                      onChange={(e) => updateField('floorAreaUnit', e.target.value as 'sqft' | 'sqmt')}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
                    >
                      <option value="sqft">Square Feet (sq.ft)</option>
                      <option value="sqmt">Square Metres (sq.mt)</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={addFloor}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Floor</span>
                  </button>
                </div>

                {/* Table Header on medium+ screens */}
                <div className="hidden sm:grid grid-cols-12 gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  <div className="col-span-3">Floor Name</div>
                  <div className="col-span-3">Area ({state.floorAreaUnit})</div>
                  <div className="col-span-3">Guideline Rate (Rs./{state.floorAreaUnit})</div>
                  <div className="col-span-2 text-right">Floor Value</div>
                  <div className="col-span-1 text-center">Action</div>
                </div>

                <div className="space-y-2.5">
                  {state.floors.map((fl) => {
                    const floorAreaNum = typeof fl.area === 'number' ? fl.area : 0;
                    const floorRateNum = typeof fl.rate === 'number' ? fl.rate : 0;
                    const floorVal = floorAreaNum * floorRateNum;

                    return (
                      <div
                        key={fl.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                      >
                        {/* Floor Name */}
                        <div className="sm:col-span-3">
                          <label className="text-[10px] text-slate-500 uppercase font-semibold block sm:hidden mb-0.5">
                            Floor Name
                          </label>
                          <input
                            type="text"
                            value={fl.name}
                            placeholder="e.g. Ground Floor"
                            onChange={(e) => updateFloor(fl.id, { name: e.target.value })}
                            className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white outline-none"
                          />
                        </div>

                        {/* Constructed Area */}
                        <div className="sm:col-span-3">
                          <label className="text-[10px] text-slate-500 uppercase font-semibold block sm:hidden mb-0.5">
                            Area ({state.floorAreaUnit})
                          </label>
                          <div className="flex rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              placeholder="e.g. 800"
                              value={fl.area}
                              onChange={(e) =>
                                updateFloor(fl.id, {
                                  area: e.target.value === '' ? '' : parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-full px-2.5 py-1.5 text-xs text-slate-900 dark:text-white outline-none font-semibold"
                            />
                            <span className="bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300 px-2 py-1.5 text-[11px] font-medium flex items-center">
                              {state.floorAreaUnit}
                            </span>
                          </div>
                        </div>

                        {/* Floor-Specific Construction Guideline Rate */}
                        <div className="sm:col-span-3">
                          <label className="text-[10px] text-slate-500 uppercase font-semibold block sm:hidden mb-0.5">
                            Guideline Rate (Rs./{state.floorAreaUnit})
                          </label>
                          <div className="flex rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700">
                            <span className="bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300 px-2 py-1.5 text-[11px] font-semibold flex items-center">
                              Rs.
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              placeholder="e.g. 1600"
                              value={fl.rate}
                              onChange={(e) =>
                                updateFloor(fl.id, {
                                  rate: e.target.value === '' ? '' : parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-full px-2 py-1.5 text-xs text-slate-900 dark:text-white outline-none font-semibold"
                            />
                          </div>
                        </div>

                        {/* Floor Valuation */}
                        <div className="sm:col-span-2 text-left sm:text-right">
                          <label className="text-[10px] text-slate-500 uppercase font-semibold block sm:hidden mb-0.5">
                            Floor Valuation
                          </label>
                          <span className="text-xs font-bold text-slate-900 dark:text-white block">
                            {formatINR(floorVal)}
                          </span>
                        </div>

                        {/* Delete Button */}
                        <div className="sm:col-span-1 text-center">
                          {state.floors.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeFloor(fl.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30"
                              title="Delete this floor"
                            >
                              <Trash2 className="w-4 h-4 mx-auto" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Construction Total Summary */}
            <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/50 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-semibold text-indigo-950 dark:text-indigo-300 block">
                  Total Constructed Area: {constructionData.totalArea} {constructionData.areaUnit}
                </span>
                <span className="text-[11px] text-slate-500">
                  {state.constructionMode === 'complete'
                    ? 'Complete Area × Single Guideline Rate'
                    : 'Sum of individual floor valuations'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">Total Construction Value</span>
                <span className="text-base font-extrabold text-indigo-900 dark:text-indigo-200">
                  {formatINR(constructionData.totalGovtConstructionValue)}
                </span>
                {constructionData.totalGovtConstructionValue > 0 && (
                  <div className="text-[10px] text-indigo-800 dark:text-indigo-300 italic">
                    In words / शब्दों में: {numberToIndianWords(constructionData.totalGovtConstructionValue)}
                  </div>
                )}
              </div>
            </div>

            {/* Combined Building Value Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[11px] text-indigo-200 uppercase font-semibold tracking-wider block">
                  Total Government Value of Building
                </span>
                <span className="text-xs text-indigo-100">
                  Land ({formatINRShort(landGovtValue)}) + Construction ({formatINRShort(constructionData.totalGovtConstructionValue)})
                </span>
              </div>
              <div className="text-right">
                <span className="text-xl font-extrabold text-white block">
                  {formatINR(totalGovtValue)}
                </span>
                {totalGovtValue > 0 && (
                  <span className="text-[11px] text-indigo-200 italic block mt-0.5">
                    In words / शब्दों में: {numberToIndianWords(totalGovtValue)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Consideration Value */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                3. Consideration Value (Sale Deed Price)
              </h3>
            </div>

            <div>
              <div className="flex rounded-xl overflow-hidden shadow-xs border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500">
                <div className="bg-slate-100 dark:bg-slate-700 text-slate-600 px-3.5 py-2.5 text-sm font-semibold">
                  Rs.
                </div>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 55,00,000"
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
          </div>

          {/* Section 4: Stamp Duty & Registration Fees */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                4. Stamp Duty & Registration Fees
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
                govtValue={totalGovtValue}
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
                govtValue={totalGovtValue}
                considerationValue={considerationNumber}
                ratePercent={typeof state.registrationFeeRate === 'number' ? state.registrationFeeRate : 0}
              />
            </div>
          </div>
        </div>

        {/* Right Summary */}
        <div className="lg:col-span-5 space-y-4">
          <CalculationSummaryCard
            title="Building (Land + Construction)"
            result={result}
            onOpenPrintModal={() => onOpenPrintModal(result, 'Building (House/Shop/Godown)')}
          />
        </div>
      </div>
    </div>
  );
};

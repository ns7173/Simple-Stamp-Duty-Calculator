import React, { useState } from 'react';
import { AreaUnit } from '../types/calculator';
import { AREA_TO_SQMT, convertArea, formatNumber } from '../utils/units';
import { X, ArrowRightLeft, Ruler } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const UNITS: { id: AreaUnit; name: string; desc: string }[] = [
  { id: 'sqft', name: 'Square Feet (sq.ft)', desc: '1 sq.mt = 10.7639 sq.ft' },
  { id: 'sqmt', name: 'Square Metres (sq.mt)', desc: 'Base Unit (1 sq.mt)' },
  { id: 'hectare', name: 'Hectare (ha)', desc: '1 Hectare = 10,000 sq.mt = 2.471 Acres' },
  { id: 'acre', name: 'Acre (ac)', desc: '1 Acre = 4,046.86 sq.mt = 43,560 sq.ft' },
  { id: 'dismil', name: 'Dismil / Decimal', desc: '1 Dismil = 435.6 sq.ft = 1/100 Acre' },
];

export const UnitConverterModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [value, setValue] = useState<number | ''>(1000);
  const [fromUnit, setFromUnit] = useState<AreaUnit>('sqft');

  if (!isOpen) return null;

  const num = typeof value === 'number' ? value : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base">Land Area Unit Converter</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-500">
            Convert any area instantly across standard Indian land measurement units:
          </p>

          <div className="flex items-stretch rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-xs focus-within:ring-2 focus-within:ring-indigo-500 bg-white dark:bg-slate-800 transition-all">
            <input
              type="number"
              min="0"
              step="any"
              value={value}
              onChange={(e) =>
                setValue(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)
              }
              placeholder="Enter value"
              className="flex-1 min-w-0 px-3 sm:px-3.5 py-2 sm:py-2.5 text-sm sm:text-base font-bold bg-transparent text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value as AreaUnit)}
              className="bg-slate-100 dark:bg-slate-700/90 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold px-2.5 sm:px-3 py-2 sm:py-2.5 border-l border-slate-300 dark:border-slate-600 outline-none cursor-pointer shrink-0 max-w-[140px] sm:max-w-none hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors unit-select-btn"
            >
              {UNITS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Converted values grid */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Equivalent In Other Units:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {UNITS.filter((u) => u.id !== fromUnit).map((u) => {
                const converted = convertArea(num, fromUnit, u.id);
                return (
                  <div
                    key={u.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
                  >
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {u.name}
                    </div>
                    <div className="text-base font-bold text-indigo-700 dark:text-indigo-300 font-mono mt-0.5">
                      {formatNumber(converted, 5)}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {u.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Real Estate Conversion Formula Sheet */}
          <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
            <span className="font-bold text-indigo-950 dark:text-indigo-300 block">
              Standard Indian Real Estate Conversion Factors:
            </span>
            <div>• 1 Square Metre = 10.7639 Square Feet</div>
            <div>• 1 Hectare = 10,000 Square Metres = 2.471 Acres</div>
            <div>• 1 Acre = 43,560 Square Feet = 100 Dismil (Decimal)</div>
            <div>• 1 Dismil = 435.6 Square Feet = 40.468 Square Metres</div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl text-xs font-semibold hover:bg-slate-800 cursor-pointer"
          >
            Close Converter
          </button>
        </div>
      </div>
    </div>
  );
};

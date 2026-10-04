import React from 'react';
import { CalculationBase } from '../types/calculator';
import { formatINR } from '../utils/units';
import { ChevronDown } from 'lucide-react';

interface Props {
  label: string;
  subLabel?: string;
  selectedBase: CalculationBase;
  onChange: (base: CalculationBase) => void;
  govtValue: number;
  considerationValue: number;
  ratePercent: number;
}

export const ValuationBaseSelector: React.FC<Props> = ({
  label,
  selectedBase,
  onChange,
  govtValue,
  considerationValue,
}) => {
  const higherValue = Math.max(govtValue, considerationValue);

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
        {label}
      </label>

      <div className="relative rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:ring-2 focus-within:ring-indigo-500">
        <select
          value={selectedBase}
          onChange={(e) => onChange(e.target.value as CalculationBase)}
          className="w-full appearance-none px-3.5 py-2.5 pr-10 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white bg-transparent outline-none cursor-pointer"
        >
          <option value="higher">
            Higher of Both ({formatINR(higherValue)})
          </option>
          <option value="govt">
            Government Value ({formatINR(govtValue)})
          </option>
          <option value="consideration">
            Consideration Value ({formatINR(considerationValue)})
          </option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

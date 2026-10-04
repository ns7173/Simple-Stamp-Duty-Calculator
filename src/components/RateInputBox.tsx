import React from 'react';

interface Props {
  label: string;
  value: number | '';
  onChange: (val: number | '') => void;
  helperText?: string;
  min?: number;
  max?: number;
  step?: number;
}

export const RateInputBox: React.FC<Props> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 0.01,
}) => {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
        {label}
      </label>
      <div className="relative rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:ring-2 focus-within:ring-indigo-500 overflow-hidden">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          placeholder="e.g. 7"
          value={value}
          onChange={(e) => {
            const valStr = e.target.value;
            if (valStr === '') {
              onChange('');
            } else {
              const parsed = parseFloat(valStr);
              onChange(isNaN(parsed) ? '' : parsed);
            }
          }}
          className="w-full px-3.5 py-2.5 text-sm font-bold text-slate-900 dark:text-white bg-transparent outline-none pr-8"
        />
        <div className="absolute right-3.5 top-2.5 text-sm font-bold text-slate-400 pointer-events-none">
          %
        </div>
      </div>
    </div>
  );
};

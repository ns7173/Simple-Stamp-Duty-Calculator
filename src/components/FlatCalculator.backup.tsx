import React from 'react';
import { Building, Sparkles } from 'lucide-react';

export const FlatCalculator: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="p-2 bg-indigo-600 text-white rounded-lg">
          <Building className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Tab 3: Flat
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Flat in a multi-storied Building
          </p>
        </div>
      </div>

      {/* Blank Canvas Container for User's Custom Instructions */}
      <div className="min-h-[420px] bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700/80 p-8 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
          <Building className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
          Flat Tab is Blank
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mt-1.5">
          All previous formulas, rates, and details have been removed. Ready for your specific calculation formulas and rules.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 font-mono">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Awaiting Instructions</span>
        </div>
      </div>
    </div>
  );
};

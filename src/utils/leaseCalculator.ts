/**
 * Lease Deed Stamp Duty & Registration Fee Calculator Utilities
 * Implements duration-based slabs, custom rent escalation, maintenance (monthly/annual), and premium
 */

export interface RentScheduleEntry {
  yearIndex: number;
  startDate: string;
  endDate: string;
  annualRent: number;
}

export interface LeaseInputs {
  tenureYears: number | ''; // 1 to 99 years (blank by default)
  leaseStartDate: string; // YYYY-MM-DD (blank by default)
  leaseEndDate: string; // YYYY-MM-DD (auto-calculated)
  startingRent: number | ''; // blank by default
  rentFrequency: 'monthly' | 'annual'; // monthly by default
  hasEscalation: boolean; // false by default
  escalationYears: number | ''; // e.g. 1 year (or 2, 3)
  escalationPercent: number | ''; // e.g. 7% or 10%
  maintenanceAmount: number | ''; // blank by default
  maintenanceFrequency: 'monthly' | 'annual'; // monthly or annual
  premium: number | ''; // blank by default
  optionFor1to5Years: 'rent_maint' | 'premium'; // Option A (rent+maint) or Option B (premium)
  rounding: boolean;
  scanningFee?: number | '';
  advocateFee?: number | '';
}

export interface LeaseCalculationResult {
  inputs: {
    lease_start_date: string;
    lease_end_date: string;
    tenure_years: number;
    starting_rent: number;
    rent_frequency: string;
    has_escalation: boolean;
    escalation_years: number;
    escalation_percent: number;
    maintenance_amount: number;
    maintenance_frequency: string;
    maintenance_per_year: number;
    premium: number;
    option_1_to_5_years: string;
  };
  duration_years: number;
  total_days: number;
  avg_annual_rent: number;
  maintenance_amount: number;
  maintenance_frequency: 'monthly' | 'annual';
  maintenance_per_year: number;
  avg_annual_rent_with_maint: number;
  premium: number;
  applicable_slab: string;
  stamp_duty: number;
  registration_fee: number;
  total_payable: number;
  formula_latex: string;
  formula_plain: string;
  calculation_steps: string[];
  explanation: string;
  expanded_schedule: RentScheduleEntry[];
}

/**
 * Calculate lease end date from start date and tenure years
 */
export function computeLeaseEndDate(startDateStr: string, years: number): string {
  if (!startDateStr || !years || isNaN(years)) return '';
  const parts = startDateStr.split('-');
  if (parts.length < 3) return '';
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return '';

  const date = new Date(y, m - 1, d);
  date.setFullYear(date.getFullYear() + Math.floor(years));
  const resY = date.getFullYear();
  const resM = String(date.getMonth() + 1).padStart(2, '0');
  const resD = String(date.getDate()).padStart(2, '0');
  return `${resY}-${resM}-${resD}`;
}

/**
 * Calculate exact difference in years using 365.25 days/year
 */
export function computeLeaseDurationYears(startDateStr: string, endDateStr: string): { years: number; days: number } {
  if (!startDateStr || !endDateStr) {
    return { years: 0, days: 0 };
  }
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  const diffMs = end.getTime() - start.getTime();
  if (diffMs <= 0 || isNaN(diffMs)) {
    return { years: 0, days: 0 };
  }

  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const years = Math.round((days / 365.25) * 100) / 100;
  return { years, days };
}

/**
 * Expand rent schedule year by year according to simple custom escalation:
 * e.g., Every 1 year 7%, or Every 2 years 10%, etc.
 */
export function generateRentSchedule(
  startDateStr: string,
  totalYears: number,
  baseAnnualRent: number,
  hasEscalation: boolean,
  escalationYears: number,
  escalationPercent: number
): RentScheduleEntry[] {
  const numYears = Math.max(1, Math.ceil(totalYears));
  const schedule: RentScheduleEntry[] = [];
  const start = startDateStr ? new Date(startDateStr) : new Date();

  let currentRent = baseAnnualRent;
  const escYrs = Math.max(1, Math.floor(escalationYears || 1));
  const escPct = Math.max(0, escalationPercent || 0);

  for (let i = 1; i <= numYears; i++) {
    // Check if escalation applies
    if (i > 1 && hasEscalation && escPct > 0) {
      if ((i - 1) % escYrs === 0) {
        currentRent *= 1 + escPct / 100;
      }
    }

    const yearStart = new Date(start);
    yearStart.setFullYear(start.getFullYear() + (i - 1));
    const yearEnd = new Date(yearStart);
    yearEnd.setFullYear(yearStart.getFullYear() + 1);

    schedule.push({
      yearIndex: i,
      startDate: yearStart.toISOString().split('T')[0],
      endDate: yearEnd.toISOString().split('T')[0],
      annualRent: Math.round(currentRent),
    });
  }

  return schedule;
}

/**
 * Main Lease Calculation Function
 */
export function calculateLease(inputs: LeaseInputs): LeaseCalculationResult {
  const durationYears = typeof inputs.tenureYears === 'number' && inputs.tenureYears > 0 ? inputs.tenureYears : 0;
  const totalDays = Math.round(durationYears * 365.25);

  const baseAnnualRent =
    inputs.rentFrequency === 'monthly'
      ? (typeof inputs.startingRent === 'number' ? inputs.startingRent : 0) * 12
      : typeof inputs.startingRent === 'number'
      ? inputs.startingRent
      : 0;

  const escYrs = typeof inputs.escalationYears === 'number' ? inputs.escalationYears : 1;
  const escPct = typeof inputs.escalationPercent === 'number' ? inputs.escalationPercent : 0;

  const schedule = generateRentSchedule(
    inputs.leaseStartDate,
    durationYears > 0 ? durationYears : 1,
    baseAnnualRent,
    inputs.hasEscalation,
    escYrs,
    escPct
  );

  // If rent or tenure is not yet entered by user, result is 0
  const hasValidInputs = durationYears > 0 && (baseAnnualRent > 0 || (typeof inputs.premium === 'number' && inputs.premium > 0));

  // Step 2: Average Annual Rent
  const totalRentSum = schedule.reduce((sum, item) => sum + item.annualRent, 0);
  const avgAnnualRent = hasValidInputs && schedule.length > 0 ? totalRentSum / schedule.length : 0;

  // Step 3: Add maintenance (monthly or annual)
  const rawMaint = typeof inputs.maintenanceAmount === 'number' ? inputs.maintenanceAmount : 0;
  const maintNum = inputs.maintenanceFrequency === 'monthly' ? rawMaint * 12 : rawMaint;
  const avgAnnualRentWithMaint = avgAnnualRent + (hasValidInputs ? maintNum : 0);

  // Step 4: Stamp duty base and rate by duration
  const premiumNum = typeof inputs.premium === 'number' ? inputs.premium : 0;

  let stampDuty = 0;
  let formulaLatex = '';
  let formulaPlain = '';
  let applicableSlab = '';

  if (!hasValidInputs) {
    applicableSlab = durationYears > 0 ? `${durationYears} Year(s)` : 'Awaiting Inputs';
  } else if (durationYears <= 5) {
    applicableSlab = '1 to 5 years';
    if (inputs.optionFor1to5Years === 'premium' && premiumNum > 0) {
      stampDuty = 0.05 * premiumNum;
      formulaLatex = '\\text{stamp\\_duty} = 0.05 \\times \\text{premium}';
      formulaPlain = `0.05 * premium = 0.05 * Rs. ${premiumNum.toLocaleString('en-IN')}`;
    } else {
      stampDuty = 0.02 * avgAnnualRentWithMaint;
      formulaLatex = '\\text{stamp\\_duty} = 0.02 \\times (\\text{avg\\_annual\\_rent} + \\text{maintenance})';
      formulaPlain = `0.02 * (Rs. ${avgAnnualRent.toLocaleString('en-IN')} + Rs. ${maintNum.toLocaleString('en-IN')})`;
    }
  } else if (durationYears <= 10) {
    applicableSlab = '>5 to 10 years';
    const base = 1.5 * avgAnnualRent + maintNum + premiumNum;
    stampDuty = 0.05 * base;
    formulaLatex = '\\text{stamp\\_duty} = 0.05 \\times (1.5 \\times \\text{avg\\_annual\\_rent} + \\text{maintenance} + \\text{premium})';
    formulaPlain = `0.05 * (1.5 * Rs. ${avgAnnualRent.toLocaleString('en-IN')} + Rs. ${maintNum.toLocaleString('en-IN')} + Rs. ${premiumNum.toLocaleString('en-IN')})`;
  } else if (durationYears <= 20) {
    applicableSlab = '>10 to 20 years';
    const base = 3 * avgAnnualRent + maintNum + premiumNum;
    stampDuty = 0.05 * base;
    formulaLatex = '\\text{stamp\\_duty} = 0.05 \\times (3 \\times \\text{avg\\_annual\\_rent} + \\text{maintenance} + \\text{premium})';
    formulaPlain = `0.05 * (3 * Rs. ${avgAnnualRent.toLocaleString('en-IN')} + Rs. ${maintNum.toLocaleString('en-IN')} + Rs. ${premiumNum.toLocaleString('en-IN')})`;
  } else {
    applicableSlab = '>20 to 99 years';
    const base = 5 * avgAnnualRent + maintNum + premiumNum;
    stampDuty = 0.05 * base;
    formulaLatex = '\\text{stamp\\_duty} = 0.05 \\times (5 \\times \\text{avg\\_annual\\_rent} + \\text{maintenance} + \\text{premium})';
    formulaPlain = `0.05 * (5 * Rs. ${avgAnnualRent.toLocaleString('en-IN')} + Rs. ${maintNum.toLocaleString('en-IN')} + Rs. ${premiumNum.toLocaleString('en-IN')})`;
  }

  // Step 5: Registration fee = 0.75 * stamp_duty
  let registrationFee = 0.75 * stampDuty;

  if (inputs.rounding) {
    stampDuty = Math.round(stampDuty);
    registrationFee = Math.round(registrationFee);
  }

  const totalPayable = stampDuty + registrationFee;

  const steps: string[] = hasValidInputs
    ? [
        `Step 1: Lease tenure: ${durationYears} years.`,
        `Step 2: Computed average annual rent: Rs. ${Math.round(avgAnnualRent).toLocaleString('en-IN')}.`,
        maintNum > 0
          ? `Step 3: Applied maintenance: Rs. ${maintNum.toLocaleString('en-IN')}/year (${inputs.maintenanceFrequency === 'monthly' ? `Rs. ${rawMaint}/mo` : 'Annual'}).`
          : `Step 3: Maintenance: Rs. 0.`,
        `Step 4: Applied ${applicableSlab} formula: Rs. ${stampDuty.toLocaleString('en-IN')}.`,
        `Step 5: Registration fee: 0.75 * Stamp Duty = Rs. ${registrationFee.toLocaleString('en-IN')}.`,
      ]
    : ['Enter lease tenure and rent to compute calculation steps.'];

  const explanation = hasValidInputs
    ? `Lease Deed of ${durationYears} years (${applicableSlab}). Average Annual Rent is Rs. ${Math.round(avgAnnualRent).toLocaleString('en-IN')}${maintNum > 0 ? ` and Maintenance is Rs. ${maintNum.toLocaleString('en-IN')}/year` : ''}. Stamp Duty is Rs. ${stampDuty.toLocaleString('en-IN')} and Registration Fee is Rs. ${registrationFee.toLocaleString('en-IN')}, totaling Rs. ${totalPayable.toLocaleString('en-IN')}.`
    : 'Please enter lease tenure and rent amount to see valuation summary.';

  return {
    inputs: {
      lease_start_date: inputs.leaseStartDate,
      lease_end_date: inputs.leaseEndDate,
      tenure_years: durationYears,
      starting_rent: typeof inputs.startingRent === 'number' ? inputs.startingRent : 0,
      rent_frequency: inputs.rentFrequency,
      has_escalation: inputs.hasEscalation,
      escalation_years: escYrs,
      escalation_percent: escPct,
      maintenance_amount: rawMaint,
      maintenance_frequency: inputs.maintenanceFrequency,
      maintenance_per_year: maintNum,
      premium: premiumNum,
      option_1_to_5_years: inputs.optionFor1to5Years,
    },
    duration_years: durationYears,
    total_days: totalDays,
    avg_annual_rent: Math.round(avgAnnualRent),
    maintenance_amount: rawMaint,
    maintenance_frequency: inputs.maintenanceFrequency,
    maintenance_per_year: maintNum,
    avg_annual_rent_with_maint: Math.round(avgAnnualRentWithMaint),
    premium: premiumNum,
    applicable_slab: applicableSlab,
    stamp_duty: stampDuty,
    registration_fee: registrationFee,
    total_payable: totalPayable,
    formula_latex: formulaLatex,
    formula_plain: formulaPlain,
    calculation_steps: steps,
    explanation,
    expanded_schedule: schedule,
  };
}

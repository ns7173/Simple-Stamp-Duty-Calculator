import { ValuationResult } from '../../types/calculator';
import { numberToIndianWords, numberToHindiWords } from '../../utils/units';

export function getLeaseSummaryText(result: ValuationResult, currentState: any): string {
  const tenureStr = currentState?.tenureYears ? `${currentState.tenureYears}` : '.....';
  const incRateStr =
    currentState?.hasEscalation &&
    currentState?.escalationPercent !== '' &&
    currentState?.escalationPercent !== undefined
      ? `${currentState.escalationPercent}`
      : '.....';
  const incYearStr =
    currentState?.hasEscalation && currentState?.escalationYears
      ? `${currentState.escalationYears}`
      : '........';
  const rentNum = currentState?.startingRent
    ? currentState.rentFrequency === 'monthly'
      ? currentState.startingRent
      : Math.round(currentState.startingRent / 12)
    : 0;
  const rentStr = rentNum > 0 ? rentNum.toLocaleString('en-IN') : '......';
  const stampDutyStr = result.stampDutyAmount > 0 ? result.stampDutyAmount.toLocaleString('en-IN') : '.............';
  const regFeeStr = result.registrationFeeAmount > 0 ? result.registrationFeeAmount.toLocaleString('en-IN') : '.............';
  const scanningStr = result.scanningFee !== undefined && result.scanningFee > 0 ? result.scanningFee.toLocaleString('en-IN') : '.............';
  const advocateStr = result.advocateFee !== undefined && result.advocateFee > 0 ? result.advocateFee.toLocaleString('en-IN') : '10,000';
  const totalPayable = result.grandTotalCharges || (result.stampDutyAmount + result.registrationFeeAmount + (result.scanningFee || 0) + (result.advocateFee || 0));
  const totalStr = totalPayable > 0 ? totalPayable.toLocaleString('en-IN') : '.................';
  const wordsEn = totalPayable > 0 ? numberToIndianWords(totalPayable) : '........................ Rupees Only';
  const wordsHi = totalPayable > 0 ? numberToHindiWords(totalPayable) : '................ रुपये मात्र';

  return `Lease / Rent Agreement (पट्टा विलेख) -
Stamp Duty & Registration Fees Summary*
Lease Tenure ${tenureStr} years
Increment Rate ${incRateStr} %
every ${incYearStr} year
Rent Rs. ${rentStr} Per Month
….......…............….............................................
Stamp Duty: Rs. ${stampDutyStr}
Registration Fees: Rs. ${regFeeStr}
Scanning Charges: Rs. ${scanningStr} (Approx)
Advocate Fees: Rs. ${advocateStr}
.......…............…..................................................
TOTAL ESTIMATED PAYABLE:* Rs. ${totalStr}
(${wordsEn} / ${wordsHi})`.trim();
}

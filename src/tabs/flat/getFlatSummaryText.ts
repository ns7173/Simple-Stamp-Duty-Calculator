import { ValuationResult } from '../../types/calculator';
import { formatINR, numberToIndianWords } from '../../utils/units';

export function getFlatSummaryText(
  result: ValuationResult,
  title: string,
  dateStr?: string
): string {
  const scanningLine =
    result.scanningFee && result.scanningFee > 0
      ? `3. Scanning Fee (स्कैनिंग शुल्क): लगभग / Approx ${formatINR(result.scanningFee)}\n`
      : '';
  const advocateLine =
    result.advocateFee && result.advocateFee > 0
      ? `4. Advocate Fees (अधिवक्ता शुल्क): ${formatINR(result.advocateFee)}\n`
      : '';

  const total = result.grandTotalCharges || (result.stampDutyAmount + result.registrationFeeAmount + (result.scanningFee || 0) + (result.advocateFee || 0));

  return `📄 *${title} - Stamp Duty & Registration Summary*
${dateStr ? `*Date:* ${dateStr}\n` : ''}Total Value / Assessment Base: ${formatINR(result.totalGovtValue)}
Consideration / Transaction Value: ${formatINR(result.considerationValue)}
──────────────────────
1. Stamp Duty: ${formatINR(result.stampDutyAmount)}
2. Registration Fee: ${formatINR(result.registrationFeeAmount)}
${scanningLine}${advocateLine}──────────────────────
*TOTAL ESTIMATED PAYABLE:* ${formatINR(total)}
(${numberToIndianWords(total)})`.trim();
}

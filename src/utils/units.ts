import { AreaUnit, RateUnit } from '../types/calculator';

// Conversion factors to standard Square Metres (sqmt)
export const AREA_TO_SQMT: Record<AreaUnit, number> = {
  sqmt: 1,
  sqft: 0.09290304,
  hectare: 10000,
  acre: 4046.8564224,
  dismil: 40.468564224,
};

export const RATE_UNIT_TO_SQMT: Record<RateUnit, number> = {
  sqmt: 1,
  sqft: 0.09290304,
  hectare: 10000,
  acre: 4046.8564224,
};

export const AREA_UNITS_CONFIG = [
  { id: 'sqft' as AreaUnit, label: 'Square Feet (sq.ft)', short: 'sqft', factorDesc: '1 sq.ft = 0.0929 sq.mt' },
  { id: 'sqmt' as AreaUnit, label: 'Square Metres (sq.mt)', short: 'sqmt', factorDesc: '1 sq.mt = 10.764 sq.ft' },
  { id: 'hectare' as AreaUnit, label: 'Hectare (ha)', short: 'Hectare', factorDesc: '1 Hectare = 10,000 sq.mt (2.47 Acres)' },
  { id: 'acre' as AreaUnit, label: 'Acre (ac)', short: 'Acre', factorDesc: '1 Acre = 4,046.86 sq.mt (100 Dismil)' },
  { id: 'dismil' as AreaUnit, label: 'Dismil / Decimal', short: 'Dismil', factorDesc: '1 Dismil = 435.6 sq.ft (1/100 Acre)' },
];

export const RATE_UNITS_CONFIG = [
  { id: 'sqmt' as RateUnit, label: 'Rs. per sq.mt', perLabel: '/sq.mt' },
  { id: 'sqft' as RateUnit, label: 'Rs. per sq.ft', perLabel: '/sq.ft' },
  { id: 'hectare' as RateUnit, label: 'Rs. per Hectare', perLabel: '/Hectare' },
  { id: 'acre' as RateUnit, label: 'Rs. per Acre', perLabel: '/Acre' },
];

/**
 * Convert any area from fromUnit to toUnit
 */
export function convertArea(area: number, fromUnit: AreaUnit, toUnit: AreaUnit | RateUnit): number {
  if (!area || isNaN(area)) return 0;
  const areaInSqmt = area * AREA_TO_SQMT[fromUnit];
  const targetFactor = RATE_UNIT_TO_SQMT[toUnit as RateUnit] || AREA_TO_SQMT[toUnit as AreaUnit];
  return areaInSqmt / targetFactor;
}

/**
 * Format number in Indian Rupee representation (e.g. Rs. 15,20,500)
 */
export function formatINR(val: number | '' | undefined | null, includeDecimals = false): string {
  if (val === '' || val === undefined || val === null || isNaN(Number(val))) {
    return 'Rs. 0';
  }
  const num = Math.round(Number(val) * 100) / 100;
  return 'Rs. ' + num.toLocaleString('en-IN', {
    maximumFractionDigits: includeDecimals ? 2 : 0,
    minimumFractionDigits: 0,
  });
}

/**
 * Short representation for easy reading (e.g., Rs. 25.50 Lakhs or Rs. 1.20 Cr)
 */
export function formatINRShort(val: number): string {
  if (!val || isNaN(val)) return 'Rs. 0';
  const absVal = Math.abs(val);
  if (absVal >= 10000000) {
    return `Rs. ${(val / 10000000).toFixed(2)} Cr`;
  }
  if (absVal >= 100000) {
    return `Rs. ${(val / 100000).toFixed(2)} Lakhs`;
  }
  if (absVal >= 1000) {
    return `Rs. ${(val / 1000).toFixed(1)} K`;
  }
  return `Rs. ${Math.round(val).toLocaleString('en-IN')}`;
}

/**
 * Convert numbers to Indian English Words (Rupees)
 */
export function numberToEnglishWords(n: number): string {
  if (isNaN(n) || n === 0) return 'Zero Rupees Only';
  const single = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teen = [
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertTwoDigits = (num: number): string => {
    if (num === 0) return '';
    if (num < 10) return single[num];
    if (num < 20) return teen[num - 10];
    const unit = num % 10;
    const ten = Math.floor(num / 10);
    return tens[ten] + (unit ? ' ' + single[unit] : '');
  };

  const convertThreeDigits = (num: number): string => {
    const hundred = Math.floor(num / 100);
    const rest = num % 100;
    let str = '';
    if (hundred > 0) {
      str += single[hundred] + ' Hundred';
      if (rest > 0) str += ' and ';
    }
    if (rest > 0) {
      str += convertTwoDigits(rest);
    }
    return str;
  };

  const absVal = Math.abs(n);
  let num = Math.floor(absVal);
  const paise = Math.round((absVal - num) * 100);

  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const hundredAndBelow = num;

  const parts: string[] = [];
  if (crore > 0) {
    parts.push(convertThreeDigits(crore) + ' Crore');
  }
  if (lakh > 0) {
    parts.push(convertTwoDigits(lakh) + ' Lakh');
  }
  if (thousand > 0) {
    parts.push(convertTwoDigits(thousand) + ' Thousand');
  }
  if (hundredAndBelow > 0) {
    parts.push(convertThreeDigits(hundredAndBelow));
  }

  let result = parts.length > 0 ? parts.join(' ') + ' Rupees' : '';
  if (paise > 0) {
    const paiseStr = convertTwoDigits(paise) + ' Paise';
    result = result ? `${result} and ${paiseStr}` : `${paiseStr}`;
  }
  return (result || 'Zero Rupees') + ' Only';
}

/**
 * Hindi unit and tens words (0 to 99)
 */
const HINDI_NUMBERS: string[] = [
  'शून्य', 'एक', 'दो', 'तीन', 'चार', 'पाँच', 'छह', 'सात', 'आठ', 'नौ',
  'दस', 'ग्यारह', 'बारह', 'तेरह', 'चौदह', 'पंद्रह', 'सोलह', 'सत्रह', 'अठारह', 'उन्नीस',
  'बीस', 'इक्कीस', 'बाईस', 'तेईस', 'चौबीस', 'पच्चीस', 'छब्बीस', 'सत्ताईस', 'अट्ठाईस', 'उनतीस',
  'तीस', 'इकत्तीस', 'बत्तीस', 'तैंतीस', 'चौंतीस', 'पैंतीस', 'छत्तीस', 'सैंतीस', 'अड़तीस', 'उनतालीस',
  'चालीस', 'इकतालीस', 'बयालीस', 'तैंतालीस', 'चवालीस', 'पैंतालीस', 'छियालीस', 'सैंतालीस', 'अड़तालीस', 'उनचास',
  'पचास', 'इक्यावन', 'बावन', 'तिरपन', 'चौवन', 'पचपन', 'छप्पन', 'सत्तावन', 'अट्ठावन', 'उनसठ',
  'साठ', 'इकसठ', 'बासठ', 'तिरसठ', 'चौंसठ', 'पैंसठ', 'छियासठ', 'सरसठ', 'अड़सठ', 'उनहत्तर',
  'सत्तर', 'इकहत्तर', 'बहत्तर', 'तिहत्तर', 'चौहत्तर', 'पचहत्तर', 'छिहत्तर', 'सतहत्तर', 'अठहत्तर', 'उन्यासी',
  'अस्सी', 'इक्यासी', 'बयासी', 'तिरासी', 'चौरासी', 'पचासी', 'छियासी', 'सत्तासी', 'अट्ठासी', 'नवासी',
  'नब्बे', 'इक्यानवे', 'बानवे', 'तिरानवे', 'चौरानवे', 'पंचानवे', 'छियानवे', 'सत्तानवे', 'अट्ठानवे', 'निन्यानवे'
];

/**
 * Convert numbers to Indian Hindi Words (रुपये मात्र)
 */
export function numberToHindiWords(n: number): string {
  if (isNaN(n) || n === 0) return 'शून्य रुपये मात्र';

  const convertTwoDigitsHindi = (num: number): string => {
    if (num <= 0) return '';
    if (num < 100) return HINDI_NUMBERS[num];
    return '';
  };

  const convertThreeDigitsHindi = (num: number): string => {
    const hundred = Math.floor(num / 100);
    const rest = num % 100;
    let str = '';
    if (hundred > 0 && hundred < 100) {
      str += HINDI_NUMBERS[hundred] + ' सौ';
      if (rest > 0) str += ' ';
    }
    if (rest > 0) {
      str += convertTwoDigitsHindi(rest);
    }
    return str;
  };

  const absVal = Math.abs(n);
  let num = Math.floor(absVal);
  const paise = Math.round((absVal - num) * 100);

  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const hundredAndBelow = num;

  const parts: string[] = [];
  if (crore > 0) {
    parts.push(convertThreeDigitsHindi(crore) + ' करोड़');
  }
  if (lakh > 0) {
    parts.push(convertTwoDigitsHindi(lakh) + ' लाख');
  }
  if (thousand > 0) {
    parts.push(convertTwoDigitsHindi(thousand) + ' हज़ार');
  }
  if (hundredAndBelow > 0) {
    parts.push(convertThreeDigitsHindi(hundredAndBelow));
  }

  let result = parts.length > 0 ? parts.join(' ') + ' रुपये' : '';
  if (paise > 0 && paise < 100) {
    const paiseStr = convertTwoDigitsHindi(paise) + ' पैसे';
    result = result ? `${result} और ${paiseStr}` : `${paiseStr}`;
  }
  return (result || 'शून्य रुपये') + ' मात्र';
}

/**
 * Convert numbers to Both English and Hindi Words (Bilingual Display)
 * Example: "Twenty Six Lakh Rupees Only / छब्बीस लाख रुपये मात्र"
 */
export function numberToIndianWords(n: number): string {
  if (isNaN(n) || n === 0) return 'Zero Rupees Only / शून्य रुपये मात्र';
  const en = numberToEnglishWords(n);
  const hi = numberToHindiWords(n);
  return `${en} / ${hi}`;
}

export function numberToBilingualWords(n: number): { en: string; hi: string; combined: string } {
  const en = numberToEnglishWords(n);
  const hi = numberToHindiWords(n);
  return {
    en,
    hi,
    combined: `${en} / ${hi}`,
  };
}

/**
 * Nicely format decimal numbers with precision
 */
export function formatNumber(val: number, maxDecimals = 4): string {
  if (isNaN(val)) return '0';
  return Number(val.toFixed(maxDecimals)).toLocaleString('en-IN');
}

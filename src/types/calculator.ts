export type AreaUnit = 'sqft' | 'sqmt' | 'hectare' | 'acre' | 'dismil';
export type RateUnit = 'sqmt' | 'sqft' | 'hectare' | 'acre';
export type CalculationBase = 'govt' | 'consideration' | 'higher';
export type ActiveTab = 'plot' | 'building' | 'flat' | 'lease';

export interface UnitDefinition {
  id: AreaUnit;
  label: string;
  shortLabel: string;
  sqmtFactor: number; // 1 unit = x sqmt
  description: string;
}

export interface RateUnitDefinition {
  id: RateUnit;
  label: string;
  perLabel: string;
  sqmtFactor: number; // 1 rate unit = x sqmt
}

// Tab 1: Plot State
export interface PlotState {
  landArea: number | '';
  landAreaUnit: AreaUnit;
  guidelineRate: number | '';
  guidelineRateUnit: RateUnit;
  considerationValue: number | '';
  considerationMode: 'direct' | 'calculated';
  considerationRate: number | '';
  considerationRateUnit: 'sqft' | 'sqmt';
  stampDutyBase: CalculationBase;
  stampDutyRate: number | ''; // Stamp Duty %
  registrationFeeBase: CalculationBase;
  registrationFeeRate: number | ''; // Registration Fee %
  additionalCessPercent: number; // Surcharge / Local Cess %
  fixedCharges: number; // Fixed fee in Rs.
  scanningFee?: number | ''; // Scanning fee in Rs.
  advocateFee?: number | ''; // Advocate fee in Rs. (default: 10,000)
}

// Tab 2: Building State
export type BuildingType = 'residential' | 'commercial_shop' | 'office' | 'godown' | 'industrial';
export type ConstructionInputMode = 'complete' | 'floorwise';

export interface FloorItem {
  id: string;
  name: string; // e.g., "Ground Floor", "First Floor"
  area: number | '';
  rate: number | ''; // Floor-specific rate override, or empty for default
}

export interface BuildingState {
  buildingType: BuildingType;
  // Land Component
  landArea: number | '';
  landAreaUnit: AreaUnit;
  landGuidelineRate: number | '';
  landGuidelineRateUnit: RateUnit;
  // Construction Component
  constructionMode: ConstructionInputMode;
  completeConstructedArea: number | '';
  completeConstructionUnit: 'sqft' | 'sqmt';
  floors: FloorItem[];
  floorAreaUnit: 'sqft' | 'sqmt';
  defaultConstructionRate: number | '';
  defaultConstructionRateUnit: 'sqft' | 'sqmt';
  // Consideration
  considerationValue: number | '';
  considerationMode: 'direct' | 'calculated';
  // Duty & Fees
  stampDutyBase: CalculationBase;
  stampDutyRate: number | '';
  registrationFeeBase: CalculationBase;
  registrationFeeRate: number | '';
  additionalCessPercent: number;
  fixedCharges: number;
  scanningFee?: number | '';
  advocateFee?: number | '';
}

// Tab 3: Flat State
export interface FlatState {
  // Land Share Valuation (UDS / Land Component)
  landArea: number | '';
  landAreaUnit: AreaUnit;
  landGuidelineRate: number | '';
  landGuidelineRateUnit: RateUnit;
  hasLandDiscount: boolean;
  landDiscountType: 'percent' | 'flat_rate';
  landDiscountValue: number | ''; // e.g. 10% or Rs 200/sqmt off

  // Construction Valuation
  superBuiltUpArea: number | '';
  builtUpAreaUnit: 'sqft' | 'sqmt';
  constructionGuidelineRate: number | '';
  constructionRateUnit: 'sqft' | 'sqmt';
  hasConstructionConcession: boolean;
  constructionConcessionType: 'percent' | 'flat_rate';
  constructionConcessionValue: number | ''; // e.g., 5% depreciation/rebate

  // Amenities / Parking (optional common flat additions)
  includeParking: boolean;
  parkingCost: number | '';
  includeAmenities: boolean;
  amenitiesCost: number | '';

  // Consideration
  considerationValue: number | '';
  considerationMode: 'direct' | 'calculated';

  // Duty & Fees
  stampDutyBase: CalculationBase;
  stampDutyRate: number; // Stamp Duty %
  registrationFeeBase: CalculationBase;
  registrationFeeRate: number; // Registration Fee %
  additionalCessPercent: number;
  fixedCharges: number;
  scanningFee?: number | '';
  advocateFee?: number | '';
}

// Tab 4: Lease State
export type LeaseValuationMethod = 'term_slab' | 'total_rent_deposit' | 'average_annual_rent' | 'capitalized_guideline';

export interface LeaseState {
  leasePeriodYears: number; // 1 to 99
  leasePeriodMonths: number; // 0 to 11
  monthlyRent: number | '';
  annualRent: number | '';
  rentInputMode: 'monthly' | 'annual';
  securityDepositRefundable: number | '';
  premiumAdvanceNonRefundable: number | '';
  annualEscalationPercent: number | ''; // optional e.g. 5% per year
  propertyGuidelineValue: number | ''; // for very long leases / 99 years lease deed comparison
  valuationMethod: LeaseValuationMethod;
  considerationValue: number | '';
  stampDutyBase: CalculationBase;
  stampDutyRate: number; // Stamp Duty %
  registrationFeeBase: CalculationBase;
  registrationFeeRate: number; // Registration Fee %
  additionalCessPercent: number;
  fixedCharges: number;
}

// Detailed calculation result schema
export interface ValuationResult {
  // Land
  landAreaOriginal: number;
  landAreaUnit: AreaUnit;
  landAreaInRateUnit: number;
  landGuidelineRate: number;
  landRateUnit: RateUnit;
  landGovtValueRaw: number;
  landDiscountAmount: number;
  landGovtValueNet: number;

  // Construction
  hasConstruction: boolean;
  constructionAreaOriginal: number;
  constructionAreaUnit: 'sqft' | 'sqmt';
  constructionGuidelineRate: number;
  constructionRateUnit: 'sqft' | 'sqmt';
  constructionGovtValueRaw: number;
  constructionConcessionAmount: number;
  constructionGovtValueNet: number;
  floorwiseBreakdown?: { name: string; area: number; rate: number; value: number }[];

  // Extras (Parking, Amenities)
  extrasGovtValue: number;

  // Total Government Value
  totalGovtValue: number; // Land Value + Construction Value

  // Consideration
  considerationValue: number; // Actual sale deed price

  // Selected bases
  stampDutyBaseType: CalculationBase;
  stampDutyApplicableBase: number;
  stampDutyBaseFormula: string;

  registrationFeeBaseType: CalculationBase;
  registrationFeeApplicableBase: number;
  registrationFeeBaseFormula: string;

  // Duty and Fees
  stampDutyRate: number;
  stampDutyAmount: number;

  registrationFeeRate: number;
  registrationFeeAmount: number;

  cessRate: number;
  cessAmount: number;
  fixedCharges: number;
  scanningFee?: number;
  advocateFee?: number;

  grandTotalCharges: number; // Stamp Duty + Reg Fee + Cess + Fixed + Scanning + Advocate
}

import { CalculationBase } from '../../types/calculator';

export type FloorType = 'ground' | 'basement_first' | 'second_plus' | 'custom';
export type DiscountApplyOn = 'construction_only' | 'guideline_only' | 'both';

export interface FlatFormState {
  floorType: FloorType;
  customDiscountPercent: number | '';
  discountApplyOn: DiscountApplyOn;
  guidelineRate: number | '';
  guidelineRateUnit: 'sqft' | 'sqmt';
  constructionRate: number | '';
  constructionRateUnit: 'sqft' | 'sqmt';
  builtUpArea: number | '';
  builtUpAreaUnit: 'sqft' | 'sqmt';
  considerationValue: number | '';
  stampDutyBase: CalculationBase;
  stampDutyRate: number | '';
  registrationFeeBase: CalculationBase;
  registrationFeeRate: number | '';
  scanningFee?: number | '';
  advocateFee?: number | '';
}

export const BLANK_FLAT_STATE: FlatFormState = {
  floorType: 'ground',
  customDiscountPercent: '',
  discountApplyOn: 'construction_only',
  guidelineRate: '',
  guidelineRateUnit: 'sqft',
  constructionRate: '',
  constructionRateUnit: 'sqft',
  builtUpArea: '',
  builtUpAreaUnit: 'sqft',
  considerationValue: '',
  stampDutyBase: 'higher',
  stampDutyRate: '',
  registrationFeeBase: 'higher',
  registrationFeeRate: '',
  scanningFee: '',
  advocateFee: 10000,
};

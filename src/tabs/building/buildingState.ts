import { AreaUnit, RateUnit, CalculationBase } from '../../types/calculator';

export type BuildingType = 'residential' | 'commercial_shop' | 'office' | 'godown' | 'industrial';
export type ConstructionInputMode = 'complete' | 'floorwise';

export interface FloorItem {
  id: string;
  name: string;
  area: number | '';
  rate: number | '';
}

export interface BuildingState {
  buildingType: BuildingType;
  landArea: number | '';
  landAreaUnit: AreaUnit;
  landGuidelineRate: number | '';
  landGuidelineRateUnit: RateUnit;
  constructionMode: ConstructionInputMode;
  completeConstructedArea: number | '';
  completeConstructionUnit: 'sqft' | 'sqmt';
  floors: FloorItem[];
  floorAreaUnit: 'sqft' | 'sqmt';
  defaultConstructionRate: number | '';
  defaultConstructionRateUnit: 'sqft' | 'sqmt';
  considerationValue: number | '';
  considerationMode: 'direct' | 'calculated';
  stampDutyBase: CalculationBase;
  stampDutyRate: number | '';
  registrationFeeBase: CalculationBase;
  registrationFeeRate: number | '';
  additionalCessPercent: number;
  fixedCharges: number;
  scanningFee?: number | '';
  advocateFee?: number | '';
}

export const initialBuildingState: BuildingState = {
  buildingType: 'residential',
  landArea: '',
  landAreaUnit: 'sqft',
  landGuidelineRate: '',
  landGuidelineRateUnit: 'sqmt',
  constructionMode: 'complete',
  completeConstructedArea: '',
  completeConstructionUnit: 'sqft',
  floors: [
    { id: '1', name: 'Ground Floor', area: '', rate: '' },
  ],
  floorAreaUnit: 'sqft',
  defaultConstructionRate: '',
  defaultConstructionRateUnit: 'sqft',
  considerationValue: '',
  considerationMode: 'direct',
  stampDutyBase: 'higher',
  stampDutyRate: '',
  registrationFeeBase: 'higher',
  registrationFeeRate: '',
  additionalCessPercent: 0,
  fixedCharges: 0,
  scanningFee: '',
  advocateFee: 10000,
};

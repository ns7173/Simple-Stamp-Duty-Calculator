import { AreaUnit, RateUnit, CalculationBase } from '../../types/calculator';

export type ConsiderationMode = 'direct' | 'calculated';

export interface PlotState {
  landArea: number | '';
  landAreaUnit: AreaUnit;
  guidelineRate: number | '';
  guidelineRateUnit: RateUnit;
  considerationValue: number | '';
  considerationMode: ConsiderationMode;
  considerationRate: number | '';
  considerationRateUnit: RateUnit;
  stampDutyBase: CalculationBase;
  stampDutyRate: number | '';
  registrationFeeBase: CalculationBase;
  registrationFeeRate: number | '';
  additionalCessPercent?: number;
  fixedCharges?: number;
  scanningFee?: number | '';
  advocateFee?: number | '';
}

export const initialPlotState: PlotState = {
  landArea: '',
  landAreaUnit: 'sqft',
  guidelineRate: '',
  guidelineRateUnit: 'sqmt',
  considerationValue: '',
  considerationMode: 'direct',
  considerationRate: '',
  considerationRateUnit: 'sqft',
  stampDutyBase: 'higher',
  stampDutyRate: '',
  registrationFeeBase: 'higher',
  registrationFeeRate: '',
  additionalCessPercent: 0,
  fixedCharges: 0,
  scanningFee: '',
  advocateFee: 10000,
};

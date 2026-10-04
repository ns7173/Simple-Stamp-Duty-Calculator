export interface StateRatePreset {
  id: string;
  name: string;
  defaultStampDutyMale: number;
  defaultStampDutyFemale: number;
  defaultRegistrationFee: number;
  notes: string;
}

export const INDIAN_STATE_PRESETS: StateRatePreset[] = [
  {
    id: 'custom',
    name: 'Custom / Manual Rates',
    defaultStampDutyMale: 5.0,
    defaultStampDutyFemale: 5.0,
    defaultRegistrationFee: 1.0,
    notes: 'Enter any custom percentage values as per local sub-registrar directives.',
  },
  {
    id: 'maharashtra',
    name: 'Maharashtra',
    defaultStampDutyMale: 6.0, // 5% + 1% Metro cess in major cities
    defaultStampDutyFemale: 5.0,
    defaultRegistrationFee: 1.0, // capped at 30k in some, or 1%
    notes: 'Stamp Duty: 5-6% (incl. 1% Metro Cess/LBT). Reg Fee: 1% (Subject to Rs. 30,000 cap in rural/semi-urban areas).',
  },
  {
    id: 'delhi',
    name: 'Delhi (NCT)',
    defaultStampDutyMale: 6.0, // 4% duty + 2% municipal cess
    defaultStampDutyFemale: 4.0, // 3% duty + 1% municipal cess
    defaultRegistrationFee: 1.0,
    notes: 'Male: 6% (4% + 2% MCD cess). Female: 4% (3% + 1% MCD cess). Reg fee: 1% + Rs. 100 pasting.',
  },
  {
    id: 'up',
    name: 'Uttar Pradesh (UP)',
    defaultStampDutyMale: 7.0,
    defaultStampDutyFemale: 6.0,
    defaultRegistrationFee: 1.0,
    notes: 'Standard 7% (1% discount for females up to Rs. 10 Lakh value). Registration fee: 1% (or fixed slabs).',
  },
  {
    id: 'karnataka',
    name: 'Karnataka',
    defaultStampDutyMale: 5.0,
    defaultStampDutyFemale: 5.0,
    defaultRegistrationFee: 2.0,
    notes: 'Properties > Rs. 45 Lakh: 5% Stamp Duty + 2% Reg Fee + 10% cess + 2% surcharge on duty.',
  },
  {
    id: 'rajasthan',
    name: 'Rajasthan',
    defaultStampDutyMale: 6.0,
    defaultStampDutyFemale: 5.0,
    defaultRegistrationFee: 1.0,
    notes: 'Stamp Duty: 6% for Male, 5% for Female. Registration Fee: 1% + 30% surcharge on duty for cow protection/drought.',
  },
  {
    id: 'mp',
    name: 'Madhya Pradesh (MP)',
    defaultStampDutyMale: 7.5, // 5% + 2% Janpad + 0.5% UPKAR
    defaultStampDutyFemale: 7.5,
    defaultRegistrationFee: 3.0,
    notes: 'Standard Stamp Duty: 7.5% (approx 5% base + local cess). Registration Fee: 3%.',
  },
  {
    id: 'gujarat',
    name: 'Gujarat',
    defaultStampDutyMale: 4.9,
    defaultStampDutyFemale: 4.9,
    defaultRegistrationFee: 1.0, // Women exempt from 1% reg fee in Gujarat
    notes: 'Basic Stamp Duty 3.5% + 1.4% surcharge = 4.9%. Registration fee 1% (Women buyers exempted from Reg fee).',
  },
  {
    id: 'tamilnadu',
    name: 'Tamil Nadu',
    defaultStampDutyMale: 7.0,
    defaultStampDutyFemale: 7.0,
    defaultRegistrationFee: 2.0, // Revised to 2% in recent budget
    notes: 'Stamp Duty: 7% on market value. Registration Fee: 2% (reduced from 4% for sale deed).',
  },
  {
    id: 'westbengal',
    name: 'West Bengal',
    defaultStampDutyMale: 6.0,
    defaultStampDutyFemale: 6.0,
    defaultRegistrationFee: 1.0,
    notes: 'Urban areas: 6% (or 7% if above Rs. 1 Cr). Panchayats: 5%. Reg Fee: 1%.',
  },
  {
    id: 'bihar',
    name: 'Bihar',
    defaultStampDutyMale: 6.0,
    defaultStampDutyFemale: 5.7,
    defaultRegistrationFee: 2.0,
    notes: 'Male: 6.0%, Female: 5.7%. Registration fee: 2% on Minimum Value Register (MVR).',
  },
  {
    id: 'haryana',
    name: 'Haryana',
    defaultStampDutyMale: 7.0,
    defaultStampDutyFemale: 5.0,
    defaultRegistrationFee: 1.0,
    notes: 'Urban Male: 7%, Urban Female: 5%. Rural: 5% Male, 3% Female. Reg Fee slab up to Rs. 50,000.',
  },
];

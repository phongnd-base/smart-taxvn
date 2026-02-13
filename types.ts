export enum Region {
  I = 1,
  II = 2,
  III = 3,
  IV = 4,
}

export interface TaxBracket {
  max: number; // Mức thu nhập tối đa của bậc (VND)
  rate: number; // Thuế suất (0.05 = 5%)
}

export interface TaxConfig {
  id: string;
  name: string;
  baseSalary: number; // Lương cơ sở
  regionalMinWage: Record<Region, number>; // Lương tối thiểu vùng
  insurance: {
    social: number; // BHXH
    health: number; // BHYT
    unemployment: number; // BHTN
    socialCapMultiplier: number; // Hệ số trần BHXH/BHYT (20 lần lương cơ sở)
    unemploymentCapMultiplier: number; // Hệ số trần BHTN (20 lần lương tối thiểu vùng)
  };
  deduction: {
    personal: number; // Giảm trừ bản thân
    dependent: number; // Giảm trừ người phụ thuộc
  };
  brackets: TaxBracket[]; // Biểu thuế lũy tiến
}

export type IncomeType = 'SALARY_LIKE' | 'FREELANCE' | 'INVESTMENT' | 'NON_TAXABLE';

export interface AdditionalIncome {
  id: string;
  type: IncomeType; 
  amount: number;
  label: string;
}

export interface CalculationInput {
  income: number;
  incomeType: 'GROSS' | 'NET';
  region: Region;
  dependents: number;
  insuranceSalary: number; // Mức đóng bảo hiểm (nếu mode là CUSTOM)
  insuranceMode: 'OFFICIAL' | 'CUSTOM'; // OFFICIAL: Theo lương chính, CUSTOM: Nhập tay
  otherDeductions: number; 
  additionalIncomes: AdditionalIncome[];
}

export interface TaxBracketDetail {
  level: number;
  rate: number;
  maxIncome: number; // Mức max của bậc này (để hiển thị label)
  minIncome: number; // Mức min của bậc này
  taxedAmount: number; // Thu nhập chịu thuế rơi vào bậc này
  taxAmount: number; // Tiền thuế phải đóng cho bậc này
}

export interface TaxResult {
  gross: number; // Lương Gross gốc
  net: number; // Lương Net từ lương gốc
  socialInsurance: number;
  healthInsurance: number;
  unemploymentInsurance: number;
  incomeBeforeTax: number; 
  taxableIncome: number; 
  personalIncomeTax: number;
  
  // Chi tiết từng bậc thuế để hiển thị bảng
  detailTax: TaxBracketDetail[];
  
  // Tổng hợp
  totalTax: number; // Tổng thuế
  totalNet: number; // Tổng thực nhận (bao gồm cả miễn thuế)
  additionalTaxDetails: { label: string; amount: number; tax: number; net: number; typeName: string }[];
}

export interface AiAdviceResponse {
  answer: string;
}
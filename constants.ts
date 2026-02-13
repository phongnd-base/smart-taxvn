import { Region, TaxConfig } from './types';

// Cấu hình chung cho Bảo hiểm & Lương tối thiểu (Giả định giữ nguyên cho cả 2 phương án hoặc cập nhật nhỏ)
const COMMON_INSURANCE = {
  social: 0.08, // 8%
  health: 0.015, // 1.5%
  unemployment: 0.01, // 1%
  socialCapMultiplier: 20,
  unemploymentCapMultiplier: 20,
};

const COMMON_REGIONAL_WAGE = {
  [Region.I]: 4960000, 
  [Region.II]: 4410000,
  [Region.III]: 3860000,
  [Region.IV]: 3250000,
};

// --- QUY ĐỊNH 2025 (HIỆN HÀNH) ---
export const TAX_BRACKETS_2025 = [
  { max: 5000000, rate: 0.05 },
  { max: 10000000, rate: 0.10 },
  { max: 18000000, rate: 0.15 },
  { max: 32000000, rate: 0.20 },
  { max: 52000000, rate: 0.25 },
  { max: 80000000, rate: 0.30 },
  { max: Infinity, rate: 0.35 },
];

export const TAX_CONFIG_2025: TaxConfig = {
  id: '2025',
  name: 'Quy định 2025',
  baseSalary: 2340000,
  regionalMinWage: COMMON_REGIONAL_WAGE,
  insurance: COMMON_INSURANCE,
  deduction: {
    personal: 11000000, 
    dependent: 4400000,
  },
  brackets: TAX_BRACKETS_2025
};

// --- ĐỀ XUẤT 2026 (MỚI) ---
// Biểu thuế 5 bậc: 5% - 10% - 20% - 30% - 35%
// Giảm trừ: 15.5tr / 6.2tr
export const TAX_BRACKETS_2026 = [
  { max: 10000000, rate: 0.05 },  // Đến 10tr
  { max: 30000000, rate: 0.10 },  // Trên 10 đến 30tr
  { max: 60000000, rate: 0.20 },  // Trên 30 đến 60tr
  { max: 100000000, rate: 0.30 }, // Trên 60 đến 100tr
  { max: Infinity, rate: 0.35 },  // Trên 100tr
];

export const TAX_CONFIG_2026: TaxConfig = {
  id: '2026',
  name: 'Đề xuất 2026',
  baseSalary: 2340000, // Giả định lương cơ sở giữ nguyên hoặc tăng nhẹ, ở đây giữ nguyên để so sánh thuế
  regionalMinWage: COMMON_REGIONAL_WAGE,
  insurance: COMMON_INSURANCE,
  deduction: {
    personal: 15500000, 
    dependent: 6200000,
  },
  brackets: TAX_BRACKETS_2026
};

// Default is now 2026 as requested
export const DEFAULT_TAX_CONFIG = TAX_CONFIG_2026;
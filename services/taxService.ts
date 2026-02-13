import { CalculationInput, Region, TaxResult, TaxConfig, TaxBracketDetail } from '../types';

const calculateInsurance = (salary: number, region: Region, appliedSalary: number, config: TaxConfig) => {
  const { baseSalary, regionalMinWage, insurance } = config;
  
  const socialHealthCap = baseSalary * insurance.socialCapMultiplier;
  const unemploymentCap = regionalMinWage[region] * insurance.unemploymentCapMultiplier;

  // Tiền lương tính bảo hiểm không được vượt quá trần
  const salaryForSocialHealth = Math.min(appliedSalary, socialHealthCap);
  const salaryForUnemployment = Math.min(appliedSalary, unemploymentCap);

  const bhxh = salaryForSocialHealth * insurance.social;
  const bhyt = salaryForSocialHealth * insurance.health;
  const bhtn = salaryForUnemployment * insurance.unemployment;

  return { bhxh, bhyt, bhtn, totalInsurance: bhxh + bhyt + bhtn };
};

const calculatePIT = (taxableIncome: number, config: TaxConfig) => {
  let tax = 0;
  const details: TaxBracketDetail[] = [];
  let previousMax = 0;
  const brackets = config.brackets;

  for (let i = 0; i < brackets.length; i++) {
    const bracket = brackets[i];
    let taxedAmountInThisBracket = 0;
    
    // Logic: How much of the taxable income falls into this specific bracket?
    if (taxableIncome > previousMax) {
      if (bracket.max === Infinity) {
        taxedAmountInThisBracket = taxableIncome - previousMax;
      } else {
        // If income is higher than this bracket's max, we take the full range.
        // If income is within this bracket, we take (income - previousMax).
        taxedAmountInThisBracket = Math.min(taxableIncome, bracket.max) - previousMax;
      }
    }

    const taxForBracket = taxedAmountInThisBracket * bracket.rate;
    tax += taxForBracket;
    
    details.push({
      level: i + 1,
      rate: bracket.rate,
      minIncome: previousMax,
      maxIncome: bracket.max,
      taxedAmount: taxedAmountInThisBracket,
      taxAmount: taxForBracket
    });

    previousMax = bracket.max;
  }

  return { tax, details };
};

export const calculateGrossToNet = (input: CalculationInput, config: TaxConfig): TaxResult => {
  let gross = input.income;
  const insuranceIncome = input.insuranceMode === 'CUSTOM' ? input.insuranceSalary : gross;

  // 1. Calculate Insurance
  const { bhxh, bhyt, bhtn, totalInsurance } = calculateInsurance(gross, input.region, insuranceIncome, config);

  // 2. Income before tax
  const incomeBeforeTax = gross - totalInsurance;

  // 3. Taxable Income
  // Deductions: Personal + Dependent * count + Other
  const totalDeductions = config.deduction.personal + (config.deduction.dependent * input.dependents) + input.otherDeductions;
  const taxableIncome = Math.max(0, incomeBeforeTax - totalDeductions);

  // 4. Calculate Tax
  const { tax: personalIncomeTax, details: detailTax } = calculatePIT(taxableIncome, config);

  // 5. Net
  const net = gross - totalInsurance - personalIncomeTax;

  // 6. Handle Additional Incomes
  let additionalTaxDetails: any[] = [];
  let additionalTax = 0;
  let additionalNet = 0;

  input.additionalIncomes.forEach(inc => {
    let tax = 0;
    let typeName = '';
    if (inc.type === 'FREELANCE') {
      tax = inc.amount >= 2000000 ? inc.amount * 0.1 : 0; // 10% if >= 2M
      typeName = 'Vãng lai (10%)';
    } else if (inc.type === 'INVESTMENT') {
      tax = inc.amount * 0.05;
      typeName = 'Đầu tư (5%)';
    } else if (inc.type === 'SALARY_LIKE') {
      tax = inc.amount * 0.1; 
      typeName = 'Gộp lương (Ước tính 10%)';
    } else {
      typeName = 'Miễn thuế';
    }
    
    additionalTaxDetails.push({
      label: inc.label,
      amount: inc.amount,
      tax: tax,
      net: inc.amount - tax,
      typeName
    });
    additionalTax += tax;
    additionalNet += (inc.amount - tax);
  });

  return {
    gross,
    net,
    socialInsurance: bhxh,
    healthInsurance: bhyt,
    unemploymentInsurance: bhtn,
    incomeBeforeTax,
    taxableIncome,
    personalIncomeTax,
    detailTax,
    totalTax: personalIncomeTax + additionalTax,
    totalNet: net + additionalNet,
    additionalTaxDetails
  };
};

export const calculateNetToGross = (input: CalculationInput, config: TaxConfig): TaxResult => {
  const targetNet = input.income;
  let lower = targetNet;
  let upper = targetNet * 2;
  let calculatedGross = targetNet;
  
  // Binary search for Gross
  for (let i = 0; i < 50; i++) {
    calculatedGross = (lower + upper) / 2;
    
    // Forward calc
    const insuranceIncome = input.insuranceMode === 'CUSTOM' ? input.insuranceSalary : calculatedGross;
    const { totalInsurance } = calculateInsurance(calculatedGross, input.region, insuranceIncome, config);
    const incomeBeforeTax = calculatedGross - totalInsurance;
    const totalDeductions = config.deduction.personal + (config.deduction.dependent * input.dependents) + input.otherDeductions;
    const taxableIncome = Math.max(0, incomeBeforeTax - totalDeductions);
    const { tax } = calculatePIT(taxableIncome, config);
    const currentNet = calculatedGross - totalInsurance - tax;

    if (Math.abs(currentNet - targetNet) < 1000) {
      break; 
    }
    if (currentNet < targetNet) {
      lower = calculatedGross;
    } else {
      upper = calculatedGross;
    }
  }

  const finalInput = { ...input, income: calculatedGross, incomeType: 'GROSS' as const };
  return calculateGrossToNet(finalInput, config);
};
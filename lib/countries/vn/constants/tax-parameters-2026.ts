export const VN_SOURCE_URLS = [
  "https://congbao.chinhphu.vn/van-ban/luat-so-109-2025-qh15-468671.htm",
  "https://xaydungchinhsach.chinhphu.vn/gioi-thieu-luat-thue-thu-nhap-ca-nhan-so-109-2025-qh15-119260123145437408.htm",
  "https://xaydungchinhsach.chinhphu.vn/quy-dinh-giam-tru-gia-canh-trong-thue-thu-nhap-ca-nhan-119260327071750084.htm",
  "https://xaydungchinhsach.chinhphu.vn/chi-tiet-bieu-thue-thu-nhap-ca-nhan-luy-tien-tung-phan-119260327091407544.htm",
  "https://baochinhphu.vn/ke-hoach-trien-khai-thi-hanh-luat-thue-thu-nhap-ca-nhan-102260505144220787.htm",
  "https://mof.gov.vn/tin-tuc-tai-chinh/tin-tuc-su-kien-8/du-thao-nghi-dinh-huong-dan-luat-thue-tncn-de-xuat-nhieu-chinh-sach-co-loi-cho-nguoi-nop-thue",
  "https://investvietnam.gov.vn/en/taxes-fees-charges-and-other-expenses.nd/personal-income-tax-pit.html",
  "https://vss.gov.vn/english/question/Pages/default.aspx?ItemID=1759",
  "https://vss.gov.vn/english/question/Pages/default.aspx?ItemID=1818",
  "https://vss.gov.vn/english/news/Pages/vietnam-social-security.aspx/1000?CateID=198&ItemID=12713",
] as const;

// Social insurance contribution rates (employee portion)
export const VN_SOCIAL_INSURANCE_2026 = {
  socialInsuranceRate: 0.08, // 8% (BHXH - social insurance)
  healthInsuranceRate: 0.015, // 1.5% (BHYT - health insurance)
  unemploymentInsuranceRate: 0.01, // 1% (BHTN - unemployment insurance)
  totalRate: 0.105, // Total employee contribution: 10.5%
  // Ceiling: 20x base salary (base salary = 2,340,000 VND as of July 2024)
  baseSalary: 2_340_000, // Statutory base salary
  ceilingMultiplier: 20, // 20x statutory base salary
  regionalMinimumWageTier1: 4_960_000, // Highest region (Region I)
} as const;

// Personal tax deduction
export const VN_PERSONAL_DEDUCTION_MONTHLY = 15_500_000; // 15.5M VND/month
export const VN_PERSONAL_DEDUCTION_ANNUAL = 186_000_000; // 186M VND/year

// Dependent deduction per dependent per month
export const VN_DEPENDENT_DEDUCTION_MONTHLY = 6_200_000; // 6.2M VND/month/dependent
export const VN_DEPENDENT_DEDUCTION_ANNUAL = 74_400_000; // 74.4M VND/year/dependent

export const VN_NON_RESIDENT_EMPLOYMENT_TAX_RATE = 0.2;
// Law 109/2025/QH15 keeps pension/life-insurance deductions subject to
// Government limits. The modeled amount uses the current implementing cap from
// Decree 65/2013/ND-CP / MOF guidance: VND 1,000,000 per month.
export const VN_VOLUNTARY_PENSION_DEDUCTION_ANNUAL_CAP = 12_000_000;
// Law 109/2025/QH15 Article 11 newly authorizes healthcare and
// education-training expense deductions for residents, but only at levels
// specified by the Government. Do not expose those as amount inputs until an
// implementing decree or MOF guidance gives a calculable cap.

// Personal income tax brackets for resident salary/wage income under Law 109/2025/QH15.
export const VN_TAX_BRACKETS_2026 = [
  { min: 0, max: 120_000_000, rate: 0.05 },
  { min: 120_000_000, max: 360_000_000, rate: 0.1 },
  { min: 360_000_000, max: 720_000_000, rate: 0.2 },
  { min: 720_000_000, max: 1_200_000_000, rate: 0.3 },
  { min: 1_200_000_000, max: Infinity, rate: 0.35 },
] as const;

export function calculateVNProgressiveTax(
  annualTaxableIncome: number
): {
  totalTax: number;
  bracketTaxes: Array<{
    min: number;
    max: number;
    rate: number;
    tax: number;
  }>;
} {
  let totalTax = 0;
  const bracketTaxes: Array<{
    min: number;
    max: number;
    rate: number;
    tax: number;
  }> = [];

  for (const bracket of VN_TAX_BRACKETS_2026) {
    if (annualTaxableIncome <= bracket.min) continue;
    const amountInBracket =
      Math.min(annualTaxableIncome, bracket.max) - bracket.min;
    if (amountInBracket <= 0) continue;
    const tax = amountInBracket * bracket.rate;
    totalTax += tax;
    bracketTaxes.push({
      min: bracket.min,
      max: bracket.max,
      rate: bracket.rate,
      tax: Math.round(tax),
    });
  }

  return {
    totalTax: Math.round(totalTax),
    bracketTaxes,
  };
}

import { TAX_YEAR } from "@/lib/constants/tax-year";
import { getCountryConfig } from "@/lib/countries/registry";
import type { CountryCode } from "@/lib/countries/types";

// Country-specific descriptions for SEO
const COUNTRY_DESCRIPTIONS: Partial<Record<CountryCode, string>> = {
  US: `Free ${TAX_YEAR} take home pay calculator for all 50 US states + DC. Calculate your salary after taxes including federal, state, Social Security, Medicare, 401(k), HSA, and IRA deductions.`,
  CA: `Free 2026 take home pay calculator for Canada. Calculate your salary after federal and Ontario income tax, CPP contributions, and EI premiums.`,
  MX: `Free 2026 take home pay calculator for Mexico. Calculate your salary after ISR income tax and estimated employee social security deductions.`,
  SG: `Free ${TAX_YEAR} take home pay calculator for Singapore. Calculate your salary after taxes including income tax, CPF contributions based on age and residency, and SRS deductions.`,
  KR: `Free ${TAX_YEAR} take home pay calculator for South Korea. Calculate your salary after taxes including income tax, local tax, national pension, health insurance, and employment insurance.`,
  NL: `Free ${TAX_YEAR} take home pay calculator for the Netherlands. Calculate your salary after taxes including income tax, national insurance, and the 30% ruling for expats.`,
  AU: `Free ${TAX_YEAR} take home pay calculator for Australia. Calculate your salary after taxes including income tax (Stage 3 cuts), Medicare levy, Medicare levy surcharge, Division 293 tax (high income earners), LITO, and superannuation.`,
  PT: `Free ${TAX_YEAR} take home pay calculator for Portugal. Calculate your salary after taxes including IRS income tax, Social Security contributions (Segurança Social), and solidarity surcharge for high incomes.`,
  TH: `Free ${TAX_YEAR} take home pay calculator for Thailand. Calculate your salary after taxes including personal income tax (progressive rates 0-35%), Social Security Fund contributions, and tax-saving options like Provident Fund, RMF, SSF, and ESG funds.`,
  HK: `Free ${TAX_YEAR} take home pay calculator for Hong Kong. Calculate your salary after salaries tax, MPF contributions, and key allowances and deductions.`,
  ID: `Free ${TAX_YEAR} take home pay calculator for Indonesia. Calculate your salary after taxes including PPh 21 income tax (progressive rates 5% to 35%), BPJS Kesehatan (health insurance), BPJS JHT (old age security), and BPJS JP (pension) contributions.`,
  MY: `Free ${TAX_YEAR} take home pay calculator for Malaysia. Calculate your salary after individual income tax, EPF/KWSP, SOCSO, EIS, and selected YA 2025 resident reliefs.`,
  TW: `Free ${TAX_YEAR} take home pay calculator for Taiwan. Calculate your salary after taxes including comprehensive income tax (progressive rates 5% to 40%), Labor Insurance, Employment Insurance, National Health Insurance, and voluntary labor pension contributions.`,
  UK: `Free ${TAX_YEAR} take home pay calculator for the United Kingdom. Calculate your salary after taxes including Income Tax (with Personal Allowance taper), Class 1 National Insurance (employee), and Scottish Income Tax rates if applicable.`,
  DE: `Free ${TAX_YEAR} take home pay calculator for Germany. Calculate your salary after taxes including income tax (Einkommensteuer) per §32a EStG, Solidarity Surcharge (Solidaritätszuschlag), and social security contributions (pension, health, unemployment, and long-term care insurance).`,
  AE: `Free 2026 take home pay calculator for the United Arab Emirates. Calculate UAE salary after 0% personal income tax and modeled GPSSA or GCC insurance extension employee pension contributions.`,
  CN: `Free 2026 take home pay calculator for China. Calculate your salary after taxes including Individual Income Tax (IIT, progressive 3%-45%), social insurance (pension 8%, medical 2%, unemployment 0.5%), housing fund contributions, and special additional deductions.`,
  JP: `Free 2026 take home pay calculator for Japan. Calculate your salary after taxes including national income tax (progressive 5%-45%), reconstruction surtax (2.1%), resident tax (10%), and social insurance (pension 9.15%, health ~5%, employment 0.6%).`,
  IN: `Free 2026 take home pay calculator for India. Calculate your salary after taxes including income tax under new regime FY 2025-26 (progressive 0-30%), surcharge, health & education cess (4%), EPF contributions (12%), and Section 87A rebate.`,
  PH: `Free 2026 take home pay calculator for the Philippines. Calculate your salary after taxes including income tax (progressive 0-35% under TRAIN law), SSS contributions (5%), PhilHealth (2.5%), and Pag-IBIG Fund (2%).`,
  VN: `Free 2026 take home pay calculator for Vietnam. Calculate your salary after taxes including personal income tax (progressive 5-35%), social insurance (8%), health insurance (1.5%), unemployment insurance (1%), and personal/dependent deductions.`,
};

// Country-specific keywords for SEO
const COUNTRY_KEYWORDS: Partial<Record<CountryCode, string[]>> = {
  US: [
    "us take home pay calculator",
    "usa salary after tax",
    "american paycheck calculator",
    `${TAX_YEAR} federal tax calculator`,
    "state tax calculator",
    "401k tax savings",
    "california paycheck calculator",
    "new york salary calculator",
    "texas take home pay",
  ],
  CA: [
    "canada take home pay calculator",
    "canada salary after tax",
    "2026 canada tax calculator",
    "canadian payroll calculator",
    "ontario salary after tax",
    "cpp ei calculator",
    "canada paycheck calculator",
  ],
  MX: [
    "mexico take home pay calculator",
    "mexico salary after tax",
    "2026 mexico tax calculator",
    "mexico isr calculator",
    "mexican payroll calculator",
    "salario neto mexico",
    "calculadora isr mexico",
  ],
  AU: [
    "australia take home pay calculator",
    "australian salary after tax",
    `${TAX_YEAR} australia tax calculator`,
    "ato tax calculator",
    "medicare levy calculator",
    "superannuation calculator",
    "stage 3 tax cuts calculator",
    "lito calculator",
    "division 293 tax calculator",
    "high income super tax",
  ],
  NL: [
    "netherlands take home pay calculator",
    "dutch salary after tax",
    `${TAX_YEAR} netherlands tax calculator`,
    "30 percent ruling calculator",
    "dutch income tax calculator",
    "loonbelasting calculator",
  ],
  PT: [
    "portugal take home pay calculator",
    "portuguese salary after tax",
    `${TAX_YEAR} portugal tax calculator`,
    "irs portugal calculator",
    "seguranca social calculator",
    "portugal income tax calculator",
    "portugal paycheck calculator",
  ],
  SG: [
    "singapore take home pay calculator",
    "sg salary after tax",
    `${TAX_YEAR} singapore tax calculator`,
    "cpf contribution calculator",
    "singapore income tax",
    "srs contribution calculator",
  ],
  KR: [
    "korea take home pay calculator",
    "korean salary after tax",
    `${TAX_YEAR} korea tax calculator`,
    "korean income tax calculator",
    "national pension korea",
    "4 major insurance korea",
  ],
  TH: [
    "thailand take home pay calculator",
    "thai salary after tax",
    `${TAX_YEAR} thailand tax calculator`,
    "thai income tax calculator",
    "personal income tax thailand",
    "social security thailand",
    "provident fund thailand",
    "rmf thailand calculator",
    "ssf thailand calculator",
    "thailand paycheck calculator",
    "rd go th tax calculator",
    "thai revenue department tax",
  ],
  HK: [
    "hong kong take home pay calculator",
    "hong kong salary after tax",
    `${TAX_YEAR} hong kong tax calculator`,
    "hong kong salaries tax calculator",
    "mpf contribution calculator",
    "hong kong payroll tax",
  ],
  ID: [
    "indonesia take home pay calculator",
    "indonesian salary after tax",
    `${TAX_YEAR} indonesia tax calculator`,
    "pph 21 calculator",
    "indonesia income tax calculator",
    "bpjs calculator",
    "bpjs kesehatan",
    "bpjs ketenagakerjaan",
    "indonesia paycheck calculator",
    "gaji bersih indonesia",
    "kalkulator pph 21",
    "tarif pph 21",
  ],
  MY: [
    "malaysia take home pay calculator",
    "malaysia salary after tax",
    `${TAX_YEAR} malaysia tax calculator`,
    "malaysia income tax calculator",
    "lhdn tax calculator",
    "hasil tax calculator",
    "epf contribution calculator",
    "kwsp contribution calculator",
    "socso calculator",
    "eis calculator malaysia",
    "malaysia paycheck calculator",
    "gaji bersih malaysia",
  ],
  TW: [
    "taiwan take home pay calculator",
    "taiwan salary after tax",
    `${TAX_YEAR} taiwan tax calculator`,
    "taiwan income tax calculator",
    "taiwan paycheck calculator",
    "labor insurance taiwan",
    "national health insurance taiwan",
    "taiwan comprehensive income tax",
    "taiwan tax brackets",
    "taiwan social insurance",
    "taiwan 綜合所得稅",
    "台灣薪資計算",
  ],
  UK: [
    "uk take home pay calculator",
    "united kingdom salary after tax",
    `${TAX_YEAR} uk tax calculator`,
    "hmrc tax calculator",
    "income tax calculator uk",
    "national insurance calculator",
    "scottish income tax calculator",
    "uk paycheck calculator",
    "salary calculator uk",
    "paye calculator",
    "personal allowance taper",
    "uk tax bands",
    "england tax calculator",
    "wales tax calculator",
    "northern ireland tax",
  ],
  DE: [
    "germany take home pay calculator",
    "german salary after tax",
    `${TAX_YEAR} germany tax calculator`,
    "germany income tax calculator",
    "einkommensteuer calculator",
    "solidaritätszuschlag calculator",
    "lohnsteuer calculator",
    "brutto netto rechner",
    "gehaltsrechner deutschland",
    "sozialversicherung beiträge",
    "krankenversicherung rechner",
    "rentenversicherung beitrag",
  ],
  AE: [
    "uae take home pay calculator",
    "dubai salary after tax",
    "abu dhabi salary calculator",
    "2026 uae salary calculator",
    "uae personal income tax",
    "gpssa contribution calculator",
    "emirati pension contribution",
    "gcc pension uae",
    "uae expat salary calculator",
  ],
  CN: [
    "china take home pay calculator",
    "china salary after tax",
    "2026 china tax calculator",
    "china iit calculator",
    "individual income tax china",
    "china social insurance calculator",
    "中国税后工资计算器",
    "china housing fund calculator",
    "china five insurance one fund",
    "五险一金计算器",
  ],
  JP: [
    "japan take home pay calculator",
    "japan salary after tax",
    "2026 japan tax calculator",
    "japanese income tax calculator",
    "japan resident tax calculator",
    "japan social insurance calculator",
    "japan pension calculator",
    "shakai hoken calculator",
    "japan payroll calculator",
    "給与計算 手取り",
  ],
  IN: [
    "india take home pay calculator",
    "india salary after tax",
    "2026 india tax calculator",
    "india income tax calculator",
    "new tax regime calculator",
    "india epf calculator",
    "section 87a rebate calculator",
    "india cess calculator",
    "indian payroll calculator",
    "भारत टैक्स कैलकुलेटर",
    "income tax slabs 2026",
  ],
  PH: [
    "philippines take home pay calculator",
    "philippines salary after tax",
    "2026 philippines tax calculator",
    "philippine income tax calculator",
    "train law tax calculator",
    "philippines sss calculator",
    "philhealth contribution calculator",
    "pag ibig calculator",
    "philippines payroll calculator",
    "sweldo calculator philippines",
  ],
  VN: [
    "vietnam take home pay calculator",
    "vietnam salary after tax",
    "2026 vietnam tax calculator",
    "vietnam income tax calculator",
    "vietnam social insurance calculator",
    "thuế thu nhập cá nhân",
    "lương gross sang net",
    "vietnam payroll calculator",
    "bảo hiểm xã hội calculator",
    "tính lương sau thuế",
  ],
};


// Country-specific header descriptions
const COUNTRY_HEADER_INFO: Partial<Record<
  CountryCode,
  { tagline: string; details: string }
>> = {
  US: {
    tagline:
      "Calculate your actual salary after taxes for all 50 US states + D.C.",
    details:
      "Federal & state taxes, Social Security, Medicare, 401(k), HSA, IRA",
  },
  CA: {
    tagline: "Calculate your actual salary after taxes in Canada.",
    details:
      "Federal and Ontario income tax, CPP contributions, and EI premiums",
  },
  MX: {
    tagline: "Calculate your actual salary after taxes in Mexico.",
    details: "ISR income tax and estimated employee social security deductions",
  },
  AU: {
    tagline: "Calculate your actual salary after taxes in Australia.",
    details:
      "Income tax (Stage 3 cuts), LITO, Medicare levy, Medicare levy surcharge, Division 293 tax, superannuation",
  },
  NL: {
    tagline: "Calculate your actual salary after taxes in the Netherlands.",
    details: "Income tax, national insurance, 30% ruling for expats",
  },
  PT: {
    tagline: "Calculate your actual salary after taxes in Portugal.",
    details:
      "IRS income tax, Social Security (Segurança Social), solidarity surcharge, PPR tax credits, dependent deductions",
  },
  SG: {
    tagline: "Calculate your actual salary after taxes in Singapore.",
    details: "Income tax, CPF contributions (based on age and residency), SRS",
  },
  KR: {
    tagline: "Calculate your actual salary after taxes in South Korea.",
    details:
      "Income tax, local tax, national pension, health insurance, employment insurance",
  },
  TH: {
    tagline: "Calculate your actual salary after taxes in Thailand.",
    details:
      "Personal income tax (0-35% progressive), Social Security Fund (5%), Provident Fund, RMF, SSF, ESG funds, allowances & deductions",
  },
  HK: {
    tagline: "Calculate your actual salary after taxes in Hong Kong.",
    details:
      "Salaries tax, MPF contributions, allowances & deductible expenses",
  },
  ID: {
    tagline: "Calculate your actual salary after taxes in Indonesia.",
    details:
      "PPh 21 income tax (5-35% progressive), BPJS Kesehatan (1%), BPJS JHT (2%), BPJS JP (1%), PTKP allowances",
  },
  MY: {
    tagline: "Calculate your actual salary after taxes in Malaysia.",
    details:
      "Individual income tax, EPF/KWSP, SOCSO, EIS, PRS, and selected YA 2025 resident reliefs",
  },
  TW: {
    tagline: "Calculate your actual salary after taxes in Taiwan.",
    details:
      "Comprehensive income tax (5-40% progressive), Labor Insurance (2.3%), Employment Insurance (0.2%), National Health Insurance (1.551%), voluntary labor pension",
  },
  UK: {
    tagline: "Calculate your actual salary after taxes in the United Kingdom.",
    details:
      "Income Tax (Personal Allowance taper £100k+), Class 1 National Insurance, Scottish tax bands",
  },
  DE: {
    tagline: "Calculate your actual salary after taxes in Germany.",
    details:
      "Income tax (Einkommensteuer §32a EStG, progressive 0-45%), Solidarity Surcharge (Solidaritätszuschlag 5.5%), Pension Insurance (9.3%), Health Insurance (7.3% + Zusatzbeitrag), Unemployment Insurance (1.3%), Long-term Care Insurance (1.8-2.4%)",
  },
  AE: {
    tagline: "Calculate your actual salary after deductions in the United Arab Emirates.",
    details:
      "0% personal income tax, GPSSA pension for UAE nationals, and GCC insurance extension contributions",
  },
  CN: {
    tagline: "Calculate your actual salary after taxes in China.",
    details:
      "Individual Income Tax (IIT, 3-45%), social insurance (pension 8%, medical 2%, unemployment 0.5%), housing fund (5-12%), and special additional deductions",
  },
  JP: {
    tagline: "Calculate your actual salary after taxes in Japan.",
    details:
      "National income tax (5-45%), reconstruction surtax (2.1%), resident tax (10%), and social insurance (pension 9.15%, health ~5%, employment 0.6%)",
  },
  IN: {
    tagline: "Calculate your actual salary after taxes in India.",
    details:
      "Income tax (new regime 0-30%), surcharge, 4% cess, EPF (12%), Section 87A rebate up to ₹60,000",
  },
  PH: {
    tagline: "Calculate your actual salary after taxes in the Philippines.",
    details:
      "Income tax (TRAIN law 0-35%), SSS (5%), PhilHealth (2.5%), Pag-IBIG Fund (2%)",
  },
  VN: {
    tagline: "Calculate your actual salary after taxes in Vietnam.",
    details:
      "Personal income tax (5-35%), social insurance (8%), health insurance (1.5%), unemployment insurance (1%), personal deduction (11M VND/month), dependent deduction (4.4M/month/person)",
  },
};

function getGenericCountryDescription(country: CountryCode): string {
  const config = getCountryConfig(country);
  return `Free ${config.taxYear} take home pay calculator for ${config.name}. Calculate your estimated salary after income tax, statutory payroll contributions, and modeled deductions.`;
}

function getGenericCountryKeywords(country: CountryCode): string[] {
  const config = getCountryConfig(country);
  const countryName = config.name.toLowerCase();
  return [
    `${countryName} take home pay calculator`,
    `${countryName} salary after tax`,
    `${config.taxYear} ${countryName} tax calculator`,
    `${countryName} paycheck calculator`,
  ];
}

function getGenericCountryHeaderInfo(country: CountryCode): {
  tagline: string;
  details: string;
} {
  const config = getCountryConfig(country);
  return {
    tagline: `Calculate your actual salary after taxes in ${config.name}.`,
    details:
      "Income tax, statutory payroll contributions, and modeled deductions",
  };
}

export function getCountryDescription(country: CountryCode): string {
  return COUNTRY_DESCRIPTIONS[country] ?? getGenericCountryDescription(country);
}

export function getCountryKeywords(country: CountryCode): string[] {
  return COUNTRY_KEYWORDS[country] ?? getGenericCountryKeywords(country);
}

export function getCountryHeaderInfo(country: CountryCode): {
  tagline: string;
  details: string;
} {
  return COUNTRY_HEADER_INFO[country] ?? getGenericCountryHeaderInfo(country);
}

export { COUNTRY_DESCRIPTIONS, COUNTRY_KEYWORDS, COUNTRY_HEADER_INFO };

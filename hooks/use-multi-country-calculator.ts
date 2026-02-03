"use client";

import { calculateNetSalary, getCountryConfig } from "@/lib/countries/registry";
import { DECalculator } from "@/lib/countries/de/calculator";
import { HKCalculator } from "@/lib/countries/hk/calculator";
import { PTCalculator } from "@/lib/countries/pt/calculator";
import { THCalculator } from "@/lib/countries/th/calculator";
import {
  CPF_VOLUNTARY_TOPUP_LIMIT,
  getSRSLimit,
} from "@/lib/countries/sg/constants/cpf-rates-2026";
import type {
  AUCalculatorInputs,
  AUResidencyType,
  CalculationResult,
  CalculatorInputs,
  CountryCode,
  CurrencyCode,
  DECalculatorInputs,
  HKCalculatorInputs,
  HKResidencyType,
  HKTaxReliefInputs,
  IDCalculatorInputs,
  IDTaxReliefInputs,
  KRCalculatorInputs,
  KRResidencyType,
  KRTaxReliefInputs,
  NLCalculatorInputs,
  PTCalculatorInputs,
  PTResidencyType,
  PayFrequency,
  SGCalculatorInputs,
  SGResidencyType,
  SGTaxReliefInputs,
  THCalculatorInputs,
  THResidencyType,
  THTaxReliefInputs,
  TWCalculatorInputs,
  TWTaxReliefInputs,
  UKCalculatorInputs,
  UKResidencyType,
  USCalculatorInputs,
  USFilingStatus,
} from "@/lib/countries/types";
import {
  CONTRIBUTION_LIMITS,
  getHSALimit,
  type HSACoverageType,
} from "@/lib/countries/us/constants/contribution-limits";
import { useCallback, useMemo, useState } from "react";

// ============================================================================
// DEFAULT VALUES
// ============================================================================
const DEFAULT_SG_TAX_RELIEFS: SGTaxReliefInputs = {
  hasSpouseRelief: false,
  numberOfChildren: 0,
  isWorkingMother: false,
  parentRelief: "none",
  numberOfParents: 0,
  courseFees: 0,
};

const DEFAULT_KR_TAX_RELIEFS: KRTaxReliefInputs = {
  numberOfDependents: 0,
  numberOfChildrenUnder20: 0,
  numberOfChildrenUnder7: 0,
  personalPensionContribution: 0,
  insurancePremiums: 0,
  medicalExpenses: 0,
  educationExpenses: 0,
  donations: 0,
  monthlyRent: 0,
  isHomeowner: false,
  hasMealAllowance: false,
  hasChildcareAllowance: false,
};

const DEFAULT_TH_TAX_RELIEFS: THTaxReliefInputs = {
  hasSpouse: false,
  spouseHasNoIncome: false,
  numberOfChildren: 0,
  numberOfChildrenBornAfter2018: 0,
  numberOfParents: 0,
  numberOfDisabledDependents: 0,
  isElderlyOrDisabled: false,
  lifeInsurancePremium: 0,
  lifeInsuranceSpousePremium: 0,
  healthInsurancePremium: 0,
  healthInsuranceParentsPremium: 0,
  hasSocialSecurity: true,
  providentFundContribution: 0,
  rmfContribution: 0,
  ssfContribution: 0,
  esgContribution: 0,
  nationalSavingsFundContribution: 0,
  mortgageInterest: 0,
  donations: 0,
  politicalDonation: 0,
};

const DEFAULT_HK_TAX_RELIEFS: HKTaxReliefInputs = {
  hasMarriedAllowance: false,
  hasSingleParentAllowance: false,
  numberOfChildren: 0,
  numberOfNewbornChildren: 0,
  numberOfDependentParents: 0,
  numberOfDependentParentsLivingWith: 0,
  numberOfDependentSiblings: 0,
  hasDisabilityAllowance: false,
  numberOfDisabledDependents: 0,
  selfEducationExpenses: 0,
  homeLoanInterest: 0,
  domesticRent: 0,
  charitableDonations: 0,
  elderlyResidentialCareExpenses: 0,
};

const DEFAULT_ID_TAX_RELIEFS: IDTaxReliefInputs = {
  maritalStatus: "single",
  numberOfDependents: 0,
  spouseIncomeCombined: false,
};

const DEFAULT_TW_TAX_RELIEFS: TWTaxReliefInputs = {
  isMarried: false,
  hasDisability: false,
  isGoldCardHolder: false,
};

// Default gross salaries per country
const DEFAULT_GROSS_SALARY: Record<CountryCode, number> = {
  US: 100000,
  SG: 60000,
  KR: 50000000, // ₩50M typical salary
  NL: 55000,
  AU: 100000, // A$100k typical Australian salary
  PT: 35000, // €35k typical Portuguese salary
  TH: 600000, // ฿600k typical Thai middle income
  HK: 420000, // HK$35k monthly
  ID: 120000000, // Rp120M typical salary
  TW: 720000, // NT$60k monthly typical salary
  UK: 35000, // £35,000 typical UK salary
  DE: 55000, // €55k typical German salary
};

// ============================================================================
// RETURN TYPE
// ============================================================================
export interface UseMultiCountryCalculatorReturn {
  // Currency (derived from country prop)
  currency: CurrencyCode;

  // Common inputs
  grossSalary: number;
  setGrossSalary: (value: number) => void;
  payFrequency: PayFrequency;
  setPayFrequency: (value: PayFrequency) => void;

  // US-specific
  usState: string;
  setUsState: (value: string) => void;
  filingStatus: USFilingStatus;
  setFilingStatus: (value: USFilingStatus) => void;
  traditional401k: number;
  setTraditional401k: (value: number) => void;
  rothIRA: number;
  setRothIRA: (value: number) => void;
  hsa: number;
  setHsa: (value: number) => void;
  hsaCoverageType: HSACoverageType;
  setHsaCoverageType: (value: HSACoverageType) => void;

  // SG-specific
  residencyType: SGResidencyType;
  setResidencyType: (value: SGResidencyType) => void;
  age: number;
  setAge: (value: number) => void;
  voluntaryCpfTopUp: number;
  setVoluntaryCpfTopUp: (value: number) => void;
  srsContribution: number;
  setSrsContribution: (value: number) => void;
  sgTaxReliefs: SGTaxReliefInputs;
  setSgTaxReliefs: (value: SGTaxReliefInputs) => void;

  // KR-specific
  krResidencyType: KRResidencyType;
  setKrResidencyType: (value: KRResidencyType) => void;
  krTaxReliefs: KRTaxReliefInputs;
  setKrTaxReliefs: (value: KRTaxReliefInputs) => void;

  // NL-specific
  hasThirtyPercentRuling: boolean;
  setHasThirtyPercentRuling: (value: boolean) => void;
  hasYoungChildren: boolean;
  setHasYoungChildren: (value: boolean) => void;

  // AU-specific
  auResidencyType: AUResidencyType;
  setAuResidencyType: (value: AUResidencyType) => void;
  hasPrivateHealthInsurance: boolean;
  setHasPrivateHealthInsurance: (value: boolean) => void;

  // PT-specific
  ptResidencyType: PTResidencyType;
  setPtResidencyType: (value: PTResidencyType) => void;
  ptFilingStatus: "single" | "married_jointly" | "married_separately";
  setPtFilingStatus: (value: "single" | "married_jointly" | "married_separately") => void;
  ptNumberOfDependents: number;
  setPtNumberOfDependents: (value: number) => void;
  ptAge: number;
  setPtAge: (value: number) => void;
  ptPprContribution: number;
  setPtPprContribution: (value: number) => void;
  ptLimits: {
    pprMaxContribution: number;
    pprMaxTaxCredit: number;
  };

  // TH-specific
  thResidencyType: THResidencyType;
  setThResidencyType: (value: THResidencyType) => void;
  thTaxReliefs: THTaxReliefInputs;
  setThTaxReliefs: (value: THTaxReliefInputs) => void;
  thProvidentFund: number;
  setThProvidentFund: (value: number) => void;
  thRmf: number;
  setThRmf: (value: number) => void;
  thSsf: number;
  setThSsf: (value: number) => void;
  thEsg: number;
  setThEsg: (value: number) => void;
  thNsf: number;
  setThNsf: (value: number) => void;
  thLimits: {
    providentFund: number;
    rmf: number;
    ssf: number;
    esg: number;
    nsf: number;
  };

  // HK-specific
  hkResidencyType: HKResidencyType;
  setHkResidencyType: (value: HKResidencyType) => void;
  hkTaxReliefs: HKTaxReliefInputs;
  setHkTaxReliefs: (value: HKTaxReliefInputs) => void;
  hkVoluntaryContributions: number;
  setHkVoluntaryContributions: (value: number) => void;
  hkLimits: {
    taxDeductibleVoluntaryContributions: number;
  };

  // ID-specific
  idTaxReliefs: IDTaxReliefInputs;
  setIdTaxReliefs: (value: IDTaxReliefInputs) => void;
  idDplkContribution: number;
  setIdDplkContribution: (value: number) => void;
  idZakatContribution: number;
  setIdZakatContribution: (value: number) => void;

  // TW-specific
  twTaxReliefs: TWTaxReliefInputs;
  setTwTaxReliefs: (value: TWTaxReliefInputs) => void;
  twVoluntaryPension: number;
  setTwVoluntaryPension: (value: number) => void;
  twLimits: {
    voluntaryPensionContribution: number;
  };
  
  // UK-specific
  ukResidencyType: UKResidencyType;
  setUkResidencyType: (value: UKResidencyType) => void;
  ukRegion: "rest_of_uk" | "scotland";
  setUkRegion: (value: "rest_of_uk" | "scotland") => void;
  ukPensionContribution: number;
  setUkPensionContribution: (value: number) => void;

  // DE-specific
  deState: string;
  setDeState: (value: string) => void;
  deIsMarried: boolean;
  setDeIsMarried: (value: boolean) => void;
  deIsChurchMember: boolean;
  setDeIsChurchMember: (value: boolean) => void;
  deIsChildless: boolean;
  setDeIsChildless: (value: boolean) => void;
  deBavContribution: number;
  setDeBavContribution: (value: number) => void;
  deRiesterContribution: number;
  setDeRiesterContribution: (value: number) => void;
  deRuerupContribution: number;
  setDeRuerupContribution: (value: number) => void;
  deLimits: {
    bav: number;
    riester: number;
    ruerup: number;
  };

  // Limits
  usLimits: {
    traditional401k: number;
    rothIRA: number;
    hsa: number;
  };
  sgLimits: {
    voluntaryCpfTopUp: number;
    srsContribution: number;
  };

  // Results
  result: CalculationResult;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================
/**
 * Calculator hook that manages state for a specific country.
 * Country is passed as a prop (from URL) rather than managed internally.
 */
export function useMultiCountryCalculator(
  country: CountryCode,
): UseMultiCountryCalculatorReturn {
  // Common inputs - initialize with country-specific defaults
  const [grossSalary, setGrossSalary] = useState(DEFAULT_GROSS_SALARY[country]);
  const [payFrequency, setPayFrequency] = useState<PayFrequency>("monthly");

  // US-specific state
  const [usState, setUsState] = useState("CA");
  const [filingStatus, setFilingStatus] = useState<USFilingStatus>("single");
  const [traditional401k, setTraditional401kState] = useState(0);
  const [rothIRA, setRothIRAState] = useState(0);
  const [hsa, setHsaState] = useState(0);
  const [hsaCoverageType, setHsaCoverageTypeState] =
    useState<HSACoverageType>("self");

  // SG-specific state
  const [residencyType, setResidencyType] =
    useState<SGResidencyType>("citizen_pr");
  const [age, setAge] = useState(30);
  const [voluntaryCpfTopUp, setVoluntaryCpfTopUpState] = useState(0);
  const [srsContribution, setSrsContributionState] = useState(0);
  const [sgTaxReliefs, setSgTaxReliefs] = useState<SGTaxReliefInputs>(
    DEFAULT_SG_TAX_RELIEFS,
  );

  // KR-specific state
  const [krResidencyType, setKrResidencyType] =
    useState<KRResidencyType>("resident");
  const [krTaxReliefs, setKrTaxReliefs] = useState<KRTaxReliefInputs>(
    DEFAULT_KR_TAX_RELIEFS,
  );

  // NL-specific state
  const [hasThirtyPercentRuling, setHasThirtyPercentRuling] = useState(false);
  const [hasYoungChildren, setHasYoungChildren] = useState(false);

  // AU-specific state
  const [auResidencyType, setAuResidencyType] =
    useState<AUResidencyType>("resident");
  const [hasPrivateHealthInsurance, setHasPrivateHealthInsurance] =
    useState(true);

  // PT-specific state
  const [ptResidencyType, setPtResidencyType] =
    useState<PTResidencyType>("resident");
  const [ptFilingStatus, setPtFilingStatus] =
    useState<"single" | "married_jointly" | "married_separately">("single");
  const [ptNumberOfDependents, setPtNumberOfDependents] = useState(0);
  const [ptAge, setPtAge] = useState(30);
  const [ptPprContribution, setPtPprContributionState] = useState(0);

  // TH-specific state
  const [thResidencyType, setThResidencyType] = useState<THResidencyType>("resident");
  const [thTaxReliefs, setThTaxReliefs] = useState<THTaxReliefInputs>(DEFAULT_TH_TAX_RELIEFS);
  const [thProvidentFund, setThProvidentFundState] = useState(0);
  const [thRmf, setThRmfState] = useState(0);
  const [thSsf, setThSsfState] = useState(0);
  const [thEsg, setThEsgState] = useState(0);
  const [thNsf, setThNsfState] = useState(0);

  // HK-specific state
  const [hkResidencyType, setHkResidencyType] =
    useState<HKResidencyType>("resident");
  const [hkTaxReliefs, setHkTaxReliefs] = useState<HKTaxReliefInputs>(
    DEFAULT_HK_TAX_RELIEFS,
  );
  const [hkVoluntaryContributions, setHkVoluntaryContributionsState] =
    useState(0);

  // ID-specific state
  const [idTaxReliefs, setIdTaxReliefs] = useState<IDTaxReliefInputs>(
    DEFAULT_ID_TAX_RELIEFS,
  );
  const [idDplkContribution, setIdDplkContribution] = useState(0);
  const [idZakatContribution, setIdZakatContribution] = useState(0);

  // TW-specific state
  const [twTaxReliefs, setTwTaxReliefs] = useState<TWTaxReliefInputs>(
    DEFAULT_TW_TAX_RELIEFS,
  );
  const [twVoluntaryPension, setTwVoluntaryPensionState] = useState(0);
  
  // UK-specific state
  const [ukResidencyType, setUkResidencyType] = useState<UKResidencyType>("resident");
  const [ukRegion, setUkRegion] = useState<"rest_of_uk" | "scotland">("rest_of_uk");
  const [ukPensionContribution, setUkPensionContribution] = useState(0);

  // DE-specific state
  const [deState, setDeState] = useState("BE"); // Berlin as default
  const [deIsMarried, setDeIsMarried] = useState(false);
  const [deIsChurchMember, setDeIsChurchMember] = useState(false);
  const [deIsChildless, setDeIsChildless] = useState(false);
  const [deBavContribution, setDeBavContributionState] = useState(0);
  const [deRiesterContribution, setDeRiesterContributionState] = useState(0);
  const [deRuerupContribution, setDeRuerupContributionState] = useState(0);

  // Track previous country using state (React docs pattern for adjusting state when props change)
  const [prevCountry, setPrevCountry] = useState(country);

  // Reset defaults when country changes (during render, not in effect)
  if (prevCountry !== country) {
    setPrevCountry(country);
    setGrossSalary(DEFAULT_GROSS_SALARY[country]);
    setPayFrequency("monthly");

    // Reset country-specific fields
    if (country === "US") {
      setUsState("CA");
      setFilingStatus("single");
      setTraditional401kState(0);
      setRothIRAState(0);
      setHsaState(0);
    } else if (country === "SG") {
      setResidencyType("citizen_pr");
      setAge(30);
      setVoluntaryCpfTopUpState(0);
      setSrsContributionState(0);
      setSgTaxReliefs(DEFAULT_SG_TAX_RELIEFS);
    } else if (country === "KR") {
      setKrResidencyType("resident");
      setKrTaxReliefs(DEFAULT_KR_TAX_RELIEFS);
    } else if (country === "NL") {
      setHasThirtyPercentRuling(false);
      setHasYoungChildren(false);
    } else if (country === "AU") {
      setAuResidencyType("resident");
      setHasPrivateHealthInsurance(true);
    } else if (country === "PT") {
      setPtResidencyType("resident");
      setPtFilingStatus("single");
      setPtNumberOfDependents(0);
      setPtAge(30);
      setPtPprContributionState(0);
    } else if (country === "TH") {
      setThResidencyType("resident");
      setThTaxReliefs(DEFAULT_TH_TAX_RELIEFS);
      setThProvidentFundState(0);
      setThRmfState(0);
      setThSsfState(0);
      setThEsgState(0);
      setThNsfState(0);
    } else if (country === "HK") {
      setHkResidencyType("resident");
      setHkTaxReliefs(DEFAULT_HK_TAX_RELIEFS);
      setHkVoluntaryContributionsState(0);
    } else if (country === "ID") {
      setIdTaxReliefs(DEFAULT_ID_TAX_RELIEFS);
      setIdDplkContribution(0);
      setIdZakatContribution(0);
    } else if (country === "TW") {
      setTwTaxReliefs(DEFAULT_TW_TAX_RELIEFS);
      setTwVoluntaryPensionState(0);
    } else if (country === "UK") {
      setUkResidencyType("resident");
      setUkRegion("rest_of_uk");
      setUkPensionContribution(0);
    } else if (country === "DE") {
      setDeState("BE");
      setDeIsMarried(false);
      setDeIsChurchMember(false);
      setDeIsChildless(false);
      setDeBavContributionState(0);
      setDeRiesterContributionState(0);
      setDeRuerupContributionState(0);
    }
  }

  // Currency based on country
  const currency: CurrencyCode = useMemo(
    () => getCountryConfig(country).currency.code,
    [country],
  );

  // Get limits
  const usLimits = useMemo(
    () => ({
      traditional401k: CONTRIBUTION_LIMITS.traditional401k,
      rothIRA: CONTRIBUTION_LIMITS.rothIRA,
      hsa: getHSALimit(hsaCoverageType),
    }),
    [hsaCoverageType],
  );

  const sgLimits = useMemo(
    () => ({
      voluntaryCpfTopUp: CPF_VOLUNTARY_TOPUP_LIMIT,
      srsContribution: getSRSLimit(residencyType),
    }),
    [residencyType],
  );

  const ptLimits = useMemo(() => {
    const limits = PTCalculator.getContributionLimits({ age: ptAge });
    // PPR limits: Under 35: €2,000 (€400 credit), 35-50: €1,750 (€350 credit), Over 50: €1,500 (€300 credit)
    const maxContribution = limits.ppr?.limit ?? 2000;
    const maxTaxCredit = maxContribution * 0.2; // 20% tax credit
    return {
      pprMaxContribution: maxContribution,
      pprMaxTaxCredit: maxTaxCredit,
    };
  }, [ptAge]);

  // TH limits
  const thLimits = useMemo(() => {
    // Get limits from calculator based on income
    const limits = THCalculator.getContributionLimits({ grossSalary });
    return {
      providentFund: limits.providentFundContribution?.limit ?? 500000,
      rmf: limits.rmfContribution?.limit ?? 500000,
      ssf: limits.ssfContribution?.limit ?? 200000,
      esg: limits.esgContribution?.limit ?? 300000,
      nsf: limits.nationalSavingsFundContribution?.limit ?? 30000,
    };
  }, [grossSalary]);

  const hkLimits = useMemo(() => {
    const limits = HKCalculator.getContributionLimits();
    return {
      taxDeductibleVoluntaryContributions:
        limits.taxDeductibleVoluntaryContributions?.limit ?? 60000,
    };
  }, []);

  // TW limits
  const twLimits = useMemo(() => {
    // Max voluntary pension: 6% of salary up to NT$150,000 monthly cap
    const monthlyCap = 150000;
    const maxRate = 0.06;
    const maxAnnual = monthlyCap * maxRate * 12;
    return {
      voluntaryPensionContribution: maxAnnual,
    };
  }, []);

  // DE limits
  const deLimits = useMemo(() => {
    const limits = DECalculator.getContributionLimits({
      country: "DE",
      grossSalary,
      isMarried: deIsMarried,
    } as Partial<DECalculatorInputs>);
    const bav = Math.min(
      limits.occupationalPension?.limit ?? 0,
      grossSalary,
    );
    const riester = Math.min(limits.riesterContribution?.limit ?? 0, grossSalary);
    const ruerup = Math.min(limits.ruerupContribution?.limit ?? 0, grossSalary);
    return { bav, riester, ruerup };
  }, [grossSalary, deIsMarried]);

  const deBavContributionClamped = Math.min(deBavContribution, deLimits.bav);
  const deRiesterContributionClamped = Math.min(
    deRiesterContribution,
    deLimits.riester,
  );
  const deRuerupContributionClamped = Math.min(
    deRuerupContribution,
    deLimits.ruerup,
  );

  // US contribution handlers with validation
  const setTraditional401k = useCallback((value: number) => {
    setTraditional401kState(
      Math.min(value, CONTRIBUTION_LIMITS.traditional401k),
    );
  }, []);

  const setRothIRA = useCallback((value: number) => {
    setRothIRAState(Math.min(value, CONTRIBUTION_LIMITS.rothIRA));
  }, []);

  const setHsa = useCallback(
    (value: number) => {
      const limit = getHSALimit(hsaCoverageType);
      setHsaState(Math.min(value, limit));
    },
    [hsaCoverageType],
  );

  const setHsaCoverageType = useCallback(
    (value: HSACoverageType) => {
      setHsaCoverageTypeState(value);
      // Adjust HSA if new limit is lower
      const newLimit = getHSALimit(value);
      if (hsa > newLimit) {
        setHsaState(newLimit);
      }
    },
    [hsa],
  );

  // SG contribution handlers with validation
  const setVoluntaryCpfTopUp = useCallback((value: number) => {
    setVoluntaryCpfTopUpState(Math.min(value, CPF_VOLUNTARY_TOPUP_LIMIT));
  }, []);

  const setSrsContribution = useCallback(
    (value: number) => {
      const limit = getSRSLimit(residencyType);
      setSrsContributionState(Math.min(value, limit));
    },
    [residencyType],
  );

  // PT PPR contribution handler with validation
  const setPtPprContribution = useCallback(
    (value: number) => {
      setPtPprContributionState(Math.min(value, ptLimits.pprMaxContribution));
    },
    [ptLimits.pprMaxContribution],
  );

  // TH contribution handlers with validation
  const setThProvidentFund = useCallback(
    (value: number) => setThProvidentFundState(Math.min(value, thLimits.providentFund)),
    [thLimits.providentFund],
  );

  const setThRmf = useCallback(
    (value: number) => setThRmfState(Math.min(value, thLimits.rmf)),
    [thLimits.rmf],
  );

  const setThSsf = useCallback(
    (value: number) => setThSsfState(Math.min(value, thLimits.ssf)),
    [thLimits.ssf],
  );

  const setThEsg = useCallback(
    (value: number) => setThEsgState(Math.min(value, thLimits.esg)),
    [thLimits.esg],
  );

  const setThNsf = useCallback(
    (value: number) => setThNsfState(Math.min(value, thLimits.nsf)),
    [thLimits.nsf],
  );

  const setHkVoluntaryContributions = useCallback(
    (value: number) =>
      setHkVoluntaryContributionsState(
        Math.min(value, hkLimits.taxDeductibleVoluntaryContributions),
      ),
    [hkLimits.taxDeductibleVoluntaryContributions],
  );

  // TW contribution handler with validation
  const setTwVoluntaryPension = useCallback(
    (value: number) =>
      setTwVoluntaryPensionState(Math.min(value, twLimits.voluntaryPensionContribution)),
    [twLimits.voluntaryPensionContribution],
  );

  // DE contribution handlers with validation
  const setDeBavContribution = useCallback(
    (value: number) => setDeBavContributionState(Math.min(value, deLimits.bav)),
    [deLimits.bav],
  );

  const setDeRiesterContribution = useCallback(
    (value: number) =>
      setDeRiesterContributionState(Math.min(value, deLimits.riester)),
    [deLimits.riester],
  );

  const setDeRuerupContribution = useCallback(
    (value: number) =>
      setDeRuerupContributionState(Math.min(value, deLimits.ruerup)),
    [deLimits.ruerup],
  );
  
  // UK pension contribution handler with validation
  // Pension contribution cannot exceed gross salary (calculator will further cap based on taxes)
  const setUkPensionContributionValidated = useCallback(
    (value: number) => {
      // Cap at gross salary and annual allowance (£60,000)
      // The calculator will further cap to ensure non-negative take-home
      const maxContribution = Math.min(60000, grossSalary);
      setUkPensionContribution(Math.min(value, maxContribution));
    },
    [grossSalary],
  );

  // Build inputs based on country
  const inputs: CalculatorInputs = useMemo(() => {
    if (country === "US") {
      const usInputs: USCalculatorInputs = {
        country: "US",
        grossSalary,
        state: usState,
        filingStatus,
        payFrequency,
        contributions: {
          traditional401k: Math.min(traditional401k, usLimits.traditional401k),
          rothIRA: Math.min(rothIRA, usLimits.rothIRA),
          hsa: Math.min(hsa, usLimits.hsa),
          hsaCoverageType,
        },
      };
      return usInputs;
    } else if (country === "SG") {
      const sgInputs: SGCalculatorInputs = {
        country: "SG",
        grossSalary,
        payFrequency,
        residencyType,
        age,
        contributions: {
          voluntaryCpfTopUp: Math.min(
            voluntaryCpfTopUp,
            sgLimits.voluntaryCpfTopUp,
          ),
          srsContribution: Math.min(srsContribution, sgLimits.srsContribution),
        },
        taxReliefs: sgTaxReliefs,
      };
      return sgInputs;
    } else if (country === "KR") {
      const krInputs: KRCalculatorInputs = {
        country: "KR",
        grossSalary,
        payFrequency,
        residencyType: krResidencyType,
        contributions: {},
        taxReliefs: krTaxReliefs,
      };
      return krInputs;
    } else if (country === "NL") {
      const nlInputs: NLCalculatorInputs = {
        country: "NL",
        grossSalary,
        payFrequency,
        hasThirtyPercentRuling,
        hasYoungChildren,
      };
      return nlInputs;
    } else if (country === "AU") {
      const auInputs: AUCalculatorInputs = {
        country: "AU",
        grossSalary,
        payFrequency,
        residencyType: auResidencyType,
        hasPrivateHealthInsurance,
      };
      return auInputs;
    } else if (country === "PT") {
      const ptInputs: PTCalculatorInputs = {
        country: "PT",
        grossSalary,
        payFrequency,
        residencyType: ptResidencyType,
        filingStatus: ptFilingStatus,
        numberOfDependents: ptNumberOfDependents,
        age: ptAge,
        contributions: {
          pprContribution: Math.min(ptPprContribution, ptLimits.pprMaxContribution),
        },
      };
      return ptInputs;
    } else if (country === "ID") {
      const idInputs: IDCalculatorInputs = {
        country: "ID",
        grossSalary,
        payFrequency,
        contributions: {
          dplkContribution: idDplkContribution,
          zakatContribution: idZakatContribution,
        },
        taxReliefs: idTaxReliefs,
      };
      return idInputs;
    } else if (country === "TW") {
      const twInputs: TWCalculatorInputs = {
        country: "TW",
        grossSalary,
        payFrequency,
        contributions: {
          voluntaryPensionContribution: Math.min(
            twVoluntaryPension,
            twLimits.voluntaryPensionContribution,
          ),
        },
        taxReliefs: twTaxReliefs,
      };
      return twInputs;
    } else if (country === "UK") {
      const ukInputs: UKCalculatorInputs = {
        country: "UK",
        grossSalary,
        payFrequency,
        residencyType: ukResidencyType,
        region: ukRegion,
        contributions: {
          pensionContribution: ukPensionContribution,
        },
      };
      return ukInputs;
    } else if (country === "DE") {
      const deInputs: DECalculatorInputs = {
        country: "DE",
        grossSalary,
        payFrequency,
        state: deState,
        isMarried: deIsMarried,
        isChurchMember: deIsChurchMember,
        isChildless: deIsChildless,
        contributions: {
          occupationalPension: deBavContributionClamped,
          riesterContribution: deRiesterContributionClamped,
          ruerupContribution: deRuerupContributionClamped,
        },
      };
      return deInputs;
    } else {
      // TH or HK
      if (country === "HK") {
        const hkInputs: HKCalculatorInputs = {
          country: "HK",
          grossSalary,
          payFrequency,
          residencyType: hkResidencyType,
          contributions: {
            taxDeductibleVoluntaryContributions: Math.min(
              hkVoluntaryContributions,
              hkLimits.taxDeductibleVoluntaryContributions,
            ),
          },
          taxReliefs: hkTaxReliefs,
        };
        return hkInputs;
      }

      const thInputs: THCalculatorInputs = {
        country: "TH",
        grossSalary,
        payFrequency,
        residencyType: thResidencyType,
        contributions: {
          providentFundContribution: Math.min(thProvidentFund, thLimits.providentFund),
          rmfContribution: Math.min(thRmf, thLimits.rmf),
          ssfContribution: Math.min(thSsf, thLimits.ssf),
          esgContribution: Math.min(thEsg, thLimits.esg),
          nationalSavingsFundContribution: Math.min(thNsf, thLimits.nsf),
        },
        taxReliefs: {
          ...thTaxReliefs,
          // Include contribution amounts in taxReliefs for allowance calculations
          providentFundContribution: Math.min(thProvidentFund, thLimits.providentFund),
          rmfContribution: Math.min(thRmf, thLimits.rmf),
          ssfContribution: Math.min(thSsf, thLimits.ssf),
          esgContribution: Math.min(thEsg, thLimits.esg),
          nationalSavingsFundContribution: Math.min(thNsf, thLimits.nsf),
        },
      };
      return thInputs;
    }
  }, [
    country,
    grossSalary,
    payFrequency,
    usState,
    filingStatus,
    traditional401k,
    rothIRA,
    hsa,
    hsaCoverageType,
    residencyType,
    age,
    voluntaryCpfTopUp,
    srsContribution,
    sgTaxReliefs,
    krResidencyType,
    krTaxReliefs,
    hasThirtyPercentRuling,
    hasYoungChildren,
    auResidencyType,
    hasPrivateHealthInsurance,
    ptResidencyType,
    ptFilingStatus,
    ptNumberOfDependents,
    ptAge,
    ptPprContribution,
    thResidencyType,
    thTaxReliefs,
    thProvidentFund,
    thRmf,
    thSsf,
    thEsg,
    thNsf,
    hkResidencyType,
    hkTaxReliefs,
    hkVoluntaryContributions,
    idTaxReliefs,
    idDplkContribution,
    idZakatContribution,
    twTaxReliefs,
    twVoluntaryPension,
    twLimits,
    ukResidencyType,
    ukRegion,
    ukPensionContribution,
    deState,
    deIsMarried,
    deIsChurchMember,
    deIsChildless,
    deBavContributionClamped,
    deRiesterContributionClamped,
    deRuerupContributionClamped,
    usLimits,
    sgLimits,
    ptLimits,
    thLimits,
    hkLimits,
  ]);

  // Calculate result
  const result = useMemo(() => {
    return calculateNetSalary(inputs);
  }, [inputs]);

  return {
    // Currency (derived from country prop)
    currency,

    // Common inputs
    grossSalary,
    setGrossSalary,
    payFrequency,
    setPayFrequency,

    // US-specific
    usState,
    setUsState,
    filingStatus,
    setFilingStatus,
    traditional401k,
    setTraditional401k,
    rothIRA,
    setRothIRA,
    hsa,
    setHsa,
    hsaCoverageType,
    setHsaCoverageType,

    // SG-specific
    residencyType,
    setResidencyType,
    age,
    setAge,
    voluntaryCpfTopUp,
    setVoluntaryCpfTopUp,
    srsContribution,
    setSrsContribution,
    sgTaxReliefs,
    setSgTaxReliefs,

    // KR-specific
    krResidencyType,
    setKrResidencyType,
    krTaxReliefs,
    setKrTaxReliefs,

    // NL-specific
    hasThirtyPercentRuling,
    setHasThirtyPercentRuling,
    hasYoungChildren,
    setHasYoungChildren,

    // AU-specific
    auResidencyType,
    setAuResidencyType,
    hasPrivateHealthInsurance,
    setHasPrivateHealthInsurance,

    // PT-specific
    ptResidencyType,
    setPtResidencyType,
    ptFilingStatus,
    setPtFilingStatus,
    ptNumberOfDependents,
    setPtNumberOfDependents,
    ptAge,
    setPtAge,
    ptPprContribution,
    setPtPprContribution,

    // TH-specific
    thResidencyType,
    setThResidencyType,
    thTaxReliefs,
    setThTaxReliefs,
    thProvidentFund,
    setThProvidentFund,
    thRmf,
    setThRmf,
    thSsf,
    setThSsf,
    thEsg,
    setThEsg,
    thNsf,
    setThNsf,

    // HK-specific
    hkResidencyType,
    setHkResidencyType,
    hkTaxReliefs,
    setHkTaxReliefs,
    hkVoluntaryContributions,
    setHkVoluntaryContributions,

    // ID-specific
    idTaxReliefs,
    setIdTaxReliefs,
    idDplkContribution,
    setIdDplkContribution,
    idZakatContribution,
    setIdZakatContribution,

    // TW-specific
    twTaxReliefs,
    setTwTaxReliefs,
    twVoluntaryPension,
    setTwVoluntaryPension,
    twLimits,
    // UK-specific
    ukResidencyType,
    setUkResidencyType,
    ukRegion,
    setUkRegion,
    ukPensionContribution,
    setUkPensionContribution: setUkPensionContributionValidated,

    // DE-specific
    deState,
    setDeState,
    deIsMarried,
    setDeIsMarried,
    deIsChurchMember,
    setDeIsChurchMember,
    deIsChildless,
    setDeIsChildless,
    deBavContribution: deBavContributionClamped,
    setDeBavContribution,
    deRiesterContribution: deRiesterContributionClamped,
    setDeRiesterContribution,
    deRuerupContribution: deRuerupContributionClamped,
    setDeRuerupContribution,
    deLimits,

    // Limits
    usLimits,
    sgLimits,
    ptLimits,
    thLimits,
    hkLimits,

    // Results
    result,
  };
}

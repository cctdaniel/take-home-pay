"use client";

import {
  calculateNetSalary,
  getCountryConfig,
  getDefaultInputs,
} from "@/lib/countries/registry";
import { DECalculator } from "@/lib/countries/de/calculator";
import { ESCalculator } from "@/lib/countries/es/calculator";
import type {
  ESCalculatorInputs,
  ESEmploymentContractType,
  ESFilingStatus,
  ESResidencyType,
} from "@/lib/countries/es/types";
import { GRCalculator } from "@/lib/countries/gr/calculator";
import type {
  GRCalculatorInputs,
  GRResidencyType,
} from "@/lib/countries/gr/types";
import { HKCalculator } from "@/lib/countries/hk/calculator";
import { MYCalculator } from "@/lib/countries/my/calculator";
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
  MYCalculatorInputs,
  MYEpfCategory,
  MYResidencyType,
  MYTaxReliefInputs,
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

const DEFAULT_MY_TAX_RELIEFS: MYTaxReliefInputs = {
  hasSpouseRelief: false,
  numberOfChildrenUnder18: 0,
  numberOfChildrenTertiary: 0,
  isDisabled: false,
  lifestyleRelief: 0,
  medicalRelief: 0,
};

const DEFAULT_TW_TAX_RELIEFS: TWTaxReliefInputs = {
  isMarried: false,
  hasDisability: false,
  isGoldCardHolder: false,
};

function getDefaultGrossSalary(country: CountryCode): number {
  return getDefaultInputs(country).grossSalary;
}

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

  // GR-specific
  grResidencyType: GRResidencyType;
  setGrResidencyType: (value: GRResidencyType) => void;
  grAge: number;
  setGrAge: (value: number) => void;
  grNumberOfDependents: number;
  setGrNumberOfDependents: (value: number) => void;
  grOccupationalPensionContribution: number;
  setGrOccupationalPensionContribution: (value: number) => void;
  grLimits: {
    occupationalPensionContribution: number;
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

  // MY-specific
  myResidencyType: MYResidencyType;
  setMyResidencyType: (value: MYResidencyType) => void;
  myAge: number;
  setMyAge: (value: number) => void;
  myEpfCategory: MYEpfCategory;
  setMyEpfCategory: (value: MYEpfCategory) => void;
  myTaxReliefs: MYTaxReliefInputs;
  setMyTaxReliefs: (value: MYTaxReliefInputs) => void;
  myVoluntaryEpfContribution: number;
  setMyVoluntaryEpfContribution: (value: number) => void;
  myPrsContribution: number;
  setMyPrsContribution: (value: number) => void;
  myLimits: {
    voluntaryEpfContribution: number;
    prsContribution: number;
  };

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

  // ES-specific
  esResidencyType: ESResidencyType;
  setEsResidencyType: (value: ESResidencyType) => void;
  esRegion: string;
  setEsRegion: (value: string) => void;
  esFilingStatus: ESFilingStatus;
  setEsFilingStatus: (value: ESFilingStatus) => void;
  esAge: number;
  setEsAge: (value: number) => void;
  esNumberOfChildren: number;
  setEsNumberOfChildren: (value: number) => void;
  esNumberOfChildrenUnderThree: number;
  setEsNumberOfChildrenUnderThree: (value: number) => void;
  esEmploymentContractType: ESEmploymentContractType;
  setEsEmploymentContractType: (value: ESEmploymentContractType) => void;
  esPensionContribution: number;
  setEsPensionContribution: (value: number) => void;
  esLimits: {
    pensionContribution: number;
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
  const [grossSalary, setGrossSalary] = useState(() =>
    getDefaultGrossSalary(country),
  );
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

  // GR-specific state
  const [grResidencyType, setGrResidencyType] =
    useState<GRResidencyType>("resident");
  const [grAge, setGrAge] = useState(31);
  const [grNumberOfDependents, setGrNumberOfDependents] = useState(0);
  const [
    grOccupationalPensionContribution,
    setGrOccupationalPensionContributionState,
  ] = useState(0);

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

  // MY-specific state
  const [myResidencyType, setMyResidencyType] =
    useState<MYResidencyType>("resident");
  const [myAge, setMyAge] = useState(30);
  const [myEpfCategory, setMyEpfCategory] =
    useState<MYEpfCategory>("citizen");
  const [myTaxReliefs, setMyTaxReliefs] = useState<MYTaxReliefInputs>(
    DEFAULT_MY_TAX_RELIEFS,
  );
  const [myVoluntaryEpfContribution, setMyVoluntaryEpfContributionState] =
    useState(0);
  const [myPrsContribution, setMyPrsContributionState] = useState(0);

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

  // ES-specific state
  const [esResidencyType, setEsResidencyType] =
    useState<ESResidencyType>("resident");
  const [esRegion, setEsRegion] = useState("general");
  const [esFilingStatus, setEsFilingStatus] =
    useState<ESFilingStatus>("individual");
  const [esAge, setEsAge] = useState(30);
  const [esNumberOfChildren, setEsNumberOfChildren] = useState(0);
  const [esNumberOfChildrenUnderThree, setEsNumberOfChildrenUnderThree] =
    useState(0);
  const [esEmploymentContractType, setEsEmploymentContractType] =
    useState<ESEmploymentContractType>("permanent");
  const [esPensionContribution, setEsPensionContributionState] = useState(0);

  // Track previous country using state (React docs pattern for adjusting state when props change)
  const [prevCountry, setPrevCountry] = useState(country);

  // Reset defaults when country changes (during render, not in effect)
  if (prevCountry !== country) {
    setPrevCountry(country);
    setGrossSalary(getDefaultGrossSalary(country));
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
    } else if (country === "GR") {
      setGrResidencyType("resident");
      setGrAge(31);
      setGrNumberOfDependents(0);
      setGrOccupationalPensionContributionState(0);
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
    } else if (country === "MY") {
      setMyResidencyType("resident");
      setMyAge(30);
      setMyEpfCategory("citizen");
      setMyTaxReliefs(DEFAULT_MY_TAX_RELIEFS);
      setMyVoluntaryEpfContributionState(0);
      setMyPrsContributionState(0);
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
    } else if (country === "ES") {
      setEsResidencyType("resident");
      setEsRegion("general");
      setEsFilingStatus("individual");
      setEsAge(30);
      setEsNumberOfChildren(0);
      setEsNumberOfChildrenUnderThree(0);
      setEsEmploymentContractType("permanent");
      setEsPensionContributionState(0);
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

  const grLimits = useMemo(() => {
    const limits = GRCalculator.getContributionLimits({
      country: "GR",
      grossSalary,
      residencyType: grResidencyType,
    } as Partial<GRCalculatorInputs>);

    return {
      occupationalPensionContribution:
        limits.occupationalPensionContribution?.limit ?? grossSalary * 0.2,
    };
  }, [grossSalary, grResidencyType]);

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

  const myLimits = useMemo(() => {
    const limits = MYCalculator.getContributionLimits();
    return {
      voluntaryEpfContribution:
        limits.voluntaryEpfContribution?.limit ?? 100000,
      prsContribution: limits.prsContribution?.limit ?? 3000,
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

  const esLimits = useMemo(() => {
    const limits = ESCalculator.getContributionLimits({
      country: "ES",
      grossSalary,
      residencyType: esResidencyType,
      employmentContractType: esEmploymentContractType,
    } as Partial<ESCalculatorInputs>);

    return {
      pensionContribution: limits.pensionContribution?.limit ?? 0,
    };
  }, [grossSalary, esResidencyType, esEmploymentContractType]);

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

  const setGrOccupationalPensionContribution = useCallback(
    (value: number) => {
      setGrOccupationalPensionContributionState(
        Math.min(value, grLimits.occupationalPensionContribution),
      );
    },
    [grLimits.occupationalPensionContribution],
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

  const setMyVoluntaryEpfContribution = useCallback(
    (value: number) =>
      setMyVoluntaryEpfContributionState(
        Math.min(value, myLimits.voluntaryEpfContribution),
      ),
    [myLimits.voluntaryEpfContribution],
  );

  // TW contribution handler with validation
  const setTwVoluntaryPension = useCallback(
    (value: number) =>
      setTwVoluntaryPensionState(Math.min(value, twLimits.voluntaryPensionContribution)),
    [twLimits.voluntaryPensionContribution],
  );

  const setMyPrsContribution = useCallback(
    (value: number) =>
      setMyPrsContributionState(Math.min(value, myLimits.prsContribution)),
    [myLimits.prsContribution],
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

  const setEsPensionContribution = useCallback(
    (value: number) =>
      setEsPensionContributionState(
        Math.min(value, esLimits.pensionContribution),
      ),
    [esLimits.pensionContribution],
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
    } else if (country === "GR") {
      const grInputs: GRCalculatorInputs = {
        country: "GR",
        grossSalary,
        payFrequency,
        residencyType: grResidencyType,
        age: grAge,
        numberOfDependents: grNumberOfDependents,
        contributions: {
          occupationalPensionContribution: Math.min(
            grOccupationalPensionContribution,
            grLimits.occupationalPensionContribution,
          ),
        },
      };
      return grInputs;
    } else if (country === "ES") {
      const esInputs: ESCalculatorInputs = {
        country: "ES",
        grossSalary,
        payFrequency,
        residencyType: esResidencyType,
        region: esRegion,
        filingStatus: esFilingStatus,
        age: esAge,
        numberOfChildren: esNumberOfChildren,
        numberOfChildrenUnderThree: Math.min(
          esNumberOfChildrenUnderThree,
          esNumberOfChildren,
        ),
        employmentContractType: esEmploymentContractType,
        contributions: {
          pensionContribution: Math.min(
            esPensionContribution,
            esLimits.pensionContribution,
          ),
        },
      };
      return esInputs;
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
    } else if (country === "MY") {
      const myInputs: MYCalculatorInputs = {
        country: "MY",
        grossSalary,
        payFrequency,
        residencyType: myResidencyType,
        age: myAge,
        epfCategory: myEpfCategory,
        contributions: {
          voluntaryEpfContribution: myVoluntaryEpfContribution,
          prsContribution: Math.min(myPrsContribution, myLimits.prsContribution),
        },
        taxReliefs: myTaxReliefs,
      };
      return myInputs;
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
    grResidencyType,
    grAge,
    grNumberOfDependents,
    grOccupationalPensionContribution,
    grLimits,
    esResidencyType,
    esRegion,
    esFilingStatus,
    esAge,
    esNumberOfChildren,
    esNumberOfChildrenUnderThree,
    esEmploymentContractType,
    esPensionContribution,
    esLimits,
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
    myResidencyType,
    myAge,
    myEpfCategory,
    myTaxReliefs,
    myVoluntaryEpfContribution,
    myPrsContribution,
    myLimits,
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

    // GR-specific
    grResidencyType,
    setGrResidencyType,
    grAge,
    setGrAge,
    grNumberOfDependents,
    setGrNumberOfDependents,
    grOccupationalPensionContribution,
    setGrOccupationalPensionContribution,
    grLimits,

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

    // MY-specific
    myResidencyType,
    setMyResidencyType,
    myAge,
    setMyAge,
    myEpfCategory,
    setMyEpfCategory,
    myTaxReliefs,
    setMyTaxReliefs,
    myVoluntaryEpfContribution,
    setMyVoluntaryEpfContribution,
    myPrsContribution,
    setMyPrsContribution,
    myLimits,

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

    // ES-specific
    esResidencyType,
    setEsResidencyType,
    esRegion,
    setEsRegion,
    esFilingStatus,
    setEsFilingStatus,
    esAge,
    setEsAge,
    esNumberOfChildren,
    setEsNumberOfChildren,
    esNumberOfChildrenUnderThree,
    setEsNumberOfChildrenUnderThree,
    esEmploymentContractType,
    setEsEmploymentContractType,
    esPensionContribution,
    setEsPensionContribution,
    esLimits,

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

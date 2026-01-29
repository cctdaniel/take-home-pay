"use client";

import { useState, useMemo, useCallback } from "react";
import type {
  CountryCode,
  CalculatorInputs,
  USCalculatorInputs,
  SGCalculatorInputs,
  KRCalculatorInputs,
  NLCalculatorInputs,
  USFilingStatus,
  SGResidencyType,
  KRResidencyType,
  SGTaxReliefInputs,
  KRTaxReliefInputs,
  PayFrequency,
  CalculationResult,
  CurrencyCode,
} from "@/lib/countries/types";
import { calculateNetSalary, getCountryConfig } from "@/lib/countries/registry";
import { CONTRIBUTION_LIMITS, getHSALimit, type HSACoverageType } from "@/lib/countries/us/constants/contribution-limits";
import { getSRSLimit, CPF_VOLUNTARY_TOPUP_LIMIT } from "@/lib/countries/sg/constants/cpf-rates-2026";

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

// ============================================================================
// RETURN TYPE
// ============================================================================
export interface UseMultiCountryCalculatorReturn {
  // Country selection
  country: CountryCode;
  setCountry: (country: CountryCode) => void;
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
export function useMultiCountryCalculator(): UseMultiCountryCalculatorReturn {
  // Country selection
  const [country, setCountryState] = useState<CountryCode>("US");

  // Common inputs
  const [grossSalary, setGrossSalary] = useState(100000);
  const [payFrequency, setPayFrequency] = useState<PayFrequency>("monthly");

  // US-specific state
  const [usState, setUsState] = useState("CA");
  const [filingStatus, setFilingStatus] = useState<USFilingStatus>("single");
  const [traditional401k, setTraditional401kState] = useState(0);
  const [rothIRA, setRothIRAState] = useState(0);
  const [hsa, setHsaState] = useState(0);
  const [hsaCoverageType, setHsaCoverageTypeState] = useState<HSACoverageType>("self");

  // SG-specific state
  const [residencyType, setResidencyType] = useState<SGResidencyType>("citizen_pr");
  const [age, setAge] = useState(30);
  const [voluntaryCpfTopUp, setVoluntaryCpfTopUpState] = useState(0);
  const [srsContribution, setSrsContributionState] = useState(0);
  const [sgTaxReliefs, setSgTaxReliefs] = useState<SGTaxReliefInputs>(DEFAULT_SG_TAX_RELIEFS);

  // KR-specific state
  const [krResidencyType, setKrResidencyType] = useState<KRResidencyType>("resident");
  const [krTaxReliefs, setKrTaxReliefs] = useState<KRTaxReliefInputs>(DEFAULT_KR_TAX_RELIEFS);

  // NL-specific state
  const [hasThirtyPercentRuling, setHasThirtyPercentRuling] = useState(false);

  // Currency based on country
  const currency: CurrencyCode = useMemo(() => getCountryConfig(country).currency.code, [country]);

  // Get limits
  const usLimits = useMemo(() => ({
    traditional401k: CONTRIBUTION_LIMITS.traditional401k,
    rothIRA: CONTRIBUTION_LIMITS.rothIRA,
    hsa: getHSALimit(hsaCoverageType),
  }), [hsaCoverageType]);

  const sgLimits = useMemo(() => ({
    voluntaryCpfTopUp: CPF_VOLUNTARY_TOPUP_LIMIT,
    srsContribution: getSRSLimit(residencyType),
  }), [residencyType]);

  // Country change handler - reset to defaults for new country
  const setCountry = useCallback((newCountry: CountryCode) => {
    setCountryState(newCountry);

    if (newCountry === "US") {
      // Reset to US defaults
      setGrossSalary(100000);
      setUsState("CA");
      setFilingStatus("single");
      setTraditional401kState(0);
      setRothIRAState(0);
      setHsaState(0);
    } else if (newCountry === "SG") {
      // Reset to SG defaults
      setGrossSalary(60000);
      setResidencyType("citizen_pr");
      setAge(30);
      setVoluntaryCpfTopUpState(0);
      setSrsContributionState(0);
      setSgTaxReliefs(DEFAULT_SG_TAX_RELIEFS);
    } else if (newCountry === "KR") {
      // Reset to KR defaults
      setGrossSalary(50000000); // ₩50M typical salary
      setKrResidencyType("resident");
      setKrTaxReliefs(DEFAULT_KR_TAX_RELIEFS);
    } else if (newCountry === "NL") {
      setGrossSalary(55000);
      setHasThirtyPercentRuling(false);
    }
  }, []);

  // US contribution handlers with validation
  const setTraditional401k = useCallback((value: number) => {
    setTraditional401kState(Math.min(value, CONTRIBUTION_LIMITS.traditional401k));
  }, []);

  const setRothIRA = useCallback((value: number) => {
    setRothIRAState(Math.min(value, CONTRIBUTION_LIMITS.rothIRA));
  }, []);

  const setHsa = useCallback((value: number) => {
    const limit = getHSALimit(hsaCoverageType);
    setHsaState(Math.min(value, limit));
  }, [hsaCoverageType]);

  const setHsaCoverageType = useCallback((value: HSACoverageType) => {
    setHsaCoverageTypeState(value);
    // Adjust HSA if new limit is lower
    const newLimit = getHSALimit(value);
    if (hsa > newLimit) {
      setHsaState(newLimit);
    }
  }, [hsa]);

  // SG contribution handlers with validation
  const setVoluntaryCpfTopUp = useCallback((value: number) => {
    setVoluntaryCpfTopUpState(Math.min(value, CPF_VOLUNTARY_TOPUP_LIMIT));
  }, []);

  const setSrsContribution = useCallback((value: number) => {
    const limit = getSRSLimit(residencyType);
    setSrsContributionState(Math.min(value, limit));
  }, [residencyType]);

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
          voluntaryCpfTopUp: Math.min(voluntaryCpfTopUp, sgLimits.voluntaryCpfTopUp),
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
    } else {
      const nlInputs: NLCalculatorInputs = {
        country: "NL",
        grossSalary,
        payFrequency,
        hasThirtyPercentRuling,
      };
      return nlInputs;
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
    usLimits,
    sgLimits,
  ]);

  // Calculate result
  const result = useMemo(() => {
    return calculateNetSalary(inputs);
  }, [inputs]);

  return {
    // Country selection
    country,
    setCountry,
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

    // Limits
    usLimits,
    sgLimits,

    // Results
    result,
  };
}

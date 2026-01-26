"use client";

import { useState, useMemo, useCallback } from "react";
import type { CalculatorInputs, CalculationResult, PayFrequency, ContributionInputs } from "@/lib/tax-calculations/types";
import type { FilingStatus } from "@/lib/constants/tax-brackets-2025";
import type { HSACoverageType } from "@/lib/constants/contribution-limits";
import { calculateNetSalary } from "@/lib/tax-calculations/calculator";
import { CONTRIBUTION_LIMITS_2025, getHSALimit } from "@/lib/constants/contribution-limits";

interface UseSalaryCalculatorReturn {
  // Inputs
  grossSalary: number;
  setGrossSalary: (value: number) => void;
  state: string;
  setState: (value: string) => void;
  filingStatus: FilingStatus;
  setFilingStatus: (value: FilingStatus) => void;
  payFrequency: PayFrequency;
  setPayFrequency: (value: PayFrequency) => void;

  // Contributions
  traditional401k: number;
  setTraditional401k: (value: number) => void;
  rothIRA: number;
  setRothIRA: (value: number) => void;
  hsa: number;
  setHsa: (value: number) => void;
  hsaCoverageType: HSACoverageType;
  setHsaCoverageType: (value: HSACoverageType) => void;

  // Limits
  limits: {
    traditional401k: number;
    rothIRA: number;
    hsa: number;
  };

  // Results
  result: CalculationResult;
}

export function useSalaryCalculator(): UseSalaryCalculatorReturn {
  // Input state
  const [grossSalary, setGrossSalary] = useState(100000);
  const [state, setState] = useState("CA");
  const [filingStatus, setFilingStatus] = useState<FilingStatus>("single");
  const [payFrequency, setPayFrequency] = useState<PayFrequency>("annual");

  // Contribution state
  const [traditional401k, setTraditional401k] = useState(0);
  const [rothIRA, setRothIRA] = useState(0);
  const [hsa, setHsa] = useState(0);
  const [hsaCoverageType, setHsaCoverageType] = useState<HSACoverageType>("self");

  // Calculate limits
  const limits = useMemo(() => ({
    traditional401k: CONTRIBUTION_LIMITS_2025.traditional401k,
    rothIRA: CONTRIBUTION_LIMITS_2025.rothIRA,
    hsa: getHSALimit(hsaCoverageType),
  }), [hsaCoverageType]);

  // Ensure contributions don't exceed limits
  const validatedContributions: ContributionInputs = useMemo(() => ({
    traditional401k: Math.min(traditional401k, limits.traditional401k),
    rothIRA: Math.min(rothIRA, limits.rothIRA),
    hsa: Math.min(hsa, limits.hsa),
    hsaCoverageType,
  }), [traditional401k, rothIRA, hsa, hsaCoverageType, limits]);

  // Calculate result
  const result = useMemo(() => {
    const inputs: CalculatorInputs = {
      grossSalary,
      state,
      filingStatus,
      payFrequency,
      contributions: validatedContributions,
    };
    return calculateNetSalary(inputs);
  }, [grossSalary, state, filingStatus, payFrequency, validatedContributions]);

  // Callbacks with validation
  const handleSetTraditional401k = useCallback((value: number) => {
    setTraditional401k(Math.min(value, CONTRIBUTION_LIMITS_2025.traditional401k));
  }, []);

  const handleSetRothIRA = useCallback((value: number) => {
    setRothIRA(Math.min(value, CONTRIBUTION_LIMITS_2025.rothIRA));
  }, []);

  const handleSetHsa = useCallback((value: number) => {
    const limit = getHSALimit(hsaCoverageType);
    setHsa(Math.min(value, limit));
  }, [hsaCoverageType]);

  const handleSetHsaCoverageType = useCallback((value: HSACoverageType) => {
    setHsaCoverageType(value);
    // Adjust HSA if new limit is lower
    const newLimit = getHSALimit(value);
    if (hsa > newLimit) {
      setHsa(newLimit);
    }
  }, [hsa]);

  return {
    grossSalary,
    setGrossSalary,
    state,
    setState,
    filingStatus,
    setFilingStatus,
    payFrequency,
    setPayFrequency,
    traditional401k,
    setTraditional401k: handleSetTraditional401k,
    rothIRA,
    setRothIRA: handleSetRothIRA,
    hsa,
    setHsa: handleSetHsa,
    hsaCoverageType,
    setHsaCoverageType: handleSetHsaCoverageType,
    limits,
    result,
  };
}

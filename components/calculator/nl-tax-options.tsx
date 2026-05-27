"use client";

import {
  CalculatorFieldGrid,
  CurrencyAmountField,
  PayFrequencyField,
  SelectField,
} from "@/components/calculator/calculator-fields";
import { ContributionSlider } from "@/components/ui/contribution-slider";
import type {
  CurrencyCode,
  NLIackEligibility,
  NLThirtyPercentRulingType,
  PayFrequency,
} from "@/lib/countries/types";

interface NLTaxOptionsProps {
  payFrequency: PayFrequency;
  onPayFrequencyChange: (value: PayFrequency) => void;
  hasThirtyPercentRuling?: boolean;
  onThirtyPercentRulingChange?: (value: boolean) => void;
  hasYoungChildren?: boolean;
  onYoungChildrenChange?: (value: boolean) => void;
  thirtyPercentRulingType?: NLThirtyPercentRulingType;
  onThirtyPercentRulingTypeChange?: (
    value: NLThirtyPercentRulingType,
  ) => void;
  iackEligibility?: NLIackEligibility;
  onIackEligibilityChange?: (value: NLIackEligibility) => void;
  employeePensionPremiumAnnual?: number;
  onEmployeePensionPremiumAnnualChange?: (value: number) => void;
  pensionAccrualFactorA?: number;
  onPensionAccrualFactorAChange?: (value: number) => void;
  unusedAnnuityReserveMargin?: number;
  onUnusedAnnuityReserveMarginChange?: (value: number) => void;
  maxUnusedAnnuityReserveMargin?: number;
  currency: CurrencyCode;
}

export function NLTaxOptions({
  payFrequency,
  onPayFrequencyChange,
  hasThirtyPercentRuling,
  onThirtyPercentRulingChange,
  hasYoungChildren,
  onYoungChildrenChange,
  thirtyPercentRulingType,
  onThirtyPercentRulingTypeChange,
  iackEligibility,
  onIackEligibilityChange,
  employeePensionPremiumAnnual = 0,
  onEmployeePensionPremiumAnnualChange,
  pensionAccrualFactorA = 0,
  onPensionAccrualFactorAChange,
  unusedAnnuityReserveMargin = 0,
  onUnusedAnnuityReserveMarginChange,
  maxUnusedAnnuityReserveMargin = 0,
  currency,
}: NLTaxOptionsProps) {
  const selectedRulingType =
    thirtyPercentRulingType ??
    (hasThirtyPercentRuling ? "standard" : "none");
  const selectedIackEligibility =
    iackEligibility ?? (hasYoungChildren ? "noFiscalPartner" : "none");

  return (
    <CalculatorFieldGrid columns={3}>
      <PayFrequencyField value={payFrequency} onChange={onPayFrequencyChange} />
      <CurrencyAmountField
        id="nl-employee-pension-premium"
        label="Employee Pension Premium"
        value={employeePensionPremiumAnnual}
        onChange={(value) =>
          onEmployeePensionPremiumAnnualChange?.(Math.max(0, value))
        }
        currency={currency}
        step={100}
        description="Annual employee pension premium withheld from salary; plan-specific and deducted before the wage-tax base."
      />
      <CurrencyAmountField
        id="nl-pension-factor-a"
        label="Pension Accrual Factor A"
        value={pensionAccrualFactorA}
        onChange={(value) =>
          onPensionAccrualFactorAChange?.(Math.max(0, value))
        }
        currency={currency}
        step={100}
        description="Enter the Factor A pension accrual from your Dutch UPO; it reduces the lijfrente annual margin."
      />
      <SelectField<NLThirtyPercentRulingType>
        id="thirty-percent-ruling-type"
        label="30% Ruling / Expat Scheme"
        value={selectedRulingType}
        onChange={(value) => {
          onThirtyPercentRulingTypeChange?.(value);
          onThirtyPercentRulingChange?.(value !== "none");
        }}
        options={[
          { value: "none", label: "Not applied" },
          { value: "standard", label: "Standard salary norm" },
          { value: "under30Masters", label: "Under 30 master's norm" },
          { value: "researcherNoSalaryNorm", label: "Researcher/doctor exception" },
        ]}
        description="Caps the tax-free allowance to 30% of salary, the 2026 maximum, and any applicable salary norm."
      />
      <SelectField<NLIackEligibility>
        id="nl-iack-eligibility"
        label="IACK Child Credit"
        value={selectedIackEligibility}
        onChange={(value) => {
          onIackEligibilityChange?.(value);
          onYoungChildrenChange?.(value !== "none");
        }}
        options={[
          { value: "none", label: "Not eligible" },
          { value: "noFiscalPartner", label: "No fiscal partner" },
          { value: "lowerEarningPartner", label: "Lower-earning partner" },
          { value: "partnerUnderSixMonths", label: "Partner under 6 months" },
        ]}
        description="For a child born after 31 Dec 2013 who lives in your household for at least 6 months."
      />
      {maxUnusedAnnuityReserveMargin > 0 && (
        <div className="sm:col-span-2 lg:col-span-3">
          <ContributionSlider
            label="Unused Reserveringsruimte"
            value={Math.min(
              Math.max(0, unusedAnnuityReserveMargin),
              maxUnusedAnnuityReserveMargin,
            )}
            onChange={(value) =>
              onUnusedAnnuityReserveMarginChange?.(
                Math.min(Math.max(0, value), maxUnusedAnnuityReserveMargin),
              )
            }
            max={maxUnusedAnnuityReserveMargin}
            step={100}
            currency={currency}
            description="Unused annuity deduction room from prior years. Belastingdienst lets 2026 use unused annual margins from 2016 through 2025, capped by the 2026 reserve-space maximum."
          />
        </div>
      )}
    </CalculatorFieldGrid>
  );
}

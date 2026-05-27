"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
  PayFrequencyField,
  SelectField,
} from "@/components/calculator/calculator-fields";
import type {
  PayFrequency,
  UKMarriageAllowanceTreatment,
  UKResidencyType,
  UKStudentLoanPlan,
} from "@/lib/countries/types";

type UKRegion = "rest_of_uk" | "scotland";

interface UKTaxOptionsProps {
  payFrequency: PayFrequency;
  onPayFrequencyChange: (value: PayFrequency) => void;
  residencyType: UKResidencyType;
  onResidencyTypeChange: (value: UKResidencyType) => void;
  region: UKRegion;
  onRegionChange: (value: UKRegion) => void;
  studentLoanPlan: UKStudentLoanPlan;
  onStudentLoanPlanChange: (value: UKStudentLoanPlan) => void;
  hasPostgraduateLoan: boolean;
  onPostgraduateLoanChange: (value: boolean) => void;
  marriageAllowance: UKMarriageAllowanceTreatment;
  onMarriageAllowanceChange: (value: UKMarriageAllowanceTreatment) => void;
}

export function UKTaxOptions({
  payFrequency,
  onPayFrequencyChange,
  residencyType,
  onResidencyTypeChange,
  region,
  onRegionChange,
  studentLoanPlan,
  onStudentLoanPlanChange,
  hasPostgraduateLoan,
  onPostgraduateLoanChange,
  marriageAllowance,
  onMarriageAllowanceChange,
}: UKTaxOptionsProps) {
  return (
    <CalculatorFieldGrid columns={2}>
      <SelectField
        id="uk-region"
        label="Region"
        value={region}
        onChange={onRegionChange}
        options={[
          { value: "rest_of_uk", label: "England, Wales & Northern Ireland" },
          { value: "scotland", label: "Scotland" },
        ]}
        description="Scottish rates apply to non-savings income."
      />
      <SelectField
        id="uk-residency-type"
        label="Residency Status"
        value={residencyType}
        onChange={onResidencyTypeChange}
        options={[
          { value: "resident", label: "Resident" },
          { value: "non_resident", label: "Non-resident" },
        ]}
        description="Personal Allowance is applied only for residents in this calculator."
      />
      <PayFrequencyField
        id="uk-pay-frequency"
        value={payFrequency}
        onChange={onPayFrequencyChange}
      />
      <SelectField
        id="uk-student-loan-plan"
        label="Student Loan Plan"
        value={studentLoanPlan}
        onChange={onStudentLoanPlanChange}
        options={[
          { value: "none", label: "No student loan" },
          { value: "plan1", label: "Plan 1" },
          { value: "plan2", label: "Plan 2" },
          { value: "plan4", label: "Plan 4" },
          { value: "plan5", label: "Plan 5" },
        ]}
        description="Uses 2026/27 HMRC annual repayment thresholds and the 9% deduction rate."
      />
      <BooleanSelectField
        id="uk-postgraduate-loan"
        label="Postgraduate Loan"
        value={hasPostgraduateLoan}
        onChange={onPostgraduateLoanChange}
        trueLabel="Yes"
        falseLabel="No"
        description="Adds the 6% postgraduate loan deduction above the 2026/27 threshold."
      />
      <SelectField
        id="uk-marriage-allowance"
        label="Marriage Allowance"
        value={marriageAllowance}
        onChange={onMarriageAllowanceChange}
        options={[
          { value: "none", label: "Not claimed" },
          { value: "receiving", label: "Receiving from spouse" },
          { value: "transferring", label: "Transferring to spouse" },
        ]}
        description="Models the transferable personal allowance for eligible married couples or civil partners."
      />
    </CalculatorFieldGrid>
  );
}

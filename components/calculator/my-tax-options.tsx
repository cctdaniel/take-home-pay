"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
  NumberField,
  NumberStepperField,
  PayFrequencyField,
  SelectField,
} from "@/components/calculator/calculator-fields";
import type {
  MYEpfCategory,
  MYResidencyType,
  PayFrequency,
} from "@/lib/countries/types";

interface MYTaxOptionsProps {
  payFrequency: PayFrequency;
  onPayFrequencyChange: (value: PayFrequency) => void;
  residencyType: MYResidencyType;
  onResidencyTypeChange: (value: MYResidencyType) => void;
  age: number;
  onAgeChange: (value: number) => void;
  epfCategory: MYEpfCategory;
  onEpfCategoryChange: (value: MYEpfCategory) => void;
  hasSpouseRelief: boolean;
  onSpouseReliefChange: (value: boolean) => void;
  hasDisabledSpouseRelief?: boolean;
  onDisabledSpouseReliefChange?: (value: boolean) => void;
  numberOfChildrenUnder18: number;
  onNumberOfChildrenUnder18Change: (value: number) => void;
  numberOfChildren18PlusEducation?: number;
  onNumberOfChildren18PlusEducationChange?: (value: number) => void;
  numberOfChildrenTertiary: number;
  onNumberOfChildrenTertiaryChange: (value: number) => void;
  numberOfDisabledChildren?: number;
  onNumberOfDisabledChildrenChange?: (value: number) => void;
  numberOfDisabledChildrenTertiary?: number;
  onNumberOfDisabledChildrenTertiaryChange?: (value: number) => void;
  isDisabled: boolean;
  onDisabledChange: (value: boolean) => void;
}

export function MYTaxOptions({
  payFrequency,
  onPayFrequencyChange,
  residencyType,
  onResidencyTypeChange,
  age,
  onAgeChange,
  epfCategory,
  onEpfCategoryChange,
  hasSpouseRelief,
  onSpouseReliefChange,
  hasDisabledSpouseRelief = false,
  onDisabledSpouseReliefChange = () => {},
  numberOfChildrenUnder18,
  onNumberOfChildrenUnder18Change,
  numberOfChildren18PlusEducation = 0,
  onNumberOfChildren18PlusEducationChange = () => {},
  numberOfChildrenTertiary,
  onNumberOfChildrenTertiaryChange,
  numberOfDisabledChildren = 0,
  onNumberOfDisabledChildrenChange = () => {},
  numberOfDisabledChildrenTertiary = 0,
  onNumberOfDisabledChildrenTertiaryChange = () => {},
  isDisabled,
  onDisabledChange,
}: MYTaxOptionsProps) {
  return (
    <CalculatorFieldGrid columns={3}>
      <PayFrequencyField
        id="my-pay-frequency"
        value={payFrequency}
        onChange={onPayFrequencyChange}
      />

      <SelectField
        id="my-residency-type"
        label="Tax Residency"
        value={residencyType}
        onChange={onResidencyTypeChange}
        options={[
          { value: "resident", label: "Resident" },
          { value: "non_resident", label: "Non-resident" },
        ]}
        description="Residents use progressive YA 2025 rates; non-residents use 30% employment income tax."
      />

      <NumberField
        id="my-age"
        label="Age"
        value={age}
        onChange={onAgeChange}
        min={16}
        max={80}
        fallbackValue={30}
        description="Affects EPF and EIS eligibility."
      />

      <SelectField
        id="my-epf-category"
        label="EPF Category"
        value={epfCategory}
        onChange={onEpfCategoryChange}
        options={[
          { value: "citizen", label: "Citizen" },
          { value: "pr_or_legacy", label: "PR / pre-1998 non-citizen" },
          { value: "foreigner_post_1998", label: "Non-citizen (post-1998)" },
        ]}
        description="Uses KWSP employee contribution categories effective from October 2025 wages."
      />

      <BooleanSelectField
        id="my-spouse-relief"
        label="Spouse Relief"
        value={hasSpouseRelief}
        onChange={onSpouseReliefChange}
        trueLabel="Claim RM4,000"
        falseLabel="No"
        description="Resident spouse or alimony relief."
      />

      <BooleanSelectField
        id="my-disabled-spouse-relief"
        label="Disabled Spouse Relief"
        value={hasDisabledSpouseRelief}
        onChange={onDisabledSpouseReliefChange}
        trueLabel="Claim RM6,000"
        falseLabel="No"
        description="Additional resident disabled husband or wife relief."
      />

      <BooleanSelectField
        id="my-disabled"
        label="Disabled Individual Relief"
        value={isDisabled}
        onChange={onDisabledChange}
        trueLabel="Claim RM7,000"
        falseLabel="No"
      />

      <NumberStepperField
        id="my-children-under-18"
        label="Children Under 18"
        value={numberOfChildrenUnder18}
        onChange={onNumberOfChildrenUnder18Change}
        min={0}
        max={10}
        description="RM2,000 relief per qualifying child."
      />

      <NumberStepperField
        id="my-children-18-plus-education"
        label="Children 18+ in Education"
        value={numberOfChildren18PlusEducation}
        onChange={onNumberOfChildren18PlusEducationChange}
        min={0}
        max={10}
        description="RM2,000 relief for full-time A-level, certificate, matriculation, or preparatory study."
      />

      <NumberStepperField
        id="my-children-tertiary"
        label="Tertiary Children"
        value={numberOfChildrenTertiary}
        onChange={onNumberOfChildrenTertiaryChange}
        min={0}
        max={10}
        description="RM8,000 relief per qualifying child in higher education."
      />

      <NumberStepperField
        id="my-disabled-children"
        label="Disabled Children"
        value={numberOfDisabledChildren}
        onChange={onNumberOfDisabledChildrenChange}
        min={0}
        max={10}
        description="RM8,000 relief per qualifying disabled child."
      />

      <NumberStepperField
        id="my-disabled-children-tertiary"
        label="Disabled Tertiary Children"
        value={numberOfDisabledChildrenTertiary}
        onChange={onNumberOfDisabledChildrenTertiaryChange}
        min={0}
        max={10}
        description="Additional RM8,000 for disabled children in qualifying higher education."
      />
    </CalculatorFieldGrid>
  );
}

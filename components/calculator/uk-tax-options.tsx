"use client";

import {
  CalculatorFieldGrid,
  PayFrequencyField,
  SelectField,
} from "@/components/calculator/calculator-fields";
import type { PayFrequency, UKResidencyType } from "@/lib/countries/types";

type UKRegion = "rest_of_uk" | "scotland";

interface UKTaxOptionsProps {
  payFrequency: PayFrequency;
  onPayFrequencyChange: (value: PayFrequency) => void;
  residencyType: UKResidencyType;
  onResidencyTypeChange: (value: UKResidencyType) => void;
  region: UKRegion;
  onRegionChange: (value: UKRegion) => void;
}

export function UKTaxOptions({
  payFrequency,
  onPayFrequencyChange,
  residencyType,
  onResidencyTypeChange,
  region,
  onRegionChange,
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
    </CalculatorFieldGrid>
  );
}

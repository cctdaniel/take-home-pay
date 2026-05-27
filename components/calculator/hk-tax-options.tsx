"use client";

import {
  CalculatorFieldGrid,
  CurrencyAmountField,
  PayFrequencyField,
  SelectField,
} from "@/components/calculator/calculator-fields";
import type {
  CurrencyCode,
  HKResidencyType,
  HKTaxReliefInputs,
  PayFrequency,
} from "@/lib/countries/types";

interface HKTaxOptionsProps {
  residencyType: HKResidencyType;
  onResidencyTypeChange: (value: HKResidencyType) => void;
  payFrequency: PayFrequency;
  onPayFrequencyChange: (value: PayFrequency) => void;
  taxReliefs?: HKTaxReliefInputs;
  onTaxReliefsChange?: (value: HKTaxReliefInputs) => void;
  currency?: CurrencyCode;
}

export function HKTaxOptions({
  residencyType,
  onResidencyTypeChange,
  payFrequency,
  onPayFrequencyChange,
  taxReliefs,
  onTaxReliefsChange,
  currency,
}: HKTaxOptionsProps) {
  const canModelHousing = taxReliefs && onTaxReliefsChange && currency;
  const updateRelief = <K extends keyof HKTaxReliefInputs>(
    key: K,
    value: HKTaxReliefInputs[K],
  ) => {
    if (!canModelHousing) {
      return;
    }

    onTaxReliefsChange({ ...taxReliefs, [key]: value });
  };

  return (
    <CalculatorFieldGrid columns={2}>
      <SelectField
        id="hk-residency-type"
        label="Residency Status"
        value={residencyType}
        onChange={onResidencyTypeChange}
        options={[
          { value: "resident", label: "Resident" },
          { value: "non_resident", label: "Non-resident" },
        ]}
        description="Allowances are applied only for residents."
      />
      <PayFrequencyField
        id="hk-pay-frequency"
        value={payFrequency}
        onChange={onPayFrequencyChange}
      />
      {canModelHousing ? (
        <>
          <SelectField
            id="hk-housing-benefit-type"
            label="Employer-Provided Housing"
            value={taxReliefs.housingBenefitType ?? "none"}
            onChange={(housingBenefitType) => {
              onTaxReliefsChange({
                ...taxReliefs,
                housingBenefitType,
                housingRentPaid:
                  housingBenefitType === "customRentalValue"
                    ? 0
                    : taxReliefs.housingRentPaid,
                customHousingRentalValue:
                  housingBenefitType === "customRentalValue"
                    ? taxReliefs.customHousingRentalValue
                    : 0,
              });
            }}
            options={[
              { value: "none", label: "No housing benefit" },
              {
                value: "residential",
                label: "Flat or serviced apartment (10%)",
              },
              { value: "hotelTwoRooms", label: "Hotel/hostel, 2 rooms (8%)" },
              { value: "hotelOneRoom", label: "Hotel/hostel, 1 room (4%)" },
              { value: "customRentalValue", label: "Entered rental value" },
            ]}
            description="GovHK/IRD rental value for an accepted employer-provided place of residence."
          />
          {taxReliefs.housingBenefitType &&
          taxReliefs.housingBenefitType !== "none" &&
          taxReliefs.housingBenefitType !== "customRentalValue" ? (
            <CurrencyAmountField
              id="hk-housing-rent-paid"
              label="Annual Rent Paid by Employee"
              value={taxReliefs.housingRentPaid ?? 0}
              onChange={(housingRentPaid) =>
                updateRelief("housingRentPaid", Math.max(0, housingRentPaid))
              }
              currency={currency}
              step={1000}
              description="Rent you pay to your employer or landlord reduces the computed rental value."
            />
          ) : null}
          {taxReliefs.housingBenefitType === "customRentalValue" ? (
            <CurrencyAmountField
              id="hk-custom-housing-rental-value"
              label="Taxable Housing Rental Value"
              value={taxReliefs.customHousingRentalValue ?? 0}
              onChange={(customHousingRentalValue) =>
                updateRelief(
                  "customHousingRentalValue",
                  Math.max(0, customHousingRentalValue),
                )
              }
              currency={currency}
              step={1000}
              description="Enter the IRD-accepted rental value or rateable value after any rent-paid adjustment."
            />
          ) : null}
        </>
      ) : null}
    </CalculatorFieldGrid>
  );
}

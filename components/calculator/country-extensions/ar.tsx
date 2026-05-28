"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
  CountStepperField,
  PayFrequencyField,
  SelectField,
} from "@/components/calculator/calculator-fields";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
  type CountryCalculatorExtensionProps,
} from "@/components/calculator/country-extension";
import { InfoPanel } from "@/components/calculator/info-panel";
import { ContributionSlider } from "@/components/ui/contribution-slider";
import {
  AR_GANANCIAS_H2_2026,
  AR_GANANCIAS_H2_2026_AVAILABLE,
  getArGananciasParams,
  resolveArGananciasSemester,
} from "@/lib/countries/ar/constants/ganancias-semesters";
import { getCountryCalculator } from "@/lib/countries/registry";
import type {
  ARCalculatorInputs,
  ARGananciasSemester,
} from "@/lib/countries/ar/types";
import { clampAmount, clampCount } from "@/lib/utils";

const AR_SEMESTER_OPTIONS: {
  value: ARGananciasSemester;
  label: string;
  disabled?: boolean;
}[] = [
  {
    value: "h1",
    label: "Enero–junio 2026 (AFIP)",
  },
  {
    value: "h2",
    label: "Julio–diciembre 2026 (AFIP)",
    disabled: !AR_GANANCIAS_H2_2026_AVAILABLE,
  },
];

export default function ARCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    setInputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
  } = useCountryCalculatorExtension<ARCalculatorInputs>(country);
  const voluntaryRetirementLimit =
    getCountryCalculator(country).getContributionLimits(inputs)
      .voluntaryRetirement?.limit ?? 0;
  const gananciasSemester = resolveArGananciasSemester(inputs.gananciasSemester);
  const activeSemester = getArGananciasParams(
    result?.breakdown.type === "AR"
      ? result.breakdown.gananciasSemester
      : gananciasSemester,
  );

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={setGrossSalary}
      result={result}
      hideDefaultSeoTaxInfo
      taxOptions={
        <CalculatorFieldGrid columns={2}>
          <SelectField<ARGananciasSemester>
            id="ar-ganancias-semester"
            label="Ganancias semester"
            value={gananciasSemester}
            onChange={(gananciasSemester) =>
              setInputs((current) => ({ ...current, gananciasSemester }))
            }
            options={AR_SEMESTER_OPTIONS}
            description={
              AR_GANANCIAS_H2_2026_AVAILABLE
                ? "AFIP publishes separate Art. 30 and Art. 94 tables each semester."
                : AR_GANANCIAS_H2_2026.unavailableNote
            }
          />
          <BooleanSelectField
            id="ar-spouse"
            label="Spouse"
            value={inputs.hasSpouse}
            onChange={(hasSpouse) =>
              setInputs((current) => ({ ...current, hasSpouse }))
            }
            trueLabel="Spouse deduction"
            falseLabel="No spouse"
          />
          <PayFrequencyField
            id="ar-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <CountStepperField
            spanColumns={2}
            id="ar-children"
            label="Dependent children"
            value={inputs.children}
            onChange={(children) =>
              setInputs((current) => ({
                ...current,
                children: clampCount(children, 10),
              }))
            }
            max={10}
            description="Family deduction per child for ganancias."
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <ContributionSlider
          label="Voluntary retirement"
          description="Aportes voluntarios — additional ganancias deduction up to 12% of gross annual salary."
          value={inputs.contributions.voluntaryRetirement}
          onChange={(voluntaryRetirement) =>
            setInputs((current) => ({
              ...current,
              contributions: {
                ...current.contributions,
                voluntaryRetirement: clampAmount(
                  voluntaryRetirement,
                  voluntaryRetirementLimit,
                ),
              },
            }))
          }
          max={voluntaryRetirementLimit}
          step={10_000}
          currency={currency}
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="Adjust voluntary contributions that reduce your tax base"
      infoCard={
        <InfoPanel title="Modeled scope">
          Ganancias 4th category: Art. 30 non-imponible, special, and family
          deductions plus voluntary retirement; Art. 94 scale; 11% jubilación, 3%
          obra social, 3% PAMI. {activeSemester.periodLabel}
        </InfoPanel>
      }
      seoInfo={<ArgentinaTaxInfo />}
    />
  );
}

function ArgentinaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Argentina</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Ganancias semester</strong> – choose
            enero–junio or julio–diciembre AFIP tables (Art. 30 deductions and Art.
            94 scale). Jul–dic 2026 tables apply once ARCA publishes them.
          </li>
          <li>
            <strong className="text-zinc-300">Ganancias</strong> – Art. 94 scale
            (5–35%) on ganancia neta after Art. 30 deductions, including voluntary
            retirement up to 12% of gross.
          </li>
          <li>
            <strong className="text-zinc-300">Social</strong> – jubilación 11%,
            obra social 3%, PAMI 3% on gross salary.
          </li>
        </ul>
      </div>
    </section>
  );
}

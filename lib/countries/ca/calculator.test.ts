import { describe, expect, it } from "vitest";
import { calculateCA } from "./calculator";
import type { CACalculatorInputs, CATaxBreakdown } from "./types";

function createInputs(overrides: Partial<CACalculatorInputs> = {}): CACalculatorInputs {
  return {
    country: "CA",
    grossSalary: 90_000,
    payFrequency: "annual",
    province: "ON",
    contributions: {
      rrspContribution: 0,
      fhsaContribution: 0,
      registeredPensionContribution: 0,
      unionDues: 0,
      childcareExpenses: 0,
    },
    ...overrides,
  };
}

describe("Canada calculator", () => {
  it("supports all provinces and territories", () => {
    const expected: CACalculatorInputs["province"][] = [
      "AB",
      "BC",
      "MB",
      "NB",
      "NL",
      "NS",
      "NT",
      "NU",
      "ON",
      "PE",
      "QC",
      "SK",
      "YT",
    ];
    for (const province of expected) {
      const result = calculateCA(createInputs({ province }));
      expect(result.breakdown.type).toBe("CA");
      if (result.breakdown.type === "CA") {
        expect(result.breakdown.province).toBe(province);
        expect(result.breakdown.provinceName.length).toBeGreaterThan(0);
      }
    }
  });

  it("uses Quebec payroll contributions instead of CPP/EI defaults", () => {
    const result = calculateCA(createInputs({ province: "QC" }));
    const taxes = result.taxes as CATaxBreakdown;
    expect(taxes.type).toBe("CA");
    expect(taxes.qpp).toBeGreaterThan(0);
    expect(taxes.qpip).toBeGreaterThan(0);
    expect(taxes.cpp).toBe(0);
  });
});

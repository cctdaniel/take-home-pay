import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
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
    const expected: CACalculatorInputs["province"][] = ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"];
    for (const province of expected) {
      const result = calculateCA(createInputs({ province }));
      assert.equal(result.breakdown.type, "CA");
      if (result.breakdown.type === "CA") {
        assert.equal(result.breakdown.province, province);
        assert.ok(result.breakdown.provinceName.length > 0);
      }
    }
  });

  it("uses Quebec payroll contributions instead of CPP/EI defaults", () => {
    const result = calculateCA(createInputs({ province: "QC" }));
    const taxes = result.taxes as CATaxBreakdown;
    assert.equal(taxes.type, "CA");
    assert.ok(taxes.qpp > 0);
    assert.ok(taxes.qpip > 0);
    assert.equal(taxes.cpp, 0);
  });
});

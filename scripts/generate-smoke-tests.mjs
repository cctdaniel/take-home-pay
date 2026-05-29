import { existsSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");

function getCountryDirectories() {
  const countriesDir = path.join(rootDir, "lib/countries");
  return readdirSync(countriesDir)
    .filter((entry) => {
      const full = path.join(countriesDir, entry);
      return (
        statSync(full).isDirectory() &&
        existsSync(path.join(full, "calculator.ts")) &&
        existsSync(path.join(full, "index.ts"))
      );
    })
    .sort();
}

const template = (code) => `// Add golden cases from an official calculator or table (cite URL in a comment).
import { describe, expect, it } from "vitest";
import { ${code}Calculator } from "./calculator";

describe("${code} calculator smoke", () => {
  it("returns net salary below gross for default inputs", () => {
    const inputs = ${code}Calculator.getDefaultInputs();
    const result = ${code}Calculator.calculate(inputs);
    expect(result.country).toBe("${code}");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThanOrEqual(result.grossSalary);
  });

  it.todo("golden: low salary from official source");
  it.todo("golden: mid salary from official source");
  it.todo("golden: high salary from official source");
});
`;

let created = 0;
for (const directory of getCountryDirectories()) {
  const code = directory.toUpperCase();
  const testPath = path.join(rootDir, "lib/countries", directory, "calculator.test.ts");
  if (existsSync(testPath)) {
    continue;
  }
  writeFileSync(testPath, `${template(code)}\n`);
  created += 1;
  console.log(`Created ${testPath}`);
}

console.log(`Smoke test scaffolds created: ${created}`);

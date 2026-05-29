/** Countries with PIT where only mandatory payroll items are modeled (no voluntary sliders yet). */
export function MandatoryOnlyContributionsNote({
  mandatoryLabel,
  sourceUrl,
  sourceLabel,
  unmodeledVoluntary,
}: {
  mandatoryLabel: string;
  sourceUrl: string;
  sourceLabel: string;
  /** Official voluntary schemes not yet exposed as calculator inputs. */
  unmodeledVoluntary?: string[];
}) {
  return (
    <div className="space-y-3 text-sm text-zinc-400">
      <p>
        Income tax and mandatory social contributions are already deducted in
        your results. This calculator does not yet expose employee-controlled
        voluntary pension or relief products as inputs.
      </p>
      <p>
        <strong className="text-zinc-300">Mandatory (in results):</strong>{" "}
        {mandatoryLabel}
      </p>
      {unmodeledVoluntary && unmodeledVoluntary.length > 0 && (
        <div>
          <p className="text-zinc-300 font-medium">
            Voluntary schemes not modeled yet
          </p>
          <ul className="mt-1 list-disc list-inside space-y-1 text-zinc-500">
            {unmodeledVoluntary.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-xs text-zinc-500">
        Source:{" "}
        <a
          href={sourceUrl}
          className="text-blue-400 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {sourceLabel}
        </a>
      </p>
    </div>
  );
}

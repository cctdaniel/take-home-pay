/**
 * Shown when employment salary is taxed but there is no employee-controlled
 * voluntary amount on payroll that reduces income tax in this calculator.
 */
export function NoVoluntaryPitReliefNote({
  explanation,
  mandatoryLabel,
  sourceUrl,
  sourceLabel,
}: {
  /** Country-specific: why there is nothing to adjust (law excludes it or relief is outside payroll). */
  explanation: string;
  mandatoryLabel?: string;
  sourceUrl: string;
  sourceLabel: string;
}) {
  return (
    <div className="space-y-3 text-sm text-zinc-400">
      <p>{explanation}</p>
      {mandatoryLabel && (
        <p>
          <strong className="text-zinc-300">Already in your results:</strong>{" "}
          {mandatoryLabel}
        </p>
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

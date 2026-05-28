/** Shown when a country has no employee voluntary PIT-reducing salary contributions to model. */
export function NoPitContributionsNote({
  mandatoryLabel,
  sourceUrl,
  sourceLabel,
}: {
  mandatoryLabel: string;
  sourceUrl: string;
  sourceLabel: string;
}) {
  return (
    <div className="space-y-3 text-sm text-zinc-400">
      <p>
        There is no personal income tax on employment salary in this model, so
        voluntary contributions do not reduce income tax. Mandatory payroll
        deductions are calculated automatically from your inputs above.
      </p>
      <p>
        <strong className="text-zinc-300">Mandatory:</strong> {mandatoryLabel}
      </p>
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

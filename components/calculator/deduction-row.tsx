import { cn } from "@/lib/utils";
import { formatCurrency, formatPercentage, type CurrencyCode } from "@/lib/format";

interface DeductionRowProps {
  label: string;
  amount: number;
  grossSalary: number;
  variant?: "default" | "total" | "net";
  showPercentage?: boolean;
  currency?: CurrencyCode;
}

export function DeductionRow({
  label,
  amount,
  grossSalary,
  variant = "default",
  showPercentage = true,
  currency = "USD",
}: DeductionRowProps) {
  const percentage = grossSalary > 0 ? amount / grossSalary : 0;

  return (
    <div
      className={cn(
        "flex items-center justify-between py-2",
        variant === "total" && "border-t border-zinc-700 pt-3 mt-1",
        variant === "net" && "border-t border-zinc-700 pt-3 mt-1"
      )}
    >
      <span
        className={cn(
          "text-sm",
          variant === "default" && "text-zinc-400",
          variant === "total" && "text-zinc-300 font-medium",
          variant === "net" && "text-emerald-400 font-semibold"
        )}
      >
        {label}
      </span>
      <div className="flex items-center gap-4">
        {showPercentage && (
          <span className="text-xs text-zinc-500 tabular-nums w-14 text-right">
            {formatPercentage(percentage)}
          </span>
        )}
        <span
          className={cn(
            "tabular-nums text-right min-w-[90px]",
            variant === "default" && "text-sm text-zinc-300",
            variant === "total" && "text-sm font-medium text-zinc-200",
            variant === "net" && "text-base font-semibold text-emerald-400"
          )}
        >
          {variant === "net" ? formatCurrency(amount, currency) : `-${formatCurrency(amount, currency)}`}
        </span>
      </div>
    </div>
  );
}

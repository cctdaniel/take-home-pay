"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrencySymbol } from "@/lib/countries/currency";
import {
  formatNumber,
  parseFormattedNumber,
  type CurrencyCode,
} from "@/lib/format";
import { useEffect, useRef, useState } from "react";

interface SalaryInputProps {
  value: number;
  onChange: (value: number) => void;
  currency?: CurrencyCode;
}

export function SalaryInput({
  value,
  onChange,
  currency = "USD",
}: SalaryInputProps) {
  const [displayValue, setDisplayValue] = useState(
    formatNumber(value, currency),
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const cursorPosRef = useRef<number | null>(null);
  const isUserClearingRef = useRef(false);
  const currencySymbol = getCurrencySymbol(currency);

  // Sync display value when external value changes
  // Skip sync if user just cleared the input to empty
  useEffect(() => {
    if (isUserClearingRef.current && value === 0) {
      // User cleared the input, keep it empty
      isUserClearingRef.current = false;
      return;
    }
    setDisplayValue(formatNumber(value, currency));
  }, [value, currency]);

  // Restore cursor position after formatting
  useEffect(() => {
    if (cursorPosRef.current !== null && inputRef.current) {
      inputRef.current.setSelectionRange(
        cursorPosRef.current,
        cursorPosRef.current,
      );
      cursorPosRef.current = null;
    }
  }, [displayValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const rawValue = input.value;
    const cursorPos = input.selectionStart ?? 0;

    // Parse and format the new value
    const parsed = parseFormattedNumber(rawValue, currency);
    const formatted = parsed > 0 ? formatNumber(parsed, currency) : "";

    // Track if user is clearing the input to empty
    isUserClearingRef.current = rawValue === "" || parsed === 0;

    // Count digits before cursor in raw input (excluding commas)
    const digitsBeforeCursor = rawValue
      .slice(0, cursorPos)
      .replace(/,/g, "").length;

    // Find new cursor position: count through formatted string until we've passed the same number of digits
    let newCursorPos = 0;
    let digitCount = 0;
    for (
      let i = 0;
      i < formatted.length && digitCount < digitsBeforeCursor;
      i++
    ) {
      newCursorPos = i + 1;
      if (formatted[i] !== ",") {
        digitCount++;
      }
    }

    cursorPosRef.current = newCursorPos;
    setDisplayValue(formatted);
    onChange(parsed);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="salary">Annual Gross Salary</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm pr-2">
          {currencySymbol}
        </span>
        <Input
          ref={inputRef}
          id="salary"
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          className="pl-12 text-lg font-medium h-10"
          placeholder="100,000"
        />
      </div>
    </div>
  );
}

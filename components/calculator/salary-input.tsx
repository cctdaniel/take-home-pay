"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatNumber, parseFormattedNumber } from "@/lib/format";
import { useState, useEffect } from "react";

interface SalaryInputProps {
  value: number;
  onChange: (value: number) => void;
}

export function SalaryInput({ value, onChange }: SalaryInputProps) {
  const [displayValue, setDisplayValue] = useState(formatNumber(value));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatNumber(value));
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setDisplayValue(rawValue);
    const parsed = parseFormattedNumber(rawValue);
    onChange(parsed);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setDisplayValue(value.toString());
  };

  const handleBlur = () => {
    setIsFocused(false);
    setDisplayValue(formatNumber(value));
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="salary">Annual Gross Salary</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">
          $
        </span>
        <Input
          id="salary"
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="pl-7 text-lg font-medium h-12"
          placeholder="100,000"
        />
      </div>
    </div>
  );
}

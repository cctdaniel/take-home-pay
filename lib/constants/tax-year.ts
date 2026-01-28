// ============================================================================
// TAX YEAR CONFIGURATION
// Update this file annually when new IRS data is released (typically October/November)
// ============================================================================

export const TAX_YEAR = 2026;
const DEFAULT_LAST_UPDATED = "2026-01-27";
export const LAST_UPDATED = process.env.NEXT_PUBLIC_LAST_UPDATED ?? DEFAULT_LAST_UPDATED;
export const DATA_SOURCE = "IRS Revenue Procedure 2025-XX"; // Update with actual Rev Proc number

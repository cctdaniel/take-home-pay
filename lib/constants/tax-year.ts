// ============================================================================
// TAX YEAR CONFIGURATION
// Update this file annually when new IRS data is released (typically October/November)
// ============================================================================

export const TAX_YEAR = 2026;
const BUILD_TIMESTAMP = process.env.NEXT_PUBLIC_BUILD_TIMESTAMP;
export const LAST_UPDATED = process.env.NEXT_PUBLIC_LAST_UPDATED ?? BUILD_TIMESTAMP ?? null;
export const DATA_SOURCE = "IRS Revenue Procedure 2025-XX"; // Update with actual Rev Proc number

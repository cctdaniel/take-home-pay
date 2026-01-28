// ============================================================================
// STATE TAX MODULE
// Re-exports from the new countries/us module for backwards compatibility
// ============================================================================

export {
  getStateCalculator,
  hasNoIncomeTax,
  getSupportedStates,
  getStateOptions,
  type StateCalculator,
} from "../countries/us/state-tax";

// Re-export StateInfo type with backwards-compatible name
export type { RegionInfo as StateInfo } from "../countries/types";

export type ValidationStatus =
  'NOT_IMPLEMENTED' | 'PASSED' | 'FAILED' | 'PENDING' | 'REQUIRES_REVIEW';

export interface ValidationResult {
  status: ValidationStatus;
  details: string[];
}

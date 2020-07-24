export interface Appendix3YInfo {
  filename: string;
  entity: string;
  abn: string;
  name: string;
  dateOfLastNotice: Date;
  dateOfChange: Date;
  natureOfChange: string;
  isIndirectInterest: boolean;
  indirectInterestDescription: string;
  numSecuritiesPrevHeld: number;
  numSecuritiesAcquired: number;
  numSecuritiesDisposed: number;
  numSecuritiesCurrHeld: number;
  securityClass: string;
  value: number | string;
  error: string;
};
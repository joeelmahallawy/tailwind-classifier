//
export enum InsuranceDocumentType {
  "Policy Document",
  "Certificate of Insurance",
  "Notice of Cancellation",
  "Loss Run Report",
  "Authorization Letter",
}

export type CategorizedDocument = {
  file: File;
  result: {
    success: boolean;
    documentType?: InsuranceDocumentType;
    error?: string;
  };
};

export type ClassificationStatus = "error" | "invalid" | "success";

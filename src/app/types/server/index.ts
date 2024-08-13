// we create this mapping since the tag names in Sensible are ugly :(
export const SensibleDocumentTypes = {
  // not a type but is almost treated as an enum
  policy_document: "Policy Document",
  certificate_insurance: "Certificate of Insurance",
  notice_cancellation: "Notice of Cancellation",
  loss_run: "Loss Run Report",
  authorization_letter: "Authorization Letter",
};

export type SensibleCategorization = {
  id: string;
  name: keyof typeof SensibleDocumentTypes;
  score: number; // ranges from 0-1 representing the similarity between documents (0 being 0% and 1 being 100%)
};

export type SensibleCategorizationResponse = {
  document_type: SensibleCategorization; // this will be the closest match (similarity search w/ embeddings)
  classification_summary: SensibleCategorization[]; // rest of these in descending order of similarity
  reference_documents: SensibleCategorization[];
};

import { SensibleDocumentTypes } from "@/app/api/classifySensible/route";

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

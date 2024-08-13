import { SensibleCategorizationResponse } from "@/app/types/server";
import { NextRequest, NextResponse } from "next/server";

// we create this mapping since the tag names in Sensible are ugly :(
export const SensibleDocumentTypes = {
  policy_document: "Policy Document",
  certificate_insurance: "Certificate of Insurance",
  notice_cancellation: "Notice of Cancellation",
  loss_run: "Loss Run Report",
  authorization_letter: "Authorization Letter",
};

// FORCE CATEGORIZATION
export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.formData();

    const uncategorizedDocument = (await formData.get(
      "uncategorizedDocument"
    )) as Blob;

    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/pdf",
        authorization: `Bearer ${process.env.SENSIBLE_API_KEY}`,
      },
      body: uncategorizedDocument,
    };

    // sensible classifies for us and gives us a similarity score
    const categorize = await fetch(
      "https://api.sensible.so/v0/classify",
      options
    );

    // gives us a list of similarity scores for each document type with `document_type` being best match
    const categorizationResults: SensibleCategorizationResponse =
      await categorize.json();

    // plug Sensible tag into mapping so we can get a cleaner name for the FE to display
    const documentType =
      SensibleDocumentTypes[categorizationResults.document_type.name];

    return NextResponse.json({ documentType, success: true });
  } catch (err) {
    return NextResponse.json(
      // @ts-expect-error
      { success: false, error: err?.message },
      { status: 500 }
    );
  }
};

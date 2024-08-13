import { NextResponse } from "next/server";
import OpenAI from "openai";
import pdfParse from "pdf-parse";

// NON-FORCED CATEGORIZATION
export const POST = async (req: Request) => {
  try {
    const formdata = await req.formData(); // nextjs lets us read formdata from request ezpz

    const uncategorizedDocumentBlob = formdata.get(
      "uncategorizedDocument"
    ) as Blob;

    // allocate memory for pdf blob so pdf-parse can read it
    const pdfBuffer = Buffer.from(
      await uncategorizedDocumentBlob.arrayBuffer()
    );

    const parsedPdf = await pdfParse(pdfBuffer); // reads buffer and creates pdf object

    const { info, text } = parsedPdf;

    // no need to insert API key here since OpenAI defaults to `process.env.OPENAI_API_KEY`
    const openai = new OpenAI();

    // creates a thread for us to interact with our insurance classifier assistant
    const thread = await openai.beta.threads.create();

    // add msgs so we can run the whole thread with new messages
    await openai.beta.threads.messages.create(thread.id, {
      role: "assistant",
      content: `
    Document info: ${info}
    \nDocument content: ${text}`,
    });

    // run/execute and poll every 0.5s
    const runThread = await openai.beta.threads.runs.createAndPoll(
      thread.id,
      {
        assistant_id: process.env
          .OPENAI_INSURANCE_DOCUMENT_CLASSIFIER_ASSISTANT_ID as string,
      },
      { pollIntervalMs: 500 }
    );

    // get messages from thread
    const messages = await openai.beta.threads.messages.list(thread.id);

    // reads first (most recent) message
    const insuranceDocumentClassification =
      // @ts-ignore
      messages.data[0].content[0]!.text!.value;

    return NextResponse.json({
      documentType: insuranceDocumentClassification,
      success: true,
    });
  } catch (err) {
    return NextResponse.json(
      // @ts-expect-error
      { success: false, error: err?.message },
      { status: 500 }
    );
  }
};

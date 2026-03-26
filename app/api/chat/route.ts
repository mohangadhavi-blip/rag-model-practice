export const runtime = "nodejs";
import { createIndex, STRIC_RAG_PROMPT } from "@/lib/rag";

// Notice: We completely removed the ResponseHelper import!

// Cache the index in memory so it doesn't rebuild on every single message
let indexPromise: Promise<any> | null = null;

async function getIndex() {
  if (!indexPromise) {
    console.log("Creating new index...");
    indexPromise = createIndex();
  }
  return indexPromise;
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message) {
      return Response.json({ error: "No message provided" }, { status: 400 });
    }

    const index = await getIndex();

    // --- GUARDRAIL 1: CHECK RETRIEVAL FIRST ---
    const retriever = index.asRetriever({ similarityTopK: 2 });
    const sourceNodes = await retriever.retrieve(message);

    // --- DEBUGGING: Look at your terminal to see why it rejects ---
    console.log("==============");
    console.log("--- RAG DEBUG ---");
    console.log("QUERY::::::>", message);
    console.log("Nodes found:", sourceNodes.length);

    sourceNodes.forEach((node: any, i: number) => {
      console.log(`Node ${i} Score:`, node.score);
      console.log(`Node ${i} Text:`, node.node.text.substring(0, 50) + "...");
    });

    // If the best matching chunk has a very low similarity score (e.g., < 0.4)
    // or if no nodes are found at all, reject the question immediately.
    const MIN_RELEVANCE_SCORE = 0.25; // Adjust this based on testing
    const isRelevant =
      sourceNodes.length > 0 &&
      (sourceNodes[0].score ?? 1) > MIN_RELEVANCE_SCORE;

    if (!isRelevant) {
      return new Response(
        "I'm sorry, but your question is not related to the documents I have access to.",
      );
    }

    // --- GUARDRAIL 2: STRICT QUERY ENGINE ---
    const queryEngine = index.asQueryEngine({
      streaming: true,
    });

    // Apply the template we defined in rag.ts
    // (Note: ensure you exported the template or the logic to update it)
    queryEngine.updatePrompts({
      "responseSynthesizer:text_qa_template": STRIC_RAG_PROMPT,
    });

    // 2. Perform the query with streaming enabled
    const response = await queryEngine.query({
      query: message,
      stream: true, // Tell LlamaIndex to stream the response
    });

    // 3. Create a ReadableStream manually from the LlamaIndex stream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          // Iterate over the stream chunks provided by LlamaIndex
          // @ts-ignore - response is an AsyncIterable when stream: true
          for await (const chunk of response) {
            if (chunk.response) {
              controller.enqueue(encoder.encode(chunk.response));
            } else if (typeof chunk === "string") {
              controller.enqueue(encoder.encode(chunk));
            }
          }
        } catch (err) {
          console.error("Streaming error:", err);
        } finally {
          controller.close();
        }
      },
    });

    // 4. Return the stream to the frontend
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error: any) {
    console.error("Route Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

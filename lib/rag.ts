import { 
  VectorStoreIndex, 
  Document, 
  Settings, 
  SentenceSplitter, 
  PromptTemplate
} from "llamaindex";
import { Ollama, OllamaEmbedding } from "@llamaindex/ollama";
import fs from "fs";
import path from "path";
import { loadExcel, loadPDF } from "@/utils/loadFile";

// 1. ✅ CONFIGURATION: Set up LLM & Embedding
Settings.llm = new Ollama({
  model: "qwen2:1.5b",
  config: {
    host: "http://127.0.0.1:11434", // Ensure this matches your Ollama port
  }
});

Settings.embedModel = new OllamaEmbedding({
  model: "nomic-embed-text-v2-moe",
});

// 2. ✅ CHUNKING: Explicitly define how to split text
// This fulfills your "Document -> Load -> Chunk" requirement
Settings.nodeParser = new SentenceSplitter({
  chunkSize: 512,      // Good size for Qwen
  chunkOverlap: 50,    // Helps maintain context between chunks
});

// 1. Define a very strict System Prompt
export const STRIC_RAG_PROMPT = new PromptTemplate({
  template: `
    "You are a strict document assistant. 
    Use ONLY the following context to answer the user's question.
    
    CONTEXT:
    ---------------------
    {context}
    ---------------------

    RULES:
    1. If the answer is NOT in the context, say exactly: "I'm sorry, but that information is not available in my documents."
    2. Do NOT use your own background knowledge.
    3. Do NOT answer questions about general topics (weather, math, other famous people) unless they are mentioned in the context.
    4. Keep the answer concise and based only on the provided text.

    User Question: {query}
    Answer:`
});

export async function createIndex() {
  console.log("#### Process Started ####");
  
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    throw new Error("Data directory not found");
  }

  const files = fs.readdirSync(dataDir);
  let documents: Document[] = [];

  for (const file of files) {
    const filePath = path.join(dataDir, file);
    
    try {
      let text = "";
      
      if (file.endsWith(".pdf")) {
        text = await loadPDF(filePath);
      } else if (file.endsWith(".xlsx")) {
        text = loadExcel(filePath);
      } else {
        continue; // Skip other file types
      }

      // Check if text is actually extracted
      if (text && text.trim().length > 0) {
        console.log(`✅ Loaded ${file} (${text.length} characters)`);
        documents.push(new Document({ text, metadata: { fileName: file } }));
      } else {
        console.warn(`⚠️ Warning: No text extracted from ${file}`);
      }
    } catch (err: any) {
      console.error(`❌ Error processing ${file}:`, err.message);
    }
  }

  if (documents.length === 0) {
    throw new Error("No documents were successfully loaded. Check your PDF/Excel files.");
  }

  // 3. ✅ EMBEDDING & RETRIEVAL: Create index
  // This automatically uses Settings.nodeParser (Chunking) and Settings.embedModel (Embedding)
  console.log("Indexing documents... (this may take a moment)");
  const index = await VectorStoreIndex.fromDocuments(documents);
  
  console.log("#### Process Completed ####");
  return index;
}

// Update your query function to use this prompt
export async function queryIndex(index: any, query: string) {
  const queryEngine = index.asQueryEngine({
    streaming: true,
  });

  // Apply the strict prompt to the engine
  queryEngine.updatePrompts({
    "responseSynthesizer:text_qa_template": STRIC_RAG_PROMPT,
  });

  const response = await queryEngine.query({ query });
  return response;
}
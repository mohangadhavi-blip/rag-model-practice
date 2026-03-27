# LlamaIndex Next.js RAG Chatbot

This is a Next.js-based Retrieval-Augmented Generation (RAG) chatbot application using LlamaIndex and Ollama for local AI processing.

## Prerequisites

Before running this application, ensure you have the following installed:

- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **Ollama** (latest version) - [Download here](https://ollama.ai/download)

## Setup Instructions

### Step 1: Install Ollama

1. Download and install Ollama from the official website: [https://ollama.ai/download](https://ollama.ai/download)
2. Follow the installation instructions for your operating system
3. After installation, Ollama should be running on `http://localhost:11434`

### Step 2: Pull Required Models

Open your terminal and run the following commands to download the necessary AI models:

```bash
# Pull the main language model
ollama pull qwen2:1.5b

# Pull the embedding model for document processing
ollama pull nomic-embed-text-v2-moe
```

**Note:** These models may take some time to download depending on your internet connection.

### Step 3: Install Dependencies

Clone or download this project, then navigate to the project directory and install the required Node.js packages:

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Step 4: Prepare Documents (Optional)

To use the RAG functionality, place your documents in the `data/` folder. Supported formats:

- PDF files (.pdf)
- Excel files (.xlsx, .xls)

The application will automatically index these documents for question-answering.

### Step 5: Run the Development Server

Start the Next.js development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

### Step 6: Access the Application

Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

You can now:

- Chat with the AI assistant
- Ask questions about your uploaded documents
- The AI will provide answers based on the content of your documents

## Features

- **Local AI Processing**: All AI processing happens locally using Ollama
- **Document Upload**: Support for PDF and Excel file formats
- **RAG (Retrieval-Augmented Generation)**: Answers questions based on your documents
- **Real-time Chat**: Streaming responses for better user experience
- **Security Guardrails**: Built-in protections against prompt injection

## Troubleshooting

### Ollama Connection Issues

- Ensure Ollama is running: Check if `http://localhost:11434` is accessible
- Verify models are downloaded: Run `ollama list` to see installed models

### Document Processing Issues

- Ensure files are placed in the `data/` folder
- Check file formats are supported (PDF, Excel)
- Restart the application after adding new documents

### Port Conflicts

- If port 3000 is busy, the app will suggest an alternative port
- You can also specify a custom port: `npm run dev -- -p 3001`

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [LlamaIndex Documentation](https://docs.llamaindex.ai/)
- [Ollama Documentation](https://github.com/ollama/ollama)

## Deployment

This application is designed for local use with Ollama. For production deployment, consider:

- Setting up Ollama on your server
- Using a cloud-based LLM service instead of local Ollama
- Containerizing the application with Docker

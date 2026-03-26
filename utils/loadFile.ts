import * as XLSX from "xlsx";
import fs from "fs"; // Import the standard fs module
const pdfParse = require('pdf-parse/lib/pdf-parse.js');

async function loadPDF(filePath: string): Promise<string> {
  try {
    // 1. Use the sync version to check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // 2. Use the promise-based version for reading the file (better for PDF)
    const dataBuffer = await fs.promises.readFile(filePath);
    
    if (dataBuffer.length === 0) {
      throw new Error("Empty PDF file");
    }

    const data = await pdfParse(dataBuffer);
    return data.text || "";
  } catch (error: any) {
    console.error("Error in loadPDF:", error.message);
    throw error;
  }
}

function loadExcel(filePath: string): string {
  try {
    // Use fs.existsSync (works now because we imported 'fs')
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at path: ${filePath}`);
    }

    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    let text = "";

    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      const json: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      json.forEach((row) => {
        if (row && row.length > 0) {
          const cleanRow = row.map(cell => cell ?? "").join(" ");
          text += cleanRow + "\n";
        }
      });
    });

    return text.trim();
  } catch (error: any) {
    console.error("Error in loadExcel:", error.message);
    throw error;
  }
}

export { loadPDF, loadExcel };
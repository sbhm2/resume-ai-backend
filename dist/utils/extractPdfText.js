"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPdfText = void 0;
const pdf_parse_1 = require("pdf-parse");
const extractPdfText = async (fileBuffer) => {
    const parser = new pdf_parse_1.PDFParse({ data: fileBuffer });
    try {
        const result = await parser.getText();
        return result.text.trim();
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to parse PDF: ${message}`);
    }
    finally {
        await parser.destroy();
    }
};
exports.extractPdfText = extractPdfText;

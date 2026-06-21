"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPdfText = void 0;
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const extractPdfText = async (fileBuffer) => {
    try {
        const data = await (0, pdf_parse_1.default)(fileBuffer);
        return data.text.trim();
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to parse PDF: ${message}`);
    }
};
exports.extractPdfText = extractPdfText;

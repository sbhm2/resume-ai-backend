"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractDocxText = void 0;
const mammoth_1 = __importDefault(require("mammoth"));
const extractDocxText = async (fileBuffer) => {
    try {
        const result = await mammoth_1.default.extractRawText({ buffer: fileBuffer });
        return result.value.trim();
    }
    catch (error) {
        throw new Error(`Failed to parse DOCX: ${error.message}`);
    }
};
exports.extractDocxText = extractDocxText;

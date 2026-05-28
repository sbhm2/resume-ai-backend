import * as pdfParseModule from 'pdf-parse';

const pdfParse = ((pdfParseModule as unknown as { default?: unknown }).default ??
  pdfParseModule) as (data: Buffer) => Promise<{ text: string }>;

export const extractPdfText = async (fileBuffer: Buffer): Promise<string> => {
    try {
        const data = await pdfParse(fileBuffer);
        return data.text.trim();
    } catch (error: any) {
        throw new Error(`Failed to parse PDF: ${error.message}`);
    }
};
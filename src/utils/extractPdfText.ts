import { PDFParse } from 'pdf-parse';

export const extractPdfText = async (fileBuffer: Buffer): Promise<string> => {
    const parser = new PDFParse({ data: fileBuffer });

    try {
        const result = await parser.getText();
        return result.text.trim();
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to parse PDF: ${message}`);
    } finally {
        await parser.destroy();
    }
};

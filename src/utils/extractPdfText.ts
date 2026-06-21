// pdf-parse v1.1.1 has no default export — the callable function is at .PDFParse
// eslint-disable-next-line @typescript-eslint/no-require-imports
const {PDFParse} = require('pdf-parse');

export const extractPdfText = async (fileBuffer: Buffer): Promise<string> => {
    try {
        const parser = new PDFParse(new Uint8Array(fileBuffer));
        const data = await parser.getText();
        return data.text.trim();
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to parse PDF: ${message}`);
    }
};

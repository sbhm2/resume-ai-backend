import pdf from 'pdf-parse';

export const extractPdfText = async (fileBuffer: Buffer): Promise<string> => {
    try {
        const data = await pdf(fileBuffer);
        return data.text.trim();
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to parse PDF: ${message}`);
    }
};

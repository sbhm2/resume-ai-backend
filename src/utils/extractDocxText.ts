import mammoth from 'mammoth';

export const extractDocxText = async (fileBuffer: Buffer): Promise<string> => {
    try {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        return result.value.trim();
    } catch (error: any) {
        throw new Error(`Failed to parse DOCX: ${error.message}`);
    }
};
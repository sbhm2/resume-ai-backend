# Resume AI Backend (TypeScript)

Express + TypeScript API that analyzes a resume against a job description and returns an AI-generated ATS-style report using Google Gemini.

## Prerequisites
- Node.js (v18+)
- A Google Gemini API key (from Google AI Studio)

## Setup
Install dependencies:

```bash
cd resume-ai-backend
npm install
```

Create a `.env` file in `resume-ai-backend/`:

```bash
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
```

## Run
Development (auto-reload):

```bash
npm run dev
```

Production:

```bash
npm run build
npm start
```

Health check:

```bash
curl http://localhost:5000/health
```

## API
### `POST /api/resume/analyze`
Analyzes a resume vs a job description.

- **Content-Type**: `multipart/form-data`
- **Form fields**
  - `resumeFile`: PDF or DOCX (max 5MB)
  - `jobDescriptionText`: string

Example success response:

```json
{
  "success": true,
  "data": {
    "atsScore": 85,
    "missingKeywords": ["TypeScript", "GraphQL", "AWS"],
    "resumeSuggestions": ["Add metrics to your recent role to quantify impact."],
    "improvedBulletPoints": [
      "Designed and implemented RESTful APIs using Node.js and Express, improving system response time by 30%."
    ],
    "recommendedSkills": ["Docker", "Kubernetes"],
    "interviewQuestions": [
      "Can you describe a time you had to optimize a slow database query?"
    ],
    "coverLetter": "Dear Hiring Manager, [Generated tailored text...]"
  }
}
```

## Errors
- **400**: missing file, missing job description, unsupported file type
- **500**: failed to parse document, Gemini API failure

## Troubleshooting
- **Port already in use**: either stop the process using the port, or change `PORT` in `.env`.
  - Find the listener: `lsof -nP -iTCP:5000 -sTCP:LISTEN`
  - Stop it: `kill <pid>` (or `kill -9 <pid>` if needed)

## Deployment notes
- Set `NODE_ENV=production`
- Set `GEMINI_API_KEY` in your host’s environment variables/secrets manager
- Build before running (`npm run build` then `npm start`)
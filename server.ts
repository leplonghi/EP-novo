import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini API
  const getAiClient = () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY environment variable is required');
    return new GoogleGenAI({ apiKey: key });
  };

  // Evaluation Endpoint
  app.post('/api/evaluate', async (req, res) => {
    try {
      const ai = getAiClient();
      const { roundId, teamName, submission, conditional } = req.body;

      const systemPrompt = `You are Professor Eduardo Longhi, a strict but humorous architecture and urbanism professor. 
Review the following student submission for the urbanism game 'Entre-Marés: Blitz Urbana'.
Provide your evaluation in STRICT JSON FORMAT. No markdown formatting, just raw JSON.

JSON Schema required:
{
  "score": number, // 0 to 70
  "strongPoint": string,
  "weakPoint": string,
  "recommendation": string,
  "funComment": string,
  "discussionPrompt": string
}

Game Context:
- Round: ${roundId}
- Team: ${teamName}
- Current Conditional Constraint: ${conditional.title} - ${conditional.tooltip}

Submission Details:
${JSON.stringify(submission, null, 2)}

Rubric (70 pts max):
- Identified the urban issue: up to 20 pts
- Chosen coherent solution: up to 20 pts
- Chosen appropriate zone: up to 15 pts
- Good justification: up to 10 pts
- Considered actual use, climate, maintenance, accessibility, or the conditional constraint: up to 5 pts. Penalize heavily if they ignored the constraint.

Keep comments short, punchy, and academic but fun (Brazilian Portuguese).`;

      let response;
      let retries = 3;
      while (retries > 0) {
        try {
          response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: systemPrompt,
            config: {
                temperature: 0.7,
                responseMimeType: "application/json",
            }
          });
          break;
        } catch (err: any) {
          console.error(`Attempt ${4 - retries} failed:`, err.status, err.message);
          if ((err.status === 503 || err.status === 429) && retries > 1) {
            retries--;
            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, (4 - retries) * 1000));
            continue;
          }
          throw err;
        }
      }

      let textContent = response.text || "{}";
      const cleanedJson = textContent.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
      const evaluation = JSON.parse(cleanedJson);

      res.json(evaluation);
    } catch (err: any) {
      console.error("Evaluation Error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Vite development middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

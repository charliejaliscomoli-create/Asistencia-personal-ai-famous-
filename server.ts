import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { processAssistantQuery } from './src/server/assistantService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Assistant API endpoint
app.post('/api/assistant', async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Prompt es requerido' });
      return;
    }

    const result = await processAssistantQuery(prompt);
    res.json(result);
  } catch (error: any) {
    console.error('Error processing assistant query:', error);
    res.status(500).json({
      error: error.message || 'Error al comunicarse con el asistente de voz',
    });
  }
});

// Serve static frontend in production
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Assistant server running on port ${PORT}`);
});

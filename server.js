
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({limit: '2mb'}));
app.use(express.static(path.join(__dirname, 'public')));


app.post('/generate', async (req, res) => {
  const { imageUrl, prompt, ratio, seed, model, duration } = req.body;
  const apiKey = process.env.RUNWAY_API_KEY;
  if (!imageUrl || !prompt || !apiKey || !ratio) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const startResp = await fetch('https://api.dev.runwayml.com/v1/image_to_video', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'X-Runway-Version': '2024-11-06',
        'Content-Type': 'application/json'
      },      body: JSON.stringify({
        promptImage: imageUrl,
        seed: seed || Math.floor(Math.random() * 1000000000),
        model: model || 'gen4_turbo',
        promptText: prompt,
        duration: duration || 5,
        ratio
      })
    });

    const startData = await startResp.json();
    if (!startResp.ok) {
      return res.status(startResp.status).json({ error: startData.message });
    }

    const taskId = startData.id;

    // poll for completion
    while (true) {
      await new Promise(r => setTimeout(r, 2000));
      const pollResp = await fetch(`https://api.dev.runwayml.com/v1/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'X-Runway-Version': '2024-11-06'
        }
      });
      const pollData = await pollResp.json();
      if (!pollResp.ok) {
        return res.status(pollResp.status).json({ error: pollData.message });
      }
      if (pollData.status === 'SUCCEEDED') {
        return res.json({ videoUrl: pollData.output[0] });
      } else if (pollData.status === 'FAILED') {
        return res.status(500).json({ error: 'Video generation failed' });
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unexpected error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

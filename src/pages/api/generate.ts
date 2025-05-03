import type { NextApiRequest, NextApiResponse } from 'next';
import { generateScript } from '@/lib/scriptGen';
import { generateVoice } from '@/lib/tts';
import { makeVideo } from '@/lib/videoMaker';
import { createThumbnail } from '@/lib/thumbnail';
import { generateSEO } from '@/lib/seo';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { topic } = req.body;
  if (!topic) {
    return res.status(400).json({ message: 'No topic provided' });
  }

  try {
    const sessionId = uuidv4();
    const tempDir = path.join(process.cwd(), 'public', 'outputs', sessionId);
    fs.mkdirSync(tempDir, { recursive: true });

    // Step 1: Generate story/script
    const script = await generateScript(topic);
    fs.writeFileSync(path.join(tempDir, 'script.txt'), script);

    // Step 2: Generate voice (TTS)
    const audioPath = await generateVoice(script, tempDir);

    // Step 3: Generate video
    const videoPath = await makeVideo(script, audioPath, tempDir);

    // Step 4: Generate thumbnail
    const thumbnailPath = await createThumbnail(topic, tempDir);

    // Step 5: Generate SEO content
    const { hashtags, caption, description } = generateSEO(topic);
    fs.writeFileSync(path.join(tempDir, 'seo.txt'), `${caption}\n\n${hashtags.join(' ')}\n\n${description}`);

    // Step 6: Zip it all
    const zipPath = path.join(tempDir, 'package.zip');
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(output);
    archive.directory(tempDir, false);
    await archive.finalize();

    const zipUrl = `/outputs/${sessionId}/package.zip`;
    return res.status(200).json({ zipUrl });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: 'Generation failed' });
  }
}

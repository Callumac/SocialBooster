import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

const outputDir = path.join(process.cwd(), 'public');
const outputPath = path.join(outputDir, 'output.mp3');

/**
 * Text to Speech using gTTS (Google Text-to-Speech via CLI)
 * @param text - The story/script
 * @param gender - 'male' or 'female'
 */
export async function generateVoice(text: string, gender: 'male' | 'female' = 'female'): Promise<string> {
  return new Promise((resolve, reject) => {
    // Slightly adjust speed or pitch to simulate voice tone
    const speed = gender === 'male' ? 0.9 : 1.1;

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const command = `gtts-cli "${text.replace(/"/g, '\\"')}" --lang en | ffmpeg -i - -filter:a "atempo=${speed}" -y ${outputPath}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`TTS error: ${stderr}`);
        return reject('Voice generation failed.');
      }
      resolve(`/output.mp3`);
    });
  });
}

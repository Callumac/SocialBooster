import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

const publicDir = path.join(process.cwd(), 'public');
const videoOutput = path.join(publicDir, 'output.mp4');

/**
 * Generates video using ffmpeg: voice + background + subtitles
 * @param scriptPath - Path to the generated text
 * @param audioPath - Path to the generated voice (mp3)
 * @param backgroundImage - Optional background image path
 */
export async function generateVideo(scriptText: string, audioPath: string, backgroundImage = 'public/placeholder.png'): Promise<string> {
  const subtitlePath = path.join(publicDir, 'subtitles.srt');

  // Simple SRT generation (each line appears for 3 seconds)
  const lines = scriptText.split(/\. |\n/).filter(Boolean);
  let srtContent = '';
  let start = 0;
  lines.forEach((line, i) => {
    const end = start + 3;
    srtContent += `${i + 1}\n00:00:${String(start).padStart(2, '0')},000 --> 00:00:${String(end).padStart(2, '0')},000\n${line.trim()}\n\n`;
    start = end;
  });
  fs.writeFileSync(subtitlePath, srtContent);

  return new Promise((resolve, reject) => {
    const command = `
      ffmpeg -loop 1 -i ${backgroundImage} -i ${audioPath} -vf "subtitles=${subtitlePath}" \
      -c:v libx264 -tune stillimage -shortest -y ${videoOutput}
    `.trim();

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Video generation error: ${stderr}`);
        return reject('Video generation failed.');
      }
      resolve('/output.mp4');
    });
  });
}

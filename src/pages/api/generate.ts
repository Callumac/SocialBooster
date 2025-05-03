import { NextApiRequest, NextApiResponse } from "next";
import { generateScript } from "@/lib/scriptGen";
import { generateVoice } from "@/lib/tts";
import { makeVideo } from "@/lib/videoMaker";
import { generateThumbnail } from "@/lib/thumbnail";
import { generateSEO } from "@/lib/seo";

import fs from "fs";
import path from "path";
import archiver from "archiver";
import { v4 as uuidv4 } from "uuid";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { prompt, type = "story" } = req.body;
  if (!prompt) {
    return res.status(400).json({ message: "No prompt provided" });
  }

  try {
    const sessionId = uuidv4();
    const tempDir = path.join(process.cwd(), "public", "outputs", sessionId);
    fs.mkdirSync(tempDir, { recursive: true });

    // 1. Script
    const script = await generateScript(prompt, type);
    fs.writeFileSync(path.join(tempDir, "script.txt"), script);

    // 2. Voice
    const audioPath = await generateVoice(script, tempDir);

    // 3. Video
    const videoPath = await makeVideo(script, audioPath, tempDir);

    // 4. Thumbnail
    const thumbnailPath = await generateThumbnail(prompt, tempDir);

    // 5. SEO
    const { hashtags, caption, description } = await generateSEO(prompt);
    fs.writeFileSync(
      path.join(tempDir, "seo.txt"),
      `${caption}\n\n${hashtags.join(" ")}\n\n${description}`
    );

    // 6. Zip output
    const zipPath = path.join(tempDir, "package.zip");
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.pipe(output);
    archive.directory(tempDir, false);
    await archive.finalize();

    const zipUrl = `/outputs/${sessionId}/package.zip`;

    return res.status(200).json({
      script,
      audio: audioPath,
      video: videoPath,
      thumbnail: thumbnailPath,
      caption,
      hashtags,
      description,
      zipUrl
    });
  } catch (error) {
    console.error("Generation error:", error);
    return res.status(500).json({ message: "Content generation failed" });
  }
}

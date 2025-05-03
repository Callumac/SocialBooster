// src/lib/scriptGen.ts
import { Configuration, OpenAIApi } from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''; // Use Vercel env var

export async function generateScript(topic: string, type: string = 'story'): Promise<string> {
  const promptMap: Record<string, string> = {
    story: `Write a captivating 3-paragraph short story based on the topic: "${topic}". Make it imaginative, emotional, and suitable for video narration.`,
    review: `Write a balanced product review about: "${topic}". Include pros, cons, and a conclusion.`,
    news: `Summarize the latest news topic: "${topic}" in 3 short paragraphs.`,
    explainer: `Explain the topic "${topic}" in a clear, simple way for beginners.`,
    motivation: `Write a motivational message about: "${topic}", under 100 words.`,
    promo: `Create an engaging promotional video script for "${topic}". Include a strong call to action.`,
    shorts: `Generate a catchy YouTube Shorts script (under 45 seconds) about: "${topic}". Make it engaging and fast-paced.`,
    podcast: `Create an audio podcast-style monologue on: "${topic}", around 1-2 minutes. Use a casual tone.`
  };

  const finalPrompt = promptMap[type] || promptMap["story"];

  // If API key available, use ChatGPT
  if (OPENAI_API_KEY) {
    try {
      const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
      const openai = new OpenAIApi(configuration);

      const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: finalPrompt }],
        temperature: 0.8,
      });

      const script = response.data.choices[0].message?.content?.trim();
      if (script) return script;
    } catch (err) {
      console.warn('OpenAI API failed. Falling back to offline script.');
    }
  }

  // Offline fallback templates
  const templates = [
    `Once upon a time, in a land far away, there was a tale about ${topic}.`,
    `This is the story of ${topic}, filled with wonder and mystery.`,
    `Imagine a world where ${topic} becomes reality — this is that story.`,
    `Here's what happens when ${topic} changes everything.`,
    `In the beginning, ${topic} seemed ordinary, but everything changed...`
  ];

  const intro = templates[Math.floor(Math.random() * templates.length)];

  const body = `
${intro}

As events unfolded, the main characters were faced with surprising twists and challenges. They discovered that ${topic} was more than just a concept — it was the key to their destiny.

In the end, the lesson was clear: never underestimate the power of ideas like ${topic}, for they shape our world in the most unexpected ways.
`;

  return body.trim();
}

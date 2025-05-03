import { Configuration, OpenAIApi } from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''; // Use Vercel env var

// Hybrid Story Generator
export async function generateScript(topic: string): Promise<string> {
  // If API key available, use ChatGPT
  if (OPENAI_API_KEY) {
    try {
      const configuration = new Configuration({
        apiKey: OPENAI_API_KEY,
      });
      const openai = new OpenAIApi(configuration);

      const prompt = `Write a captivating 3-paragraph short story based on the topic: "${topic}". Make it imaginative, emotional, and suitable for video narration.`;

      const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo', // or 'gpt-4' if available
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
      });

      const story = response.data.choices[0].message?.content?.trim();
      if (story) return story;
    } catch (err) {
      console.warn('OpenAI API failed. Falling back to offline story.');
    }
  }

  // Offline fallback generator
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

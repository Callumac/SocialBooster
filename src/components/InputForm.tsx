
import React, { useState } from "react";

const InputForm = ({ onGenerate }: { onGenerate: Function }) => {
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState("story");

  return (
    <div className="p-4 space-y-4">
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="border p-2 w-full rounded"
      >
        <option value="story">Story</option>
        <option value="review">Product Review</option>
        <option value="news">News Recap</option>
        <option value="explainer">Explainer</option>
        <option value="motivation">Motivational Quote</option>
        <option value="promo">Ad/Promo</option>
        <option value="shorts">YouTube Shorts</option>
        <option value="podcast">Podcast Audio</option>
      </select>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your topic or idea..."
        className="border p-2 w-full rounded h-32"
      />

      <button
        onClick={() => onGenerate({ prompt, type })}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Generate
      </button>
    </div>
  );
};

export default InputForm;

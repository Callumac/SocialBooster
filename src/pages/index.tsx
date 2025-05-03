
import { useState } from "react";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [zipUrl, setZipUrl] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setZipUrl("");

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    });

    const data = await res.json();
    setLoading(false);
    setZipUrl(data?.zipUrl || "");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-4 text-center">AI Story Video Generator</h1>
      <input
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Enter story topic (e.g. 'A dragon in space')"
        className="w-full max-w-md p-3 border border-gray-300 rounded mb-4"
      />
      <button
        onClick={handleGenerate}
        disabled={loading || !topic}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Generating..." : "Generate Video"}
      </button>

      {zipUrl && (
        <a
          href={zipUrl}
          download
          className="mt-6 text-green-600 underline font-semibold"
        >
          Download Your Video Package
        </a>
      )}
    </div>
  );
}

import type { NextApiRequest, NextApiResponse } from "next";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "OPTIONS") {
    Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Note: For Next.js API routes with file uploads, you often need a middleware like `formidable`.
    // Assuming `req.files?.audio` is available through a custom middleware setup.
    const audioFile = (req as any).files?.audio as File; 

    if (!audioFile) {
      throw new Error("No audio file provided.");
    }

    // Convert audio to a Blob for Eleven Labs API
    const audioBlob = new Blob([await audioFile.arrayBuffer()], { type: audioFile.type });

    // Prepare form data for Eleven Labs
    const formData = new FormData();
    formData.append("audio", audioBlob, audioFile.name);
    formData.append("model_id", "whisper-1"); // Explicitly add model_id to form data

    // Call Eleven Labs Whisper ASR
    const elevenLabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/speech-to-text`,
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY ?? "",
        },
        body: formData,
      }
    );

    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text();
      throw new Error(`Eleven Labs API error: ${elevenLabsResponse.status} - ${errorText}`);
    }

    const result = (await elevenLabsResponse.json()) as { text: string }; // Simplified type for immediate use
    const transcript = result.text;

    Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({ transcript });
  } catch (error: any) {
    console.error("Voice transcription error:", error);
    Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({ error: error.message });
  }
}
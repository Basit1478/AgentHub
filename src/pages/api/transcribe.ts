import type { NextApiRequest, NextApiResponse } from "next";

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, xi-api-key",
  "Access-Control-Max-Age": "86400",
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    res.status(204).setHeader("Access-Control-Allow-Origin", "*");
    Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
    return res.end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Parse form data
    const formData = req.body; // You may need to use a middleware like 'formidable' for file uploads

    // TODO: Implement file parsing logic here (see Next.js docs for file uploads)

    // Check ElevenLabs API key
    const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY || "";
    if (!elevenLabsApiKey) {
      return res.status(500).json({ error: "ElevenLabs API key not configured" });
    }

    // Check ElevenLabs quota
    const quotaResponse = await fetch("https://api.elevenlabs.io/v1/user/subscription", {
      headers: { "xi-api-key": elevenLabsApiKey },
    });
    if (!quotaResponse.ok) {
      throw new Error(`Failed to check ElevenLabs quota: ${quotaResponse.statusText}`);
    }
    const quota = await quotaResponse.json();
    if (quota.character_count >= quota.character_limit) {
      return res.status(429).json({ error: "ElevenLabs character quota exceeded" });
    }

    // Send audio to ElevenLabs STT (you need to send the file as FormData)
    // TODO: Implement file upload logic here

    // Example response
    return res.status(200).json({
      text: "Transcribed text here",
      language: "en",
    });
  } catch (error: any) {
    console.error("Transcription error:", error.message || error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
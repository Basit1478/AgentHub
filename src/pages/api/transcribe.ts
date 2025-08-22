
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Changed from https to http
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, xi-api-key",
  "Access-Control-Max-Age": "86400",
};

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204, // No Content for OPTIONS
      headers: corsHeaders,
    });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get("file");
    if (!audioFile || !(audioFile instanceof File)) {
      return new Response(JSON.stringify({ error: "No valid audio file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check ElevenLabs API key
    const elevenLabsApiKey = Deno.env.get("ELEVEN_LABS_API_KEY") || "";
    if (!elevenLabsApiKey) {
      return new Response(JSON.stringify({ error: "ElevenLabs API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
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
      return new Response(JSON.stringify({ error: "ElevenLabs character quota exceeded" }), {
        status: 429,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Send audio to ElevenLabs STT
    const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: {
        "xi-api-key": elevenLabsApiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      let errorMessage = errorData.detail?.message || "Failed to transcribe voice";
      if (errorData.detail?.status === "quota_exceeded") {
        errorMessage = "ElevenLabs API quota exceeded. Please check your plan.";
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    if (!result.text) {
      throw new Error("No transcription available");
    }

    return new Response(
      JSON.stringify({
        text: result.text,
        language: result.language || "en",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Transcription error:", error.message || error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
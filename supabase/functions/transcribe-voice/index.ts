// functions/transcribe-voice/index.ts
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
};

// 🔑 API Key ko Deno environment variable me rakho
const ELEVEN_API_KEY = Deno.env.get("ELEVEN_LABS_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get("file");

    if (!audioFile) {
      return new Response(
        JSON.stringify({ error: "Audio file missing" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 🎤 Eleven Labs STT API call
    const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: {
        "xi-api-key": ELEVEN_API_KEY!,
      },
      body: (() => {
        const fd = new FormData();
        fd.append("file", audioFile);
        fd.append("model_id", "eleven_multilangual_v2"); // ✅ recommended STT model
        return fd;
      })()
    });

    const data = await response.json();

    if (!response.ok || !data || !data.text) {
        console.error("Eleven Labs transcription failed or returned no text:", data);
        return new Response(
            JSON.stringify({ error: data.detail || "Transcription failed or no text available" }),
            { status: response.status || 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

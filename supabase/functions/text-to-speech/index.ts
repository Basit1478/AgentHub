import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, voice, language } = await req.json()

    if (!text) {
      throw new Error('Text is required')
    }

    // For free TTS, we'll use the browser's built-in speech synthesis
    // This endpoint will return voice configuration
    const voiceConfig = {
      text,
      voice: voice || 'en-US',
      language: language || 'en-US',
      rate: 0.9,
      pitch: 1.0,
      volume: 1.0
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        voiceConfig,
        message: 'Voice configuration ready for client-side synthesis'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
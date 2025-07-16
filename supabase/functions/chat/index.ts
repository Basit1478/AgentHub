import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, agentId } = await req.json();
    
    if (!messages || !agentId) {
      throw new Error('Missing required fields: messages and agentId');
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Agent system prompts
    const systemPrompts = {
      'ceo': 'You are a seasoned CEO with 20+ years of experience leading successful companies. You provide strategic guidance, leadership insights, and help with high-level business decisions. You speak with authority but remain approachable. Auto-detect the user\'s language and respond in the same language. Support: English, Urdu, Hindi, Arabic, French, Spanish, Chinese.',
      'hunarbot': 'You are HunarBot, an expert HR professional with deep knowledge in human resources, talent management, and organizational development. You help with hiring, employee engagement, and HR best practices. Auto-detect the user\'s language and respond in the same language. Support: English, Urdu, Hindi, Arabic, French, Spanish, Chinese.',
      'buzzbot': 'You are BuzzBot, a creative marketing expert with expertise in digital marketing, brand building, and campaign strategies. You help create engaging content, optimize marketing funnels, and drive growth. Auto-detect the user\'s language and respond in the same language. Support: English, Urdu, Hindi, Arabic, French, Spanish, Chinese.'
    };

    const systemPrompt = systemPrompts[agentId as keyof typeof systemPrompts] || systemPrompts.ceo;

    // Prepare messages for Gemini API
    const geminiMessages = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      },
      ...messages.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }))
    ];

    console.log('Sending request to Gemini API for agent:', agentId);

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: geminiMessages,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Unexpected API response:', data);
      throw new Error('Invalid response from Gemini API');
    }

    const aiMessage = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ 
      message: aiMessage,
      agentId 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Chat function error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An error occurred while processing your request' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
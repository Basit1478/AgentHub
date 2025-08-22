import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error("Authentication failed");
    }

    const { messages, agentId } = await req.json();

    // Get user's subscription info to determine which API key to use
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select(`
        plan,
        subscriptions (
          plan_name,
          status
        )
      `)
      .eq('user_id', userData.user.id)
      .single();

    // Determine which Gemini API key to use based on subscription
    const isPremium = profile?.subscriptions?.some(
      (sub: any) => sub.status === 'active' && ['Professional', 'Enterprise'].includes(sub.plan_name)
    ) || profile?.plan === 'premium' || profile?.plan === 'enterprise';

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      throw new Error("Gemini API key not configured");
    }

    // Use different models based on subscription tier
    const model = isPremium ? "gemini-1.5-pro" : "gemini-1.5-flash";

    // Format messages for Gemini API
    const formattedMessages = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // System prompt based on agent
    const systemPrompts = {
      'ceo-agent': 'You are a CEO Coach AI assistant. Help with business strategy, leadership, and executive decision-making. Auto-detect the user\'s language and respond in the same language. Support: English, Roman Urdu, and provide English transcription.',
      'hunar-bot': 'You are HunarBot, an AI assistant focused on skill development and career growth. Auto-detect the user\'s language and respond in the same language. Support: English, Roman Urdu, and provide English transcription.',
      'buzz-bot': 'You are BuzzBot, an AI assistant for marketing, social media, and brand development. Auto-detect the user\'s language and respond in the same language. Support: English, Roman Urdu, and provide English transcription.'
    };

    const systemPrompt = systemPrompts[agentId as keyof typeof systemPrompts] || 
      'You are a HR MARKETING and Strategy Agent. Auto-detect the user\'s language and respond in the same language. Support: English, Roman Urdu, and provide English transcription.';

    // Add system message
    const allMessages = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      ...formattedMessages
    ];

    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: allMessages,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.candidates[0]?.content?.parts[0]?.text || "I apologize, but I couldn't generate a response.";

    return new Response(JSON.stringify({ message: aiMessage, model: model }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
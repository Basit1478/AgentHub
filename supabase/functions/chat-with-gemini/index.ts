import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

interface GeminiApiResponse {
  candidates?: {
    content?: {
      parts?: {
        text?: string;
      }[];
    };
  }[];
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Create Supabase client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData?.user) throw new Error("Authentication failed");

    const { messages, agentId } = req.body;

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

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) throw new Error("Gemini API key not configured");

    // Use different models based on subscription tier
    const model = isPremium ? "gemini-1.5-pro" : "gemini-1.5-flash";

    // Format messages for Gemini API
    const formattedMessages = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // System prompt based on agent
    const systemPrompts: Record<string, string> = {
      "ceo-agent": "You are a CEO Coach AI assistant. Help with business strategy, leadership, and executive decision-making. Auto-detect the user's language and respond in the same language. Support: English, Roman Urdu, and provide English transcription.",
      "hunar-bot": "You are HunarBot, an AI assistant focused on skill development and career growth. Auto-detect the user's language and respond in the same language. Support: English, Roman Urdu, and provide English transcription.",
      "buzz-bot": "You are BuzzBot, an AI assistant for marketing, social media, and brand development. Auto-detect the user's language and respond in the same language. Support: English, Roman Urdu, and provide English transcription."
    };

    const systemPrompt =
      systemPrompts[agentId as keyof typeof systemPrompts] ||
      "You are a HR MARKETING and Strategy Agent. Auto-detect the user's language and respond in the same language. Support: English, Roman Urdu, and provide English transcription.";

    // Add system message
    const allMessages = [
      { role: "user", parts: [{ text: systemPrompt }] },
      ...formattedMessages,
    ];

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
    }

    const data = (await response.json()) as GeminiApiResponse;
    const aiMessage =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I apologize, but I couldn't generate a response.";

    Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({ message: aiMessage, model });
  } catch (error: any) {
    Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
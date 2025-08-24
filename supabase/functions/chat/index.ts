import type { NextApiRequest, NextApiResponse } from "next";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function searchGoogle(query: string): Promise<string> {
  try {
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

    if (!apiKey || !searchEngineId) {
      return "Google Search API not configured";
    }

    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&num=5`
    );

    if (!response.ok) {
      throw new Error(`Search API error: ${response.status}`);
    }

    const data: any = await response.json();
    const results = data.items?.slice(0, 3).map((item: any) => ({
      title: item.title,
      snippet: item.snippet,
      link: item.link
    })) || [];

    return results.length > 0
      ? `Search results for "${query}":\n${results.map((r: any) => `• ${r.title}: ${r.snippet}`).join('\n')}`
      : "No search results found";
  } catch (error: any) {
    return `Search error: ${error.message}`;
  }
}

async function searchPlaces(query: string): Promise<string> {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return "Google Maps API not configured";
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Maps API error: ${response.status}`);
    }

    const data: any = await response.json();
    const results = data.results?.slice(0, 3).map((place: any) => ({
      name: place.name,
      address: place.formatted_address,
      rating: place.rating,
      types: place.types?.slice(0, 3)
    })) || [];

    return results.length > 0
      ? `Places found for "${query}":\n${results.map((r: any) => `• ${r.name} - ${r.address} (Rating: ${r.rating || 'N/A'})`).join('\n')}`
      : "No places found";
  } catch (error: any) {
    return `Maps error: ${error.message}`;
  }
}

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
    const { messages, agentId, files } = req.body;

    if (!messages || !agentId) {
      throw new Error("Missing required fields: messages and agentId");
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key not configured");
    }

    const systemPrompts: Record<string, string> = {
      ceo: "You are a seasoned CEO with 20+ years of experience leading successful companies. You provide strategic guidance, leadership insights, and help with high-level business decisions. You can search Google for industry data, competitor information, and business insights, as well as find business locations and meeting venues using Google Maps. You speak with authority but remain approachable. Auto-detect the user's language and respond in the same language. Support: English, Urdu, Hindi, Arabic, French, Spanish, Chinese.",
      hunarbot: "You are HunarBot, an expert HR professional with deep knowledge in human resources, talent management, and organizational development. You help with hiring, employee engagement, and HR best practices. You can search Google for current HR trends, salary data, and company information, as well as find office locations and coworking spaces using Google Maps. Auto-detect the user's language and respond in the same language. Support: English, Urdu, Hindi, Arabic, French, Spanish, Chinese.",
      buzzbot: "You are buzzbot, a creative marketing expert with expertise in digital marketing, brand building, and campaign strategies. You help create engaging content, optimize marketing funnels, and drive growth. You can search Google for market trends, competitor analysis, and industry insights, as well as find local businesses and events using Google Maps for location-based marketing. Auto-detect the user's language and respond in the same language. Support: English, Urdu, Hindi, Arabic, French, Spanish, Chinese."
    };

    const systemPrompt = systemPrompts[agentId] || systemPrompts.ceo;

    // Get the latest user message
    const latestMessage = messages[messages.length - 1];
    let enhancedMessage = latestMessage.content;

    // Check if user is asking for search or maps
    if (
      latestMessage.content.toLowerCase().includes("search for") ||
      latestMessage.content.toLowerCase().includes("google")
    ) {
      const query = latestMessage.content.replace(/search for|google/gi, "").trim();
      if (query) {
        const searchResults = await searchGoogle(query);
        enhancedMessage += `\n\n${searchResults}`;
      }
    }

    if (
      latestMessage.content.toLowerCase().includes("find places") ||
      latestMessage.content.toLowerCase().includes("location") ||
      latestMessage.content.toLowerCase().includes("near me")
    ) {
      const query = latestMessage.content.replace(/find places|location|near me/gi, "").trim();
      if (query) {
        const mapResults = await searchPlaces(query);
        enhancedMessage += `\n\n${mapResults}`;
      }
    }

    // Add file information if files were uploaded
    if (files && files.length > 0) {
      const fileInfo = files.map((file: any) => `- ${file.name} (${file.type})`).join("\n");
      enhancedMessage += `\n\nFiles uploaded:\n${fileInfo}`;
    }

    // Prepare messages for Gemini API
    const geminiMessages = messages.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    if (geminiMessages.length > 0) {
      geminiMessages[geminiMessages.length - 1].parts[0].text = enhancedMessage;
    }

    // Prepend system prompt to the first message of the conversation
    if (messages.length === 1) {
      geminiMessages[0].parts[0].text = `${systemPrompt}\n\n${geminiMessages[0].parts[0].text}`;
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.4,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data: any = await response.json();

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error("Invalid response from Gemini API");
    }

    const aiMessage = data.candidates[0].content.parts[0].text;

    Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({
      message: aiMessage,
      agentId,
    });
  } catch (error: any) {
    Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: error.message || "An error occurred while processing your request",
    });
  }
}
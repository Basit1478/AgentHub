import type { NextApiRequest, NextApiResponse } from "next";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    console.log("Test function called successfully!");
    
    Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({
      message: "Backend is working!",
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url
    });
  } catch (error: any) {
    console.error("Test function error:", error);
    Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: "Test function failed",
      details: error.message
    });
  }
}
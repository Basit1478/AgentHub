import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

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
    console.log("SUPABASE_URL present:", !!process.env.SUPABASE_URL);
    console.log("SUPABASE_SERVICE_ROLE_KEY present:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData?.user) throw new Error("Authentication failed");

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('user_id', userData.user.id);

    if (profileError || !profile?.[0]?.is_admin) throw new Error("Access denied - admin privileges required");

    const { action, userId } = req.body;
    console.log("Received action:", action);
    console.log("Received userId:", userId);

    switch (action) {
      case 'get_users': {
        const { data: users, error: usersError } = await supabaseAdmin
          .from('profiles')
          .select(`
            *,
            subscriptions (
              plan_name,
              status,
              current_period_end,
              stripe_customer_id
            )
          `)
          .order('created_at', { ascending: false });

        if (usersError) throw usersError;
        return res.status(200).json({ users });
      }

      case 'get_chat_stats': {
        const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const { data: chatStats, error: chatError } = await supabaseAdmin
          .from('chat_history')
          .select('user_id, agent_id, created_at')
          .gte('created_at', since);

        if (chatError) throw chatError;

        const statsGrouped = (chatStats || []).reduce((acc: any, chat: any) => {
          const date = chat.created_at.split('T')[0];
          if (!acc[date]) acc[date] = 0;
          acc[date]++;
          return acc;
        }, {});

        return res.status(200).json({ chatStats: statsGrouped });
      }

      case 'reset_user_conversations': {
        if (!userId) throw new Error("Missing userId");
        const { error: resetError } = await supabaseAdmin
          .from('profiles')
          .update({ 
            conversations_used: 0,
            last_reset_date: new Date().toISOString().split('T')[0]
          })
          .eq('user_id', userId);

        if (resetError) throw resetError;
        return res.status(200).json({ success: true });
      }

      default:
        throw new Error("Invalid action");
    }
  } catch (error: any) {
    console.error("Admin dashboard error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
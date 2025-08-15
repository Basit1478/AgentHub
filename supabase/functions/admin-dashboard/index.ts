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
    // Create Supabase client with service role key
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

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('user_id', userData.user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      throw new Error("Access denied - admin privileges required");
    }

    const { action } = await req.json();

    switch (action) {
      case 'get_users':
        // Get all users with their profiles and subscription data
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

        return new Response(JSON.stringify({ users }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });

      case 'get_chat_stats':
        // Get chat statistics
        const { data: chatStats, error: chatError } = await supabaseAdmin
          .from('chat_history')
          .select('user_id, agent_id, created_at')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        if (chatError) throw chatError;

        const statsGrouped = chatStats.reduce((acc: any, chat: any) => {
          const date = chat.created_at.split('T')[0];
          if (!acc[date]) acc[date] = 0;
          acc[date]++;
          return acc;
        }, {});

        return new Response(JSON.stringify({ chatStats: statsGrouped }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });

      case 'reset_user_conversations':
        const { userId } = await req.json();
        
        const { error: resetError } = await supabaseAdmin
          .from('profiles')
          .update({ 
            conversations_used: 0,
            last_reset_date: new Date().toISOString().split('T')[0]
          })
          .eq('user_id', userId);

        if (resetError) throw resetError;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });

      default:
        throw new Error("Invalid action");
    }
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
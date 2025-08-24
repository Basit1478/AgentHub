import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

interface StripeSubscriptionWithPeriods extends Stripe.Subscription {
  current_period_start: number;
  current_period_end: number;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "OPTIONS") {
    Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { action } = req.body;
    
    // Get authenticated user
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseClient = createClient(
      process.env.SUPABASE_URL ?? "",
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    
    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2025-07-30.basil",
    });

    if (action === "check") {
      // Check subscription status
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      
      if (customers.data.length === 0) {
        // Update database with no subscription
        await supabaseClient.from("subscriptions").upsert({
          user_id: user.id,
          status: "inactive",
          plan_name: "free",
        });
        
        Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
        res.setHeader("Content-Type", "application/json");
        return res.status(200).json({
          subscribed: false,
          plan: "free"
        });
      }

      const customerId = customers.data[0].id;
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      });

      const hasActiveSub = subscriptions.data.length > 0;
      let planName = "free";
      
      if (hasActiveSub) {
        const subscription = subscriptions.data[0] as StripeSubscriptionWithPeriods;
        const priceId = subscription.items.data[0].price.id;
        const price = await stripe.prices.retrieve(priceId);
        
        // Determine plan based on price
        const amount = price.unit_amount || 0;
        if (amount >= 2999) planName = "premium";
        else if (amount >= 999) planName = "basic";
        
        // Update database
        await supabaseClient.from("subscriptions").upsert({
          user_id: user.id,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          plan_name: planName,
          status: "active",
          current_period_start: null, // TODO: Revisit how to get this value if needed, as it might be deprecated in Stripe Subscription object
          current_period_end: null, // TODO: Revisit how to get this value if needed, as it might be deprecated in Stripe Subscription object
        });
      }

      Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
      res.setHeader("Content-Type", "application/json");
      return res.status(200).json({
        subscribed: hasActiveSub,
        plan: planName
      });
    }

    if (action === "portal") {
      // Create customer portal session
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      
      if (customers.data.length === 0) {
        throw new Error("No Stripe customer found");
      }

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customers.data[0].id,
        return_url: `${req.headers.host}/pricing`,
      });

      Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
      res.setHeader("Content-Type", "application/json");
      return res.status(200).json({ url: portalSession.url });
    }

    throw new Error("Invalid action");
  } catch (error: any) {
    console.error("Subscription management error:", error);
    Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({ error: error.message });
  }
}
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

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
    const { planName } = req.body;
    
    if (!planName) {
      throw new Error("Plan name is required");
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2025-07-30.basil",
    });

    // Define pricing for each plan
    const planPricing = {
      'Starter': { amount: 900, name: 'Starter Plan' }, // $9.00
      'Professional': { amount: 2900, name: 'Professional Plan' }, // $29.00
      'Enterprise': { amount: 9900, name: 'Enterprise Plan' } // $99.00
    };

    const plan = planPricing[planName as keyof typeof planPricing];
    if (!plan) {
      throw new Error("Invalid plan name");
    }

    // Create Stripe checkout session with inline price data
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "link", "us_bank_account"],
      payment_method_options: {
        us_bank_account: {
          verification_method: "instant",
        },
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: plan.name,
            },
            unit_amount: plan.amount,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/pricing`,
      metadata: {
        planName: planName,
      },
    });

    Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({ error: error.message });
  }
}
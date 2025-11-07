import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, gfaContext } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

    // Build system prompt with GFA context
    const systemPrompt = `You are an expert assistant for Green Field Analysis (GFA) optimization. You help users understand their data and results.

Current GFA Context:
${gfaContext.customers ? `- Total Customers: ${gfaContext.customers.length}` : ''}
${gfaContext.customers ? `- Customer Data Available: Yes\n  Columns: id, product, name, city, country, latitude, longitude, demand, unitOfMeasure, conversionFactor` : ''}
${gfaContext.products ? `- Products: ${gfaContext.products.map((p: any) => p.name).join(', ')}` : ''}
${gfaContext.dcs ? `- Optimization Results: ${gfaContext.dcs.length > 0 ? `${gfaContext.dcs.length} distribution centers found` : 'Not yet optimized'}` : ''}
${gfaContext.settings ? `- Optimization Mode: ${gfaContext.settings.mode}` : ''}

Customer Data Details:
${gfaContext.customers ? JSON.stringify(gfaContext.customers, null, 2) : 'No customer data loaded yet'}

Products Details:
${gfaContext.products ? JSON.stringify(gfaContext.products, null, 2) : 'No products loaded yet'}

${gfaContext.dcs && gfaContext.dcs.length > 0 ? `Optimization Results:
${JSON.stringify(gfaContext.dcs, null, 2)}` : ''}

${gfaContext.costBreakdown ? `Cost Breakdown:
${JSON.stringify(gfaContext.costBreakdown, null, 2)}` : ''}

Your role:
- Answer questions about the input data (customers, products, demand)
- Explain what data columns are required and their purpose
- Provide statistics and analysis based on the actual data
- Answer questions about optimization results
- Explain GFA model concepts and methodology
- Be precise with numbers from the actual data

When users ask questions like:
- "How many customers are there?" - Count from the actual customer data
- "What products do we have?" - List from the products array
- "Which customers have demand > X?" - Filter and count from customer data
- "How many customers in USA?" - Filter by country field
- "What is the max/min demand?" - Calculate from customer demand values
- "What columns are required?" - Explain: product, name, city, country, latitude, longitude, demand, unitOfMeasure

Always reference the actual data provided in the context above.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("gfa-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

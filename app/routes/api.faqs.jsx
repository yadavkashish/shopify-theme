import db from "../db.server";

// This loader acts as a public API for your storefront
export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const productId = url.searchParams.get("productId");
  // It is good practice to pass the shop domain from Liquid to identify the store settings
  const shop = url.searchParams.get("shop"); 

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  // 1. Fetch Storefront Settings (Style, Color, Radius)
  // We try to find settings for the specific shop, or default to the first record for dev
  let settings = await db.fAQSettings.findFirst({
    where: shop ? { shop } : undefined
  });

  // Apply defaults if no settings exist yet
  if (!settings) {
    settings = { style: 'accordion', color: '#008060', radius: 8 };
  }

  // 2. Validate Product ID
  if (!productId) {
    return new Response(JSON.stringify({ faqs: [], settings }), { headers: corsHeaders });
  }

  // 3. Find which FAQ Sets are mapped to this product
  const mappedSets = await db.productFAQMapping.findMany({
    where: { productId: productId }
  });
  
  const assignedTitles = mappedSets.map(map => map.faqTitle);

  // If no FAQs assigned, return empty list but valid settings
  if (assignedTitles.length === 0) {
    return new Response(JSON.stringify({ faqs: [], settings }), { headers: corsHeaders });
  }

  // 4. Fetch the actual FAQs
  const faqs = await db.fAQ.findMany({
    where: { title: { in: assignedTitles } }
  });
  
  // 5. Return JSON
  // We return 'faqs' as a flat list here because the Liquid/JS frontend 
  // we built in the previous step iterates over a single array.
  return new Response(JSON.stringify({
    faqs,     // The list of questions
    settings  // The design tokens (color, style, radius)
  }), {
    headers: corsHeaders,
  });
};
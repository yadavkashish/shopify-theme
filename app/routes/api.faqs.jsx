import db from "../db.server";

// This loader acts as a public API for your storefront
export const loader = async ({ request }) => {
  // 1. Get the productId from the URL query parameters sent by the storefront
  const url = new URL(request.url);
  const productId = url.searchParams.get("productId");

  // If no product ID is provided, return an empty object
  if (!productId) {
    return Response.json({}, { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  // 2. Find which FAQ Sets (titles) are mapped to this specific product
  const mappedSets = await db.productFAQMapping.findMany({
    where: { productId: productId }
  });
  
  const assignedTitles = mappedSets.map(map => map.faqTitle);

  // If no FAQs are assigned to this product, return empty so the Liquid block stays hidden
  if (assignedTitles.length === 0) {
    return Response.json({}, { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  // 3. Fetch ONLY the FAQs that belong to the assigned titles
  const faqs = await db.fAQ.findMany({
    where: { title: { in: assignedTitles } }
  });
  
  // 4. Group them by title just like we did in the dashboard
  const groupedFaqs = faqs.reduce((acc, faq) => {
    const key = faq.title || "Untitled Set";
    if (!acc[key]) acc[key] = [];
    acc[key].push(faq);
    return acc;
  }, {});

  // 5. Return the JSON with CORS headers so the storefront can read it
  return Response.json(groupedFaqs, {
    headers: {
      "Access-Control-Allow-Origin": "*", // Allows your storefront to fetch this securely
    },
  });
};
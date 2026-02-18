import db from "../db.server";
import { json } from "@remix-run/node";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const productId = url.searchParams.get("productId");
  // We need the shop to find the right settings. 
  // In a real app, you might extract this from the session or a query param.
  const shopParam = url.searchParams.get("shop"); 

  if (!productId) {
    return json({}, { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  // 1. Fetch the Style Settings (Find first or by specific shop if passed)
  // If no settings exist, fallback to defaults
  const settings = (await db.fAQSettings.findFirst({
    where: shopParam ? { shop: shopParam } : undefined
  })) || { style: 'accordion', color: '#008060', radius: 8 };

  // 2. Find Mapped FAQs
  const mappedSets = await db.productFAQMapping.findMany({
    where: { productId: productId }
  });
  
  const assignedTitles = mappedSets.map(map => map.faqTitle);

  if (assignedTitles.length === 0) {
    return json({}, { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  // 3. Fetch Questions
  const faqs = await db.fAQ.findMany({
    where: { title: { in: assignedTitles } }
  });
  
  // 4. Group Them
  const groupedFaqs = faqs.reduce((acc, faq) => {
    const key = faq.title || "Untitled Set";
    if (!acc[key]) acc[key] = [];
    acc[key].push(faq);
    return acc;
  }, {});

  // 5. Return BOTH content and config
  return json({
    content: groupedFaqs,
    config: settings
  }, {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
};
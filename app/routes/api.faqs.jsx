import db from "../db.server.js";

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}

// ===========================================
// LOADER – Handles all GET requests to /api/faqs
// ===========================================
export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") || "";

  try {
    const faqs = await db.fAQ.findMany({
      orderBy: { createdAt: "asc" },
    });

    const settings = (await db.fAQSettings.findFirst({
      where: shop ? { shop } : undefined,
    })) || {
      style: "accordion",
      color: "#008060",
      radius: 8,
    };

    const mappings = await db.productFAQMapping.findMany();

    return jsonResponse({ faqs, settings, mappings });
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return jsonResponse({ error: "Failed to fetch data" }, 500);
  }
};

// ===========================================
// ACTION – Handles all POST requests to /api/faqs
// ===========================================
export const action = async ({ request }) => {
  const body = await request.json();
  const { intent } = body;

  try {
    // --- Save UI Settings ---
    if (intent === "saveSettings") {
      const { style, color, radius, shop } = body;
      const shopName = shop || "default-shop.myshopify.com";

      await db.fAQSettings.upsert({
        where: { shop: shopName },
        update: { style, color, radius: parseInt(radius) },
        create: { shop: shopName, style, color, radius: parseInt(radius) },
      });
      return jsonResponse({ success: true });
    }

    // --- Save FAQ Set ---
    if (intent === "saveFaqSet") {
      const { title, questions, idsToDelete, shop } = body;
      const shopName = shop || "";

      if (idsToDelete && idsToDelete.length > 0) {
        await db.fAQ.deleteMany({
          where: { id: { in: idsToDelete } },
        });
      }

      for (const q of questions) {
        if (q.id && !q.id.toString().startsWith("temp_")) {
          await db.fAQ.update({
            where: { id: q.id },
            data: { title, question: q.question, answer: q.answer, shop: shopName },
          });
        } else {
          await db.fAQ.create({
            data: { title, question: q.question, answer: q.answer, shop: shopName },
          });
        }
      }
      return jsonResponse({ success: true });
    }

    // --- Delete FAQ Set ---
    if (intent === "deleteSet") {
      const { title } = body;
      await db.fAQ.deleteMany({ where: { title } });
      await db.productFAQMapping.deleteMany({ where: { faqTitle: title } });
      return jsonResponse({ success: true });
    }

    // --- Save Product Mappings ---
    if (intent === "saveProductMapping") {
      const { faqTitle, productIds } = body;

      await db.productFAQMapping.deleteMany({
        where: { faqTitle },
      });

      if (productIds && productIds.length > 0) {
        await db.productFAQMapping.createMany({
          data: productIds.map((productId) => ({
            faqTitle,
            productId,
          })),
        });
      }

      return jsonResponse({ success: true });
    }

    // --- Remove Single Product Mapping ---
    if (intent === "removeProductMapping") {
      const { faqTitle, productId } = body;
      await db.productFAQMapping.deleteMany({
        where: { faqTitle, productId },
      });
      return jsonResponse({ success: true });
    }

    return jsonResponse({ error: "Unknown intent" }, 400);
  } catch (error) {
    console.error("Database error during POST:", error);
    return jsonResponse({ error: "Internal Server Error" }, 500);
  }
};
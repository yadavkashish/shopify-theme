import db from "../db.server.js";

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") || "";

  try {
    const faqs = await db.fAQ.findMany({ orderBy: { createdAt: "asc" } });
    const settings = (await db.fAQSettings.findFirst({ where: shop ? { shop } : undefined })) || { style: "accordion", color: "#008060", radius: 8 };
    const mappings = await db.productFAQMapping.findMany();

    const testimonials = await db.testimonial.findMany({ orderBy: { createdAt: "asc" } });
    const testiSettings = (await db.testimonialSettings.findFirst({ where: shop ? { shop } : undefined })) || { style: "grid", color: "#ffb800", radius: 12 };
    const testiMappings = await db.productTestimonialMapping.findMany();

    return jsonResponse({ faqs, settings, mappings, testimonials, testiSettings, testiMappings });
  } catch (error) {
    console.error("Error fetching admin data:", error);
    return jsonResponse({ error: "Failed to fetch data" }, 500);
  }
};

export const action = async ({ request }) => {
  const body = await request.json();
  const { intent } = body;
  const shopName = body.shop || "default-shop.myshopify.com";

  try {
    // --- FAQ Intents ---
    if (intent === "saveSettings") {
      const { style, color, radius } = body;
      await db.fAQSettings.upsert({
        where: { shop: shopName },
        update: { style, color, radius: parseInt(radius) },
        create: { shop: shopName, style, color, radius: parseInt(radius) },
      });
      return jsonResponse({ success: true });
    }

    if (intent === "saveFaqSet") {
      const { title, questions, idsToDelete } = body;
      if (idsToDelete?.length > 0) await db.fAQ.deleteMany({ where: { id: { in: idsToDelete } } });

      for (const q of questions) {
        if (q.id && !q.id.toString().startsWith("temp_")) {
          await db.fAQ.update({ where: { id: q.id }, data: { title, question: q.question, answer: q.answer, shop: shopName } });
        } else {
          await db.fAQ.create({ data: { title, question: q.question, answer: q.answer, shop: shopName } });
        }
      }
      return jsonResponse({ success: true });
    }

    if (intent === "deleteSet") {
      await db.fAQ.deleteMany({ where: { title: body.title } });
      await db.productFAQMapping.deleteMany({ where: { faqTitle: body.title } });
      return jsonResponse({ success: true });
    }

    if (intent === "saveProductMapping") {
      const { faqTitle, productIds } = body;
      await db.productFAQMapping.deleteMany({ where: { faqTitle } });
      if (productIds?.length > 0) {
        await db.productFAQMapping.createMany({ data: productIds.map((productId) => ({ faqTitle, productId })) });
      }
      return jsonResponse({ success: true });
    }

    if (intent === "removeProductMapping") {
      await db.productFAQMapping.deleteMany({ where: { faqTitle: body.faqTitle, productId: body.productId } });
      return jsonResponse({ success: true });
    }

    // --- Testimonial Intents ---
    if (intent === "saveTestiSettings") {
      const { style, color, radius } = body;
      await db.testimonialSettings.upsert({
        where: { shop: shopName },
        update: { style, color, radius: parseInt(radius) },
        create: { shop: shopName, style, color, radius: parseInt(radius) },
      });
      return jsonResponse({ success: true });
    }

    if (intent === "saveTestimonialSet") {
      const { title, testimonials, idsToDelete } = body;
      if (idsToDelete?.length > 0) await db.testimonial.deleteMany({ where: { id: { in: idsToDelete } } });

      for (const t of testimonials) {
        if (t.id && !t.id.toString().startsWith("temp_")) {
          await db.testimonial.update({ where: { id: t.id }, data: { title, author: t.author, subtitle: t.subtitle, rating: t.rating, content: t.content, shop: shopName } });
        } else {
          await db.testimonial.create({ data: { title, author: t.author, subtitle: t.subtitle, rating: t.rating, content: t.content, shop: shopName } });
        }
      }
      return jsonResponse({ success: true });
    }

    if (intent === "deleteTestiSet") {
      await db.testimonial.deleteMany({ where: { title: body.title } });
      await db.productTestimonialMapping.deleteMany({ where: { testiTitle: body.title } });
      return jsonResponse({ success: true });
    }

    if (intent === "saveTestiProductMapping") {
      const { testiTitle, productIds } = body;
      await db.productTestimonialMapping.deleteMany({ where: { testiTitle } });
      if (productIds?.length > 0) {
        await db.productTestimonialMapping.createMany({ data: productIds.map((productId) => ({ testiTitle, productId })) });
      }
      return jsonResponse({ success: true });
    }

    if (intent === "removeTestiProductMapping") {
      await db.productTestimonialMapping.deleteMany({ where: { testiTitle: body.testiTitle, productId: body.productId } });
      return jsonResponse({ success: true });
    }

    return jsonResponse({ error: "Unknown intent" }, 400);
  } catch (error) {
    console.error("Database error during POST:", error);
    return jsonResponse({ error: "Internal Server Error" }, 500);
  }
};
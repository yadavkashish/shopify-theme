import express from 'express';
import db from '../db.server.js'; // Ensure this points to your Prisma client

const router = express.Router();

// ==========================================
// 1. DASHBOARD: Get Initial Data
// ==========================================
router.get('/api/faqs', async (req, res) => {
  try {
    const faqs = await db.fAQ.findMany({
      orderBy: { createdAt: 'asc' }
    });
    
    // Fetch settings (Assuming single shop for now, or filter by session shop)
    const settings = (await db.fAQSettings.findFirst()) || { 
      style: 'accordion', color: '#008060', radius: 8 
    };

    return res.json({ faqs, settings });
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return res.status(500).json({ error: "Failed to fetch data" });
  }
});

// ==========================================
// 2. DASHBOARD: Save, Update, and Delete
// ==========================================
router.post('/api/faqs', async (req, res) => {
  const { intent } = req.body;
  
  // NOTE: In a secure Shopify Express app, you should grab the shop from the session:
  // const shop = res.locals.shopify.session.shop;
  const shop = req.body.shop || "default-shop.myshopify.com"; 

  try {
    // Handle saving UI settings
    if (intent === "saveSettings") {
      const { style, color, radius } = req.body;
      
      await db.fAQSettings.upsert({
        where: { shop: shop },
        update: { style, color, radius },
        create: { shop, style, color, radius }
      });
      return res.json({ success: true });
    }

    // Handle saving FAQ Sets
    if (intent === "saveFaqSet") {
      const { title, questions, idsToDelete } = req.body;

      // Delete any removed questions
      if (idsToDelete && idsToDelete.length > 0) {
        await db.fAQ.deleteMany({
          where: { id: { in: idsToDelete } }
        });
      }

      // Create or update the questions in the set
      for (const q of questions) {
        if (q.id && !q.id.toString().startsWith("temp_")) {
          await db.fAQ.update({
            where: { id: q.id },
            data: { title, question: q.question, answer: q.answer }
          });
        } else {
          await db.fAQ.create({
            data: { title, question: q.question, answer: q.answer }
          });
        }
      }
      return res.json({ success: true });
    }

    // Handle deleting an entire FAQ Set
    if (intent === "deleteSet") {
      const { title } = req.body;
      await db.fAQ.deleteMany({
        where: { title: title }
      });
      await db.productFAQMapping.deleteMany({
        where: { faqTitle: title }
      });
      return res.json({ success: true });
    }

    return res.status(400).json({ error: "Unknown intent" });

  } catch (error) {
    console.error("Database error during POST:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// ==========================================
// 3. STOREFRONT: App Block API (Your original code)
// ==========================================
router.get('/api/faqs/product', async (req, res) => {
  // In Express, query parameters are accessed via req.query
  const { productId, shop: shopParam } = req.query;

  // Set CORS header (or use the 'cors' npm package globally in your express app)
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (!productId) {
    return res.json({});
  }

  try {
    // 1. Fetch the Style Settings
    const settings = (await db.fAQSettings.findFirst({
      where: shopParam ? { shop: shopParam } : undefined
    })) || { style: 'accordion', color: '#008060', radius: 8 };

    // 2. Find Mapped FAQs
    const mappedSets = await db.productFAQMapping.findMany({
      where: { productId: productId }
    });
    
    const assignedTitles = mappedSets.map(map => map.faqTitle);

    if (assignedTitles.length === 0) {
      return res.json({});
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
    return res.json({
      content: groupedFaqs,
      config: settings
    });

  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
import db from "../db.server.js";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, ngrok-skip-browser-warning",
};

function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json", ...corsHeaders },
    });
}

export const action = async ({ request }) => {
    if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders });
    }
    return jsonResponse({ error: "Method not allowed" }, 405);
};

// ===========================================
// PUBLIC STOREFRONT API
// GET /api/faqs/product?productId=...&shop=...
// No auth required – called from the storefront theme block
// ===========================================
export const loader = async ({ request }) => {
    const url = new URL(request.url);
    const productId = url.searchParams.get("productId");
    const shopParam = url.searchParams.get("shop");

    if (!productId) {
        return jsonResponse({});
    }

    try {
        // 1. Fetch Style Settings
        const settings = (await db.fAQSettings.findFirst({
            where: shopParam ? { shop: shopParam } : undefined,
        })) || { style: "accordion", color: "#008060", radius: 8 };

        // 2. Find Mapped FAQ titles for this product
        const mappedSets = await db.productFAQMapping.findMany({
            where: { productId },
        });

        const assignedTitles = mappedSets.map((map) => map.faqTitle);

        if (assignedTitles.length === 0) {
            return jsonResponse({});
        }

        // 3. Fetch FAQ questions for those titles
        const faqs = await db.fAQ.findMany({
            where: { title: { in: assignedTitles } },
        });

        // 5. Return content + config
        return jsonResponse({ faqs: faqs, config: settings });
    } catch (error) {
        console.error("Storefront FAQ API error:", error);
        return jsonResponse({ error: "Internal Server Error" }, 500);
    }
};

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
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
    return jsonResponse({ error: "Method not allowed" }, 405);
};

export const loader = async ({ request }) => {
    const url = new URL(request.url);
    const productId = url.searchParams.get("productId");
    const shopParam = url.searchParams.get("shop");

    if (!productId) return jsonResponse({});

    try {
        const testiSettingsModel = db.testimonialSettings || db.TestimonialSettings;
        const testiModel = db.testimonial || db.Testimonial;
        const mappingModel = db.productTestimonialMapping || db.ProductTestimonialMapping;

        const settings = (await testiSettingsModel.findFirst({
            where: shopParam ? { shop: shopParam } : undefined,
        })) || { style: "grid", color: "#ffb800", radius: 12 };

        const mappedSets = await mappingModel.findMany({
            where: { productId },
        });

        const assignedTitles = mappedSets.map((map) => map.testiTitle);
        if (assignedTitles.length === 0) return jsonResponse({});

        const testimonials = await testiModel.findMany({
            where: { title: { in: assignedTitles } },
        });

        return jsonResponse({ testimonials: testimonials, config: settings });
    } catch (error) {
        console.error("Storefront Testimonial API error:", error);
        return jsonResponse({ error: "Internal Server Error", details: error.message }, 500);
    }
};
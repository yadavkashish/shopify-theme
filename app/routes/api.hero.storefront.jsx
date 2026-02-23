import db from "../db.server.js";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, ngrok-skip-browser-warning",
};

// 👉 ADDED: This catches the browser's CORS preflight check
export const action = async ({ request }) => {
    if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders });
    }
    return new Response(JSON.stringify({ error: "Method not allowed" }), { 
        status: 405, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
    });
};

// Your existing loader
export const loader = async ({ request }) => {
    const url = new URL(request.url);
    const shopParam = url.searchParams.get("shop");

    if (!shopParam) return new Response(JSON.stringify({}), { status: 200, headers: corsHeaders });

    try {
        const settings = await db.heroSettings.findFirst({ where: { shop: shopParam } }) || { style: "centered", color: "#000000" };
        const content = await db.heroContent.findFirst({ where: { shop: shopParam } });

        // If no content is configured, don't render a hero
        if (!content) return new Response(JSON.stringify({}), { status: 200, headers: corsHeaders });

        return new Response(JSON.stringify({ content, config: settings }), {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Internal Error" }), { status: 500, headers: corsHeaders });
    }
};
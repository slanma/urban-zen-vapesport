import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "list_my_orders",
  title: "List my orders",
  description: "Vrátí objednávky aktuálně přihlášeného uživatele podle e-mailu z tokenu, seřazené od nejnovější.",
  inputSchema: {
    limit: z.number().int().min(1).max(100).optional().describe("Maximum orders to return (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Nepřihlášený uživatel." }], isError: true };
    }
    const email = ctx.getUserEmail();
    if (!email) return { content: [{ type: "text", text: "Token neobsahuje e-mail." }], isError: true };

    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase
      .from("orders")
      .select("id, order_number, created_at, email, company_name, is_b2b, payment_label, items")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(limit ?? 20);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { orders: data ?? [] },
    };
  },
});

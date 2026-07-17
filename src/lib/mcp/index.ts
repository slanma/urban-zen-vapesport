import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listProducts from "./tools/list_products";
import getMyB2bProfile from "./tools/get_my_b2b_profile";
import listMyOrders from "./tools/list_my_orders";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "vapesport-mcp",
  title: "Vapesport MCP",
  version: "0.1.0",
  instructions:
    "Nástroje pro e-shop Vapesport. `list_products` je veřejné; `get_my_b2b_profile` a `list_my_orders` vyžadují přihlášení uživatele.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listProducts, getMyB2bProfile, listMyOrders],
});

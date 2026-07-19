import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Prerender jen veřejné stránky. Admin, B2B portál, košík a pokladna
// se negenerují do HTML (nepotřebují SEO a běží jen v prohlížeči).
const isPrivate = (p: string) => {
  const q = p.startsWith("/") ? p : "/" + p;
  return (
    q.startsWith("/admin") ||
    q === "/kosik" ||
    q === "/pokladna" ||
    ["/b2b-login", "/b2b-heslo", "/b2b-register", "/b2b-nastenka", "/b2b-dashboard", "/b2b-pokladna"].includes(q)
  );
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  ssgOptions: {
    includedRoutes(paths: string[]) {
      return paths.filter((p) => !isPrivate(p));
    },
  },
}));

import { ViteReactSSG } from "vite-react-ssg";
import { routes } from "./App";
import "./index.css";

// Prerender (SSG) při buildu, hydratace v prohlížeči.
export const createRoot = ViteReactSSG({ routes });

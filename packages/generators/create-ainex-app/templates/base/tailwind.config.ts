import type { Config } from "tailwindcss";
import sharedConfig from "@ainexsuite/config/tailwind.config";

const config: Config = {
  ...sharedConfig,
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}", // Shared UI components
  ],
};

export default config;

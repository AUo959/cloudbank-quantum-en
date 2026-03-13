import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const projectRoot = process.env.PROJECT_ROOT || dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
  server: {
    host: true,
    port: Number(process.env.PORT) || 5000,
    strictPort: true,
  },
  preview: {
    host: true,
    port: Number(process.env.PREVIEW_PORT) || 5001,
  },
});

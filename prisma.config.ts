import { defineConfig } from "@prisma/config";
import { config as loadEnv } from "dotenv";
import { resolve } from "path";

// Carregamos primeiro o .env padrão e, em seguida, o .env.local para permitir overrides locais.
loadEnv({ path: resolve(process.cwd(), ".env") });
loadEnv({ path: resolve(process.cwd(), ".env.local"), override: true });

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});

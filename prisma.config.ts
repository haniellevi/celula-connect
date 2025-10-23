import { defineConfig } from "@prisma/config";
import { parse } from "dotenv";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

const projectRoot = process.cwd();

function loadEnvFile(filename: string, options: { override?: boolean } = {}) {
  const { override = false } = options;
  const filePath = resolve(projectRoot, filename);

  if (!existsSync(filePath)) {
    return;
  }

  let content = readFileSync(filePath, "utf8");

  if (content.includes("\u0000")) {
    content = readFileSync(filePath, "utf16le");
  }

  content = content.replace(/^\uFEFF/, "");

  const parsed = parse(content);

  for (const [key, value] of Object.entries(parsed)) {
    if (!override && process.env[key] !== undefined) {
      continue;
    }
    process.env[key] = value;
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local", { override: true });

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});

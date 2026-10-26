
import { readFileSync, existsSync } from "node:fs";

const examplePath = ".env.example";

if (!existsSync(examplePath)) {
  console.error("FAIL: .env.example file is missing");
  process.exit(1);
}

const content = readFileSync(examplePath, "utf8");

const apiUrlLine = content
  .split(/\r?\n/)
  .find((line) => line.startsWith("VITE_API_URL="));

if (!apiUrlLine) {
  console.error("FAIL: VITE_API_URL is missing from .env.example");
  process.exit(1);
}

const apiUrl = apiUrlLine.slice("VITE_API_URL=".length).trim();

try {
  const parsedUrl = new URL(apiUrl);

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("Unsupported URL protocol");
  }

  console.log("PASS: Frontend example API URL is valid");
} catch {
  console.error("FAIL: Invalid VITE_API_URL in .env.example");
  process.exit(1);
}

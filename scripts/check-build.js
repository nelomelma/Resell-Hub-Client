
import { existsSync, statSync } from "node:fs";

const requiredFiles = ["dist/index.html", "dist/assets"];

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    console.error(`FAIL: Missing production build output: ${file}`);
    process.exit(1);
  }
}

if (!statSync("dist/assets").isDirectory()) {
  console.error("FAIL: dist/assets is not a directory");
  process.exit(1);
}

console.log("PASS: Frontend production build output is ready");

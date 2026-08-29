import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const loadServiceAccountKey = () => {
  const possiblePaths = [
    path.join(__dirname, "../config/service.account-key.json"),
    path.join(__dirname, "../config/service-account-key.json"),
    path.join(__dirname, "../service-account-key.json"),
    path.join(process.cwd(), "config/service.account-key.json"),
    path.join(process.cwd(), "config/service-account-key.json"),
    path.join(process.cwd(), "service-account-key.json"),
  ];

  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      console.log(`🔑 [SHEETS] Memuat Service Account Key dari: ${filePath}`);
      const rawData = fs.readFileSync(filePath, "utf8");
      return JSON.parse(rawData);
    }
  }

  throw new Error(
    "File credential service.account-key.json tidak ditemukan di folder config/ atau root backend.",
  );
};

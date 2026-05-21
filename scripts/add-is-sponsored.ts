// scripts/add-is-sponsored.ts
import { Client, Databases } from "node-appwrite";
import fs from "fs";
import path from "path";

// Load .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
        const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)$/);
        if (match) {
            const key = match[1].trim();
            let val = match[2].trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                val = val.slice(1, -1);
            }
            process.env[key] = val;
        }
    }
}

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a0b4741002e8ae14adc";

async function run() {
    try {
        await databases.getAttribute(databaseId, "product", "isSponsored");
        console.log("isSponsored attribute already exists on product collection.");
    } catch {
        console.log("Creating isSponsored attribute on product collection...");
        await databases.createBooleanAttribute(databaseId, "product", "isSponsored", false, false);
        console.log("Done! isSponsored attribute created.");
    }
}

run().catch(console.error);

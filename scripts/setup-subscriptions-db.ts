// scripts/setup-subscriptions-db.ts
import { Client, Databases, Permission, Role, DatabasesIndexType, OrderBy } from "node-appwrite";
import fs from "fs";
import path from "path";

// 1. Dependency-free env parser for .env.local
function loadEnv() {
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
    console.log("Loaded environment variables from .env.local");
  } else {
    console.warn("Warning: .env.local not found at project root!");
  }
}

loadEnv();

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a0b4741002e8ae14adc";
const VENDORS_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_VENDORS_COLLECTION || "vendor";

if (!endpoint || !projectId || !apiKey) {
  console.error("Error: Missing Appwrite configuration in process.env. Ensure .env.local has Endpoint, Project ID, and API Key.");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);

const PAYMENTS_COLLECTION = "tokoni_payments";
const SPONSORSHIPS_COLLECTION = "tokoni_sponsorships";

async function attributeExists(collectionId: string, attributeId: string): Promise<boolean> {
  try {
    await databases.getAttribute(databaseId, collectionId, attributeId);
    return true;
  } catch {
    return false;
  }
}

async function indexExists(collectionId: string, indexId: string): Promise<boolean> {
  try {
    await databases.getIndex(databaseId, collectionId, indexId);
    return true;
  } catch {
    return false;
  }
}

async function pollAttributesReady(collectionId: string, expectedAttributes: string[]) {
  console.log(`Polling attributes readiness for collection: ${collectionId}...`);
  while (true) {
    const collection = await databases.getCollection(databaseId, collectionId);
    const readyAttributes = collection.attributes
      .filter((attr: any) => attr.status === "available")
      .map((attr: any) => attr.key);
    
    const missing = expectedAttributes.filter(attr => !readyAttributes.includes(attr));
    console.log(`  - Ready: ${readyAttributes.length}/${expectedAttributes.length}. Missing: [${missing.join(", ")}]`);
    if (missing.length === 0) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

async function setup() {
  try {
    console.log("Initializing Appwrite subscriptions and payments database setup...");

    // 1. Update VENDORS_COLLECTION with plan, trialEndsAt, planEndsAt
    console.log(`Updating vendor collection: ${VENDORS_COLLECTION}...`);
    const vendorAttrs = [
      { id: "plan", type: "string", required: false, size: 50, default: "premium" },
      { id: "trialEndsAt", type: "string", required: false, size: 100, default: null },
      { id: "planEndsAt", type: "string", required: false, size: 100, default: null }
    ];

    for (const attr of vendorAttrs) {
      const exists = await attributeExists(VENDORS_COLLECTION, attr.id);
      if (!exists) {
        console.log(`Creating attribute '${attr.id}' in '${VENDORS_COLLECTION}'...`);
        await databases.createStringAttribute(databaseId, VENDORS_COLLECTION, attr.id, attr.size, attr.required, attr.default ?? undefined, false);
      }
    }
    await pollAttributesReady(VENDORS_COLLECTION, ["plan", "trialEndsAt", "planEndsAt"]);

    // 2. Create PAYMENTS collection
    let paymentsCollectionExists = true;
    try {
      await databases.getCollection(databaseId, PAYMENTS_COLLECTION);
      console.log(`Collection '${PAYMENTS_COLLECTION}' already exists.`);
    } catch {
      paymentsCollectionExists = false;
    }

    if (!paymentsCollectionExists) {
      console.log(`Creating collection '${PAYMENTS_COLLECTION}'...`);
      await databases.createCollection(
        databaseId,
        PAYMENTS_COLLECTION,
        "Tokoni Payments",
        [
          Permission.read(Role.users()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
        ],
        false
      );
      console.log(`Collection '${PAYMENTS_COLLECTION}' created.`);
    }

    const paymentAttrs = [
      { id: "vendorId", type: "string", required: true, size: 255, default: null },
      { id: "amount", type: "double", required: true, size: 0, default: null },
      { id: "status", type: "string", required: false, size: 50, default: "pending" },
      { id: "type", type: "string", required: true, size: 50, default: null },
      { id: "description", type: "string", required: true, size: 1000, default: null },
      { id: "metadata", type: "string", required: false, size: 5000, default: null }
    ];

    for (const attr of paymentAttrs) {
      const exists = await attributeExists(PAYMENTS_COLLECTION, attr.id);
      if (!exists) {
        console.log(`Creating attribute '${attr.id}' in '${PAYMENTS_COLLECTION}'...`);
        if (attr.type === "double") {
          await databases.createFloatAttribute(databaseId, PAYMENTS_COLLECTION, attr.id, attr.required);
        } else {
          await databases.createStringAttribute(databaseId, PAYMENTS_COLLECTION, attr.id, attr.size!, attr.required, attr.default ?? undefined, false);
        }
      }
    }
    await pollAttributesReady(PAYMENTS_COLLECTION, paymentAttrs.map(a => a.id));

    // Create vendorId index for payments
    const paymentIndexId = "idx_payments_vendorId";
    const paymentIndexExists = await indexExists(PAYMENTS_COLLECTION, paymentIndexId);
    if (!paymentIndexExists) {
      console.log(`Creating query index '${paymentIndexId}' for vendorId...`);
      await databases.createIndex(databaseId, PAYMENTS_COLLECTION, paymentIndexId, DatabasesIndexType.Key, ["vendorId"], [OrderBy.Asc]);
      console.log(`Index '${paymentIndexId}' created.`);
    }

    // 3. Create SPONSORSHIPS collection
    let sponsorshipsCollectionExists = true;
    try {
      await databases.getCollection(databaseId, SPONSORSHIPS_COLLECTION);
      console.log(`Collection '${SPONSORSHIPS_COLLECTION}' already exists.`);
    } catch {
      sponsorshipsCollectionExists = false;
    }

    if (!sponsorshipsCollectionExists) {
      console.log(`Creating collection '${SPONSORSHIPS_COLLECTION}'...`);
      await databases.createCollection(
        databaseId,
        SPONSORSHIPS_COLLECTION,
        "Tokoni Sponsorships",
        [
          Permission.read(Role.users()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
        ],
        false
      );
      console.log(`Collection '${SPONSORSHIPS_COLLECTION}' created.`);
    }

    const sponsorshipAttrs = [
      { id: "vendorId", type: "string", required: true, size: 255 },
      { id: "productId", type: "string", required: true, size: 255 },
      { id: "startDate", type: "string", required: true, size: 100 },
      { id: "endDate", type: "string", required: true, size: 100 },
      { id: "duration", type: "string", required: true, size: 50 },
      { id: "interplatform", type: "boolean", required: true },
      { id: "status", type: "string", required: false, size: 50, default: "active" },
      { id: "paymentId", type: "string", required: true, size: 255 }
    ];

    for (const attr of sponsorshipAttrs) {
      const exists = await attributeExists(SPONSORSHIPS_COLLECTION, attr.id);
      if (!exists) {
        console.log(`Creating attribute '${attr.id}' in '${SPONSORSHIPS_COLLECTION}'...`);
        if (attr.type === "boolean") {
          await databases.createBooleanAttribute(databaseId, SPONSORSHIPS_COLLECTION, attr.id, attr.required);
        } else {
          await databases.createStringAttribute(databaseId, SPONSORSHIPS_COLLECTION, attr.id, attr.size!, attr.required, attr.default ?? undefined, false);
        }
      }
    }
    await pollAttributesReady(SPONSORSHIPS_COLLECTION, sponsorshipAttrs.map(a => a.id));

    // Create query indexes for sponsorships
    const sponsorIndexId = "idx_sponsorships_vendorId";
    const sponsorIndexExists = await indexExists(SPONSORSHIPS_COLLECTION, sponsorIndexId);
    if (!sponsorIndexExists) {
      console.log(`Creating query index '${sponsorIndexId}' for vendorId...`);
      await databases.createIndex(databaseId, SPONSORSHIPS_COLLECTION, sponsorIndexId, DatabasesIndexType.Key, ["vendorId"], [OrderBy.Asc]);
      console.log(`Index '${sponsorIndexId}' created.`);
    }

    const sponsorProdIndexId = "idx_sponsorships_productId";
    const sponsorProdIndexExists = await indexExists(SPONSORSHIPS_COLLECTION, sponsorProdIndexId);
    if (!sponsorProdIndexExists) {
      console.log(`Creating query index '${sponsorProdIndexId}' for productId...`);
      await databases.createIndex(databaseId, SPONSORSHIPS_COLLECTION, sponsorProdIndexId, DatabasesIndexType.Key, ["productId"], [OrderBy.Asc]);
      console.log(`Index '${sponsorProdIndexId}' created.`);
    }

    console.log("Appwrite Subscriptions & Payments Database Setup Completed Successfully!");
  } catch (error) {
    console.error("Database setup failed with error:", error);
    process.exit(1);
  }
}

setup();

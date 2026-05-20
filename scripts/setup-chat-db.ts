// scripts/setup-chat-db.ts
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

if (!endpoint || !projectId || !apiKey) {
  console.error("Error: Missing Appwrite configuration in process.env. Ensure .env.local has Endpoint, Project ID, and API Key.");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);

const CHAT_COLLECTION = "chat";
const MESSAGE_COLLECTION = "message";

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

async function pollAttributesReady(collectionId: string, expectedCount: number) {
  console.log(`Polling attributes readiness for collection: ${collectionId}...`);
  while (true) {
    const collection = await databases.getCollection(databaseId, collectionId);
    const attributes = collection.attributes;
    const readyAttributes = attributes.filter((attr: any) => attr.status === "available");
    console.log(`  - Ready: ${readyAttributes.length}/${expectedCount}`);
    if (readyAttributes.length >= expectedCount) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

async function setup() {
  try {
    console.log("Initializing Appwrite database setup...");

    // Create CHAT collection
    let chatCollectionExists = true;
    try {
      await databases.getCollection(databaseId, CHAT_COLLECTION);
      console.log(`Collection '${CHAT_COLLECTION}' already exists.`);
    } catch {
      chatCollectionExists = false;
    }

    if (!chatCollectionExists) {
      console.log(`Creating collection '${CHAT_COLLECTION}'...`);
      await databases.createCollection(
        databaseId,
        CHAT_COLLECTION,
        "Chat",
        [
          Permission.read(Role.users()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
        ],
        false // Document security not required for now, handled via query/participants filter
      );
      console.log(`Collection '${CHAT_COLLECTION}' created.`);
    }

    // Define chat attributes
    const chatAttrs = [
      { id: "participants", type: "stringArray", required: true, size: 255 },
      { id: "lastMessage", type: "string", required: false, size: 1000 },
      { id: "lastMessageSenderId", type: "string", required: false, size: 255 },
      { id: "lastMessageAt", type: "string", required: false, size: 255 },
      { id: "unreadCounts", type: "string", required: false, size: 1000, default: "{}" },
      { id: "typingUsers", type: "stringArray", required: false, size: 255 },
      { id: "lastMessageStatus", type: "string", required: false, size: 20, default: "sent" },
    ];

    let chatAttrsCreated = 0;
    for (const attr of chatAttrs) {
      const exists = await attributeExists(CHAT_COLLECTION, attr.id);
      if (!exists) {
        console.log(`Creating attribute '${attr.id}' in '${CHAT_COLLECTION}'...`);
        if (attr.type === "stringArray") {
          await databases.createStringAttribute(databaseId, CHAT_COLLECTION, attr.id, attr.size, attr.required, undefined, true);
        } else {
          await databases.createStringAttribute(databaseId, CHAT_COLLECTION, attr.id, attr.size, attr.required, attr.default, false);
        }
        chatAttrsCreated++;
      } else {
        chatAttrsCreated++;
      }
    }

    // Wait until all chat attributes are active before creating indexes
    await pollAttributesReady(CHAT_COLLECTION, chatAttrs.length);

    // Skip participants index since Appwrite does not support indexing multi-valued string arrays.
    // Querying on array attributes is still supported without an index.

    // Create MESSAGE collection
    let msgCollectionExists = true;
    try {
      await databases.getCollection(databaseId, MESSAGE_COLLECTION);
      console.log(`Collection '${MESSAGE_COLLECTION}' already exists.`);
    } catch {
      msgCollectionExists = false;
    }

    if (!msgCollectionExists) {
      console.log(`Creating collection '${MESSAGE_COLLECTION}'...`);
      await databases.createCollection(
        databaseId,
        MESSAGE_COLLECTION,
        "Message",
        [
          Permission.read(Role.users()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
        ],
        false
      );
      console.log(`Collection '${MESSAGE_COLLECTION}' created.`);
    }

    // Define message attributes
    const msgAttrs = [
      { id: "chatId", type: "string", required: true, size: 255 },
      { id: "senderId", type: "string", required: true, size: 255 },
      { id: "text", type: "string", required: false, size: 10000 },
      { id: "media", type: "stringArray", required: false, size: 1000 },
      { id: "mediaType", type: "string", required: false, size: 20, default: "none" },
      { id: "replyTo", type: "string", required: false, size: 255 },
      { id: "reactions", type: "string", required: false, size: 2000, default: "[]" },
      { id: "status", type: "string", required: false, size: 20, default: "sent" },
    ];

    for (const attr of msgAttrs) {
      const exists = await attributeExists(MESSAGE_COLLECTION, attr.id);
      if (!exists) {
        console.log(`Creating attribute '${attr.id}' in '${MESSAGE_COLLECTION}'...`);
        if (attr.type === "stringArray") {
          await databases.createStringAttribute(databaseId, MESSAGE_COLLECTION, attr.id, attr.size, attr.required, undefined, true);
        } else {
          await databases.createStringAttribute(databaseId, MESSAGE_COLLECTION, attr.id, attr.size, attr.required, attr.default, false);
        }
      }
    }

    // Wait until all message attributes are active before creating indexes
    await pollAttributesReady(MESSAGE_COLLECTION, msgAttrs.length);

    // Create chatId query index
    const msgIndexId = "idx_chatId";
    const msgIdxExists = await indexExists(MESSAGE_COLLECTION, msgIndexId);
    if (!msgIdxExists) {
      console.log(`Creating query index '${msgIndexId}' for chatId...`);
      await databases.createIndex(databaseId, MESSAGE_COLLECTION, msgIndexId, DatabasesIndexType.Key, ["chatId"], [OrderBy.Asc]);
      console.log(`Index '${msgIndexId}' created.`);
    }

    console.log("Appwrite Database Setup Completed Successfully!");
  } catch (error) {
    console.error("Database setup failed with error:", error);
    process.exit(1);
  }
}

setup();

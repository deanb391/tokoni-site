// scripts/reseed-posts.ts
import { Client, Databases, ID } from "node-appwrite";
import * as AWS from "aws-sdk";
import fs from "fs";
import path from "path";
import https from "https";

// 1. Load environment variables from .env.local
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)$/);
      if (match) {
        const key = match[1].trim();
        let val = match[2].trim();
        if (val.includes("#")) {
          val = val.split("#")[0].trim();
        }
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
    console.log("Loaded env variables successfully.");
  } else {
    console.error("Error: .env.local not found!");
    process.exit(1);
  }
}

loadEnv();

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a0b4741002e8ae14adc";
const POSTS_COLLECTION = "post";
const VENDORS_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_VENDORS_COLLECTION || "vendor";
const PRODUCTS_COLLECTION = "product";

if (!endpoint || !projectId || !apiKey) {
  console.error("Missing Appwrite config variables in .env.local!");
  process.exit(1);
}

// 2. Initialize Clients
const appwriteClient = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(appwriteClient);

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY!,
  secretAccessKey: process.env.AWS_SECRET_KEY!,
  region: process.env.AWS_REGION!,
});
const BUCKET_NAME = process.env.AWS_BUCKET!;
const CLOUDFRONT_URL = process.env.NEXT_PUBLIC_CLOUDFRONT_URL || `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;

// Helper: Download file to buffer, following redirects recursively
function downloadFile(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    function get(currentUrl: string) {
      https.get(currentUrl, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const redirectUrl = res.headers.location.startsWith("http")
            ? res.headers.location
            : new URL(res.headers.location, currentUrl).href;
          get(redirectUrl);
          return;
        }

        if (res.statusCode !== 200) {
          reject(new Error(`Failed download status ${res.statusCode} for ${currentUrl}`));
          return;
        }

        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      }).on("error", reject);
    }
    get(url);
  });
}

// Helper: Upload file to S3
async function uploadToS3(key: string, body: Buffer, contentType: string): Promise<string> {
  console.log(`Uploading to S3: bucket=${BUCKET_NAME}, key=${key}, size=${body.length} bytes...`);
  await s3.putObject({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  }).promise();
  const fileUrl = `${CLOUDFRONT_URL}/${key}`;
  console.log(`Uploaded successfully! CDN URL: ${fileUrl}`);
  return fileUrl;
}

// Media seed definitions
const sourceVideos = [
  { url: "https://www.w3schools.com/html/mov_bbb.mp4", name: "mov_bbb.mp4" },
  { url: "https://www.w3schools.com/html/movie.mp4", name: "movie.mp4" },
  { url: "https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/bolt-detection.mp4", name: "bolt-detection.mp4" },
  { url: "https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/bottle-detection.mp4", name: "bottle-detection.mp4" },
];

const sourceImages = [
  { url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=60", name: "unsplash1.jpg" },
  { url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=60", name: "unsplash2.jpg" },
  { url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60", name: "unsplash3.jpg" },
];

const captions = [
  "Start your morning with a freshly brewed espresso in our ceramic handmade mug. Feel the warm aroma! #coffee #espresso #morning",
  "Riding the urban streets at sunset. The new polyurethane skate wheels are buttery smooth. #skate #sunset #board",
  "Escaping into the deep pine forest creek. Nature is the best therapy. Listen to the flowing water. #nature #forest #creek",
  "Upgrade your wardrobe with this handcrafted Italian leather bag. Minimalist, premium, and durable. #fashion #leather #bag",
  "The ultimate wireless headphones for audiophiles. Crisp highs, deep bass, and absolute noise isolation. #tech #audio #headphones",
  "Transform your living room space with this mid-century modern handmade chair. Sleek and comfortable. #decor #home #furniture",
  "Precision grinding for the perfect filter coffee. Crafting delicious pour-over roasts every single day. #coffee #roast #grind",
  "Catching air at the skatepark. Pushing limits and building community. #skate #wheels #skateboarding",
  "Sunlight filtering through the dense redwood canopy. Pure serenity. #nature #sunlight #peace",
  "Vintage leather jacket styled for the modern explorer. Heavy duty brass hardware. #fashion #jacket #vintage",
  "Sleek metal desk organizer to declutter your creative studio workspace. #decor #studio #handmade",
  "Freshly roasted single-origin coffee beans straight from high-altitude farms. #coffee #roast #beans",
  "Cruising through downtown traffic under the neon glow. Late night sessions are the best. #skate #street #night",
  "Refreshing mountain stream rushing over granite riverbeds. Cold and pure. #nature #water #stream",
  "Classy minimalist leather wallet that fits perfectly. #fashion #leather #wallet",
  "Studio monitor speakers with flat response for accurate mixing and mastering. #tech #audio #studio",
  "Artistic ceramic flower vase with textured rustic matte finish. #decor #art #vintage",
  "Chasing waves and ocean breeze. Cozy beach day edits. #nature #sea #waves",
  "Waterproof canvas backpack designed for hiking, travel, and everyday commute. #fashion #bag #travel",
  "Mechanical keyboard with custom tactile switches for high-performance typing. #tech #keyboard #minimalist",
];

async function main() {
  console.log("Starting reseeding process...");

  // 1. Fetch vendors and products
  console.log("Fetching vendors...");
  const vendorsRes = await databases.listDocuments(databaseId, VENDORS_COLLECTION, []);
  const vendors = vendorsRes.documents;
  console.log(`Found ${vendors.length} vendors.`);

  if (vendors.length === 0) {
    console.error("Cannot seed posts: No vendors found in the database. Please create a vendor first.");
    process.exit(1);
  }

  console.log("Fetching products...");
  const productsRes = await databases.listDocuments(databaseId, PRODUCTS_COLLECTION, []);
  const products = productsRes.documents;
  console.log(`Found ${products.length} products.`);

  // 2. Download and Upload media files to S3
  const uploadedVideos: string[] = [];
  const uploadedImages: string[] = [];

  console.log("--- Seeding Video Media to S3 ---");
  for (const item of sourceVideos) {
    try {
      const buffer = await downloadFile(item.url);
      const key = `posts/seed/${item.name}`;
      const cdnUrl = await uploadToS3(key, buffer, "video/mp4");
      uploadedVideos.push(cdnUrl);
    } catch (err) {
      console.error(`Failed to seed video ${item.name}:`, err);
    }
  }

  console.log("--- Seeding Image Media to S3 ---");
  for (const item of sourceImages) {
    try {
      const buffer = await downloadFile(item.url);
      const key = `posts/seed/${item.name}`;
      const cdnUrl = await uploadToS3(key, buffer, "image/jpeg");
      uploadedImages.push(cdnUrl);
    } catch (err) {
      console.error(`Failed to seed image ${item.name}:`, err);
    }
  }

  if (uploadedVideos.length === 0 || uploadedImages.length === 0) {
    console.error("Failed to upload seed media to S3. Aborting.");
    process.exit(1);
  }

  // 3. Clear existing posts
  console.log("--- Clearing Existing Posts ---");
  let hasMorePosts = true;
  while (hasMorePosts) {
    const listRes = await databases.listDocuments(databaseId, POSTS_COLLECTION, []);
    if (listRes.documents.length === 0) {
      hasMorePosts = false;
      break;
    }
    console.log(`Deleting batch of ${listRes.documents.length} posts...`);
    for (const doc of listRes.documents) {
      await databases.deleteDocument(databaseId, POSTS_COLLECTION, doc.$id);
    }
  }
  console.log("All existing posts cleared successfully.");

  // 4. Generate 50 posts (45 videos, 5 images)
  console.log("--- Generating 50 Seeded Posts ---");
  const postsToCreate: any[] = [];

  for (let i = 1; i <= 50; i++) {
    // 90% are videos (1-45), 10% are images (46-50)
    const isVideo = i <= 45;
    const mediaUrl = isVideo 
      ? uploadedVideos[Math.floor(Math.random() * uploadedVideos.length)]
      : uploadedImages[Math.floor(Math.random() * uploadedImages.length)];
    
    const randomVendor = vendors[Math.floor(Math.random() * vendors.length)];
    const vendorId = randomVendor.$id;

    // Filter products belonging to this vendor, or choose randomly
    const vendorProducts = products.filter(p => p.vendor === vendorId || p.vendor?.$id === vendorId);
    const pool = vendorProducts.length > 0 ? vendorProducts : products;
    const taggedProducts: string[] = [];
    if (pool.length > 0 && Math.random() > 0.3) {
      const p1 = pool[Math.floor(Math.random() * pool.length)];
      taggedProducts.push(p1.$id);
      if (pool.length > 1 && Math.random() > 0.5) {
        const p2 = pool.filter(p => p.$id !== p1.$id)[0];
        if (p2) taggedProducts.push(p2.$id);
      }
    }

    const caption = captions[Math.floor(Math.random() * captions.length)] + ` (Ref: #${i})`;
    const views = Math.floor(Math.random() * 1450) + 50; // 50 to 1500
    const shares = Math.floor(Math.random() * 148) + 2;   // 2 to 150
    const likes = Math.floor(Math.random() * 495) + 5;    // 5 to 500
    const saved = Math.floor(Math.random() * 50);

    // Randomize creation date within last 15 days
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 15));
    const nowStr = createdDate.toISOString();

    const payload = {
      type: isVideo ? "video" : "image",
      media: [mediaUrl],
      caption,
      taggedProducts: taggedProducts,
      vendor: vendorId,
      likes,
      likedBy: JSON.stringify([]),
      comments: 0,
      saved,
      views,
      shares,
      $createdAt: nowStr,
      $updatedAt: nowStr,
    };

    postsToCreate.push(payload);
  }

  // Write documents to Appwrite
  for (let i = 0; i < postsToCreate.length; i++) {
    console.log(`Saving post ${i + 1}/50 (${postsToCreate[i].type})...`);
    await databases.createDocument(
      databaseId,
      POSTS_COLLECTION,
      ID.unique(),
      postsToCreate[i]
    );
  }

  console.log("Seeding complete! Successfully created 50 posts (45 videos, 5 images).");
}

main().catch(console.error);

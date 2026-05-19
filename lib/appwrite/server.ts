// lib/appwrite/server.ts
import { Client, Databases, Storage } from "node-appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

export const databases = new Databases(client);
export const storage = new Storage(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "69617e75000c6c010a75";
const USER_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION || "user";

export async function getUserById(userId: string) {
  try {
    const userDoc = await databases.getDocument(
      DATABASE_ID,
      USER_COLLECTION,
      userId
    );
    return userDoc;
  } catch (error) {
    console.error("Error fetching user by ID secure:", error);
    return null;
  }
}

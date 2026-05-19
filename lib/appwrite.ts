// lib/appwrite.ts
import { Client, Account, Storage, Databases, ID, Avatars, OAuthProvider } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const account = new Account(client);
export const storage = new Storage(client);
export const databases = new Databases(client);

const avatars = new Avatars(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "69617e75000c6c010a75";
const USER_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION || "user";

export async function createUser({
  email,
  password,
  username,
  isVendor = false,
}: {
  email: string;
  password: string;
  username: string;
  isVendor?: boolean;
}) {
  try {
    // 1. Create auth account
    const userAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    // 2. Create session immediately
    await account.createEmailPasswordSession(email, password);

    // 3. Create user document
    const avatar = avatars.getInitials(username);

    const userDoc = await databases.createDocument(
      DATABASE_ID,
      USER_COLLECTION,
      userAccount.$id, // Same ID as Auth Account
      {
        username,
        email,
        avatar,
        isAdmin: false,
        isVendor,
      }
    );

    return userDoc;
  } catch (error) {
    throw error;
  }
}

export async function updateUser({
  userId,
  isVendor,
  lastTime,
}: {
  userId: string;
  isVendor?: boolean;
  lastTime?: Date;
}) {
  const payload: Record<string, any> = {};
  if (isVendor !== undefined) payload.isVendor = isVendor;
  if (lastTime !== undefined) payload.lastTime = lastTime;

  return databases.updateDocument(
    DATABASE_ID,
    USER_COLLECTION,
    userId,
    payload
  );
}

export async function getCurrentUser() {
  try {
    // Check if client-side and session fallback token exists to avoid noisy 401 console errors
    if (typeof window !== "undefined") {
      const fallback = localStorage.getItem("cookieFallback");
      if (!fallback || fallback === "[]") {
        return null;
      }
    }

    // 1. Check session
    const session = await account.getSession("current");
    if (!session) return null;

    // 2. Get auth user
    const authUser = await account.get();

    // 3. Try to get user document
    try {
      const userDoc = await databases.getDocument(
        DATABASE_ID,
        USER_COLLECTION,
        authUser.$id
      );
      return userDoc;
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

export async function signIn(email: string, password: string) {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error) {
    throw error;
  }
}

export async function googleSignIn() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
    const redirectUrl = `${baseUrl}/auth/callback`;

    const response = await account.createOAuth2Token(
      OAuthProvider.Google,
      redirectUrl,
      redirectUrl
    );

    if (!response) {
      throw new Error("OAuth URL was not returned");
    }

    window.location.href = response;
  } catch (error) {
    console.error("Error during Google sign-in:", error);
    throw error;
  }
}

export async function handleOAuthSignIn(userId: string, secret: string) {
  // 1. Create session
  await account.createSession(userId, secret);

  // 2. Get auth user
  const authUser = await account.get();

  // 3. Check if profile exists
  try {
    const userDoc = await databases.getDocument(
      DATABASE_ID,
      USER_COLLECTION,
      authUser.$id
    );

    return {
      status: "EXISTS",
      user: userDoc,
    };
  } catch {
    return {
      status: "NEW",
      user: authUser,
    };
  }
}

export async function createUserProfile(
  authUser: any,
  data: {
    username: string;
    isVendor?: boolean;
  }
) {
  const avatar = avatars.getInitials(data.username);

  const userDoc = await databases.createDocument(
    DATABASE_ID,
    USER_COLLECTION,
    authUser.$id,
    {
      username: data.username,
      email: authUser.email,
      avatar,
      isAdmin: false,
      isVendor: data.isVendor || false,
    }
  );

  return userDoc;
}

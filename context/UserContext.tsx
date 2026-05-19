// context/UserContext.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getCurrentUser, updateUser } from "@/lib/services/auth.service";
import { getMyVendor } from "@/lib/api/vendors";
import type { Vendor } from "@/lib/services/vendors.service";

type User = {
  $id: string;
  email: string;
  username: string;
  avatar: string;
  isAdmin?: boolean;
  isVendor?: boolean;
  $createdAt: string;
};

type UserContextType = {
  user: User | null;
  vendor: Vendor | null;
  loading: boolean;
  vendorLoading: boolean;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  setVendor: (vendor: Vendor | null) => void;
  refetchVendor: () => Promise<Vendor | null>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [vendorLoading, setVendorLoading] = useState(false);

  const fetchVendorForUser = useCallback(
    async (userId: string) => {
      setVendorLoading(true);
      try {
        const vendorAccount = await getMyVendor(userId);
        setVendor(vendorAccount);
        return vendorAccount;
      } catch {
        setVendor(null);
        return null;
      } finally {
        setVendorLoading(false);
      }
    },
    []
  );

  const refetchVendor = useCallback(async () => {
    if (!user?.$id) {
      setVendor(null);
      return null;
    }
    return fetchVendorForUser(user.$id);
  }, [user?.$id, fetchVendorForUser]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const currentUser = await getCurrentUser();
      console.log("User: ", currentUser)
      setUser(currentUser as unknown as User);

      if (currentUser) {
        // Update user active status
        await updateUser({
          userId: currentUser.$id,
          lastTime: new Date(),
        });
        await fetchVendorForUser(currentUser.$id);
      } else {
        setVendor(null);
      }
    } catch {
      setUser(null);
      setVendor(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        vendor,
        loading,
        vendorLoading,
        refreshUser: fetchUser,
        setUser,
        setVendor,
        refetchVendor,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

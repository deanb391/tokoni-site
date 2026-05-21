// lib/utils/cart.ts

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
}

export const getCart = (vendorId: string): CartItem[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(`tokoni_cart_${vendorId}`);
  return data ? JSON.parse(data) : [];
};

export const addToCart = (vendorId: string, item: CartItem) => {
  if (typeof window === "undefined") return;
  const cart = getCart(vendorId);
  if (!cart.some((i) => i.productId === item.productId)) {
    cart.push(item);
    localStorage.setItem(`tokoni_cart_${vendorId}`, JSON.stringify(cart));
  }
};

export const removeFromCart = (vendorId: string, productId: string) => {
  if (typeof window === "undefined") return;
  let cart = getCart(vendorId);
  cart = cart.filter((i) => i.productId !== productId);
  localStorage.setItem(`tokoni_cart_${vendorId}`, JSON.stringify(cart));
};

export const clearCart = (vendorId: string) => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(`tokoni_cart_${vendorId}`);
};

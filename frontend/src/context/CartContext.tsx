import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { CartItem } from '../types';
import { addToCartApi, removeFromCartApi, updateCartQtyApi, getCartApi } from '../api/userApi';

interface CartContextType {
  items: CartItem[];
  count: number;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, variantId: string, quantity?: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  updateQty: (variantId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getCartApi();
      setItems(res.data.cart?.products || []);
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addItem = async (productId: string, variantId: string, quantity = 1) => {
    await addToCartApi({ productId, variantId, quantity });
    await fetchCart();
  };

  const removeItem = async (variantId: string) => {
    await removeFromCartApi(variantId);
    await fetchCart();
  };

  const updateQty = async (variantId: string, quantity: number) => {
    await updateCartQtyApi(variantId, quantity);
    await fetchCart();
  };

  const clearCart = () => setItems([]);
  const count = items.reduce((a, i) => a + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, count, isLoading, fetchCart, addItem, removeItem, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};

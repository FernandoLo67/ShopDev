import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as cartApi from '../api/cart';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const LOCAL_CART_KEY = 'shopdev_cart';

function loadLocalCart() {
  try {
    const saved = localStorage.getItem(LOCAL_CART_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveLocalCart(items) {
  try {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
  } catch {
    /* localStorage lleno o no disponible */
  }
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const res = await cartApi.getCart();
      const data = res.data;
      setItems(Array.isArray(data) ? data : data.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setItems(loadLocalCart());
    }
  }, [user, fetchCart]);

  useEffect(() => {
    if (!user) {
      saveLocalCart(items);
    }
  }, [items, user]);

  const addItem = useCallback(
    async (productId, cantidad, productData = null) => {
      if (user) {
        await cartApi.addCartItem(productId, cantidad);
        await fetchCart();
      } else {
        setItems((prev) => {
          const existing = prev.find((i) => i.productId === productId);
          if (existing) {
            return prev.map((i) =>
              i.productId === productId
                ? { ...i, cantidad: i.cantidad + cantidad }
                : i
            );
          }
          return [
            ...prev,
            {
              id: `local-${Date.now()}`,
              productId,
              cantidad,
              product: productData,
            },
          ];
        });
      }
    },
    [user, fetchCart]
  );

  const updateItem = useCallback(
    async (itemId, cantidad) => {
      if (user) {
        await cartApi.updateCartItem(itemId, cantidad);
        await fetchCart();
      } else {
        setItems((prev) =>
          prev.map((i) => (i.id === itemId ? { ...i, cantidad } : i))
        );
      }
    },
    [user, fetchCart]
  );

  const removeItem = useCallback(
    async (itemId) => {
      if (user) {
        await cartApi.removeCartItem(itemId);
        await fetchCart();
      } else {
        setItems((prev) => prev.filter((i) => i.id !== itemId));
      }
    },
    [user, fetchCart]
  );

  const clearCart = useCallback(async () => {
    if (user) {
      for (const item of items) {
        await cartApi.removeCartItem(item.id);
      }
    }
    setItems([]);
  }, [user, items]);

  const itemCount = items.reduce((sum, i) => sum + (i.cantidad || 0), 0);
  const total = items.reduce((sum, i) => {
    const price = i.product?.precio || 0;
    return sum + Number(price) * (i.cantidad || 0);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        total,
        loading,
        addItem,
        updateItem,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de CartProvider');
  return context;
}

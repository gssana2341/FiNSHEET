import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  // Could optionally persist to localStorage, but memory state is fine for this demo
  
  const addToCart = (item) => {
    // Basic duplication check
    const exists = cartItems.find(i => i.id === item.id);
    if (!exists) {
      setCartItems(prev => [...prev, item]);
      return true; // Successfully added
    }
    return false; // Already in cart
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(i => i.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalSatang = () => {
    return cartItems.reduce((total, item) => total + item.priceSatang, 0);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, getTotalSatang }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

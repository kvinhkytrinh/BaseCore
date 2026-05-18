import React, { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);

const getProductId = (product) => product.id || product.Id;
const getProductPrice = (product) => Number(product.price || product.Price || 0);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    const addToCart = (product) => {
        const productId = getProductId(product);

        setCartItems((prevCart) => {
            const existedItem = prevCart.find(
                (item) => getProductId(item) === productId
            );

            if (existedItem) {
                return prevCart.map((item) =>
                    getProductId(item) === productId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            return [...prevCart, { ...product, quantity: 1 }];
        });
    };

    const increaseQuantity = (productId) => {
        setCartItems((prevCart) =>
            prevCart.map((item) =>
                getProductId(item) === productId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
        );
    };

    const decreaseQuantity = (productId) => {
        setCartItems((prevCart) =>
            prevCart
                .map((item) =>
                    getProductId(item) === productId
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                )
                .filter((item) => item.quantity > 0)
        );
    };

    const removeFromCart = (productId) => {
        setCartItems((prevCart) =>
            prevCart.filter((item) => getProductId(item) !== productId)
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const totalCartQuantity = useMemo(
        () => cartItems.reduce((total, item) => total + item.quantity, 0),
        [cartItems]
    );

    const totalCartPrice = useMemo(
        () =>
            cartItems.reduce(
                (total, item) => total + getProductPrice(item) * item.quantity,
                0
            ),
        [cartItems]
    );

    const value = {
        cartItems,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        totalCartQuantity,
        totalCartPrice,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;

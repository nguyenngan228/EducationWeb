import { MyCartReducer } from '../reducers/mycartreducer';
import React, { createContext, useReducer, useContext, useEffect, useState } from 'react';
import mycontext from './mycontext';

const CartContext = createContext();

const CartProvider = ({ children }) => {
    const [user] = useContext(mycontext)
    const [currentUserId, setCurrentUserId] = useState(user?.id);

    // Hàm lưu giỏ hàng vào localStorage
    const saveCartToLocalStorage = (cartItems, userId) => {
        if (!userId) return; // Không lưu nếu user chưa đăng nhập
        const key = `cart_user_${userId}`;
        localStorage.setItem(key, JSON.stringify(cartItems));
    };

    // Hàm tải giỏ hàng từ localStorage
    const loadCartFromLocalStorage = (userId) => {
        if (!userId) return [];
        const key = `cart_user_${userId}`;
        const cartData = localStorage.getItem(key);
        try {
            if (cartData) {
                const parsedData = JSON.parse(cartData);
                return Array.isArray(parsedData) ? parsedData : [];
            }
        } catch (error) {
            console.error(`Error parsing cart from localStorage (${key}):`, error);
        }
        return [];
    };

    // Khởi tạo state ban đầu
    const initialCart = loadCartFromLocalStorage(user?.id);
    const initialState = {
        items: initialCart
    };

    const [state, dispatch] = useReducer(MyCartReducer, initialState);

    // Đồng bộ giỏ hàng với localStorage khi state.items thay đổi
    useEffect(() => {
        const userId = user?.id;
        // Chỉ lưu nếu user tồn tại và state.items không rỗng
        if (userId && state.items.length > 0) {
            saveCartToLocalStorage(state.items, userId);
        }
    }, [state.items, user]);

    // Xử lý khi user thay đổi
    useEffect(() => {
        const userId = user?.id;
        if (userId) {
            // Tải giỏ hàng của user mới
            const loadedCart = loadCartFromLocalStorage(userId);
            dispatch({ type: 'LOAD_CART', payload: loadedCart });
            setCurrentUserId(userId);
        } else {
            // Khi user đăng xuất, reset state nhưng không ghi đè localStorage
            dispatch({ type: 'LOAD_CART', payload: [] });
            setCurrentUserId(null);
        }
    }, [user]);

    const addToCart = (item) => {
        if (!user?.id) {
            alert("Vui lòng đăng nhập để thêm vào giỏ hàng");
            return;
        }
        // Kiểm tra xem user hiện tại có khớp với user đã tải giỏ hàng không
        if (user?.id !== currentUserId) {
            const loadedCart = loadCartFromLocalStorage(user?.id);
            dispatch({ type: 'LOAD_CART', payload: loadedCart });
            setCurrentUserId(user?.id);
        }
        dispatch({ type: 'ADD_TO_CART', payload: item });
    };

    const removeFromCart = (item) => {
        dispatch({ type: 'REMOVE_FROM_CART', payload: item });
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };

    return (
        <CartContext.Provider value={{ state, dispatch, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

const useCart = () => useContext(CartContext);

export { CartProvider, useCart };

import { MyCartReducer } from '../reducers/mycartreducer';
import React, { createContext, useReducer, useContext } from 'react';

const CartContext = createContext();

const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(MyCartReducer, { items: [] });

    return (
        <CartContext.Provider value={{ state, dispatch }}>
            {children}
        </CartContext.Provider>
    );
};

const useCart = () => useContext(CartContext);

export { CartProvider, useCart };

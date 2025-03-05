export const MyCartReducer = (state = { items: [] }, action) => {
    switch (action.type) {
        case "ADD_TO_CART":
            const existingItemIndex = state.items.findIndex(item => item.id === action.payload.id);
            console.info('existing',existingItemIndex)
            if (existingItemIndex !== -1) {
                const updatedItems = state.items.map(item =>
                    item.id === action.payload.id
                        ? { ...item, quantity: action.payload.quantity || 1 }
                        : item
                );
                return { ...state, items: updatedItems };
            } else {
                return { ...state, items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }] };
            }
        
        case "REMOVE_FROM_CART":
            return { ...state, items: state.items.filter(item => item.id !== action.payload.id) };
        default:
            return state;
    }
};
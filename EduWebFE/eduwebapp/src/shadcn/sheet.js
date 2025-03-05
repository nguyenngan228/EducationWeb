import React, { useState } from 'react';

export function Sheet({ children }) {
    const [isOpen, setIsOpen] = useState(false);

    const openSheet = () => setIsOpen(true);
    const closeSheet = () => setIsOpen(false);

    return (
        <div>
            {React.Children.map(children, child =>
                React.cloneElement(child, { isOpen, openSheet, closeSheet })
            )}
        </div>
    );
}

export function SheetTrigger({ openSheet, className, children }) {
    return (
        <button onClick={openSheet} className={className}>
            {children}
        </button>
    );
}

export function SheetContent({ isOpen, closeSheet, className, children }) {
    return (
        <div
            className={`${className} fixed top-0 left-0 h-full bg-white transition-transform duration-300 ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
            <button onClick={closeSheet} className="absolute top-4 right-4">
                X
            </button>
            {children}
        </div>
    );
}

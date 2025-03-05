import { useCart } from "../../../configs/mycartcontext";
import "./cart.css";
import { useContext, useEffect, useRef, useState } from "react";
import { authAPI, endpoints } from "../../../configs/APIs";
import mycontext from "../../../configs/mycontext";

export const Cart = () => {
  const { state, dispatch } = useCart();

  const { items: cartItems } = state;
  const [user] = useContext(mycontext);

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const payment = async (e) => {
    e.preventDefault();
    try {
      const courseIds = cartItems.map((item) => item.id);
      let res = await authAPI().post(endpoints["payment"], {
        student: user.id,
        course: courseIds,
      });

      window.location.href = res.data.url;
    } catch (ex) {
      console.error(ex);
    }
  };

  return (
    <div className="cart-container">
      <h1 className="cart-title">SHOPPING CART</h1>
      <div className="cart-content">
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <img src={item.url} alt={item.name} className="cart-item-img" />
              <div className="cart-item-details">
                <h6>{item.title}</h6>
                <p>{item.description}</p>
                <div className="cart-item-pricing">
                  <span className="new-price">
                    {item.price.toLocaleString()}$
                  </span>
                </div>
                <button className="buy-button">Buy</button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Payment</h3>
          <div className="cart-summary-total">
            <span>Total:</span>
            <span>{totalPrice.toLocaleString()}$</span>
          </div>
          <button onClick={payment} className="checkout-button">
            Buy
          </button>
        </div>
      </div>
    </div>
  );
};

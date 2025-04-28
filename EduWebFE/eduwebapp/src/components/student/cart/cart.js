import { useCart } from "../../../configs/mycartcontext";
import "./cart.css";
import { useContext, useState} from "react";
import { authAPI, endpoints } from "../../../configs/APIs";
import mycontext from "../../../configs/mycontext";

export const Cart = () => {
  const { state, clearCart } = useCart();
    const { items: cartItems } = state;
    const [user] = useContext(mycontext);
    const cart = state.items;
    const [isLoading, setIsLoading] = useState(false);

    // Tính tổng giá
    const totalPrice = cartItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
    );

    const payment = async (e) => {
        e.preventDefault();
        if (!window.confirm(`Xác nhận thanh toán cho ${cart.length} khóa học?`)) {
            return;
        }

        setIsLoading(true);
        try {
            if (!cart || cart.length === 0) {
                throw new Error("Giỏ hàng trống");
            }

            if (!user?.id) {
                throw new Error("Vui lòng đăng nhập để thanh toán");
            }

            const payload = {
                course: cart.map(item => {
                    if (!item.id) {
                        throw new Error(`Khóa học không hợp lệ: ${JSON.stringify(item)}`);
                    }
                    return item.id;
                })
            };
            console.log("Payload gửi đi:", payload);

            let res = await authAPI().post(endpoints['payment'], payload);
            if (res.data?.url) {
                window.location.href = res.data.url;
                clearCart();
                const userId = user?.id;
                if (userId) {
                    localStorage.removeItem(`cart_user_${userId}`);
                }
            } else {
                throw new Error("Không nhận được URL thanh toán");
            }
        } catch (ex) {
            console.error("Lỗi chi tiết:", ex.response?.data || ex.message);
            const errorMsg = ex.response?.data?.error || ex.message || "Vui lòng thử lại";
            alert(`Lỗi: ${errorMsg}`);
        } finally {
            setIsLoading(false);
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
                                <button onClick={payment} className="buy-button">Buy</button>
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
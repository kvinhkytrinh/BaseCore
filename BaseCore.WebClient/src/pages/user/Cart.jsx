import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import Menu from './Menu';

function Cart() {
    const navigate = useNavigate();
    const {
        cartItems,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        totalCartPrice,
    } = useCart();

    useEffect(() => {
        document.body.classList.add("sub_page");

        return () => {
            document.body.classList.remove("sub_page");
        };
    }, []);

    return (
        <>
            <Menu />
            <div className="menu-modal-overlay" onClick={() => navigate('/menu')}>
                <div className="menu-modal-panel" onClick={(event) => event.stopPropagation()}>
                    <div className="menu-modal-header">
                        <h2>Đơn hàng của bạn</h2>
                        <button type="button" className="menu-modal-close" onClick={() => navigate('/menu')}>
                            &times;
                        </button>
                    </div>

                    <div className="cart-dropdown cart-page-dropdown menu-modal-content">
                        {cartItems.length === 0 ? (
                            <p className="empty-cart">Giỏ hàng rỗng</p>
                        ) : (
                            <>
                                {cartItems.map((item) => (
                                    <div key={item.id || item.Id} className="cart-item">
                                        <div className="cart-item-info">
                                            <h6>{item.name || item.Name}</h6>
                                            <div className="cart-qty">
                                                <button onClick={() => decreaseQuantity(item.id || item.Id)}>-</button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => increaseQuantity(item.id || item.Id)}>+</button>
                                            </div>

                                            <p>
                                                {Number(item.price || item.Price || 0).toLocaleString("vi-VN")} đ
                                            </p>
                                        </div>

                                        <button
                                            className="remove-btn"
                                            onClick={() => removeFromCart(item.id || item.Id)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </>
                        )}

                        <div className="cart-total">
                            <span>Tổng:</span>
                            <strong>{totalCartPrice.toLocaleString("vi-VN")} đ</strong>
                        </div>

                        <button
                            type="button"
                            className="checkout-btn"
                            onClick={() => {
                                if (cartItems.length === 0) {
                                    alert("Your cart is empty!");
                                    return;
                                }

                                navigate('/checkout');
                            }}
                        >
                           Xác nhận
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Cart;

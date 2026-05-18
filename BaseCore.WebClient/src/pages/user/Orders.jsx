import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderApi } from '../../services/api';
import Menu from './Menu';

function Orders() {
    const navigate = useNavigate();
    const [orderHistory, setOrderHistory] = useState([]);

    useEffect(() => {
        document.body.classList.add("sub_page");

        return () => {
            document.body.classList.remove("sub_page");
        };
    }, []);

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const response = await orderApi.getMyOrders();
                setOrderHistory(response.data || []);
            } catch (error) {
                console.error("Failed to load my orders", error);
            }
        };

        loadOrders();
    }, []);

    return (
        <>
            <Menu />
            <div className="menu-modal-overlay" onClick={() => navigate('/menu')}>
                <div className="menu-modal-panel" onClick={(event) => event.stopPropagation()}>
                    <div className="invoice-box cart-page-dropdown menu-modal-content">
                        <div className="invoice-header">
                            <h3>Đơn hàng của bạn</h3>
                            <button type="button" onClick={() => navigate('/menu')}>&times;</button>
                        </div>

                        {orderHistory.length === 0 ? (
                            <p className="empty-cart">No orders yet.</p>
                        ) : (
                            <div className="my-order-list">
                                {orderHistory.map((order, index) => (
                                    <div className="my-order-card" key={order.id}>
                                        <h5>Order #{orderHistory.length - index}</h5>
                                        <p className="invoice-time">
                                            Ordered at: {order.createdAt || new Date(order.orderDate).toLocaleString("vi-VN")}
                                        </p>
                                        <p>Status: {order.status}</p>

                                        {Array.isArray(order.items) && order.items.map((item) => (
                                            <div className="invoice-item" key={item.id || item.Id}>
                                                <span>{item.name || item.Name}</span>
                                                <span>
                                                    {item.quantity} x{" "}
                                                    {Number(item.price || item.Price || 0).toLocaleString("vi-VN")} đ
                                                </span>
                                            </div>
                                        ))}

                                        <div className="invoice-total">
                                            <span>Total:</span>
                                            <strong>{Number(order.total || order.totalAmount || 0).toLocaleString("vi-VN")} đ</strong>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Orders;

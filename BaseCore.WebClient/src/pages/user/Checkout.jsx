import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { orderApi, deliveryAddressApi, voucherApi } from '../../services/api';
import Menu from './Menu';
import VoucherPicker from './VoucherPicker';
 

function Checkout() {
    const [addresses, setAddresses] = useState([]);
    const [showVoucherPicker, setShowVoucherPicker] = useState(false);
    const [availableVouchers, setAvailableVouchers] = useState([]);
    const [voucherLoading, setVoucherLoading] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState("");
    const [useNewAddress, setUseNewAddress] = useState(false);
    const [saveNewAddress, setSaveNewAddress] = useState(true);
    const [voucherCode, setVoucherCode] = useState("");
    const [appliedVoucher, setAppliedVoucher] = useState(null);
    const [voucherApplying, setVoucherApplying] = useState(false);
    const navigate = useNavigate();
    const { cartItems, clearCart, totalCartPrice } = useCart();
    const [checkoutInfo, setCheckoutInfo] = useState({
        fullName: "",
        phone: "",
        email: "",
        address: "",
    });
    const handleSelectVoucher = (voucher) => {
        setAppliedVoucher(voucher);
        setVoucherCode(voucher.code || voucher.Code);

    }
    const [checkoutSaving, setCheckoutSaving] = useState(false);
    const voucherDiscountAmount = Number(appliedVoucher?.discountAmount || 0);
    const payableAmount = appliedVoucher
        ? Number(
            appliedVoucher.finalAmount ??
            appliedVoucher.totalAmount ??
            Math.max(0, totalCartPrice - voucherDiscountAmount)
        )
        : totalCartPrice;

    useEffect(() => {
        document.body.classList.add("sub_page");

        return () => {
            document.body.classList.remove("sub_page");
        };
    }, []);
    const fomatCurrency = (value) => {
        return `${Number(value || 0).toLocaleString("vi-VN")} đ`;
    }
    // thay doi checkout
    useEffect(() => {
        loadAvailableVouchers();
    }, [cartItems]);
    useEffect(() => {
        const loadAddresses = async () => {
            try {
                const response = await deliveryAddressApi.getMyAddresses();
                const data = response.data || [];

                setAddresses(data);

                const defaultAddress =
                    data.find((item) => item.isDefault || item.IsDefault) || data[0];

                if (defaultAddress) {
                    setSelectedAddressId(defaultAddress.id || defaultAddress.Id);
                    setUseNewAddress(false);
                } else {
                    setUseNewAddress(true);
                }
            } catch (error) {
                console.error("Failed to load delivery addresses", error);
                setUseNewAddress(true);
            }
        };

        loadAddresses();
    }, []);
    // load voucher
    const loadAvailableVouchers = async () => {
    const items = getOrderItems();

    if (items.length === 0 || items.some((item) => !item.productId || item.quantity <= 0)) {
        setAvailableVouchers([]);
        return;
    }

    setVoucherLoading(true);

    try {
        const response = await voucherApi.getAvailable({ items });
        setAvailableVouchers(response.data || []);
    } catch (error) {
        console.error("Failed to load vouchers", error);
        setAvailableVouchers([]);
    } finally {
        setVoucherLoading(false);
    }
};

    const handleCheckoutInfoChange = (event) => {
        const { name, value } = event.target;

        if (name === "phone") {
            const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
            setCheckoutInfo((prev) => ({ ...prev, phone: digitsOnly }));
            return;
        }

        setCheckoutInfo((prev) => ({ ...prev, [name]: value }));
    };

    const handlePhoneKeyDown = (event) => {
        const allowedControlKeys = [
            "Backspace",
            "Delete",
            "Tab",
            "ArrowLeft",
            "ArrowRight",
            "Home",
            "End",
        ];

        if (
            allowedControlKeys.includes(event.key) ||
            event.ctrlKey ||
            event.metaKey
        ) {
            return;
        }

        if (!/^\d$/.test(event.key)) {
            event.preventDefault();
        }
    };

    const getOrderItems = () =>
        cartItems.map((item) => ({
            productId: Number(item.id || item.Id),
            quantity: Number(item.quantity),
        }));

    const handleApplyVoucher = async () => {
        const code = voucherCode.trim();

        if (!code) {
            alert("Please enter voucher code.");
            return;
        }

        const items = getOrderItems();

        if (items.length === 0 || items.some((item) => !item.productId || item.quantity <= 0)) {
            alert("Invalid order item. Please check your cart and try again.");
            return;
        }

        setVoucherApplying(true);

        try {
            const response = await voucherApi.validate({
                code,
                items,
            });

            setAppliedVoucher(response.data);
            setVoucherCode(response.data.code || code);
        } catch (error) {
            setAppliedVoucher(null);
            alert(error.response?.data?.message || error.message || "Invalid voucher");
        } finally {
            setVoucherApplying(false);
        }
    };

    const handleRemoveVoucher = () => {
        setAppliedVoucher(null);
        setVoucherCode("");
    };

    const handleSaveCheckoutInfo = async (event) => {
        event.preventDefault();

        const normalizedInfo = {
            fullName: checkoutInfo.fullName.trim(),
            phone: checkoutInfo.phone.trim(),
            email: checkoutInfo.email.trim(),
            address: checkoutInfo.address.trim(),
        };

        const items = getOrderItems();

        if (items.length === 0 || items.some((item) => !item.productId || item.quantity <= 0)) {
            alert("Invalid order item. Please check your cart and try again.");
            return;
        }

        let deliveryAddressId = selectedAddressId ? Number(selectedAddressId) : null;

        if (!useNewAddress && !deliveryAddressId) {
            alert("Please select a delivery address.");
            return;
        }

        if (useNewAddress) {
            if (!normalizedInfo.fullName || !normalizedInfo.phone || !normalizedInfo.email || !normalizedInfo.address) {
                alert("Please fill in all delivery information before placing an order.");
                return;
            }

            if (!/^0\d{9}$/.test(normalizedInfo.phone)) {
                alert("Phone number must start with 0 and contain exactly 10 digits.");
                return;
            }
        }

        setCheckoutSaving(true);

        try {
            if (useNewAddress && saveNewAddress) {
                const addressResponse = await deliveryAddressApi.create({
                    fullName: normalizedInfo.fullName,
                    phone: normalizedInfo.phone,
                    email: normalizedInfo.email,
                    address: normalizedInfo.address,
                    isDefault: addresses.length === 0,
                });

                deliveryAddressId = addressResponse.data.id || addressResponse.data.Id;
            }

            const orderData = useNewAddress && !deliveryAddressId
                ? {
                    customerName: normalizedInfo.fullName,
                    customerPhone: normalizedInfo.phone,
                    customerEmail: normalizedInfo.email,
                    shippingAddress: normalizedInfo.address,
                    voucherCode: appliedVoucher?.code || undefined,
                    items,
                }
                : {
                    deliveryAddressId,
                    voucherCode: appliedVoucher?.code || undefined,
                    items,
                };

            await orderApi.create(orderData);

            alert("Your order is waiting for admin confirmation.");
            clearCart();
            navigate('/orders');
        } catch (error) {
            console.error("Failed to create order:", error);
            alert(error.response?.data?.message || error.message || "Failed to create order");
        } finally {
            setCheckoutSaving(false);
        }
    };

    return (
        <>
            <Menu />
            <div className="menu-modal-overlay" onClick={() => navigate('/menu')}>
                <div className="menu-modal-panel" onClick={(event) => event.stopPropagation()}>
                    <div className="invoice-box cart-page-dropdown menu-modal-content">
                        <div className="invoice-header">
                            <h3>Xác nhận đặt hàng</h3>
                            <button type="button" onClick={() => navigate('/menu')}>&times;</button>
                        </div>

                        <section className="checkout-card">
    <div className="checkout-card-header">
        <h4>Sản phẩm đã chọn</h4>
        <button
            type="button"
            className="checkout-edit-btn"
            onClick={() => navigate('/menu')}
        >
            Chỉnh sửa
        </button>
    </div>

    <div className="invoice-list checkout-product-list">
        {cartItems.length === 0 ? (
            <p className="empty-cart">Cart is empty</p>
        ) : (
            cartItems.map((item) => (
                <div className="invoice-item checkout-product-item" key={item.id || item.Id}>
                    <span>{item.name || item.Name}</span>
                    <span>
                        {item.quantity} x{" "}
                        {Number(item.price || item.Price || 0).toLocaleString("vi-VN")} đ
                    </span>
                </div>
            ))
        )}
    </div>
</section>

<form onSubmit={handleSaveCheckoutInfo}>
    <section className="checkout-card">
        <div className="checkout-card-header">
            <h4>Địa chỉ giao hàng</h4>
        </div>

        {addresses.length > 0 && (
            <div className="mb-3 checkout-address-list">
                                    {addresses.map((address) => {
                                        const id = address.id || address.Id;
                                        const fullName = address.fullName || address.FullName;
                                        const phone = address.phone || address.Phone;
                                        const detailAddress = address.address || address.Address;

                                        return (
                                            <label key={id} className="d-block mb-2">
                                                <input
                                                    type="radio"
                                                    name="deliveryAddress"
                                                    checked={!useNewAddress && Number(selectedAddressId) === Number(id)}
                                                    onChange={() => {
                                                        setUseNewAddress(false);
                                                        setSelectedAddressId(id);
                                                    }}
                                                    disabled={checkoutSaving}
                                                />
                                                {" "}
                                                {fullName} - {phone} - {detailAddress}
                                            </label>
                                        );
                                    })}

                                    <label className="d-block mb-2">
                                        <input
                                            type="radio"
                                            name="deliveryAddress"
                                            checked={useNewAddress}
                                            onChange={() => setUseNewAddress(true)}
                                            disabled={checkoutSaving}
                                        />
                                        {" "}
                                        Use new delivery address
                                    </label>
                                </div>
                            )}

                            {useNewAddress && (
                                <>
                                    <input
                                        className="form-control mb-3"
                                        name="fullName"
                                        placeholder="Full name"
                                        value={checkoutInfo.fullName}
                                        onChange={handleCheckoutInfoChange}
                                        disabled={checkoutSaving}
                                    />

                                    <input
                                        className="form-control mb-3"
                                        name="phone"
                                        type="tel"
                                        placeholder="Phone number"
                                        value={checkoutInfo.phone}
                                        onChange={handleCheckoutInfoChange}
                                        onKeyDown={handlePhoneKeyDown}
                                        maxLength={10}
                                        inputMode="numeric"
                                        pattern="0[0-9]{9}"
                                        disabled={checkoutSaving}
                                    />

                                    <input
                                        className="form-control mb-3"
                                        name="email"
                                        type="email"
                                        placeholder="Email"
                                        value={checkoutInfo.email}
                                        onChange={handleCheckoutInfoChange}
                                        disabled={checkoutSaving}
                                    />

                                    <textarea
                                        className="form-control mb-3"
                                        name="address"
                                        placeholder="Delivery address"
                                        value={checkoutInfo.address}
                                        onChange={handleCheckoutInfoChange}
                                        disabled={checkoutSaving}
                                    />

                                    <label className="d-block mb-3">
                                        <input
                                            type="checkbox"
                                            checked={saveNewAddress}
                                            onChange={(event) => setSaveNewAddress(event.target.checked)}
                                            disabled={checkoutSaving}
                                        />
                                        {" "}
                                        Save this address for next orders
                                    </label>
                                </>
                            )}
                        </section>

                            <div className="mb-3">
                                <div className="voucher-summary-box" onClick={() => setShowVoucherPicker(true)}>
                                    {appliedVoucher ? (
                                        <>
                                            <div>
                                                <strong>{appliedVoucher.code}</strong> -{appliedVoucher.name}
                                            </div>
                                            <div>
                                                Giam {Number(appliedVoucher.discountAmount || 0).toLocaleString("vi-VN")} đ
                                            </div>
                                        </>
                                    ) : (
                                        <span>Chọn Voucher</span>
                                    )}
                                </div>   
                                  
                                
                                
                                

                                {appliedVoucher && (
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary mt-2"
                                        onClick={handleRemoveVoucher}
                                        disabled={checkoutSaving}
                                    >
                                        Hủy bỏ
                                    </button>
                                )}
                            </div>
                            <div className="invoice-total">
                                <span>Tổng tiền:</span>
                                <strong>{totalCartPrice.toLocaleString("vi-VN")} đ</strong>
                            </div>

                            {appliedVoucher && (
                                <div className="invoice-total">
                                    <span>Giảm giá:</span>
                                    <strong>
                                        -{voucherDiscountAmount.toLocaleString("vi-VN")} đ
                                    </strong>
                                </div>
                            )}

                            <div className="invoice-total">
                                <span>Thanh toán:</span>
                                <strong>
                                    {payableAmount.toLocaleString("vi-VN")} đ
                                </strong>
                            </div>

                            <button type="submit" className="paid-btn" disabled={checkoutSaving}>
                                {checkoutSaving ? "Placing order..." : "Đặt hàng"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <VoucherPicker
                show={showVoucherPicker}
                vouchers = {availableVouchers}
                loading = {voucherLoading}
                selectedVoucher={appliedVoucher}
                onSelect={handleSelectVoucher}
                onClose={() => setShowVoucherPicker(false)}
            />
        </>
    );
}

export default Checkout;

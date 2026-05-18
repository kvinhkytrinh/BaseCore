import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { orderApi, userApi } from '../services/api';

const BILL_STATUSES = {
    ALL: 'All',
    PENDING: 'Pending',
    SHIPPING: 'Shipping',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
};

const normalizeBillStatus = (status) => {
    if (status === 'PendingApproval' || status === 'Pending' || status === 0) return BILL_STATUSES.PENDING;
    if (status === 'Shipping' || status === 5) return BILL_STATUSES.SHIPPING;
    if (status === 'Completed' || status === 'Approved' || status === 4 || status === 1) return BILL_STATUSES.COMPLETED;
    if (status === 'Cancelled' || status === 'Rejected' || status === 3 || status === 2) return BILL_STATUSES.CANCELLED;
    return status;
};

const Bills = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState(BILL_STATUSES.ALL);
    const [processedBills, setProcessedBills] = useState(new Set());
    const [selectedBill, setSelectedBill] = useState(null);
    const [selectedBillDetails, setSelectedBillDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [startDate, setStartDate] = useState(''); 
    const [endDate, setEndDate] = useState('');
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [completedRevenue, setCompletedRevenue] = useState(0);
    const { isAdmin } = useAuth();
    
    // ============ BỔ SUNG: State phân trang ============
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    // ===================================================

    const getFieldValue = (source, ...keys) => {
        if (!source) return undefined;
        for (const key of keys) {
            if (Object.prototype.hasOwnProperty.call(source, key) && source[key] != null) {
                return source[key];
            }
        }
        return undefined;
    };

    const formatOrderDateTime = (value) => {
        if (!value || value === 'N/A') return 'N/A';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return 'N/A';

        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    useEffect(() => {
        loadBills();
    }, [selectedStatus, startDate, endDate, page]);

    const loadBills = async () => {
        setLoading(true);
        try {
            const params = {
                status: selectedStatus === BILL_STATUSES.ALL ? undefined : selectedStatus,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                page,
                pageSize,
            };
            const [ordersResponse, statisticsResponse] = await Promise.all([
                orderApi.getAll(params),
                orderApi.getStatistics({
                    startDate: startDate || undefined,
                    endDate: endDate || undefined,
                }),
            ]);
            const payload = ordersResponse.data || {};
            const items = Array.isArray(payload) ? payload : payload.items || payload.data || [];
            setBills(items);
            setTotalItems(payload.totalItems || payload.totalCount || items.length || 0);
            setTotalPages(payload.totalPages || 1);
            setCompletedRevenue(statisticsResponse.data?.completedRevenue || 0);
        } catch (error) {
            console.error('Failed to load bills:', error);
        } finally {
            setLoading(false);
        }
    };
    const handleViewDetails = async (bill) => {
        setSelectedBill(bill);
        setDetailsLoading(true);
        try {
            const response = await orderApi.getById(bill.id);
            const payload = response.data || {};
            const order = payload.order || payload.data?.order || payload;
            let details = payload.details || payload.data?.details || payload.orderDetails || payload.data?.orderDetails || [];
            let orderUser = null;

            console.log('Order detail response:', payload);
            console.log('Details array:', details);

            const userId = getFieldValue(order, 'userId', 'UserId', 'userID', 'UserID');
            if (userId) {
                try {
                    const userResponse = await userApi.getById(userId);
                    orderUser = userResponse.data?.data || userResponse.data;
                } catch (userError) {
                    console.warn('Failed to load order user:', userError);
                }
            }

            setSelectedBillDetails({
                order,
                details: Array.isArray(details) ? details : [],
                user: orderUser,
            });
        } catch (error) {
            console.error('Failed to load bill details:', error);
            let orderUser = null;
            const billUserId = getFieldValue(bill, 'userId', 'UserId', 'userID', 'UserID');
            if (billUserId) {
                try {
                    const userResponse = await userApi.getById(billUserId);
                    orderUser = userResponse.data?.data || userResponse.data;
                } catch (userError) {
                    console.warn('Failed to load fallback bill user:', userError);
                }
            }
            const fallbackDetails = bill.items || bill.orderDetails || bill.billItems || bill.details || [];
            console.log('Fallback details:', fallbackDetails);
            setSelectedBillDetails({
                order: bill,
                details: Array.isArray(fallbackDetails) ? fallbackDetails : [],
                user: orderUser,
            });
        } finally {
            setDetailsLoading(false);
        }
    };
    const handleCloseDetails = () => {
        setSelectedBill(null);
        setSelectedBillDetails(null);
        setDetailsLoading(false);
    };

    const getDetailCustomer = () => {
        const bill = selectedBillDetails?.order || selectedBill;
        const orderUser = selectedBillDetails?.user;
        return {
            customerName: getFieldValue(bill, 'customerName', 'CustomerName') || getFieldValue(orderUser, 'name', 'Name', 'fullName', 'FullName') || 'N/A',
            customerPhone: getFieldValue(bill, 'customerPhone', 'CustomerPhone') || getFieldValue(orderUser, 'phone', 'Phone') || 'N/A',
            customerEmail: getFieldValue(bill, 'customerEmail', 'CustomerEmail') || getFieldValue(orderUser, 'email', 'Email') || 'N/A',
            customerAddress: getFieldValue(bill, 'shippingAddress', 'ShippingAddress') || 'N/A',
            customerId: getFieldValue(orderUser, 'id', 'Id') || getFieldValue(bill, 'userId', 'UserId', 'userID', 'UserID', 'customerId', 'CustomerId', 'customerID', 'CustomerID') || 'N/A',
            orderDate: getFieldValue(bill, 'orderDate', 'OrderDate', 'createdAt', 'CreatedAt') || 'N/A',
            billItems: selectedBillDetails?.details || getFieldValue(bill, 'items', 'Items', 'orderDetails', 'orderDetails', 'billItems', 'billItems', 'details', 'Details') || []
        };
    };

    const handleConfirm = async (id) => {
        try {
            await orderApi.updateStatus(id, 'Shipping');
            setProcessedBills(prev => new Set(prev).add(id));
            loadBills();
        } catch (error) {
            alert('Failed to confirm bill');
        }
    };
    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this bill?')) return;

        try {
            await orderApi.cancel(id);
            setProcessedBills(prev => new Set(prev).add(id));
            loadBills();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to cancel bill');
        }
    };
    const getStatusBadgeClass = (status) => {
        switch (normalizeBillStatus(status)) {
            case BILL_STATUSES.COMPLETED:
                return 'badge badge-success';
            case BILL_STATUSES.SHIPPING:
                return 'badge badge-info';
            case BILL_STATUSES.CANCELLED:
                return 'badge badge-danger';
            case BILL_STATUSES.PENDING:
                return 'badge badge-warning';
            default:
                return 'badge badge-light';
        }
    };

    const getStatusText = (status) => {
        return normalizeBillStatus(status);
    };

    // ============ BỔ SUNG: Hàm phân trang ============
    const renderPagination = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <li key={i} className={`page-item ${page === i ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setPage(i)}>
                        {i}
                    </button>
                </li>
            );
        }
        return pages;
    };
    // ===================================================

    return (
        <div className="content-wrapper">
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0" style={{ fontFamily: 'Time New Roman' }}>
                                Bills Management
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">JolliVing</h3>
                        </div>
                        <div className="card-body">
                            {/* Giao diện lọc tối giản */}
                           <div className="d-flex align-items-center mb-3 p-2 bg-light border rounded" style={{ gap: '10px' }}>
    {/* Bộ lọc trạng thái */}
    <select 
        className="form-control form-control-sm" 
        style={{ width: '130px' }}
        value={selectedStatus} 
        onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
    >
        <option value={BILL_STATUSES.ALL}>All Status</option>
        <option value={BILL_STATUSES.PENDING}>Pending</option>
        <option value={BILL_STATUSES.SHIPPING}>Shipping</option>
        <option value={BILL_STATUSES.COMPLETED}>Completed</option>
        <option value={BILL_STATUSES.CANCELLED}>Cancelled</option>
    </select>

    {/* Bộ lọc ngày */}
    <div className="d-flex align-items-center bg-white border rounded px-2">
        <input type="date" className="form-control form-control-sm border-0 bg-transparent" 
               value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} />
        <span className="mx-1 text-muted">→</span>
        <input type="date" className="form-control form-control-sm border-0 bg-transparent" 
               value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} />
    </div>

    {/* Hiển thị Doanh thu - Đẩy sang bên phải */}
    <div className="ml-auto d-flex align-items-center border-left pl-3">
        <div className="text-right">
            <small className="text-muted d-block text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
                Revenue (Completed)
            </small>
            <span className="text-success font-weight-bold" style={{ fontSize: '1.2rem' }}>
                {completedRevenue.toLocaleString()} <small>VND</small>
            </span>
        </div>
    </div>

    {/* Nút Reset nhanh */}
    {(startDate || endDate || selectedStatus !== BILL_STATUSES.ALL) && (
        <button className="btn btn-sm btn-link text-muted" onClick={() => { setStartDate(''); setEndDate(''); setSelectedStatus(BILL_STATUSES.ALL); setPage(1); }}>
            <i className="fa fa-sync"></i>
        </button>
    )}
</div>
                            
                            
                            {/* UI lọc danh sách */}
                            {/* ============ BỔ SUNG: Dropdown lọc trạng thái ============ */}
                            
                            
                            
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary"></div>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-bordered table-striped">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>User ID</th>
                                                <th>Order Date</th>
                                                <th>Total Amount</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bills.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="text-center">
                                                        No {selectedStatus !== BILL_STATUSES.ALL ? selectedStatus + ' ' : ''}bills found
                                                    </td>
                                                </tr>
                                            ) : (
                                                bills.map((bill) => (
                                                    <tr key={bill.id}>
                                                        <td>{bill.id}</td>
                                                        <td>{getFieldValue(bill, 'userId', 'UserId', 'userID', 'UserID') || 'N/A'}</td>
                                                        <td>{formatOrderDateTime(bill.orderDate)}</td>
                                                        <td>{bill.totalAmount?.toLocaleString()} VND</td>
                                                        <td>
                                                            <span className={getStatusBadgeClass(bill.status)}>
                                                                {getStatusText(bill.status)}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {normalizeBillStatus(bill.status) === BILL_STATUSES.PENDING && isAdmin() ? (
                                                                <>
                                                                    <button
                                                                        className="btn btn-sm btn-success mr-2"
                                                                        onClick={() => handleConfirm(bill.id)}
                                                                        disabled={processedBills.has(bill.id)}
                                                                    >
                                                                        Confirm
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-sm btn-danger"
                                                                        onClick={() => handleCancel(bill.id)}
                                                                        disabled={processedBills.has(bill.id)}
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </>
                                                            ) : null}
                                                            {isAdmin() && (
                                                                <button
                                                                    className="btn btn-sm btn-info ml-2"
                                                                    onClick={() => handleViewDetails(bill)}
                                                                    title="View details"
                                                                >
                                                                    <i className="fa fa-eye" aria-hidden="true"></i>
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                    
                                    {/* ============ BỔ SUNG: UI Phân trang ============ */}
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span>Total: {totalItems} bills</span>
                                        <nav>
                                            <ul className="pagination mb-0">
                                                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                                    <button 
                                                        className="page-link" 
                                                        disabled={page === 1} 
                                                        onClick={() => setPage(page - 1)}
                                                    >
                                                        Previous
                                                    </button>
                                                </li>
                                                {renderPagination()}
                                                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                                    <button 
                                                        className="page-link" 
                                                        disabled={page === totalPages} 
                                                        onClick={() => setPage(page + 1)}
                                                    >
                                                        Next
                                                    </button>
                                                </li>
                                            </ul>
                                        </nav>
                                    </div>
                                    {/* ================================================= */}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
            {/* Modal chi tiết hóa đơn */}
            {selectedBill && (
                <>
                    <div className="modal-backdrop fade show"></div>
                    <div className="modal show d-block" tabIndex="-1" role="dialog">
                        <div className="modal-dialog modal-lg" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Bill #{selectedBill.id} details</h5>
                                    <button type="button" className="close" onClick={handleCloseDetails}>
                                        <span>&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    {detailsLoading ? (
                                        <div className="text-center py-4">
                                            <div className="spinner-border text-primary"></div>
                                        </div>
                                    ) : (() => {
                                        try {
                                            const { customerId, customerName, customerPhone, customerEmail, customerAddress, orderDate, billItems } = getDetailCustomer();
                                            return (
                                                <>
                                                    <p><strong>Customer ID:</strong> {customerId}</p>
                                                    <p><strong>Customer:</strong> {customerName}</p>
                                                    <p><strong>Phone:</strong> {customerPhone}</p>
                                                    <p><strong>Email:</strong> {customerEmail}</p>
                                                    <p><strong>Address:</strong> {customerAddress}</p>
                                                    <p><strong>Order Time:</strong> {formatOrderDateTime(orderDate)}</p>

                                                    <table className="table table-sm">
                                                        <thead>
                                                            <tr>
                                                                <th>Item</th>
                                                                <th>Quantity</th>
                                                                <th>Unit Price</th>
                                                                <th>Total</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {billItems.length === 0 ? (
                                                                <tr>
                                                                    <td colSpan={4} className="text-center">No items</td>
                                                                </tr>
                                                            ) : billItems.map((item, index) => {
                                                                // Get product name from various possible locations
                                                                const productName = getFieldValue(item.product, 'name', 'Name', 'title', 'Title') || 
                                                                                  getFieldValue(item, 'productName', 'ProductName', 'name', 'Name', 'title', 'Title') || 
                                                                                  'N/A';
                                                                // Get quantity
                                                                const qty = getFieldValue(item, 'quantity', 'Quantity', 'qty', 'Qty') || 0;
                                                                // Get unit price from product or item
                                                                const unitPrice = getFieldValue(item, 'unitPrice', 'UnitPrice', 'price', 'Price') || 
                                                                                getFieldValue(item.product, 'price', 'Price') || 0;
                                                                return (
                                                                    <tr key={item.id || item.productId || item.ProductId || index}>
                                                                        <td>{productName}</td>
                                                                        <td>{qty}</td>
                                                                        <td>{parseInt(unitPrice).toLocaleString()} ₫</td>
                                                                        <td>{(qty * parseInt(unitPrice)).toLocaleString()} ₫</td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                    <hr />
                                                    <p style={{ textAlign: 'right', fontSize: '16px', fontWeight: 'bold' }}>
                                                        <strong>Total Payment:</strong> <span style={{ color: '#FFC107' }}>{parseInt(selectedBillDetails?.order?.totalAmount || 0).toLocaleString()} ₫</span>
                                                    </p>
                                                </>
                                            );
                                        } catch (error) {
                                            console.error('Error rendering bill details:', error);
                                            return (
                                                <div className="alert alert-danger">
                                                    Error loading bill details. Please try again.
                                                </div>
                                            );
                                        }
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Bills;

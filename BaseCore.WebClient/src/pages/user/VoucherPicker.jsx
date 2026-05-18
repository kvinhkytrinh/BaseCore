function VoucherPicker({
    show,
    vouchers,
    loading,
    selectedVoucher,
    onSelect,
    onClose,
}) {
    if (!show) return null;

    return (
        <div className="voucher-modal-overlay" onClick={onClose}>
            <div className="voucher-modal-panel" onClick={(event) => event.stopPropagation()}>
                <div className="invoice-header">
                    <h3>Kho voucher</h3>
                    <button type="button" onClick={onClose}>&times;</button>
                </div>

                {loading ? (
                    <p>Loading vouchers...</p>
                ) : vouchers.length === 0 ? (
                    <p className="empty-cart">No vouchers available.</p>
                ) : (
                    <div className="voucher-table-wrap">
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Mã</th>
                                    <th>Tên</th>
                                    <th>Giảm</th>
                                    <th>Điều kiện</th>
                                    <th>Hạn dùng</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {vouchers.map((voucher) => {
                                    const code = voucher.code || voucher.Code;
                                    const isEligible = voucher.isEligible ?? voucher.IsEligible;
                                    const isSelected = selectedVoucher?.code === code;

                                    return (
                                        <tr key={voucher.id || voucher.Id} className={!isEligible ? "voucher-disabled" : ""}>
                                            <td><strong>{code}</strong></td>
                                            <td>{voucher.name || voucher.Name}</td>
                                            <td>
                                                {(voucher.discountType || voucher.DiscountType) === "Percent"
                                                    ? `${voucher.discountValue || voucher.DiscountValue}%`
                                                    : `${Number(voucher.discountValue || voucher.DiscountValue || 0).toLocaleString("vi-VN")} đ`}
                                            </td>
                                            <td>
                                                Min: {Number(voucher.minOrderAmount || voucher.MinOrderAmount || 0).toLocaleString("vi-VN")} đ
                                                {!isEligible && (
                                                    <div className="voucher-reason">
                                                        {voucher.reason || voucher.Reason}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                {new Date(voucher.endDate || voucher.EndDate).toLocaleDateString("vi-VN")}
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-warning"
                                                    disabled={!isEligible}
                                                    onClick={() => onSelect(voucher)}
                                                >
                                                    {isSelected ? "Đã chọn" : "Chọn"}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default VoucherPicker;
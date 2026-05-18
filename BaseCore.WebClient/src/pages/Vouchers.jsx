import React, { useEffect, useState } from 'react';
import { voucherApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const emptyForm = {
    code: '',
    name: '',
    discountType: 'Percent',
    discountValue: '',
    maxDiscountAmount: '',
    minOrderAmount: '',
    usageLimit: '',
    startDate: '',
    endDate: '',
    isActive: true,
};

const formatMoney = (value) => {
    if (value === null || value === undefined || value === '') return '-';
    return Number(value).toLocaleString('vi-VN') + ' đ';
};

const toDateTimeLocal = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);
    return localDate.toISOString().slice(0, 16);
};

const toDisplayDate = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleString('vi-VN');
};

const Vouchers = () => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [error, setError] = useState('');
    const { isAdmin } = useAuth();

    useEffect(() => {
        loadVouchers();
    }, []);

    const loadVouchers = async () => {
        setLoading(true);
        try {
            const response = await voucherApi.getAll();
            setVouchers(response.data || []);
        } catch (error) {
            console.error('Failed to load vouchers:', error);
            setError(error.response?.data?.message || 'Failed to load vouchers');
        } finally {
            setLoading(false);
        }
    };

    const openModal = (voucher = null) => {
        setError('');

        if (voucher) {
            setEditingVoucher(voucher);
            setFormData({
                code: voucher.code || '',
                name: voucher.name || '',
                discountType: voucher.discountType || 'Percent',
                discountValue: voucher.discountValue ?? '',
                maxDiscountAmount: voucher.maxDiscountAmount ?? '',
                minOrderAmount: voucher.minOrderAmount ?? '',
                usageLimit: voucher.usageLimit ?? '',
                startDate: toDateTimeLocal(voucher.startDate),
                endDate: toDateTimeLocal(voucher.endDate),
                isActive: Boolean(voucher.isActive),
            });
        } else {
            setEditingVoucher(null);
            setFormData(emptyForm);
        }

        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingVoucher(null);
        setFormData(emptyForm);
        setError('');
    };

    const updateField = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const buildPayload = () => ({
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        maxDiscountAmount: formData.maxDiscountAmount === '' ? null : Number(formData.maxDiscountAmount),
        minOrderAmount: formData.minOrderAmount === '' ? null : Number(formData.minOrderAmount),
        usageLimit: formData.usageLimit === '' ? null : Number(formData.usageLimit),
        startDate: formData.startDate,
        endDate: formData.endDate,
        isActive: formData.isActive,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            const payload = buildPayload();

            if (editingVoucher) {
                await voucherApi.update(editingVoucher.id, {
                    id: editingVoucher.id,
                    usedCount: editingVoucher.usedCount || 0,
                    createdAt: editingVoucher.createdAt,
                    ...payload,
                });
            } else {
                await voucherApi.create(payload);
            }

            closeModal();
            loadVouchers();
        } catch (error) {
            setError(error.response?.data?.message || 'Operation failed');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (voucher) => {
        const confirmed = window.confirm(`Are you sure you want to delete voucher ${voucher.code}?`);
        if (!confirmed) return;

        try {
            await voucherApi.delete(voucher.id);
            loadVouchers();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete voucher');
        }
    };

    return (
        <div className="content-wrapper">
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0" style={{ fontFamily: 'Time New Roman' }}>Vouchers Management</h1>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    <div className="card">
                        <div className="card-header">
                            <div className="row align-items-center">
                                <div className="col-md-6">
                                    <h3 className="card-title">All Vouchers</h3>
                                </div>
                                <div className="col-md-6 text-right">
                                    {isAdmin() && (
                                        <button className="btn btn-success" onClick={() => openModal()}>
                                            <i className="fas fa-plus"></i> Add Voucher
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="card-body table-responsive">
                            {error && !showModal && <div className="alert alert-danger">{error}</div>}

                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary"></div>
                                </div>
                            ) : (
                                <table className="table table-bordered table-striped">
                                    <thead>
                                        <tr>
                                            <th>Code</th>
                                            <th>Name</th>
                                            <th>Type</th>
                                            <th>Value</th>
                                            <th>Min Order</th>
                                            <th>Limit</th>
                                            <th>Used</th>
                                            <th>Time</th>
                                            <th>Status</th>
                                            {isAdmin() && <th style={{ width: '120px' }}>Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vouchers.length === 0 ? (
                                            <tr>
                                                <td colSpan={isAdmin() ? 10 : 9} className="text-center">
                                                    No vouchers found
                                                </td>
                                            </tr>
                                        ) : (
                                            vouchers.map((voucher) => (
                                                <tr key={voucher.id}>
                                                    <td><strong>{voucher.code}</strong></td>
                                                    <td>{voucher.name}</td>
                                                    <td>{voucher.discountType}</td>
                                                    <td>
                                                        {voucher.discountType === 'Percent'
                                                            ? `${voucher.discountValue}%`
                                                            : formatMoney(voucher.discountValue)}
                                                        {voucher.maxDiscountAmount ? (
                                                            <div className="text-muted small">
                                                                Max {formatMoney(voucher.maxDiscountAmount)}
                                                            </div>
                                                        ) : null}
                                                    </td>
                                                    <td>{formatMoney(voucher.minOrderAmount)}</td>
                                                    <td>{voucher.usageLimit ?? 'Unlimited'}</td>
                                                    <td>{voucher.usedCount || 0}</td>
                                                    <td>
                                                        <div>{toDisplayDate(voucher.startDate)}</div>
                                                        <div className="text-muted small">to {toDisplayDate(voucher.endDate)}</div>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${voucher.isActive ? 'badge-success' : 'badge-secondary'}`}>
                                                            {voucher.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    {isAdmin() && (
                                                        <td>
                                                            <button
                                                                className="btn btn-sm btn-info mr-1"
                                                                onClick={() => openModal(voucher)}
                                                                title="Edit"
                                                            >
                                                                <i className="fas fa-edit"></i>
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-danger"
                                                                onClick={() => handleDelete(voucher)}
                                                                title="Delete"
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {showModal && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingVoucher ? 'Edit Voucher' : 'Add Voucher'}
                                </h5>
                                <button type="button" className="close" onClick={closeModal}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    {error && <div className="alert alert-danger">{error}</div>}

                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Code</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={formData.code}
                                                    onChange={(e) => updateField('code', e.target.value)}
                                                    placeholder="SALE20"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={formData.name}
                                                    onChange={(e) => updateField('name', e.target.value)}
                                                    placeholder="Discount 20%"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label>Discount Type</label>
                                                <select
                                                    className="form-control"
                                                    value={formData.discountType}
                                                    onChange={(e) => updateField('discountType', e.target.value)}
                                                >
                                                    <option value="Percent">Percent</option>
                                                    <option value="Fixed">Fixed</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label>Discount Value</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    className="form-control"
                                                    value={formData.discountValue}
                                                    onChange={(e) => updateField('discountValue', e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label>Max Discount</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    className="form-control"
                                                    value={formData.maxDiscountAmount}
                                                    onChange={(e) => updateField('maxDiscountAmount', e.target.value)}
                                                    placeholder="Optional"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label>Min Order Amount</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    className="form-control"
                                                    value={formData.minOrderAmount}
                                                    onChange={(e) => updateField('minOrderAmount', e.target.value)}
                                                    placeholder="Optional"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label>Usage Limit</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    className="form-control"
                                                    value={formData.usageLimit}
                                                    onChange={(e) => updateField('usageLimit', e.target.value)}
                                                    placeholder="Optional"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label>Status</label>
                                                <div className="form-control d-flex align-items-center">
                                                    <input
                                                        id="voucher-active"
                                                        type="checkbox"
                                                        className="mr-2"
                                                        checked={formData.isActive}
                                                        onChange={(e) => updateField('isActive', e.target.checked)}
                                                    />
                                                    <label htmlFor="voucher-active" className="mb-0">Active</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Start Date</label>
                                                <input
                                                    type="datetime-local"
                                                    className="form-control"
                                                    value={formData.startDate}
                                                    onChange={(e) => updateField('startDate', e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>End Date</label>
                                                <input
                                                    type="datetime-local"
                                                    className="form-control"
                                                    value={formData.endDate}
                                                    onChange={(e) => updateField('endDate', e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={saving}>
                                        {saving ? 'Saving...' : editingVoucher ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {showModal && <div className="modal-backdrop fade show"></div>}
        </div>
    );
};

export default Vouchers;

import React, { useEffect, useState } from 'react';
import { supplierApi } from '../services/api';

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [error, setError] = useState('');
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    const [formData, setFormData] = useState({
        name: '',
        contactName: '',
        phone: '',
        email: '',
        address: '',
        supplyType: '',
        isActive: true,
        note: '',
    });

    useEffect(() => {
        loadSuppliers();
    }, [page, keyword]);

    const loadSuppliers = async () => {
        setLoading(true);
        try {
            const response = await supplierApi.getAll({ keyword, page, pageSize });
            const payload = response.data;
            const supplierList = Array.isArray(payload)
                ? payload
                : payload.data || payload.items || [];

            setSuppliers(supplierList);
            setTotalPages(payload.totalPages || 1);
            setTotalCount(payload.totalCount || supplierList.length);
        } catch (error) {
            console.error('Failed to load suppliers:', error);
        } finally {
            setLoading(false);
        }
    };
    const handleSearch=(e) => {
        e.preventDefault();
        setPage(1);
        loadSuppliers();
    };
    const renderPagination = () => {
        const pages = [];
        for (let i=1; i <= totalPages; i++){
            pages.push(
                <li key ={i} className={`page-item ${page === i ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setPage(i)}>
                        {i}

                    </button>

                </li>
            );
        }
        return pages;
    };

    const openModal = (supplier = null) => {
        if (supplier) {
            setEditingSupplier(supplier);
            setFormData({
                name: supplier.name || '',
                contactName: supplier.contactName || '',
                phone: supplier.phone || '',
                email: supplier.email || '',
                address: supplier.address || '',
                supplyType: supplier.supplyType || '',
                isActive: supplier.isActive ?? true,
                note: supplier.note || '',
            });
        } else {
            setEditingSupplier(null);
            setFormData({
                name: '',
                contactName: '',
                phone: '',
                email: '',
                address: '',
                supplyType: '',
                isActive: true,
                note: '',
            });
        }

        setError('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingSupplier(null);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (editingSupplier) {
                await supplierApi.update(editingSupplier.id, formData);
            } else {
                await supplierApi.create(formData);
            }

            closeModal();
            loadSuppliers();
        } catch (error) {
            setError(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this supplier?')) return;

        try {
            await supplierApi.delete(id);
            loadSuppliers();
        } catch (error) {
            alert('Failed to delete supplier');
        }
    };

    return (
        <div className="content-wrapper">
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0" style={{ fontFamily: 'Time New Roman' }}>
                                Suppliers Management
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    <div className="card">
                        <div className="card-header">
                            <div className="row">
                                <div className="col-md-6">
                                    <form onSubmit={handleSearch} className="form-inline">
                                        <input
                                        type="text"
                                        className="form-control mr-2"
                                        placeholder="Search by name, contact, phone, email..."
                                        value={keyword}
                                        onChange={(e) => setKeyword(e.target.value)}
                                        />
                                        <button type = "submit" className="btn btn-primary">
                                            <i className="fas fa-search"></i> Search

                                        </button>

                                    </form>
                                </div>
                                <div className="col-md-6 text-right">
                                    <button className="btn btn-success" onClick={() => openModal()}>
                                        <i className="fas fa-plus"></i> Add Supplier
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="card-body">
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary"></div>
                                </div>
                            ) : (
                                <table className="table table-bordered table-striped">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Contact Name</th>
                                            <th>Phone Number</th>
                                            <th>Email</th>
                                            <th>SupplyType</th>
                                            <th>isActive</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {suppliers.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="text-center">
                                                    None
                                                </td>
                                            </tr>
                                        ) : (
                                            suppliers.map((supplier) => (
                                                <tr key={supplier.id}>
                                                    <td>{supplier.name}</td>
                                                    <td>{supplier.contactName}</td>
                                                    <td>{supplier.phone}</td>
                                                    <td>{supplier.email}</td>
                                                    <td>{supplier.supplyType}</td>
                                                    <td>
                                                        <span className={`badge ${supplier.isActive ? 'badge-success' : 'badge-secondary'}`}>
                                                            {supplier.isActive ? '✅' : '❌'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-info mr-1"
                                                            onClick={() => openModal(supplier)}
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => handleDelete(supplier.id)}
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            )}
                            <div className="d-flex justify-content-between align-items-center">
                                <span>Total: {totalCount} suppliers</span>
                                <nav>
                                    <ul className="pagination mb-0">
                                        <li className={`page-item ${page === 1 ? 'disabled': ''}`}>
                                            <button className="page-link" disabled={page === 1} onClick={() => setPage(page - 1)}>
                                                Previous
                                            </button>
                                        </li>
                                        {renderPagination()}
                                        <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                            <button className="page-link" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                                                Next
                                            </button>

                                        </li>

                                    </ul>
                                </nav>

                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {showModal && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                    <div className="modal-dialog modal-lg modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingSupplier ? 'Update Suppliers' : 'Add Suppliers'}
                                </h5>
                                <button type="button" className="close" onClick={closeModal}>
                                    <span>&times;</span>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="modal-body" style ={{maxHeight: '65vh', overflowY:'auto'}}>
                                    {error && <div className="alert alert-danger">{error}</div>}

                                    <div className="form-group">
                                        <label>Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Contact Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.contactName}
                                            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Address</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>MaterialType</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.supplyType}
                                            onChange={(e) => setFormData({ ...formData, supplyType: e.target.value })}
                                            placeholder="ex: chicken, milk, boot..."
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Note</label>
                                        <textarea
                                            className="form-control"
                                            value={formData.note}
                                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                            rows="3"
                                        />
                                    </div>

                                    {editingSupplier && (
                                        <div className="form-group">
                                            <div className="custom-control custom-switch">
                                                <input
                                                    type="checkbox"
                                                    className="custom-control-input"
                                                    id="supplierIsActive"
                                                    checked={formData.isActive}
                                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                />
                                                <label className="custom-control-label" htmlFor="supplierIsActive">
                                                    Contacting
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                        Hủy
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingSupplier ? 'Update' : 'Add'}
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

export default Suppliers;

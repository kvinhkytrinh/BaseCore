import React, { useState, useEffect } from 'react';
import { productApi, categoryApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Products = () => {
    const [priceRange, setPriceRange] = useState('');
    const [sizeFilter, setSizeFilter] = useState('');
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: 0,
        stock: 0,
        size: '',
        rating: 0,
        description: '',
        imageUrl: '',
        categoryId: '',

    });
    const [error, setError] = useState('');
    const { isAdmin } = useAuth();

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        loadProducts();
    }, [page, keyword, categoryId, priceRange, sizeFilter]);

    const loadCategories = async () => {
        try {
            const response = await categoryApi.getAll();
            setCategories(response.data || []);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const loadProducts = async () => {
        setLoading(true);
        try {
            const response = await productApi.search({
                keyword,
                categoryId: categoryId || undefined,
                priceRange: priceRange || undefined,
                size: sizeFilter || undefined,
                page,
                pageSize,
            });
            setProducts(response.data.items || response.data.data || []);
            setTotalPages(response.data.totalPages || 0);
            setTotalCount(response.data.totalCount || 0);
        } catch (error) {
            console.error('Failed to load products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        loadProducts();
    };

    const openModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                price: product.price,
                stock: product.stock,
                size: product.size || '',
                rating: product.rating || 0,
                description: product.description || '',
                imageUrl: product.imageUrl || '',
                categoryId: product.categoryId,
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                price: 0,
                stock: 0,
                size: '',
                rating: 0,
                description: '',
                imageUrl: '',
                categoryId: categories[0]?.id || '',
            });
        }
        setError('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingProduct(null);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const data = {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                rating: parseFloat(formData.rating),
                categoryId: parseInt(formData.categoryId),
            };

            if (editingProduct) {
                await productApi.update(editingProduct.id, { id: editingProduct.id, ...data });
            } else {
                await productApi.create(data);
            }

            closeModal();
            loadProducts();
        } catch (error) {
            setError(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            await productApi.delete(id);
            loadProducts();
        } catch (error) {
            alert('Failed to delete product');
        }
    };

    const renderPagination = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <li key={i} className={`page-item ${page === i ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setPage(i)}>{i}</button>
                </li>
            );
        }
        return pages;
    };
    const getCategoryName = (product) => {
    const productCategoryId = product.categoryId || product.CategoryId;
    const category = categories.find(cat =>
        String(cat.id || cat.Id) === String(productCategoryId)
    );

    return product.category?.name
        || product.categoryName
        || product.CategoryName
        || category?.name
        || category?.Name
        || '';
};


    return (
        <div className="content-wrapper">
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0" style ={{fontFamily: 'Time New Roman'}}>Products Management</h1>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    <div className="card">
                        <div className="card-header">
                            <div className="row">
                                <div className="col-md-10">
                                    <form onSubmit={handleSearch} className="form-inline">
                                        <input
                                            type="text"
                                            className="form-control mr-2"
                                            placeholder="Name, ID, Price..."
                                            value={keyword}
                                            onChange={(e) => setKeyword(e.target.value)}
                                        />
                                        
                                        <select
                                            className="form-control mr-2"
                                            value={categoryId}
                                            onChange={(e) => setCategoryId(e.target.value)}
                                        >
                                            <option value="">All Categories</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        <select
                                            className="form-control mr-2"
                                            value={priceRange}
                                            onChange={(e) => {
                                                setPriceRange(e.target.value);
                                                setPage(1);
                                            }}
                                        >
                                            <option value="">All Prices</option>
                                            <option value="under100"> under 100k</option>
                                            <option value="100to200">100k - 200k</option>
                                            <option value="above200">Above 200k</option>
                                        </select>
                                        <select
                                            className="form-control mr-2"
                                            value={sizeFilter}
                                            onChange={(e) => {
                                                setSizeFilter(e.target.value);
                                                setPage(1);
                                            }}
                                        >
                                            <option value="">All Sizes</option>
                                            <option value="S">S</option>
                                            <option value="M">M</option>
                                            <option value="L">L</option>
                                            <option value="XL">XL</option>
                                        </select>
                                        <button type="submit" className="btn btn-primary">
                                            <i className="fas fa-search"></i> Search
                                        </button>
                                    </form>
                                </div>
                                <div className="col-md-2 text-right">
                                    {isAdmin() && (
                                        <button className="btn btn-success" onClick={() => openModal()}>
                                            <i className="fas fa-plus"></i> Add Product
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="card-body">
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary"></div>
                                </div>
                            ) : (
                                <>
                                    <table className="table table-bordered table-striped">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Name</th>
                                                <th>Category</th>
                                                <th>Price</th>
                                                <th>Stock</th>
                                                <th>Size</th>
                                                <th>Rating</th>
                                                {isAdmin() && <th>Actions</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.length === 0 ? (
                                                <tr>
                                                    <td colSpan={isAdmin() ? 8 : 7} className="text-center">
                                                        No products found
                                                    </td>
                                                </tr>
                                            ) : (
                                                products.map(product => (
                                                    <tr key={product.id}>
                                                        <td>{product.id}</td>
                                                        <td>{product.name}</td>
                                                        <td>{getCategoryName(product)}</td>
                                                        <td>{product.price?.toLocaleString()} VND</td>
                                                        <td>{product.stock}</td>
                                                        <td>{product.size}</td>
                                                        <td>{product.rating}</td>
                                                        {isAdmin() && (
                                                            <td>
                                                                <button
                                                                    className="btn btn-sm btn-info mr-1"
                                                                    onClick={() => openModal(product)}
                                                                >
                                                                    <i className="fas fa-edit"></i>
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-danger"
                                                                    onClick={() => handleDelete(product.id)}
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

                                    <div className="d-flex justify-content-between align-items-center">
                                        <span>Total: {totalCount} products</span>
                                        <nav>
                                            <ul className="pagination mb-0">
                                                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                                    <button className="page-link" onClick={() => setPage(page - 1)}>
                                                        Previous
                                                    </button>
                                                </li>
                                                {renderPagination()}
                                                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                                    <button className="page-link" onClick={() => setPage(page + 1)}>
                                                        Next
                                                    </button>
                                                </li>
                                            </ul>
                                        </nav>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Modal */}
            {showModal && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingProduct ? 'Edit Product' : 'Add Product'}
                                </h5>
                                <button type="button" className="close" onClick={closeModal}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body" style ={{maxHeight: '65vh', overflowY:'auto'}} >
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
                                        <label>Category</label>
                                        <select
                                            className="form-control"
                                            value={formData.categoryId}
                                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Price</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            required
                                            min="0"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Size</label>
                                        <input
                                            type="Text"
                                            className="form-control"
                                            value={formData.size}
                                            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                            placeholder="e.g., S, M, L, XL"
                                            
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Rating</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={formData.rating}
                                            onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                                            min="0"
                                            max="5"
                                            step="0.1"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Stock</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={formData.stock}
                                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                            required
                                            min="0"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Image URL</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.imageUrl}
                                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea
                                            className="form-control"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows="3"
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingProduct ? 'Update' : 'Create'}
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

export default Products;

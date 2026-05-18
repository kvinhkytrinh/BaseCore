import React, { useState, useEffect } from 'react';
import { productApi, userApi, categoryApi, orderApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
    const [stats, setStats] = useState({
        products: 0,
        categories: 0,
        users: 0,
        pendingBills: 0,
    });
    const [loading, setLoading] = useState(true);
    const { isAdmin } = useAuth();

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [productsRes, categoriesRes, billsRes] = await Promise.all([
                productApi.getAll(),
                categoryApi.getAll(),
                orderApi.getAll({ status: 'Pending', page: 1, pageSize: 1 }),
            ]);

            let usersCount = 0;
            if (isAdmin()) {
                try {
                    const usersRes = await userApi.getAll({ page: 1, pageSize: 1 });
                    usersCount = usersRes.data.totalCount || 0;
                } catch (e) {
                    console.log('Cannot fetch users count');
                }
            }

            const pendingCount = billsRes.data?.totalItems || billsRes.data?.totalCount || 0;
            setStats({
                products: productsRes.data?.totalCount || productsRes.data?.items?.length || productsRes.data?.length || 0,
                categories: categoriesRes.data?.length || 0,
                users: usersCount,
                pendingBills: pendingCount, // them vao stats
            });
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="content-wrapper">
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0" style={{fontFamily:'Time New Roman'}}>Dashboard</h1>
                        </div>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    { isAdmin() && stats.pendingBills > 0  && (
                        <div className="alert alert-warning alert-dismissible fade show" role = "alert">
                        <strong> Notice </strong> You have {stats.pendingBills} pending bills that need to be processed.
                        <button
                            type="button"
                            className="close"
                            data-dismiss="alert"
                            aria-label="Close"
                        >
                            <span aria-hidden = "true">&times;</span>

                        </button>
                        </div>
                    )}
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="sr-only">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="row">
                            <div className="col-lg-3 col-6">
                                <div className="small-box bg-info">
                                    <div className="inner">
                                        <h3>{stats.products}</h3>
                                        <p>Products</p>
                                    </div>
                                    <div className="icon">
                                        <i className="fas fa-box"></i>
                                    </div>
                                    <a href="/products" className="small-box-footer">
                                        More info <i className="fas fa-arrow-circle-right"></i>
                                    </a>
                                </div>
                            </div>
                            <div className="col-lg-3 col-6">
                                <div className="small-box bg-success">
                                    <div className="inner">
                                        <h3>{stats.categories}</h3>
                                        <p>Categories</p>
                                    </div>
                                    <div className="icon">
                                        <i className="fas fa-tags"></i>
                                    </div>
                                    <a href="/categories" className="small-box-footer">
                                        More info <i className="fas fa-arrow-circle-right"></i>
                                    </a>
                                </div>
                            </div>
                            {isAdmin() && (
                                <div className="col-lg-3 col-6">
                                    <div className="small-box bg-warning">
                                        <div className="inner">
                                            <h3>{stats.users}</h3>
                                            <p>Users</p>
                                        </div>
                                        <div className="icon">
                                            <i className="fas fa-users"></i>
                                        </div>
                                        <a href="/users" className="small-box-footer">
                                            More info <i className="fas fa-arrow-circle-right"></i>
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="row">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">Welcome to JolliVing System</h3>
                                </div>
                                <div className="card-body">
                                    <p>This is a teaching framework for web development using:</p>
                                    <ul>
                                        <li><strong>Backend:</strong> .NET Core 8.0 with Entity Framework Core</li>
                                        <li><strong>Frontend:</strong> React 18 with React Router</li>
                                        <li><strong>UI:</strong> AdminLTE 3 with Bootstrap 4</li>
                                        <li><strong>Authentication:</strong> JWT Bearer Token</li>
                                    </ul>
                                    <p>Features include:</p>
                                    <ul>
                                        <li>User Authentication (Login/Logout)</li>
                                        <li>Product Management (CRUD with Search & Pagination)</li>
                                        <li>Category Management</li>
                                        <li>User Management (Admin only)</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;

import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import About from './pages/user/About';
import Book from './pages/user/Book';
import Cart from './pages/user/Cart';
import Checkout from './pages/user/Checkout';
import Home from './pages/user/Home';
import Login from './pages/Login';
import Menu from './pages/user/Menu';
import Orders from './pages/user/Orders';
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Users from './pages/Users';
import Bills from './pages/Bills';
import Suppliers from './pages/Suppliers';
import Vouchers from './pages/Vouchers';

const LoadingScreen = () => (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
        </div>
    </div>
);

const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading, isAdmin } = useAuth();

    if (loading) {
        return <LoadingScreen />;
    }

    return isAuthenticated ? 
    <Navigate to={isAdmin() ? '/admin':'/'} replace /> 
    : children;
};


function App() {
    const { isAuthenticated, loading, isAdmin } = useAuth();
    return (
        
        <Router>
            <Routes>
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute adminOnly>
                            <MainLayout>
                                <Dashboard />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                    />

                <Route
                    path="/products"
                    element={
                        <ProtectedRoute adminOnly>
                            <MainLayout>
                                <Products />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/suppliers"
                    element={
                        <ProtectedRoute adminOnly>
                            <MainLayout>
                                <Suppliers />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/categories"
                    element={
                        <ProtectedRoute adminOnly>
                            <MainLayout>
                                <Categories />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/users"
                    element={
                        <ProtectedRoute adminOnly>
                            <MainLayout>
                                <Users />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />
                 <Route
                    path="/bills"
                    element={
                        <ProtectedRoute adminOnly>
                            <MainLayout>
                                <Bills />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/vouchers"
                    element={
                        <ProtectedRoute adminOnly>
                            <MainLayout>
                                <Vouchers />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />
                
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/menu"
                    element={
                        <ProtectedRoute>
                            <Menu />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/cart"
                    element={
                        <ProtectedRoute>
                            <Cart />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/checkout"
                    element={
                        <ProtectedRoute>
                            <Checkout />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/orders"
                    element={
                        <ProtectedRoute>
                            <Orders />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/about"
                    element={
                        <ProtectedRoute>
                            <About />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/book"
                    element={
                        <ProtectedRoute>
                            <Book />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;

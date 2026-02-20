import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sileo';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import UsersPage from './pages/UsersPage';
import DashboardLayout from './layouts/DashboardLayout';
import { useAuth } from './context/AuthContext';
import ChatsPage from './pages/ChatsPage';
import LandingPage from './pages/LandingPage';
import { LazyMotion, domAnimation } from 'framer-motion';

const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

const AdminRoute = ({ children }) => {
    const { user } = useAuth();
    // Broaden access for "Mensajes" module
    if (user?.role !== 'admin' && user?.role !== 'superadmin' && Number(user?.permission_level) < 1) {
        return <Navigate to="/app" replace />;
    }
    return children;
};

function App() {
    return (
        <LazyMotion features={domAnimation}>
            <Router basename={import.meta.env.BASE_URL}>
                <Toaster position="top-center" richColors />
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />

                    <Route path="/app" element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<UserDashboard />} />

                        <Route path="users" element={
                            <AdminRoute>
                                <UsersPage />
                            </AdminRoute>
                        } />

                        <Route path="chats" element={
                            <AdminRoute>
                                <ChatsPage />
                            </AdminRoute>
                        } />
                    </Route>
                </Routes>
            </Router>
        </LazyMotion>
    );
}

export default App;

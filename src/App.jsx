import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import UsersPage from './pages/UsersPage';
import DashboardLayout from './layouts/DashboardLayout';
import { useAuth } from './context/AuthContext';
import ChatsPage from './pages/ChatsPage';

const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

const AdminRoute = ({ children }) => {
    const { user } = useAuth();
    if (user?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }
    return children;
};

function App() {
    return (
        <Router basename={import.meta.env.BASE_URL}>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route path="/" element={
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
    );
}

export default App;
